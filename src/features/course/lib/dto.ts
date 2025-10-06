// Re-export backend schemas for use in frontend
export {
  CourseSchema,
  CourseListQuerySchema,
  CourseIdParamSchema,
  EnrollmentRequestSchema,
  EnrollmentResponseSchema,
} from '../backend/schema';

// Define additional frontend-specific types
export interface Course {
  id: string;
  instructor_id: string;
  instructor_name: string;
  title: string;
  description?: string;
  category?: string;
  difficulty_level?: string;
  status: 'draft' | 'published' | 'archived';
  max_enrollment?: number;
  current_enrollment: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  learner_id: string;
  enrolled_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CourseFilters {
  search?: string;
  category?: string;
  difficulty_level?: string;
  sort?: 'latest' | 'popular';
}

export interface EnrollmentStatus {
  is_enrolled: boolean;
}