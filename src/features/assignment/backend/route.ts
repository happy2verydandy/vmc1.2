import { Hono } from 'hono';
import { 
  AssignmentResponseSchema, 
  SubmissionRequestSchema, 
  GetAssignmentRequestSchema,
  GradeSubmissionRequestSchema,
  GetSubmissionsRequestSchema,
  SubmissionDetailSchema,
  CreateAssignmentRequestSchema,
  UpdateAssignmentRequestSchema,
  PublishAssignmentRequestSchema,
  CloseAssignmentRequestSchema
} from './schema';
import { 
  getAssignmentDetail, 
  submitAssignment, 
  getAssignmentSubmission,
  getSubmissionsForAssignment,
  getSubmissionDetail,
  gradeSubmission,
  createAssignment,
  updateAssignment,
  publishAssignment,
  closeAssignment
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

  // Assignment 생성 (Instructor 전용)
  app.post('/assignments', withAuth(), async (c) => {
    try {
      const instructorId = c.get('user_id');
      const assignmentData = await c.req.json();

      // Validate request body
      const parsedAssignment = CreateAssignmentRequestSchema.safeParse(assignmentData);
      if (!parsedAssignment.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_DATA', 
          `Validation error: ${parsedAssignment.error.issues.map(i => i.message).join(', ')}`));
      }

      const validatedAssignment = parsedAssignment.data;

      const createdAssignment = await createAssignment(c.get('supabase'), instructorId, validatedAssignment);
      return respond(c, success(createdAssignment, 201));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to create assignment', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to create assignment'));
    }
  });

  // Assignment 업데이트 (Instructor 전용)
  app.patch('/assignments/:assignmentId', withAuth(), async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      const instructorId = c.get('user_id');
      const updateData = await c.req.json();

      // Validate assignmentId parameter
      const parsedId = GetAssignmentRequestSchema.safeParse({ assignmentId });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }

      // Validate request body
      const parsedUpdate = UpdateAssignmentRequestSchema.safeParse(updateData);
      if (!parsedUpdate.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_DATA', 
          `Validation error: ${parsedUpdate.error.issues.map(i => i.message).join(', ')}`));
      }

      const validatedUpdate = parsedUpdate.data;

      const updatedAssignment = await updateAssignment(c.get('supabase'), instructorId, assignmentId, validatedUpdate);
      return respond(c, success(updatedAssignment));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to update assignment', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to update assignment'));
    }
  });

  // Assignment 게시 (Instructor 전용)
  app.post('/assignments/:assignmentId/publish', withAuth(), async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      const instructorId = c.get('user_id');

      // Validate assignmentId parameter
      const parsedId = PublishAssignmentRequestSchema.safeParse({ assignmentId });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }

      const publishedAssignment = await publishAssignment(c.get('supabase'), instructorId, assignmentId);
      return respond(c, success(publishedAssignment));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to publish assignment', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to publish assignment'));
    }
  });

  // Assignment 마감 (Instructor 전용)
  app.post('/assignments/:assignmentId/close', withAuth(), async (c) => {
    try {
      const assignmentId = c.req.param('assignmentId');
      const instructorId = c.get('user_id');

      // Validate assignmentId parameter
      const parsedId = CloseAssignmentRequestSchema.safeParse({ assignmentId });
      if (!parsedId.success) {
        return respond(c, failure(400, 'INVALID_ASSIGNMENT_ID', 'Invalid assignment ID format'));
      }

      const closedAssignment = await closeAssignment(c.get('supabase'), instructorId, assignmentId);
      return respond(c, success(closedAssignment));
    } catch (error) {
      if (error instanceof AssignmentError) {
        return respond(c, failure(error.status as 400 | 401 | 403 | 404 | 500, 
          error.code, error.message));
      }
      c.get('logger').error('Failed to close assignment', { error });
      return respond(c, failure(500, 'INTERNAL_ERROR', 'Failed to close assignment'));
    }
  });
};