import type { Document, DocumentFormData, RenewalChecklist } from '../types';
import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }
  return body;
}

// ── Documents ──────────────────────────────────────────────────────────────

export async function fetchDocuments(): Promise<Document[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/documents`, { headers });
  const body = await handleResponse<{ data: Document[] }>(res);
  return body.data;
}

export async function createDocument(data: DocumentFormData): Promise<Document> {
  const headers = await getAuthHeader();
  const payload = {
    title: data.title,
    category: data.category,
    issue_date: data.issue_date || null,
    expiry_date: data.expiry_date || null,
    issuing_organization: data.issuing_organization || null,
    notes: data.notes || null,
  };
  const res = await fetch(`${API_BASE}/api/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: Document }>(res);
  return body.data;
}

export async function updateDocument(id: string, data: Partial<DocumentFormData>): Promise<Document> {
  const headers = await getAuthHeader();
  const payload: Record<string, string | null | undefined> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.category !== undefined) payload.category = data.category;
  if (data.issue_date !== undefined) payload.issue_date = data.issue_date || null;
  if (data.expiry_date !== undefined) payload.expiry_date = data.expiry_date || null;
  if (data.issuing_organization !== undefined) payload.issuing_organization = data.issuing_organization || null;
  if (data.notes !== undefined) payload.notes = data.notes || null;

  const res = await fetch(`${API_BASE}/api/documents/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: Document }>(res);
  return body.data;
}

export async function deleteDocument(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/documents/${id}`, { method: 'DELETE', headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || 'Failed to delete document');
  }
}

// ── Renewal Checklist ──────────────────────────────────────────────────────

export async function fetchRenewalChecklist(
  category: string,
  documentType: string,
  countryRegion: string
): Promise<RenewalChecklist> {
  const res = await fetch(`${API_BASE}/api/renewal-checklist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, documentType, countryRegion }),
  });
  const body = await handleResponse<{ data: RenewalChecklist }>(res);
  return body.data;
}
