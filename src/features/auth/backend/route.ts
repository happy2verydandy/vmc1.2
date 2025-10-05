import type { Hono } from 'hono';
import {
  failure,
  respond,
  success,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { OnboardRequestSchema } from '@/features/auth/backend/schema';
import { onboardUser } from './service';
import {
  authErrorCodes,
  type AuthServiceError,
} from './error';

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  // Log all requests to auth routes
  app.use('/auth/*', async (c, next) => {
    const logger = getLogger(c);
    logger.info(`Received ${c.req.method} request to ${c.req.path}`);
    return next();
  });

  // Onboard endpoint
  app.post('/auth/onboard', async (c) => {
    const logger = getLogger(c);
    logger.info('Processing onboard request');

    const supabase = getSupabase(c);

    // Get request body
    const body = await c.req.json();
    logger.info('Request body received', { body: Object.keys(body) });

    // We need to validate the full request including terms agreement
    const parsedBody = OnboardRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      logger.error('Request validation failed', parsedBody.error.format());
      return respond(
        c,
        failure(
          400,
          authErrorCodes.invalidParams,
          'The provided onboarding data is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    // Extract termsAgreed from the request body
    const { termsAgreed = false } = body;
    logger.info('Terms agreed status', { termsAgreed });

    // Get client IP and user agent for terms agreement
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '';
    const userAgent = c.req.header('user-agent') || '';
    logger.info('Client info', { ipAddress, userAgent });

    // Call service to onboard user
    const result = await onboardUser(supabase, parsedBody.data, termsAgreed, ipAddress, userAgent);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AuthServiceError, unknown>;

      if (errorResult.error.code === authErrorCodes.createUserError) {
        logger.error('Failed to create user during onboarding', errorResult.error.message);
      } else if (errorResult.error.code === authErrorCodes.profileCreationError) {
        logger.error('Failed to create profile during onboarding', errorResult.error.message);
      } else {
        logger.error('Onboarding failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Onboarding successful', { userId: result.data.userId });
    
    // Return success response
    return respond(c, success({
      success: true,
      userId: result.data.userId,
      email: result.data.email,
      role: result.data.role,
      message: '회원가입이 성공적으로 완료되었습니다.',
    }));
  });
};