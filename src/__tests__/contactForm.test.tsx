import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { validateInquiry } from '@/lib/contactConfig';

const serviceIds = ['ai-strategy', 'legacy-modernization'];
const valid = {
  name: 'Jordan Example',
  email: 'jordan@example.com',
  organization: '',
  service: 'ai-strategy',
  message: 'We have a legacy claims system and need to decide whether to modernize it before adding AI.',
};

describe('validateInquiry (shared client/server rules)', () => {
  it('accepts a valid inquiry', () => {
    expect(validateInquiry(valid, serviceIds)).toEqual({});
  });
  it('rejects missing name, bad email, short message, unknown service', () => {
    const errors = validateInquiry({ ...valid, name: '', email: 'nope', message: 'short', service: 'x' }, serviceIds);
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name', 'service']);
  });
  it('rejects over-length fields', () => {
    const errors = validateInquiry({ ...valid, name: 'a'.repeat(121), message: 'b'.repeat(4001) }, serviceIds);
    expect(errors.name).toBeDefined();
    expect(errors.message).toBeDefined();
  });
});

async function loadForm(endpoint: string) {
  vi.resetModules();
  vi.stubEnv('VITE_CONTACT_ENDPOINT', endpoint);
  const mod = await import('@/components/ContactForm');
  return mod.default;
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), valid.name);
  await user.type(screen.getByLabelText('Email'), valid.email);
  await user.type(screen.getByLabelText(/What are you trying to decide/), valid.message);
}

describe('ContactForm', () => {
  beforeEach(() => vi.unstubAllEnvs());

  it('preview mode: shows a notice and disables submission when no endpoint is configured', async () => {
    const ContactForm = await loadForm('');
    render(<ContactForm />);
    expect(screen.getByText(/not yet connected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send inquiry' })).toBeDisabled();
    // No invented email address is shown.
    expect(screen.queryByRole('link', { name: /@/ })).toBeNull();
  });

  it('client validation blocks submission and focuses the first invalid field', async () => {
    const ContactForm = await loadForm('/api/contact');
    const fetchImpl = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows success only after the server confirms acceptance', async () => {
    const ContactForm = await loadForm('/api/contact');
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const user = userEvent.setup();
    render(<ContactForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(await screen.findByText('Your inquiry has been received.')).toBeInTheDocument();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({ name: valid.name, email: valid.email, website: '' });
  });

  it('server rejection: shows an error, preserves entered text, and allows retry', async () => {
    const ContactForm = await loadForm('/api/contact');
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      return calls === 1
        ? new Response(JSON.stringify({ ok: false, message: 'Provider down.' }), { status: 502 })
        : new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    const user = userEvent.setup();
    render(<ContactForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Provider down.');
    expect(screen.getByLabelText('Name')).toHaveValue(valid.name);
    expect(screen.queryByText('Your inquiry has been received.')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(await screen.findByText('Your inquiry has been received.')).toBeInTheDocument();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('network failure: shows an error and never shows success', async () => {
    const ContactForm = await loadForm('/api/contact');
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const user = userEvent.setup();
    render(<ContactForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
    expect(screen.queryByText('Your inquiry has been received.')).toBeNull();
  });

  it('double-click submits only once while a request is pending', async () => {
    const ContactForm = await loadForm('/api/contact');
    let resolve!: (r: Response) => void;
    const fetchImpl = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<ContactForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    const btn = screen.getByRole('button', { name: 'Send inquiry' });
    await user.click(btn);
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Sending…' }));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    expect(await screen.findByText('Your inquiry has been received.')).toBeInTheDocument();
  });

  it('server field errors are mapped back onto the form', async () => {
    const ContactForm = await loadForm('/api/contact');
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: false, message: 'Please correct the highlighted fields.', errors: { email: 'Server says no.' } }), {
          status: 422,
        }),
    );
    const user = userEvent.setup();
    render(<ContactForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(await screen.findByText('Server says no.')).toBeInTheDocument();
  });
});
