import { z } from 'zod';

// Grade 관련 스키마 정의
export const AssignmentGradeSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  assignment_title: z.string(),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  is_late: z.boolean().default(false),
  weight: z.number(), // 과제 비중
  submitted_at: z.string().datetime(),
  graded_at: z.string().datetime().nullable(),
});

export const CourseGradeSummarySchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  total_score: z.number(), // 코스 총점
  assignments_count: z.number(), // 과제 수
  graded_assignments_count: z.number(), // 채점된 과제 수
});

export const GradeSummarySchema = z.array(CourseGradeSummarySchema);

export const GradeDetailSchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  assignments: z.array(AssignmentGradeSchema),
});

export type AssignmentGrade = z.infer<typeof AssignmentGradeSchema>;
export type CourseGradeSummary = z.infer<typeof CourseGradeSummarySchema>;
export type GradeSummary = z.infer<typeof GradeSummarySchema>;
export type GradeDetail = z.infer<typeof GradeDetailSchema>;