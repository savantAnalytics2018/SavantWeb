/** Thin fetch helpers for the portal API (same-origin cookies). */
import type { PortalStatus, PortalStudy, PortalStudySummary } from '@/lib/portalTypes';

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  message?: string;
  data?: T;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/portal${path}`, { credentials: 'same-origin', headers: { Accept: 'application/json', ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) }, ...init });
    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      /* non-JSON */
    }
    return { ok: res.ok && body.ok !== false, status: res.status, message: typeof body.message === 'string' ? body.message : undefined, data: body as unknown as T };
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server. Check your connection and try again.' };
  }
}

export const portalApi = {
  study: (ref: string) => call<{ viewer: 'client' | 'admin'; study: PortalStudy }>(`/study/${ref}`),
  message: (ref: string, body: string) => call<{ status: PortalStatus }>(`/study/${ref}/message`, { method: 'POST', body: JSON.stringify({ body }) }),
  approve: (ref: string) => call<{ status: PortalStatus }>(`/study/${ref}/approve`, { method: 'POST', body: '{}' }),
  setStatus: (ref: string, status: PortalStatus, scope?: string) => call<{ status: PortalStatus }>(`/study/${ref}/status`, { method: 'POST', body: JSON.stringify({ status, scope }) }),
  uploadReport: (ref: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file, file.name);
    fd.append('name', file.name);
    return call<{ status: PortalStatus; reportName: string }>(`/study/${ref}/report`, { method: 'POST', body: fd });
  },
  requestLink: (ref: string, email: string) => call<unknown>('/link', { method: 'POST', body: JSON.stringify({ ref, email }) }),
  adminLink: () => call<unknown>('/admin/link'),
  adminStudies: () => call<{ studies: PortalStudySummary[] }>('/admin/studies'),
};

export function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
