import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Course, Enrollment, PaginatedResponse, CourseFilters, EnrollmentStatus } from '../lib/dto';
import { apiClient } from '@/lib/remote/api-client';

interface GetCoursesParams extends CourseFilters {
  page?: number;
  limit?: number;
}

export const useCoursesQuery = (params: GetCoursesParams = {}) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.difficulty_level) queryParams.append('difficulty_level', params.difficulty_level);
      if (params.sort) queryParams.append('sort', params.sort);
      queryParams.append('page', String(params.page || 1));
      queryParams.append('limit', String(params.limit || 10));

      const response = await apiClient.get(`/courses?${queryParams.toString()}`);
      
      return response.data.data as PaginatedResponse<Course>;
    },
  });
};

export const useCourseQuery = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${courseId}`);
      
      return response.data.data.course as Course;
    },
    enabled: !!courseId,
  });
};

export const useEnrollmentStatusQuery = (courseId: string) => {
  return useQuery({
    queryKey: ['enrollment-status', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${courseId}/enrollment-status`);
      
      return response.data.data as EnrollmentStatus;
    },
    enabled: !!courseId,
  });
};

export const useEnrollCourseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiClient.post(`/courses/${courseId}/enroll`);
      
      return response.data.data as { enrollment: Enrollment };
    },
    onSuccess: (data, courseId) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['enrollment-status', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};