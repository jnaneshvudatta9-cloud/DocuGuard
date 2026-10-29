import { useState } from 'react';
import {
  Sparkles, Send, AlertTriangle, CheckSquare, FileStack,
  Clock, ExternalLink, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { fetchRenewalChecklist } from '../lib/api';
import type { RenewalChecklist } from '../types';
import { DOCUMENT_CATEGORIES } from '../types';

export function RenewalChecklistPage() {
  const [category, setCategory] = useState('Identity');
  const [documentType, setDocumentType] = useState('');
  const [countryRegion, setCountryRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<RenewalChecklist | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    steps: true,
    documents: true,
    links: true,
  });

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setChecklist(null);
    setLoading(true);

    try {
      const result = await fetchRenewalChecklist(category, documentType.trim(), countryRegion.trim());
      setChecklist(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-navy-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">AI Renewal Guide</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10">
          Get an AI-generated renewal preparation checklist for any document type.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Informational only.</strong> AI suggestions are a starting point, not legal advice.
          Requirements vary by location and authority. Always verify with the relevant issuing body.
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="renewal-category" className="label">Document Category</label>
            <select
              id="renewal-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input"
            >
              {DOCUMENT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="renewal-doc-type" className="label">
              Document Type <span className="text-red-500">*</span>
            </label>
            <input
              id="renewal-doc-type"
              type="text"
              required
              maxLength={100}
              value={documentType}
              onChange={e => setDocumentType(e.target.value)}
              placeholder="e.g. Passport, Driver's License, National ID"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="renewal-country" className="label">
              Country / Region <span className="text-red-500">*</span>
            </label>
            <input
              id="renewal-country"
              type="text"
              required
              maxLength={100}
              value={countryRegion}
              onChange={e => setCountryRegion(e.target.value)}
              placeholder="e.g. United States, United Kingdom, India"
              className="input"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            id="renewal-submit-btn"
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating checklist…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Renewal Checklist
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {checklist && (
        <div className="space-y-4 animate-fade-in">
          {/* Demo badge */}
          {checklist.isDemo && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Demo mode:</strong> Configure <code className="bg-blue-100 px-1 rounded">GEMINI_API_KEY</code> in{' '}
                <code className="bg-blue-100 px-1 rounded">server/.env</code> for AI-powered results.
              </p>
            </div>
          )}

          {/* Explanation */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-2 text-sm">Overview</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{checklist.explanation}</p>
          </div>

          {/* Steps */}
          <div className="card overflow-hidden">
            <button
              id="toggle-steps-section"
              onClick={() => toggleSection('steps')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-navy-700" />
                <span className="font-semibold text-slate-800 text-sm">Renewal Steps</span>
                <span className="badge bg-navy-50 text-navy-700">{checklist.steps.length}</span>
              </div>
              {expandedSections.steps ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {expandedSections.steps && (
              <ol className="px-5 pb-5 space-y-2.5">
                {checklist.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy-100 text-navy-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Common Documents */}
          <div className="card overflow-hidden">
            <button
              id="toggle-docs-section"
              onClick={() => toggleSection('documents')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileStack className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800 text-sm">Supporting Documents</span>
                <span className="badge bg-emerald-50 text-emerald-700">{checklist.commonDocuments.length}</span>
              </div>
              {expandedSections.documents ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {expandedSections.documents && (
              <ul className="px-5 pb-5 space-y-2">
                {checklist.commonDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Timing */}
          <div className="card p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Recommended Timing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{checklist.timing}</p>
            </div>
          </div>

          {/* Official Links */}
          {checklist.officialLinks && checklist.officialLinks.length > 0 && (
            <div className="card overflow-hidden">
              <button
                id="toggle-links-section"
                onClick={() => toggleSection('links')}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800 text-sm">Official Resources</span>
                </div>
                {expandedSections.links ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {expandedSections.links && (
                <ul className="px-5 pb-5 space-y-2">
                  {checklist.officialLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-navy-700 hover:text-navy-900 hover:underline transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">{checklist.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
