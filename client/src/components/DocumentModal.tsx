import { useEffect, useRef } from 'react';
import { X, Save, FileText } from 'lucide-react';
import type { Document, DocumentFormData } from '../types';
import { DOCUMENT_CATEGORIES } from '../types';

interface DocumentModalProps {
  mode: 'create' | 'edit';
  document?: Document;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const EMPTY_FORM: DocumentFormData = {
  title: '',
  category: 'Other',
  issue_date: '',
  expiry_date: '',
  issuing_organization: '',
  notes: '',
};

function toFormData(doc: Document): DocumentFormData {
  return {
    title: doc.title,
    category: doc.category,
    issue_date: doc.issue_date ?? '',
    expiry_date: doc.expiry_date ?? '',
    issuing_organization: doc.issuing_organization ?? '',
    notes: doc.notes ?? '',
  };
}

export function DocumentModal({
  mode,
  document,
  onClose,
  onSubmit,
  loading = false,
  error,
}: DocumentModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const initial = document ? toFormData(document) : EMPTY_FORM;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: DocumentFormData = {
      title: (fd.get('title') as string).trim(),
      category: fd.get('category') as DocumentFormData['category'],
      issue_date: fd.get('issue_date') as string,
      expiry_date: fd.get('expiry_date') as string,
      issuing_organization: (fd.get('issuing_organization') as string).trim(),
      notes: (fd.get('notes') as string).trim(),
    };
    await onSubmit(data);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Add document' : 'Edit document'}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-navy-700" />
            </div>
            <h2 className="font-semibold text-slate-800">
              {mode === 'create' ? 'Add New Document' : 'Edit Document'}
            </h2>
          </div>
          <button
            id="doc-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto scrollbar-thin">
          <div className="px-6 py-5 space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="doc-title" className="label">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="doc-title"
                name="title"
                type="text"
                required
                maxLength={255}
                defaultValue={initial.title}
                placeholder="e.g. Passport, Driver's License"
                className="input"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="doc-category" className="label">Category</label>
              <select
                id="doc-category"
                name="category"
                defaultValue={initial.category}
                className="input"
              >
                {DOCUMENT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="doc-issue-date" className="label">Issue Date</label>
                <input
                  id="doc-issue-date"
                  name="issue_date"
                  type="date"
                  defaultValue={initial.issue_date}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="doc-expiry-date" className="label">Expiry Date</label>
                <input
                  id="doc-expiry-date"
                  name="expiry_date"
                  type="date"
                  defaultValue={initial.expiry_date}
                  className="input"
                />
              </div>
            </div>

            {/* Issuing Org */}
            <div>
              <label htmlFor="doc-org" className="label">Issuing Organization</label>
              <input
                id="doc-org"
                name="issuing_organization"
                type="text"
                maxLength={255}
                defaultValue={initial.issuing_organization}
                placeholder="e.g. Department of State"
                className="input"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="doc-notes" className="label">Notes</label>
              <textarea
                id="doc-notes"
                name="notes"
                rows={3}
                maxLength={2000}
                defaultValue={initial.notes}
                placeholder="Optional notes about this document…"
                className="input resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button type="button" id="doc-modal-cancel" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              id="doc-modal-submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {mode === 'create' ? 'Add Document' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
