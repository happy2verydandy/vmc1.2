import { useQuery } from '@tanstack/react-query';
import { 
  fetchGradeSummary, 
  fetchCourseGradeDetail, 
  fetchAssignmentGrade 
} from '../lib/api';
import { GradeSummary, GradeDetail } from '../lib/dto';

export const useGradeSummaryQuery = () => {
  return useQuery<GradeSummary, Error>({
    queryKey: ['grade-summary'],
    queryFn: async () => {
      try {
        const data = await fetchGradeSummary();
        return data;
      } catch (error) {
        console.error('Error fetching grade summary:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCourseGradeDetailQuery = (courseId: string) => {
  return useQuery<GradeDetail, Error>({
    queryKey: ['course-grade-detail', courseId],
    queryFn: async () => {
      try {
        const data = await fetchCourseGradeDetail(courseId);
        return data;
      } catch (error) {
        console.error(`Error fetching course grade detail for course ${courseId}:`, error);
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssignmentGradeQuery = (assignmentId: string) => {
  return useQuery<any, Error>({
    queryKey: ['assignment-grade', assignmentId],
    queryFn: async () => {
      try {
        const data = await fetchAssignmentGrade(assignmentId);
        return data;
      } catch (error) {
        console.error(`Error fetching assignment grade for assignment ${assignmentId}:`, error);
        throw error;
      }
    },
    enabled: !!assignmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};