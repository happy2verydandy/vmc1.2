'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { OnboardForm, OnboardResponse, OnboardResponseSchema } from '@/features/auth/lib/dto';

const onboardUser = async (data: OnboardForm): Promise<OnboardResponse> => {
  try {
    const response = await apiClient.post('/api/auth/onboard', data);
    
    // Validate response data with Zod
    const parsed = OnboardResponseSchema.parse(response.data);
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Zod')) {
      // This is a Zod validation error
      throw new Error(`서버 응답 형식이 올바르지 않습니다: ${error.message}`);
    }
    const message = extractApiErrorMessage(error, '회원가입에 실패했습니다.');
    throw new Error(message);
  }
};

export const useOnboardMutation = () => {
  return useMutation({
    mutationFn: onboardUser,
  });
};