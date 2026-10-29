import { useMemo } from 'react';
import {
  FileText, AlertTriangle, Clock, CheckCircle2, Calendar,
  TrendingUp, RefreshCw, Plus, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { getDocumentStatus, formatDate, daysUntilExpiry, sortByExpiry } from '../lib/dateUtils';
import { StatusBadge } from '../components/StatusBadge';
import type { Document } from '../types';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

function StatCard({ label, value, icon: Icon, colorClass, bgClass }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { documents, stats, loading, error, refresh } = useDocuments();

  const firstName = user?.email?.split('@')[0] ?? 'there';

  // Get upcoming expirations (expiring soon or expired, sorted by expiry asc)
  const urgentDocs = useMemo(
    () => sortByExpiry(documents).filter(d => {
      const s = getDocumentStatus(d);
      return s === 'expired' || s === 'expiring_soon';
    }).slice(0, 5),
    [documents]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, <span className="text-navy-700 capitalize">{firstName}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's an overview of your document portfolio.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn-secondary" id="dashboard-refresh-btn">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link to="/documents" className="btn-primary" id="dashboard-add-btn">
            <Plus className="w-4 h-4" /> Add Document
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={stats.total}
          icon={FileText}
          colorClass="text-navy-700"
          bgClass="bg-navy-50"
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon={AlertTriangle}
          colorClass="text-red-600"
          bgClass="bg-red-50"
        />
        <StatCard
          label="Expiring in 30 Days"
          value={stats.expiringSoon}
          icon={Clock}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          label="Valid"
          value={stats.valid}
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Documents */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-navy-700" />
                <h2 className="font-semibold text-slate-800 text-sm">Needs Attention</h2>
              </div>
              <Link to="/documents" className="text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors">
                View all →
              </Link>
            </div>

            {urgentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="font-medium text-slate-700">All documents are in good standing!</p>
                <p className="text-sm text-slate-500">No expired or expiring documents right now.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {urgentDocs.map((doc: Document) => {
                  const status = getDocumentStatus(doc);
                  const days = doc.expiry_date ? daysUntilExpiry(doc.expiry_date) : undefined;
                  return (
                    <li key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{doc.category}</span>
                          {doc.expiry_date && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.expiry_date)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={status} daysLeft={days} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Quick actions + summary */}
        <div className="space-y-4">
          {/* Summary breakdown */}
          <div className="card px-5 py-4">
            <h2 className="font-semibold text-slate-800 text-sm mb-4">Status Overview</h2>
            {stats.total === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No documents yet.</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Valid',           value: stats.valid,       color: 'bg-emerald-400' },
                  { label: 'Expiring Soon',   value: stats.expiringSoon, color: 'bg-amber-400' },
                  { label: 'Expired',         value: stats.expired,     color: 'bg-red-400' },
                  { label: 'No Expiry Date',  value: stats.noExpiry,    color: 'bg-slate-300' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: stats.total ? `${(value / stats.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Checklist CTA */}
          <div className="card bg-gradient-to-br from-navy-700 to-navy-900 text-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-semibold">AI Renewal Guide</span>
            </div>
            <p className="text-xs text-white/70 mb-4">
              Get a step-by-step AI-generated checklist for renewing any document.
            </p>
            <Link
              to="/renewal"
              id="dashboard-renewal-cta"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              Try it now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
