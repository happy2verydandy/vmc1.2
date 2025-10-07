import { Hono } from 'hono';
import { 
  GradeSummarySchema,
  GradeDetailSchema
} from './schema';
import { 
  getLearnerGradeSummary,
  getCourseGradeDetail,
  getAssignmentGrade
} from './service';
import type { AppEnv } from '@/backend/hono/context';
import { failure, respond, success } from '@/backend/http/response';
import { getUserId } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/with-auth';

export const registerGradeRoutes = (app: Hono<AppEnv>) => {
  // 사용자의 전체 성적 요약 조회
  app.get('/grades', withAuth(), async (c) => {
    try {
      const userId = c.get('user_id');

      if (!userId) {
        return respond(c, failure(401, 'UNAUTHENTICATED', 'Authentication required'));
      }

      const gradeSummary = await getLearnerGradeSummary(c.get('supabase'), userId);
      return respond(c, success(gradeSummary));
    } catch (error) {
      c.get('logger').error('Failed to fetch grade summary', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch grade summary'));
    }
  });

  // 특정 코스의 상세 성적 조회
  app.get('/grades/courses/:courseId', withAuth(), async (c) => {
    try {
      const courseId = c.req.param('courseId');
      const userId = c.get('user_id');

      // Validate courseId parameter
      if (!courseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return respond(c, failure(400, 'INVALID_COURSE_ID', 'Invalid course ID format'));
      }

      if (!userId) {
        return respond(c, failure(401, 'UNAUTHENTICATED', 'Authentication required'));
      }

      const gradeDetail = await getCourseGradeDetail(c.get('supabase'), userId, courseId);
      return respond(c, success(gradeDetail));
    } catch (error) {
      c.get('logger').error('Failed to fetch course grade detail', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch course grade detail'));
    }
  });

  // 특정 과제의 성적 조회
  app.get('/grades/assignments/:assignmentId', withAuth(), async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      const userId = c.get('user_id');

      // Validate assignmentId parameter
      if (!assignmentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }

      if (!userId) {
        return respond(c, failure(401, 'UNAUTHENTICATED', 'Authentication required'));
      }

      const assignmentGrade = await getAssignmentGrade(c.get('supabase'), userId, assignmentId);
      
      if (!assignmentGrade) {
        return respond(c, success(null, 404));
      }
      
      return respond(c, success(assignmentGrade));
    } catch (error) {
      c.get('logger').error('Failed to fetch assignment grade', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch assignment grade'));
    }
  });
};