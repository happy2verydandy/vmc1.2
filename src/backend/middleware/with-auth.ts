import { MiddlewareHandler } from 'hono';
import { AppEnv } from '../hono/context';
import { getUserFromToken } from '@/backend/supabase/utils';

export const withAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authorization header missing or invalid' } }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = c.get('supabase');

    // Verify the token with Supabase using the service role client
    const user = await getUserFromToken(supabase, token);

    if (!user) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401);
    }

    // Set the user ID in the context for downstream handlers
    c.set('user_id', user.id);

    await next();
  };
};