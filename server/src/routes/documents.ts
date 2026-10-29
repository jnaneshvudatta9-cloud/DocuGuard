import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getSupabaseClient } from '../lib/supabase';

export const documentsRouter = Router();

// Validation schemas
const uuidSchema = z.string().uuid('Invalid document ID');

const documentBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.enum([
    'Identity', 'Education', 'Finance', 'Vehicle', 'Medical', 'Employment', 'Other'
  ]).default('Other'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').nullable().optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').nullable().optional(),
  issuing_organization: z.string().max(255).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const patchDocumentBodySchema = documentBodySchema.partial();

// Apply auth to all document routes
documentsRouter.use(requireAuth as any);

// GET /api/documents
documentsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabaseClient(req.accessToken);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /documents]', error.message);
      res.status(500).json({ error: 'Failed to fetch documents' });
      return;
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents
documentsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = documentBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  try {
    const supabase = getSupabaseClient(req.accessToken);
    const { data, error } = await supabase
      .from('documents')
      .insert({ ...parsed.data, user_id: req.userId! })
      .select()
      .single();

    if (error) {
      console.error('[POST /documents]', error.message);
      res.status(500).json({ error: 'Failed to create document' });
      return;
    }

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// PATCH /api/documents/:id
documentsRouter.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const idParsed = uuidSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    res.status(400).json({ error: 'Invalid document ID' });
    return;
  }

  const parsed = patchDocumentBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  try {
    const supabase = getSupabaseClient(req.accessToken);

    // First check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', idParsed.data)
      .eq('user_id', req.userId!)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .update(parsed.data)
      .eq('id', idParsed.data)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) {
      console.error('[PATCH /documents/:id]', error.message);
      res.status(500).json({ error: 'Failed to update document' });
      return;
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id
documentsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const idParsed = uuidSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    res.status(400).json({ error: 'Invalid document ID' });
    return;
  }

  try {
    const supabase = getSupabaseClient(req.accessToken);

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', idParsed.data)
      .eq('user_id', req.userId!);

    if (error) {
      console.error('[DELETE /documents/:id]', error.message);
      res.status(500).json({ error: 'Failed to delete document' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});
