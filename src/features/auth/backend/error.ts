export const authErrorCodes = {
  invalidParams: 'AUTH_INVALID_PARAMS',
  termsNotAgreed: 'AUTH_TERMS_NOT_AGREED',
  userAlreadyExists: 'AUTH_USER_ALREADY_EXISTS',
  createUserError: 'AUTH_CREATE_USER_ERROR',
  profileCreationError: 'AUTH_PROFILE_CREATION_ERROR',
  termsAgreementError: 'AUTH_TERMS_AGREEMENT_ERROR',
  validationError: 'AUTH_VALIDATION_ERROR',
  unexpectedError: 'AUTH_UNEXPECTED_ERROR',
  loginFailed: 'AUTH_LOGIN_FAILED',
  profileFetchError: 'AUTH_PROFILE_FETCH_ERROR',
  unknownError: 'AUTH_UNKNOWN_ERROR',
} as const;

type AuthErrorValue = (typeof authErrorCodes)[keyof typeof authErrorCodes];

export type AuthServiceError = AuthErrorValue;