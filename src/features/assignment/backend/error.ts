// Assignment 관련 에러 코드 정의
export enum AssignmentErrorCode {
  ASSIGNMENT_NOT_FOUND = 'ASSIGNMENT_NOT_FOUND',
  ASSIGNMENT_NOT_PUBLISHED = 'ASSIGNMENT_NOT_PUBLISHED',
  ASSIGNMENT_CLOSED = 'ASSMENT_CLOSED',
  USER_NOT_ENROLLED = 'USER_NOT_ENROLLED',
  SUBMISSION_NOT_FOUND = 'SUBMISSION_NOT_FOUND',
  INVALID_SUBMISSION_DATA = 'INVALID_SUBMISSION_DATA',
  SUBMISSION_NOT_ALLOWED = 'SUBMISSION_NOT_ALLOWED',
}

export class AssignmentError extends Error {
  constructor(
    public code: AssignmentErrorCode,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AssignmentError';
  }
}