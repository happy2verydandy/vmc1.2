import { z } from 'zod';

// Assignment 관련 스키마 정의
export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().datetime(),
  weight: z.number().min(0).max(100),
  late_submission_allowed: z.boolean().default(false),
  resubmission_allowed: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'closed']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AssignmentResponseSchema = AssignmentSchema.extend({
  course_title: z.string(),
  course_instructor_name: z.string(),
});

export const SubmissionRequestSchema = z.object({
  assignment_id: z.string().uuid(),
  content: z.string().min(1, 'Content is required'),
  link: z.string().url('Link must be a valid URL').optional().nullable(),
});

export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  learner_id: z.string().uuid(),
  content: z.string(),
  link: z.string().nullable(),
  submitted_at: z.string().datetime(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  is_late: z.boolean().default(false),
  grade: z.number().nullable(),
  feedback: z.string().nullable(),
  graded_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const GetAssignmentRequestSchema = z.object({
  assignmentId: z.string().uuid(),
});

export type Assignment = z.infer<typeof AssignmentSchema>;
export type AssignmentResponse = z.infer<typeof AssignmentResponseSchema>;
export type SubmissionRequest = z.infer<typeof SubmissionRequestSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;