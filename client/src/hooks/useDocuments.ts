import { useState, useEffect, useCallback } from 'react';
import type { Document, DocumentFormData, DashboardStats } from '../types';
import { fetchDocuments, createDocument, updateDocument, deleteDocument } from '../lib/api';
import { calculateStats } from '../lib/dateUtils';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, expired: 0, expiringSoon: 0, valid: 0, noExpiry: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      setStats(calculateStats(docs));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (data: DocumentFormData): Promise<{ error: string | null }> => {
    try {
      const newDoc = await createDocument(data);
      setDocuments(prev => [newDoc, ...prev]);
      setStats(calculateStats([newDoc, ...documents]));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create document' };
    }
  };

  const update = async (id: string, data: Partial<DocumentFormData>): Promise<{ error: string | null }> => {
    try {
      const updated = await updateDocument(id, data);
      const newDocs = documents.map(d => d.id === id ? updated : d);
      setDocuments(newDocs);
      setStats(calculateStats(newDocs));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update document' };
    }
  };

  const remove = async (id: string): Promise<{ error: string | null }> => {
    try {
      await deleteDocument(id);
      const newDocs = documents.filter(d => d.id !== id);
      setDocuments(newDocs);
      setStats(calculateStats(newDocs));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete document' };
    }
  };

  return { documents, stats, loading, error, refresh: load, create, update, remove };
}
