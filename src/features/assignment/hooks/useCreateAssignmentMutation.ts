import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { Assignment, CreateAssignmentRequest } from '../lib/dto';

export const useCreateAssignmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (createData: CreateAssignmentRequest) => {
      const response = await apiClient.post(`/assignments`, createData);
      return response.data as Assignment;
    },
    onSuccess: (data, variables) => {
      // 생성 성공 후 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ['assignments', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['course-assignments', variables.course_id] });
    },
    onError: (error) => {
      console.error('Create assignment error:', error);
    },
  });
};