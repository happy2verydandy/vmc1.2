import { 
  GradeSummary, 
  GradeDetail, 
  AssignmentGrade, 
  CourseGradeSummary 
} from './schema';
import { calculateCourseTotalScore, createCourseGradeSummary } from '../lib/calculateGrade';

type SupabaseClient = any; // 실제 Supabase 클라이언트 타입으로 대체 필요

/**
 * 사용자의 전체 성적 요약 정보를 조회하는 서비스 함수
 * - 사용자 ID를 기반으로 모든 수강 과목의 성적 요약을 반환
 */
export const getLearnerGradeSummary = async (
  supabase: SupabaseClient,
  userId: string
): Promise<GradeSummary> => {
  // 1. 사용자가 수강한 코스 정보 조회
  const { data: enrollments, error: enrollmentError } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses(title)
    `)
    .eq('learner_id', userId);

  if (enrollmentError) {
    throw new Error(`Failed to fetch enrollments: ${enrollmentError.message}`);
  }

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  // 2. 각 코스에 대한 성적 요약 생성
  const gradeSummaries: CourseGradeSummary[] = [];

  for (const enrollment of enrollments) {
    // 3. 해당 코스의 과제 및 제출 정보 조회
    const { data: assignmentSubmissions, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        id,
        assignment_id,
        assignments(title, weight),
        score,
        feedback,
        status,
        is_late,
        submitted_at,
        graded_at
      `)
      .eq('learner_id', userId)
      .eq('assignments.course_id', enrollment.course_id)
      .order('submitted_at', { ascending: false });

    if (submissionError) {
      console.error(`Failed to fetch submissions for course ${enrollment.course_id}:`, submissionError);
      continue; // 오류가 발생한 코스는 건너뛰고 계속 진행
    }

    // 4. AssignmentGrade 형식으로 변환
    const assignments: AssignmentGrade[] = assignmentSubmissions.map((sub: any) => ({
      id: sub.id,
      assignment_id: sub.assignment_id,
      assignment_title: sub.assignments?.title || 'Unknown Assignment',
      score: sub.score,
      feedback: sub.feedback,
      status: sub.status,
      is_late: sub.is_late,
      weight: sub.assignments?.weight || 0,
      submitted_at: sub.submitted_at,
      graded_at: sub.graded_at,
    }));

    // 5. 코스 성적 요약 생성
    const courseSummary = createCourseGradeSummary(
      enrollment.course_id,
      enrollment.courses?.title || 'Unknown Course',
      assignments
    );

    gradeSummaries.push(courseSummary);
  }

  return gradeSummaries;
};

/**
 * 특정 코스의 상세 성적 정보를 조회하는 서비스 함수
 */
export const getCourseGradeDetail = async (
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<GradeDetail> => {
  // 1. 코스 존재 여부 및 사용자 수강 여부 확인
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses(title)
    `)
    .eq('learner_id', userId)
    .eq('course_id', courseId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new Error(`User is not enrolled in course ${courseId}`);
  }

  // 2. 해당 코스의 모든 과제 제출 정보 조회
  const { data: assignmentSubmissions, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      id,
      assignment_id,
      assignments(title, weight),
      score,
      feedback,
      status,
      is_late,
      submitted_at,
      graded_at
    `)
    .eq('learner_id', userId)
    .eq('assignments.course_id', courseId)
    .order('submitted_at', { ascending: false });

  if (submissionError) {
    throw new Error(`Failed to fetch submissions for course ${courseId}: ${submissionError.message}`);
  }

  // 3. AssignmentGrade 형식으로 변환
  const assignments: AssignmentGrade[] = assignmentSubmissions.map((sub: any) => ({
    id: sub.id,
    assignment_id: sub.assignment_id,
    assignment_title: sub.assignments?.title || 'Unknown Assignment',
    score: sub.score,
    feedback: sub.feedback,
    status: sub.status,
    is_late: sub.is_late,
    weight: sub.assignments?.weight || 0,
    submitted_at: sub.submitted_at,
    graded_at: sub.graded_at,
  }));

  return {
    course_id: courseId,
    course_title: enrollment.courses?.title || 'Unknown Course',
    assignments,
  };
};

/**
 * 특정 과제의 성적 정보를 조회하는 서비스 함수
 */
export const getAssignmentGrade = async (
  supabase: SupabaseClient,
  userId: string,
  assignmentId: string
): Promise<AssignmentGrade | null> => {
  // 1. 특정 과제 제출 정보 조회
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      id,
      assignment_id,
      assignments(title, weight, course_id),
      score,
      feedback,
      status,
      is_late,
      submitted_at,
      graded_at
    `)
    .eq('learner_id', userId)
    .eq('assignment_id', assignmentId)
    .single();

  if (submissionError) {
    // 제출 내역이 없을 경우 null 반환
    return null;
  }

  if (!submission) {
    return null;
  }

  // 2. AssignmentGrade 형식으로 변환
  return {
    id: submission.id,
    assignment_id: submission.assignment_id,
    assignment_title: submission.assignments?.title || 'Unknown Assignment',
    score: submission.score,
    feedback: submission.feedback,
    status: submission.status,
    is_late: submission.is_late,
    weight: submission.assignments?.weight || 0,
    submitted_at: submission.submitted_at,
    graded_at: submission.graded_at,
  };
};