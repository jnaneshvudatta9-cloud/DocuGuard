import type { Document, DocumentStatus, DashboardStats } from '../types';

/**
 * Parse a YYYY-MM-DD date string as local date (avoids UTC timezone offset issues).
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date with time zeroed out for accurate day comparisons.
 */
export function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calculate document expiry status based on expiry_date and today's local date.
 */
export function getDocumentStatus(document: Document): DocumentStatus {
  if (!document.expiry_date) return 'no_expiry';

  const expiry = parseLocalDate(document.expiry_date);
  const now = today();

  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'valid';
}

/**
 * Calculate dashboard statistics from a list of documents.
 */
export function calculateStats(documents: Document[]): DashboardStats {
  let expired = 0;
  let expiringSoon = 0;
  let valid = 0;
  let noExpiry = 0;

  for (const doc of documents) {
    const status = getDocumentStatus(doc);
    if (status === 'expired') expired++;
    else if (status === 'expiring_soon') expiringSoon++;
    else if (status === 'valid') valid++;
    else noExpiry++;
  }

  return {
    total: documents.length,
    expired,
    expiringSoon,
    valid,
    noExpiry,
  };
}

/**
 * Format a YYYY-MM-DD date string for display.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Returns number of days until expiry (negative = expired).
 */
export function daysUntilExpiry(expiryDateStr: string): number {
  const expiry = parseLocalDate(expiryDateStr);
  const now = today();
  return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Sort documents: expiring/expired first, no-expiry last.
 */
export function sortByExpiry(documents: Document[]): Document[] {
  return [...documents].sort((a, b) => {
    if (!a.expiry_date && !b.expiry_date) return 0;
    if (!a.expiry_date) return 1;
    if (!b.expiry_date) return -1;
    return a.expiry_date.localeCompare(b.expiry_date);
  });
}
