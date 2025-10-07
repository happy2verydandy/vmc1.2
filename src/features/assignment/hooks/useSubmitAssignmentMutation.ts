import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { Submission, SubmissionRequest } from '../lib/dto';

export const useSubmitAssignmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (submissionData: SubmissionRequest) => {
      const response = await apiClient.post(`/assignments/${submissionData.assignment_id}/submit`, submissionData);
      return response.data as Submission;
    },
    onSuccess: (data, variables) => {
      // 제출 성공 후 쿼리 무효화하여 최신 정보 가져오기
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['assignment-submission', variables.assignment_id] });
    },
  });
};

export const useAssignmentSubmissionQuery = (assignmentId: string) => {
  return useQuery<Submission | null, Error>({
    queryKey: ['assignment-submission', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}/submission`);
      return response.data;
    },
    enabled: !!assignmentId,
  });
};