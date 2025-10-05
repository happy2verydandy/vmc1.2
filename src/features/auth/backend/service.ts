import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  OnboardRequestSchema,
  UserProfileTableRowSchema,
  TermsAgreementTableRowSchema,
  type OnboardRequest,
  type UserProfileTableRow,
  type TermsAgreementTableRow,
} from '@/features/auth/backend/schema';
import {
  authErrorCodes,
  type AuthServiceError,
} from '@/features/auth/backend/error';

const PROFILES_TABLE = 'profiles';
const TERMS_AGREEMENT_TABLE = 'terms_agreement';

export const onboardUser = async (
  client: SupabaseClient,
  request: OnboardRequest,
  termsAgreed: boolean,
  ipAddress?: string,
  userAgent?: string,
): Promise<HandlerResult<{ userId: string; email: string; role: string }, AuthServiceError, unknown>> => {
  // Validate terms agreement
  if (!termsAgreed) {
    return failure(400, authErrorCodes.termsNotAgreed, '이용 약관에 동의해야 합니다.');
  }

  // Parse and validate the request
  const parsedRequest = OnboardRequestSchema.safeParse(request);
  
  if (!parsedRequest.success) {
    return failure(400, authErrorCodes.invalidParams, 'Request validation failed', parsedRequest.error.format());
  }
  
  const { email, password, role, fullName, phone } = parsedRequest.data;

  // Check if user already exists
  const { data: existingUser, error: userCheckError } = await client
    .from(PROFILES_TABLE)
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    return failure(409, authErrorCodes.userAlreadyExists, '이미 존재하는 이메일입니다.');
  }

  // Create auth user
  const { data: authData, error: authError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto confirm email for onboarding
    user_metadata: { role },
  });

  if (authError) {
    return failure(500, authErrorCodes.createUserError, `Auth 사용자 생성 실패: ${authError.message}`);
  }

  const userId = authData.user.id;

  // Insert profile data
  const profileInsertResult = await client
    .from(PROFILES_TABLE)
    .insert([{
      id: userId,
      email,
      role,
      full_name: fullName,
      phone,
    }])
    .select()
    .single<UserProfileTableRow>();

  if (profileInsertResult.error) {
    // Rollback auth user creation if profile insertion fails
    await client.auth.admin.deleteUser(userId);
    return failure(500, authErrorCodes.profileCreationError, `프로필 생성 실패: ${profileInsertResult.error.message}`);
  }

  const profileRowParse = UserProfileTableRowSchema.safeParse(profileInsertResult.data);
  
  if (!profileRowParse.success) {
    // Rollback auth user creation if profile validation fails
    await client.auth.admin.deleteUser(userId);
    return failure(500, authErrorCodes.validationError, `프로필 데이터 검증 실패: ${profileRowParse.error.message}`);
  }

  // Insert terms agreement
  const termsInsertResult = await client
    .from(TERMS_AGREEMENT_TABLE)
    .insert([{
      user_id: userId,
      terms_type: 'general_terms',
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    }])
    .select()
    .single<TermsAgreementTableRow>();

  if (termsInsertResult.error) {
    // Rollback auth user creation and profile if terms insertion fails
    await client.auth.admin.deleteUser(userId);
    return failure(500, authErrorCodes.termsAgreementError, `약관 동의 저장 실패: ${termsInsertResult.error.message}`);
  }

  const termsRowParse = TermsAgreementTableRowSchema.safeParse(termsInsertResult.data);
  
  if (!termsRowParse.success) {
    // Rollback auth user creation and profile if terms validation fails
    await client.auth.admin.deleteUser(userId);
    return failure(500, authErrorCodes.validationError, `약관 데이터 검증 실패: ${termsRowParse.error.message}`);
  }

  return success({ userId, email, role });
};