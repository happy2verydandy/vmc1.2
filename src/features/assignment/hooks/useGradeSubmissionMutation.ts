import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { GradeSubmissionRequest, Submission } from '../lib/dto';

export const useGradeSubmissionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ submissionId, gradeData }: { submissionId: string; gradeData: GradeSubmissionRequest }) => {
      const response = await apiClient.post(`/submissions/${submissionId}/grade`, gradeData);
      return response.data as Submission;
    },
    onSuccess: (data, variables) => {
      // 채점 성공 후 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['submission', variables.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['submissions', data.assignment_id] });
    },
  });
};