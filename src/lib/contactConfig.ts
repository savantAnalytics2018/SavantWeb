/**
 * Contact delivery configuration (brief §15).
 *
 * The form submits only when VITE_CONTACT_ENDPOINT is set at build time.
 * Otherwise the form renders in preview mode: a clear notice, submission
 * disabled, and no simulated success.
 */
// `import.meta.env` exists in the Vite browser build; it is undefined when this
// module is bundled into the Cloudflare Worker, so read it defensively.
const viteEnv = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});
const endpoint = viteEnv.VITE_CONTACT_ENDPOINT?.trim() ?? '';

export const contactConfig = {
  endpoint,
  enabled: endpoint.length > 0,
} as const;

export const limits = {
  name: { min: 2, max: 120 },
  email: { max: 254 },
  organization: { max: 160 },
  message: { min: 20, max: 4000 },
} as const;

export interface InquiryInput {
  name: string;
  email: string;
  organization: string;
  service: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof InquiryInput, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared client/server validation. Returns an empty object when valid. */
export function validateInquiry(input: InquiryInput, validServiceIds: readonly string[]): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const organization = input.organization.trim();
  const message = input.message.trim();

  if (name.length < limits.name.min) errors.name = 'Please enter your name.';
  else if (name.length > limits.name.max) errors.name = `Name must be ${limits.name.max} characters or fewer.`;

  if (!email) errors.email = 'Please enter your email address so we can reply.';
  else if (email.length > limits.email.max || !emailPattern.test(email))
    errors.email = 'Please enter a valid email address.';

  if (organization.length > limits.organization.max)
    errors.organization = `Organization must be ${limits.organization.max} characters or fewer.`;

  if (input.service && !validServiceIds.includes(input.service)) errors.service = 'Please choose a listed service.';

  if (message.length < limits.message.min)
    errors.message = `Please describe the problem in at least ${limits.message.min} characters.`;
  else if (message.length > limits.message.max)
    errors.message = `Message must be ${limits.message.max} characters or fewer.`;

  return errors;
}
