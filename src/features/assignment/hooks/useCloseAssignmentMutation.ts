import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { Assignment, CloseAssignmentRequest } from '../lib/dto';

export const useCloseAssignmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (closeData: CloseAssignmentRequest) => {
      const response = await apiClient.post(`/assignments/${closeData.assignmentId}/close`, closeData);
      return response.data as Assignment;
    },
    onSuccess: (data, variables) => {
      // 마감 성공 후 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['course-assignments', data.course_id] });
    },
    onError: (error) => {
      console.error('Close assignment error:', error);
    },
  });
};