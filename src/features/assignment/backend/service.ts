import { AssignmentResponse, Assignment, SubmissionRequest, Submission, GradeSubmissionRequest, SubmissionDetail, CreateAssignmentRequest, UpdateAssignmentRequest } from './schema';
import { AssignmentError, AssignmentErrorCode } from './error';

type SupabaseClient = any; // 실제 Supabase 클라이언트 타입으로 대체 필요

/**
 * Assignment 상세 정보를 조회하는 서비스 함수
 * - 사용자 인증 여부 확인
 * - 사용자가 해당 코스에 등록되어 있는지 검증
 * - Assignment가 published 상태인지 확인
 * - Assignment 상세 정보 반환
 */
export const getAssignmentDetail = async (
  supabase: SupabaseClient,
  userId: string,
  assignmentId: string
): Promise<AssignmentResponse> => {
  // 1. Assignment 정보 조회
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      course_id,
      title,
      description,
      due_date,
      weight,
      late_submission_allowed,
      resubmission_allowed,
      status,
      created_at,
      updated_at,
      courses(title),
      profiles(full_name)
    `)
    .eq('id', assignmentId)
    .eq('status', 'published') // published 상태만 조회
    .single();

  if (assignmentError || !assignment) {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
      'Assignment not found or not published',
      404
    );
  }

  // 2. 사용자가 해당 코스에 등록되어 있는지 확인
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', assignment.course_id)
    .eq('learner_id', userId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new AssignmentError(
      AssignmentErrorCode.USER_NOT_ENROLLED,
      'User is not enrolled in this course',
      403
    );
  }

  // 3. Assignment 정보 반환
  return {
    id: assignment.id,
    course_id: assignment.course_id,
    title: assignment.title,
    description: assignment.description,
    due_date: assignment.due_date,
    weight: assignment.weight,
    late_submission_allowed: assignment.late_submission_allowed,
    resubmission_allowed: assignment.resubmission_allowed,
    status: assignment.status,
    created_at: assignment.created_at,
    updated_at: assignment.updated_at,
    course_title: assignment.courses?.title || '',
    course_instructor_name: assignment.profiles?.full_name || '',
  };
};

/**
 * Assignment 제출을 처리하는 서비스 함수
 * - 제출 데이터 유효성 검사
 * - 마감일 확인 및 지각 처리
 * - 재제출 가능 여부 확인
 * - 제출 정보 저장
 */
export const submitAssignment = async (
  supabase: SupabaseClient,
  userId: string,
  submissionData: SubmissionRequest
): Promise<Submission> => {
  const { assignment_id, content, link } = submissionData;

  // 1. Assignment 정보 조회
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignment_id)
    .eq('status', 'published')
    .single();

  if (assignmentError || !assignment) {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
      'Assignment not found or not published',
      404
    );
  }

  // 2. 사용자가 해당 코스에 등록되어 있는지 확인
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', assignment.course_id)
    .eq('learner_id', userId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new AssignmentError(
      AssignmentErrorCode.USER_NOT_ENROLLED,
      'User is not enrolled in this course',
      403
    );
  }

  // 3. 마감일 확인
  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const isLate = now > dueDate;
  
  // 마감 후 제출이 허용되지 않았고 마감이 지난 경우
  if (isLate && !assignment.late_submission_allowed) {
    throw new AssignmentError(
      AssignmentErrorCode.SUBMISSION_NOT_ALLOWED,
      'Assignment submission deadline has passed',
      400
    );
  }

  // 4. 기존 제출 정보 확인
  const { data: existingSubmission, error: existingError } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignment_id)
    .eq('learner_id', userId)
    .single();

  // 재제출이 허용되지 않았고 이미 제출한 경우
  if (existingSubmission && !assignment.resubmission_allowed) {
    throw new AssignmentError(
      AssignmentErrorCode.SUBMISSION_NOT_ALLOWED,
      'Resubmission is not allowed for this assignment',
      400
    );
  }

  // 5. 제출 정보 저장
  // 상태는 항상 'submitted'로 설정
  const submissionStatus = 'submitted';
  
  const submissionDataToInsert = {
    assignment_id,
    learner_id: userId,
    content,
    link: link || null,
    status: submissionStatus,
    is_late: isLate,
    ...(existingSubmission ? { id: existingSubmission.id } : {}), // 기존 제출이 있으면 업데이트
  };

  let submission;
  if (existingSubmission) {
    // 기존 제출이 있으면 업데이트
    const { data, error } = await supabase
      .from('submissions')
      .update(submissionDataToInsert)
      .eq('id', existingSubmission.id)
      .select()
      .single();
      
    if (error) {
      throw new AssignmentError(
        AssignmentErrorCode.INVALID_SUBMISSION_DATA,
        'Failed to update submission: ' + error.message,
        400
      );
    }
    submission = data;
  } else {
    // 새로운 제출이면 삽입
    const { data, error } = await supabase
      .from('submissions')
      .insert(submissionDataToInsert)
      .select()
      .single();
      
    if (error) {
      throw new AssignmentError(
        AssignmentErrorCode.INVALID_SUBMISSION_DATA,
        'Failed to submit assignment: ' + error.message,
        400
      );
    }
    submission = data;
  }

  return submission as Submission;
};

/**
 * Assignment 제출 정보를 조회하는 서비스 함수
 * - 사용자 인증 여부 확인
 * - 사용자가 해당 과제에 제출한 내역이 있는지 확인
 */
export const getAssignmentSubmission = async (
  supabase: SupabaseClient,
  userId: string,
  assignmentId: string
): Promise<Submission | null> => {
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('learner_id', userId)
    .single();

  if (error) {
    // 제출 내역이 없을 경우 null 반환
    return null;
  }

  return submission as Submission;
};

/**
 * 특정 Assignment의 모든 제출물 목록을 조회하는 함수
 * - Instructor가 본인 코스의 과제에 대해서만 조회 가능
 */
export const getSubmissionsForAssignment = async (
  supabase: SupabaseClient,
  instructorId: string,
  assignmentId: string
): Promise<SubmissionDetail[]> => {
  // 1. Assignment가 Instructor의 코스에 속하는지 확인
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      course_id,
      courses(instructor_id)
    `)
    .eq('id', assignmentId)
    .eq('courses.instructor_id', instructorId)
    .single();

  if (assignmentError || !assignment) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to assignment',
      403
    );
  }

  // 2. 해당 Assignment의 모든 제출물 조회
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select(`
      submissions.*,
      profiles(full_name)
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });

  if (submissionsError) {
    throw new AssignmentError(
      AssignmentErrorCode.SUBMISSIONS_FETCH_ERROR,
      'Failed to fetch submissions',
      500
    );
  }

  // 3. 제출물 목록 반환
  return submissions.map(sub => ({
    id: sub.id,
    assignment_id: sub.assignment_id,
    learner_id: sub.learner_id,
    learner_name: sub.profiles?.full_name || 'Unknown',
    content: sub.content,
    link: sub.link,
    submitted_at: sub.submitted_at,
    status: sub.status,
    is_late: sub.is_late,
    grade: sub.grade,
    feedback: sub.feedback,
    graded_at: sub.graded_at,
    created_at: sub.created_at,
    updated_at: sub.updated_at,
  }));
};

/**
 * 특정 제출물의 상세 정보를 조회하는 함수
 * - Instructor가 본인 코스의 과제에 대해서만 조회 가능
 */
export const getSubmissionDetail = async (
  supabase: SupabaseClient,
  instructorId: string,
  submissionId: string
): Promise<SubmissionDetail> => {
  // 1. 제출물 정보 조회
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      submissions.*,
      assignments(course_id),
      courses(instructor_id),
      profiles(full_name)
    `)
    .eq('submissions.id', submissionId)
    .single();

  if (submissionError || !submission) {
    throw new AssignmentError(
      AssignmentErrorCode.SUBMISSION_NOT_FOUND,
      'Submission not found',
      404
    );
  }

  // 2. Instructor가 해당 과제의 담당자인지 확인
  if (submission.courses.instructor_id !== instructorId) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to submission',
      403
    );
  }

  // 3. 제출물 상세 정보 반환
  return {
    id: submission.id,
    assignment_id: submission.assignment_id,
    learner_id: submission.learner_id,
    learner_name: submission.profiles?.full_name || 'Unknown',
    content: submission.content,
    link: submission.link,
    submitted_at: submission.submitted_at,
    status: submission.status,
    is_late: submission.is_late,
    grade: submission.grade,
    feedback: submission.feedback,
    graded_at: submission.graded_at,
    created_at: submission.created_at,
    updated_at: submission.updated_at,
  };
};

/**
 * 제출물을 채점하는 함수
 * - 점수(0~100) 및 피드백 저장
 * - 상태 업데이트 (graded / resubmission_required)
 * - Instructor가 본인 코스의 과제에 대해서만 채점 가능
 */
export const gradeSubmission = async (
  supabase: SupabaseClient,
  instructorId: string,
  submissionId: string,
  gradeData: GradeSubmissionRequest
): Promise<Submission> => {
  const { grade, feedback, status } = gradeData;

  // 1. 제출물 정보 조회
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      id,
      assignment_id,
      assignments(course_id),
      courses(instructor_id)
    `)
    .eq('submissions.id', submissionId)
    .single();

  if (submissionError || !submission) {
    throw new AssignmentError(
      AssignmentErrorCode.SUBMISSION_NOT_FOUND,
      'Submission not found',
      404
    );
  }

  // 2. Instructor가 해당 과제의 담당자인지 확인
  if (submission.courses.instructor_id !== instructorId) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to submission',
      403
    );
  }

  // 3. 점수 범위 및 피드백 검증
  if (grade < 0 || grade > 100) {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_GRADE,
      'Grade must be between 0 and 100',
      400
    );
  }

  // 4. 제출물 업데이트
  const updateData: any = {
    grade,
    feedback,
    status,
    graded_at: new Date().toISOString(),
  };

  const { data: updatedSubmission, error: updateError } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();

  if (updateError) {
    throw new AssignmentError(
      AssignmentErrorCode.GRADE_SUBMISSION_ERROR,
      'Failed to grade submission: ' + updateError.message,
      500
    );
  }

  return updatedSubmission as Submission;
};

/**
 * Assignment를 생성하는 서비스 함수
 * - Instructor가 본인 코스에 대한 과제 생성
 * - 기본적으로 draft 상태로 생성
 */
export const createAssignment = async (
  supabase: SupabaseClient,
  instructorId: string,
  assignmentData: CreateAssignmentRequest
): Promise<Assignment> => {
  const { course_id, title, description, due_date, weight, late_submission_allowed, resubmission_allowed, status } = assignmentData;

  // 1. Instructor가 해당 코스의 강사인지 확인
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('id', course_id)
    .eq('instructor_id', instructorId)
    .single();

  if (courseError || !course) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to course',
      403
    );
  }

  // 2. 마감일이 유효한지 확인 (과거일 수 없음)
  const dueDate = new Date(due_date);
  const now = new Date();
  if (dueDate < now && status === 'published') {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
      'Due date cannot be in the past when publishing assignment',
      400
    );
  }

  // 3. Assignment 생성
  const newAssignment = {
    course_id,
    title,
    description: description || '',
    due_date,
    weight,
    late_submission_allowed,
    resubmission_allowed,
    status: status || 'draft',
  };

  const { data: createdAssignment, error: createError } = await supabase
    .from('assignments')
    .insert(newAssignment)
    .select()
    .single();

  if (createError) {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
      'Failed to create assignment: ' + createError.message,
      500
    );
  }

  return createdAssignment as Assignment;
};

/**
 * Assignment를 업데이트하는 서비스 함수
 * - Instructor가 본인 코스에 대한 과제 수정
 * - 상태 전이 유효성 검사 포함
 */
export const updateAssignment = async (
  supabase: SupabaseClient,
  instructorId: string,
  assignmentId: string,
  updateData: UpdateAssignmentRequest
): Promise<Assignment> => {
  // 1. Assignment 정보 조회
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      course_id,
      status,
      courses(instructor_id)
    `)
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
      'Assignment not found',
      404
    );
  }

  // 2. Instructor가 해당 과제의 강사인지 확인
  if (assignment.courses.instructor_id !== instructorId) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to assignment',
      403
    );
  }

  // 3. 상태 전이 유효성 검사
  const currentStatus = assignment.status;
  const newStatus = updateData.status;
  if (newStatus) {
    if (
      (currentStatus === 'published' && newStatus === 'draft') ||
      (currentStatus === 'closed' && newStatus === 'draft') ||
      (currentStatus === 'closed' && newStatus === 'published')
    ) {
      throw new AssignmentError(
        AssignmentErrorCode.INVALID_STATUS_TRANSITION,
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  // 4. 마감일이 변경되었고, 상태가 published인 경우 유효성 검사
  if (updateData.due_date && assignment.status === 'published') {
    const dueDate = new Date(updateData.due_date);
    const now = new Date();
    if (dueDate < now) {
      throw new AssignmentError(
        AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
        'Due date cannot be in the past for published assignment',
        400
      );
    }
  }

  // 5. Assignment 업데이트
  const { data: updatedAssignment, error: updateError } = await supabase
    .from('assignments')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (updateError) {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
      'Failed to update assignment: ' + updateError.message,
      500
    );
  }

  return updatedAssignment as Assignment;
};

/**
 * Assignment를 게시하는 서비스 함수
 * - Assignment 상태를 draft에서 published로 변경
 */
export const publishAssignment = async (
  supabase: SupabaseClient,
  instructorId: string,
  assignmentId: string
): Promise<Assignment> => {
  // 1. Assignment 정보 조회
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      course_id,
      status,
      due_date,
      courses(instructor_id)
    `)
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
      'Assignment not found',
      404
    );
  }

  // 2. Instructor가 해당 과제의 강사인지 확인
  if (assignment.courses.instructor_id !== instructorId) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to assignment',
      403
    );
  }

  // 3. 현재 상태가 draft인지 확인
  if (assignment.status !== 'draft') {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_ALREADY_PUBLISHED,
      'Assignment is not in draft state',
      400
    );
  }

  // 4. 마감일이 유효한지 확인
  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  if (dueDate < now) {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
      'Due date cannot be in the past when publishing assignment',
      400
    );
  }

  // 5. Assignment 상태를 published로 변경
  const { data: updatedAssignment, error: updateError } = await supabase
    .from('assignments')
    .update({ 
      status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (updateError) {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
      'Failed to publish assignment: ' + updateError.message,
      500
    );
  }

  return updatedAssignment as Assignment;
};

/**
 * Assignment를 마감하는 서비스 함수
 * - Assignment 상태를 published에서 closed로 변경
 */
export const closeAssignment = async (
  supabase: SupabaseClient,
  instructorId: string,
  assignmentId: string
): Promise<Assignment> => {
  // 1. Assignment 정보 조회
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      id,
      course_id,
      status,
      courses(instructor_id)
    `)
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
      'Assignment not found',
      404
    );
  }

  // 2. Instructor가 해당 과제의 강사인지 확인
  if (assignment.courses.instructor_id !== instructorId) {
    throw new AssignmentError(
      AssignmentErrorCode.UNAUTHORIZED_ACCESS,
      'Unauthorized access to assignment',
      403
    );
  }

  // 3. 현재 상태가 published인지 확인
  if (assignment.status !== 'published') {
    throw new AssignmentError(
      AssignmentErrorCode.ASSIGNMENT_ALREADY_CLOSED,
      'Assignment is not in published state',
      400
    );
  }

  // 4. Assignment 상태를 closed로 변경
  const { data: updatedAssignment, error: updateError } = await supabase
    .from('assignments')
    .update({ 
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (updateError) {
    throw new AssignmentError(
      AssignmentErrorCode.INVALID_ASSIGNMENT_DATA,
      'Failed to close assignment: ' + updateError.message,
      500
    );
  }

  return updatedAssignment as Assignment;
};