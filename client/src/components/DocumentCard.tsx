import { Building2, Calendar, Tag, Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { Document } from '../types';
import { StatusBadge } from './StatusBadge';
import { getDocumentStatus, formatDate, daysUntilExpiry } from '../lib/dateUtils';

interface DocumentCardProps {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Identity:   'bg-indigo-100 text-indigo-700',
  Education:  'bg-sky-100 text-sky-700',
  Finance:    'bg-emerald-100 text-emerald-700',
  Vehicle:    'bg-orange-100 text-orange-700',
  Medical:    'bg-rose-100 text-rose-700',
  Employment: 'bg-violet-100 text-violet-700',
  Other:      'bg-slate-100 text-slate-600',
};

export function DocumentCard({ document: doc, onEdit, onDelete }: DocumentCardProps) {
  const status = getDocumentStatus(doc);
  const days = doc.expiry_date ? daysUntilExpiry(doc.expiry_date) : undefined;

  const borderAccent =
    status === 'expired'       ? 'border-l-red-400' :
    status === 'expiring_soon' ? 'border-l-amber-400' :
    status === 'valid'         ? 'border-l-emerald-400' :
                                  'border-l-slate-200';

  return (
    <div className={`card border-l-4 ${borderAccent} p-5 hover:shadow-card-hover transition-all duration-200 group`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`badge text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.Other}`}>
              <Tag className="w-3 h-3" />
              {doc.category}
            </span>
            <StatusBadge status={status} daysLeft={days} />
          </div>

          <h3 className="font-semibold text-slate-800 truncate mb-1">{doc.title}</h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {doc.issuing_organization && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {doc.issuing_organization}
              </span>
            )}
            {doc.issue_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Issued: {formatDate(doc.issue_date)}
              </span>
            )}
            {doc.expiry_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Expires: {formatDate(doc.expiry_date)}
              </span>
            )}
          </div>

          {doc.notes && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2">{doc.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`edit-doc-${doc.id}`}
            onClick={() => onEdit(doc)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
            aria-label={`Edit ${doc.title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            id={`delete-doc-${doc.id}`}
            onClick={() => onDelete(doc)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label={`Delete ${doc.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
        </div>
      </div>
    </div>
  );
}
