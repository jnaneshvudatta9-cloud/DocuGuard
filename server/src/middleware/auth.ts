import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../lib/supabase';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  accessToken?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  
  try {
    // Verify the token by getting the user from Supabase
    const supabase = getSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = user.id;
    req.accessToken = token;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
