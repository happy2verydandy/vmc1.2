import { Hono } from 'hono';
import { AssignmentResponseSchema, SubmissionRequestSchema, GetAssignmentRequestSchema } from './schema';
import { getAssignmentDetail, submitAssignment, getAssignmentSubmission } from './service';
import { AssignmentError, AssignmentErrorCode } from './error';
import type { AppEnv } from '@/backend/hono/context';
import { failure, respond, success } from '@/backend/http/response';
import { getUserId } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/with-auth';

export const registerAssignmentRoutes = (app: Hono<AppEnv>) => {
  // Assignment 상세 정보 조회
  app.get('/assignments/:assignmentId', async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      
      // Validate assignmentId parameter
      const parsedId = GetAssignmentRequestSchema.safeParse({ assignmentId });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }
      
      const userId = getUserId(c);

      if (!userId) {
        return respond(c, failure(401, 'UNAUTHENTICATED', 'Authentication required'));
      }

      const assignmentDetail = await getAssignmentDetail(c.get('supabase'), userId, assignmentId);
      return respond(c, success(assignmentDetail));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to fetch assignment detail', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch assignment detail'));
    }
  });

  // Assignment 제출
  app.post('/assignments/:assignmentId/submit', withAuth(), async (c) => {
    try {
      const submissionData = await c.req.json();
      const userId = c.get('user_id');
      const urlAssignmentId = c.req.param('assignmentId');
      
      // Validate request body
      const parsedSubmission = SubmissionRequestSchema.safeParse(submissionData);
      if (!parsedSubmission.success) {
        return respond(c, failure(400, 'INVALID_SUBMISSION_DATA', 
          `Validation error: ${parsedSubmission.error.issues.map(i => i.message).join(', ')}`));
      }
      
      const validatedSubmission = parsedSubmission.data;

      // assignmentId도 submissionData에 포함되지만, URL 파라미터로도 전달받아 일치 여부 확인
      if (validatedSubmission.assignment_id !== urlAssignmentId) {
        return respond(c, failure(400, 'ASSIGNMENT_ID_MISMATCH', 'Assignment ID mismatch'));
      }

      const submission = await submitAssignment(c.get('supabase'), userId, validatedSubmission);
      return respond(c, success(submission, 201));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to submit assignment', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to submit assignment'));
    }
  });

  // Assignment 제출 정보 조회
  app.get('/assignments/:assignmentId/submission', withAuth(), async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      const userId = c.get('user_id');

      // Validate assignmentId parameter
      const parsedId = GetAssignmentRequestSchema.safeParse({ assignmentId });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }

      const submission = await getAssignmentSubmission(c.get('supabase'), userId, assignmentId);
      return respond(c, success(submission));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to fetch assignment submission', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch assignment submission'));
    }
  });
};