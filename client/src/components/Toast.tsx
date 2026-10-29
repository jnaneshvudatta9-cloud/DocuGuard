import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

const ICON_STYLES = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

export function Toast({ id, type, message, onDismiss }: ToastProps) {
  const Icon = ICONS[type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 5000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card-hover text-sm animate-fade-in ${STYLES[type]}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ICON_STYLES[type]}`} />
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={() => onDismiss(id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Toast container ────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}
