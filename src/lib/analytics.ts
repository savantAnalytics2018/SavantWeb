/**
 * Disabled analytics adapter (brief §16).
 *
 * No tracker is loaded and no data is transmitted. Events are defined so a
 * future, explicitly approved integration can be wired in one place. Any
 * such integration must handle consent where applicable and must never
 * receive personal information or message content.
 */
export type AnalyticsEvent =
  | 'contact_cta_click'
  | 'inquiry_submitted'
  | 'inquiry_accepted'
  | 'inquiry_failed'
  | 'animation_toggled';

type Payload = Record<string, string | number | boolean>;

let sink: ((event: AnalyticsEvent, payload?: Payload) => void) | null = null;

/** Register a sink. Not called anywhere by default. */
export function configureAnalytics(fn: typeof sink): void {
  sink = fn;
}

export function track(event: AnalyticsEvent, payload?: Payload): void {
  if (!sink) return; // disabled by default
  try {
    sink(event, payload);
  } catch {
    /* never let analytics break the site */
  }
}
