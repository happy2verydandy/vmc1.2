export enum CourseErrorCode {
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  ENROLLMENT_UNAVAILABLE = 'ENROLLMENT_UNAVAILABLE',
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
  ENROLLMENT_LIMIT_EXCEEDED = 'ENROLLMENT_LIMIT_EXCEEDED',
  USER_NOT_LEARNER = 'USER_NOT_LEARNER',
  COURSE_NOT_PUBLISHED = 'COURSE_NOT_PUBLISHED',
}

export class CourseError extends Error {
  constructor(
    public code: CourseErrorCode,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'CourseError';
  }
}