import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { SubmissionDetail } from '../lib/dto';

export const useSubmissionDetailQuery = (submissionId: string) => {
  return useQuery<SubmissionDetail, Error>({
    queryKey: ['submission', submissionId],
    queryFn: async () => {
      const response = await apiClient.get(`/submissions/${submissionId}`);
      return response.data;
    },
    enabled: !!submissionId,
  });
};