import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import { registerCourseRoutes } from '@/features/course/backend/route';
import { registerAssignmentRoutes } from '@/features/assignment/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  // Add logging middleware to see all requests - after context is set
  app.use('*', async (c, next) => {
    const logger = c.get('logger');
    logger.info(`Hono received ${c.req.method} request to ${c.req.path}`);
    return next();
  });

  registerExampleRoutes(app);
  registerAuthRoutes(app);
  registerCourseRoutes(app);
  registerAssignmentRoutes(app);

  singletonApp = app;

  return app;
};
