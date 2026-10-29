export type DocumentCategory =
  | 'Identity'
  | 'Education'
  | 'Finance'
  | 'Vehicle'
  | 'Medical'
  | 'Employment'
  | 'Other';

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Identity',
  'Education',
  'Finance',
  'Vehicle',
  'Medical',
  'Employment',
  'Other',
];

export type DocumentStatus = 'expired' | 'expiring_soon' | 'valid' | 'no_expiry';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  category: DocumentCategory;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_organization: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentFormData {
  title: string;
  category: DocumentCategory;
  issue_date: string;
  expiry_date: string;
  issuing_organization: string;
  notes: string;
}

export interface RenewalChecklist {
  explanation: string;
  steps: string[];
  commonDocuments: string[];
  timing: string;
  officialLinks: { label: string; url: string }[];
  disclaimer: string;
  isDemo: boolean;
}

export interface DashboardStats {
  total: number;
  expired: number;
  expiringSoon: number;
  valid: number;
  noExpiry: number;
}
