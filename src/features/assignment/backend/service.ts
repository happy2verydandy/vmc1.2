import { AssignmentResponse, Assignment, SubmissionRequest, Submission } from './schema';
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