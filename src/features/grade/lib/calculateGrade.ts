import { AssignmentGrade, CourseGradeSummary } from './dto';

/**
 * 코스별 총점 계산: (각 Assignment 점수 × 비중) 합산
 * @param assignments - 과제 점수 배열
 * @returns 총점 (0-100)
 */
export const calculateCourseTotalScore = (assignments: AssignmentGrade[]): number => {
  if (!assignments || assignments.length === 0) {
    return 0;
  }

  // 총 가중치 합계 계산
  const totalWeight = assignments.reduce((sum, assignment) => sum + assignment.weight, 0);
  
  if (totalWeight === 0) {
    return 0;
  }

  // 각 과제의 점수 * 비중 합산
  const weightedScoreSum = assignments.reduce((sum, assignment) => {
    if (assignment.score !== null) {
      return sum + (assignment.score * assignment.weight);
    }
    return sum;
  }, 0);

  // 실제 점수를 가진 과제들만 총 가중치로 나눔
  return Number(((weightedScoreSum / totalWeight) * 100).toFixed(2));
};

/**
 * 코스별 성적 요약 정보 생성
 * @param courseId - 코스 ID
 * @param courseTitle - 코스 제목
 * @param assignments - 과제 배열
 * @returns 코스 성적 요약
 */
export const createCourseGradeSummary = (
  courseId: string,
  courseTitle: string,
  assignments: AssignmentGrade[]
): CourseGradeSummary => {
  const totalScore = calculateCourseTotalScore(assignments);
  const assignmentsCount = assignments.length;
  const gradedAssignmentsCount = assignments.filter(
    assignment => assignment.score !== null
  ).length;

  return {
    course_id: courseId,
    course_title: courseTitle,
    total_score: totalScore,
    assignments_count: assignmentsCount,
    graded_assignments_count: gradedAssignmentsCount,
  };
};