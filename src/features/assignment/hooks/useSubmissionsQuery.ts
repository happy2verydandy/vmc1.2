import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { SubmissionDetail } from '../lib/dto';

export const useSubmissionsQuery = (assignmentId: string) => {
  return useQuery<SubmissionDetail[], Error>({
    queryKey: ['submissions', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return response.data;
    },
    enabled: !!assignmentId,
  });
};