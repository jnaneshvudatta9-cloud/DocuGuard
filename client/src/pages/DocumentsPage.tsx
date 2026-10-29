import { useState, useMemo } from 'react';
import {
  Plus, Search, SlidersHorizontal, FileText,
  RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentModal } from '../components/DocumentModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ToastContainer, useToast } from '../components/Toast';
import type { Document, DocumentFormData } from '../types';
import { DOCUMENT_CATEGORIES } from '../types';
import { getDocumentStatus, sortByExpiry } from '../lib/dateUtils';

type StatusFilter = 'all' | 'expired' | 'expiring_soon' | 'valid' | 'no_expiry';

export function DocumentsPage() {
  const { documents, loading, error, refresh, create, update, remove } = useDocuments();
  const { toasts, addToast, dismiss } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; doc?: Document } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtered + sorted documents
  const filtered = useMemo(() => {
    let docs = sortByExpiry(documents);

    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.issuing_organization ?? '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      docs = docs.filter(d => d.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      docs = docs.filter(d => getDocumentStatus(d) === statusFilter);
    }

    return docs;
  }, [documents, search, categoryFilter, statusFilter]);

  const hasFilters = search || categoryFilter !== 'all' || statusFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
  }

  async function handleModalSubmit(data: DocumentFormData) {
    setModalLoading(true);
    setModalError(null);

    const result =
      modal?.mode === 'create'
        ? await create(data)
        : await update(modal!.doc!.id, data);

    setModalLoading(false);

    if (result.error) {
      setModalError(result.error);
    } else {
      setModal(null);
      addToast('success', modal?.mode === 'create' ? 'Document added successfully.' : 'Document updated successfully.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error: err } = await remove(deleteTarget.id);
    setDeleteLoading(false);
    if (err) {
      addToast('error', err);
    } else {
      addToast('success', `"${deleteTarget.title}" deleted.`);
    }
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading documents…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600 font-medium">{error}</p>
        <button onClick={refresh} className="btn-secondary">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {documents.length} document{documents.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            id="add-document-btn"
            onClick={() => { setModal({ mode: 'create' }); setModalError(null); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="doc-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or organization…"
                className="input pl-9"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Categories</option>
                {DOCUMENT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="input w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="no_expiry">No Expiry Date</option>
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                id="clear-filters-btn"
                onClick={clearFilters}
                className="btn-secondary flex-shrink-0"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <FileText className="w-7 h-7 text-slate-300" />
            </div>
            {documents.length === 0 ? (
              <>
                <p className="font-semibold text-slate-700">No documents yet</p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Add your first document to start tracking expiry dates and staying organized.
                </p>
                <button
                  id="empty-add-btn"
                  onClick={() => { setModal({ mode: 'create' }); setModalError(null); }}
                  className="btn-primary mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Your First Document
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-700">No results found</p>
                <p className="text-sm text-slate-400">Try adjusting your filters or search term.</p>
                <button onClick={clearFilters} className="btn-secondary mt-2">
                  <X className="w-4 h-4" /> Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {hasFilters && (
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{' '}
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            )}
            {filtered.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onEdit={d => { setModal({ mode: 'edit', doc: d }); setModalError(null); }}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <DocumentModal
          mode={modal.mode}
          document={modal.doc}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
          loading={modalLoading}
          error={modalError}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Document"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
