import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { Assignment, UpdateAssignmentRequest } from '../lib/dto';

export const useUpdateAssignmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, updateData }: { assignmentId: string; updateData: UpdateAssignmentRequest }) => {
      const response = await apiClient.patch(`/assignments/${assignmentId}`, updateData);
      return response.data as Assignment;
    },
    onSuccess: (data) => {
      // 업데이트 성공 후 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ['assignment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['course-assignments', data.course_id] });
    },
    onError: (error) => {
      console.error('Update assignment error:', error);
    },
  });
};