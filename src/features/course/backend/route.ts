import { Hono } from 'hono';
import { 
  CourseListQuerySchema, 
  CourseIdParamSchema, 
} from './schema';
import { 
  getCourses, 
  getCourseById, 
  createEnrollment,
  isUserEnrolledInCourse 
} from './service';
import { CourseError, CourseErrorCode } from './error';
import { withAuth } from '@/backend/middleware/with-auth';
import { AppEnv } from '@/backend/hono/context';
import { success, failure, respond } from '@/backend/http/response';

export const registerCourseRoutes = (app: Hono<AppEnv>) => {
  // Get all published courses with filters
  app.get('/courses', async (c) => {
    try {
      const supabase = c.get('supabase');
      
      // Parse and validate query parameters manually
      const search = c.req.query('search');
      const category = c.req.query('category');
      const difficulty_level = c.req.query('difficulty_level');
      const sort = c.req.query('sort') as 'latest' | 'popular' || 'latest';
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);
      
      // Validate sort parameter
      if (sort !== 'latest' && sort !== 'popular') {
        return respond(c, failure(400, 'INVALID_SORT', 'Sort must be either "latest" or "popular"'));
      }
      
      // Validate page and limit
      if (isNaN(page) || page < 1) {
        return respond(c, failure(400, 'INVALID_PAGE', 'Page must be a positive integer'));
      }
      
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return respond(c, failure(400, 'INVALID_LIMIT', 'Limit must be between 1 and 100'));
      }

      const result = await getCourses(supabase, {
        search,
        category,
        difficulty_level,
        sort,
        page,
        limit,
      });

      return respond(c, success({
        courses: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.count,
          total_pages: Math.ceil(result.count / result.limit),
        },
      }));
    } catch (error) {
      if (error instanceof CourseError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, error.code, error.message));
      }
      
      c.get('logger').error('Failed to fetch courses', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch courses'));
    }
  });

  // Get a specific course by ID
  app.get('/courses/:id', async (c) => {
    try {
      const supabase = c.get('supabase');
      const id = c.req.param('id');
      
      // Validate ID parameter
      const parsedId = CourseIdParamSchema.safeParse({ id });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_COURSE_ID', 'Invalid course ID format'));
      }

      const course = await getCourseById(supabase, parsedId.data.id);

      return respond(c, success({ course }));
    } catch (error) {
      if (error instanceof CourseError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, error.code, error.message));
      }
      
      c.get('logger').error('Failed to fetch course', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch course'));
    }
  });

  // Check enrollment status for a user
  app.get('/courses/:id/enrollment-status', withAuth(), async (c) => {
    try {
      const userId = c.get('user_id');
      const supabase = c.get('supabase');
      const id = c.req.param('id');
      
      // Validate ID parameter
      const parsedId = CourseIdParamSchema.safeParse({ id });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_COURSE_ID', 'Invalid course ID format'));
      }

      const isEnrolled = await isUserEnrolledInCourse(supabase, parsedId.data.id, userId);

      return respond(c, success({ is_enrolled: isEnrolled }));
    } catch (error) {
      c.get('logger').error('Failed to check enrollment status', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to check enrollment status'));
    }
  });

  // Enroll in a course
  app.post('/courses/:id/enroll', withAuth(), async (c) => {
    try {
      const userId = c.get('user_id');
      const supabase = c.get('supabase');
      const id = c.req.param('id');
      
      // Validate ID parameter
      const parsedId = CourseIdParamSchema.safeParse({ id });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_COURSE_ID', 'Invalid course ID format'));
      }

      // Verify user is a learner
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        return respond(c, failure(400, 'USER_PROFILE_ERROR', 'Failed to verify user role'));
      }

      if (profile.role !== 'learner') {
        return respond(c, failure(403, 'USER_NOT_LEARNER', 'Only learners can enroll in courses'));
      }

      const enrollment = await createEnrollment(supabase, parsedId.data.id, userId);

      return respond(c, success({ enrollment }, 201));
    } catch (error) {
      if (error instanceof CourseError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, error.code, error.message));
      }
      
      c.get('logger').error('Failed to enroll in course', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to enroll in course'));
    }
  });

  return app;
};