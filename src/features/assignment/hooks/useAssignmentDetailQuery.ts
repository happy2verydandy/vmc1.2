import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { AssignmentResponse } from '../lib/dto';

export const useAssignmentDetailQuery = (assignmentId: string) => {
  return useQuery<AssignmentResponse, Error>({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data;
    },
    enabled: !!assignmentId,
  });
};