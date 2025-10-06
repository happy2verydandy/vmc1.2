import { z } from 'zod';

// User role schema
export const UserRoleSchema = z.enum(['learner', 'instructor']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// User profile schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  fullName: z.string().min(1, '이름을 입력해주세요.'),
  phone: z.string().regex(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/, '유효한 휴대폰번호 형식이 아닙니다.'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Terms agreement schema
export const TermsAgreementSchema = z.object({
  termsType: z.string(),
  agreedAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type TermsAgreement = z.infer<typeof TermsAgreementSchema>;

// Onboarding request schema
export const OnboardRequestSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  role: UserRoleSchema,
  fullName: z.string().min(1, '이름을 입력해주세요.'),
  phone: z.string().regex(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/, '유효한 휴대폰번호 형식이 아닙니다.'),
});

// Onboarding form schema (includes terms agreement validation)
export const OnboardFormSchema = OnboardRequestSchema.extend({
  termsAgreed: z.boolean().refine(value => value === true, {
    message: '이용 약관에 동의해야 합니다.'
  })
});

export type OnboardForm = z.infer<typeof OnboardFormSchema>;

export type OnboardRequest = z.infer<typeof OnboardRequestSchema>;

// Onboarding response schema
export const OnboardResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  profile: UserProfileSchema.optional(),
  message: z.string()
});

export type OnboardResponse = z.infer<typeof OnboardResponseSchema>;

// Database row schemas
export const UserProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  full_name: z.string(),
  phone: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfileTableRow = z.infer<typeof UserProfileTableRowSchema>;

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const TermsAgreementTableRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  terms_type: z.string(),
  agreed_at: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TermsAgreementTableRow = z.infer<typeof TermsAgreementTableRowSchema>;