import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { Assignment, PublishAssignmentRequest } from '../lib/dto';

export const usePublishAssignmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (publishData: PublishAssignmentRequest) => {
      const response = await apiClient.post(`/assignments/${publishData.assignmentId}/publish`, publishData);
      return response.data as Assignment;
    },
    onSuccess: (data, variables) => {
      // 게시 성공 후 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['course-assignments', data.course_id] });
    },
    onError: (error) => {
      console.error('Publish assignment error:', error);
    },
  });
};