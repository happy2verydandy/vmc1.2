import { Hono } from 'hono';
import { 
  AssignmentResponseSchema, 
  SubmissionRequestSchema, 
  GetAssignmentRequestSchema,
  GradeSubmissionRequestSchema,
  GetSubmissionsRequestSchema,
  SubmissionDetailSchema
} from './schema';
import { 
  getAssignmentDetail, 
  submitAssignment, 
  getAssignmentSubmission,
  getSubmissionsForAssignment,
  getSubmissionDetail,
  gradeSubmission
} from './service';
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

  // Assignment별 제출물 목록 조회 (Instructor 전용)
  app.get('/assignments/:assignmentId/submissions', withAuth(), async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      const instructorId = c.get('user_id');

      // Validate assignmentId parameter
      const parsedId = GetSubmissionsRequestSchema.safeParse({ assignmentId });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }

      const submissions = await getSubmissionsForAssignment(c.get('supabase'), instructorId, assignmentId);
      return respond(c, success(submissions));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to fetch submissions', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch submissions'));
    }
  });

  // 제출물 상세 정보 조회 (Instructor 전용)
  app.get('/submissions/:submissionId', withAuth(), async (c) => {
    try {
      const submissionId = c.req.param('submissionId');
      const instructorId = c.get('user_id');

      // Validate submissionId parameter
      const parsedId = submissionId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      if (!parsedId) {
        return respond(c, failure(400, 'INVALID_SUBMISSION_ID', 'Invalid submission ID format'));
      }

      const submissionDetail = await getSubmissionDetail(c.get('supabase'), instructorId, submissionId);
      return respond(c, success(submissionDetail));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to fetch submission detail', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to fetch submission detail'));
    }
  });

  // 제출물 채점 (Instructor 전용)
  app.post('/submissions/:submissionId/grade', withAuth(), async (c) => {
    try {
      const submissionId = c.req.param('submissionId');
      const instructorId = c.get('user_id');
      const gradeData = await c.req.json();

      // Validate request body
      const parsedGrade = GradeSubmissionRequestSchema.safeParse(gradeData);
      if (!parsedGrade.success) {
        return respond(c, failure(400, 'INVALID_GRADE_DATA', 
          `Validation error: ${parsedGrade.error.issues.map(i => i.message).join(', ')}`));
      }

      const validatedGrade = parsedGrade.data;

      const updatedSubmission = await gradeSubmission(c.get('supabase'), instructorId, submissionId, validatedGrade);
      return respond(c, success(updatedSubmission));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to grade submission', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to grade submission'));
    }
  });
};