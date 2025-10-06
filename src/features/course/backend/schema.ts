import { z } from 'zod';

// Course-related schemas
export const CourseSchema = z.object({
  id: z.string().uuid(),
  instructor_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  difficulty_level: z.string().max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  max_enrollment: z.number().int().positive().optional(),
  current_enrollment: z.number().int().nonnegative().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CourseListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty_level: z.string().optional(),
  sort: z.enum(['latest', 'popular']).default('latest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
});

export const CourseIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const EnrollmentRequestSchema = z.object({
  course_id: z.string().uuid(),
});

export const EnrollmentResponseSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  learner_id: z.string().uuid(),
  enrolled_at: z.string().datetime(),
});