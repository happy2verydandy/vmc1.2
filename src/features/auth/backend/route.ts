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
import { OnboardRequestSchema, LoginRequestSchema } from '@/features/auth/backend/schema';
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

  app.use('/api/auth/*', async (c, next) => {
    const logger = getLogger(c);
    logger.info(`Received ${c.req.method} request to ${c.req.path} with api prefix`);
    return next();
  });

  // Login endpoint
  app.post('/auth/login', async (c) => {
    const logger = getLogger(c);
    logger.info('Processing login request');

    const supabase = getSupabase(c);

    // Get request body from form data or JSON
    let body: any;
    try {
      // Try to parse as JSON first
      body = await c.req.json();
    } catch {
      // If JSON parsing fails, try to parse form data
      const formData = await c.req.parseBody();
      body = {
        email: formData.email as string,
        password: formData.password as string,
      };
    }

    logger.info('Request body received', { body: Object.keys(body) });

    // Validate the request body
    const parsedBody = LoginRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      logger.error('Login request validation failed', parsedBody.error.format());
      return respond(
        c,
        failure(
          400,
          authErrorCodes.invalidParams,
          'The provided login data is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const { email, password } = parsedBody.data;

    try {
      // Attempt to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Login failed', error.message);
        return respond(
          c,
          failure(
            401,
            authErrorCodes.loginFailed,
            'Invalid email or password.',
          ),
        );
      }

      // Get user profile to check role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        logger.error('Failed to fetch user profile', profileError.message);
        return respond(
          c,
          failure(
            500,
            authErrorCodes.profileFetchError,
            'Failed to fetch user profile.',
          ),
        );
      }

      logger.info('Login successful', { userId: data.user.id, role: profileData.role });

      return respond(c, success({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profileData.role,
        },
        token: data.session?.access_token,
        message: 'Login successful.',
      }));
    } catch (error: any) {
      logger.error('Unexpected error during login', error?.message || String(error));
      return respond(
        c,
        failure(
          500,
          authErrorCodes.unknownError,
          'An unexpected error occurred during login.',
        ),
      );
    }
  });

  // Also register the API version of the login route
  app.post('/api/auth/login', async (c) => {
    const logger = getLogger(c);
    logger.info('Processing login request via /api prefix');

    const supabase = getSupabase(c);

    // Get request body from form data or JSON
    let body: any;
    try {
      // Try to parse as JSON first
      body = await c.req.json();
    } catch {
      // If JSON parsing fails, try to parse form data
      const formData = await c.req.parseBody();
      body = {
        email: formData.email as string,
        password: formData.password as string,
      };
    }

    logger.info('Request body received', { body: Object.keys(body) });

    // Validate the request body
    const parsedBody = LoginRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      logger.error('Login request validation failed', parsedBody.error.format());
      return respond(
        c,
        failure(
          400,
          authErrorCodes.invalidParams,
          'The provided login data is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const { email, password } = parsedBody.data;

    try {
      // Attempt to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Login failed', error.message);
        return respond(
          c,
          failure(
            401,
            authErrorCodes.loginFailed,
            'Invalid email or password.',
          ),
        );
      }

      // Get user profile to check role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        logger.error('Failed to fetch user profile', profileError.message);
        return respond(
          c,
          failure(
            500,
            authErrorCodes.profileFetchError,
            'Failed to fetch user profile.',
          ),
        );
      }

      logger.info('Login successful', { userId: data.user.id, role: profileData.role });

      return respond(c, success({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profileData.role,
        },
        token: data.session?.access_token,
        message: 'Login successful.',
      }));
    } catch (error: any) {
      logger.error('Unexpected error during login', error?.message || String(error));
      return respond(
        c,
        failure(
          500,
          authErrorCodes.unknownError,
          'An unexpected error occurred during login.',
        ),
      );
    }
  });

  // Onboard endpoint - handle both /auth/onboard and /api/auth/onboard variations
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

  // Also register the API version of the route in case Next.js passes the full path
  app.post('/api/auth/onboard', async (c) => {
    const logger = getLogger(c);
    logger.info('Processing onboard request via /api prefix');

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