/** Shared client/server types for the paid-study portal. */

export const portalStatuses = ['submitted', 'reviewing', 'needs_input', 'scope_proposed', 'approved', 'running', 'delivered', 'closed'] as const;
export type PortalStatus = (typeof portalStatuses)[number];

/** Steps shown in the status strip, in order; 'needs_input' and 'closed' are shown as badges, not steps. */
export const portalSteps: { id: PortalStatus; label: string; client: string }[] = [
  { id: 'submitted', label: 'Submitted', client: 'We have your questionnaire.' },
  { id: 'reviewing', label: 'Under review', client: 'We read it within 24 hours and ask anything we need.' },
  { id: 'scope_proposed', label: 'Scope confirmation', client: 'Our read of your decision, the segments, the questions, and the delivery date — for you to approve.' },
  { id: 'approved', label: 'Approved', client: 'Scope locked. We send the invoice; the study is scheduled when payment clears.' },
  { id: 'running', label: 'Running', client: 'The study is in progress.' },
  { id: 'delivered', label: 'Delivered', client: 'Your memo is on this page.' },
];

export const statusLabel: Record<PortalStatus, string> = {
  submitted: 'Submitted',
  reviewing: 'Under review',
  needs_input: 'Needs your input',
  scope_proposed: 'Scope confirmation ready',
  approved: 'Approved',
  running: 'Running',
  delivered: 'Delivered',
  closed: 'Closed',
};

export interface PortalMessage {
  id: number;
  author: 'client' | 'savant';
  body: string;
  createdAt: number;
}

export interface PortalStudy {
  ref: string;
  package: string;
  status: PortalStatus;
  email: string;
  name: string;
  company: string;
  answers: Record<string, unknown>;
  scope: string | null;
  approvedAt: number | null;
  hasReport: boolean;
  reportName: string | null;
  createdAt: number;
  updatedAt: number;
  messages: PortalMessage[];
}

export interface PortalStudySummary {
  ref: string;
  package: string;
  status: PortalStatus;
  name: string;
  company: string;
  email: string;
  createdAt: number;
  updatedAt: number;
}

export const portalLimits = { message: 4000, scope: 8000, reportBytes: 25 * 1024 * 1024 };
