import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { services } from '@/content/services';
import { homeHero as hero } from '@/content/home';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('routing and page rendering', () => {
  it('renders the homepage with hero copy, one H1 and the primary CTA linking to contact', () => {
    renderAt('/');
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(hero.headline.replace(/\n/g, '').replace(/<\/?em>/g, ''));
    const cta = screen.getAllByRole('link', { name: hero.primaryCta.label })[0];
    expect(cta).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
  });

  it('renders every service detail page with its title as the H1', () => {
    for (const s of services) {
      const { unmount } = renderAt(`/services/${s.id}`);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(s.title);
      expect(screen.getByText(/hypothetical, not a client case study/i)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders the 404 page for unknown routes and unknown service ids', () => {
    renderAt('/does-not-exist');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/does not exist/i);
    const { unmount } = renderAt('/services/not-a-service');
    expect(screen.getAllByRole('heading', { level: 1 }).at(-1)).toHaveTextContent(/does not exist/i);
    unmount();
  });

  it('navigates from the header to Services and marks the link current', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(nav).getByRole('link', { name: 'Services' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/five connected service areas/i);
    expect(within(nav).getByRole('link', { name: 'Services' })).toHaveAttribute('aria-current', 'page');
  });

  it('mobile menu toggles with aria-expanded and closes on Escape', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const toggle = screen.getByRole('button', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('hero animation exposes a pause/resume control that persists for the session', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const btn = screen.getByRole('button', { name: 'Pause animation' });
    await user.click(btn);
    expect(screen.getByRole('button', { name: 'Resume animation' })).toHaveAttribute('aria-pressed', 'true');
    expect(window.sessionStorage.getItem('sa-hero-animation')).toBe('paused');
    window.sessionStorage.clear();
  });
});
