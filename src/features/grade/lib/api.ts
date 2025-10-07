import { apiClient } from '@/lib/remote/api-client';
import { GradeSummary, GradeDetail } from '../lib/dto';

/**
 * 사용자의 전체 성적 요약을 가져옵니다.
 */
export const fetchGradeSummary = async (): Promise<GradeSummary> => {
  const response = await apiClient.get('/grades');
  return response.data;
};

/**
 * 특정 코스의 상세 성적을 가져옵니다.
 */
export const fetchCourseGradeDetail = async (courseId: string): Promise<GradeDetail> => {
  const response = await apiClient.get(`/grades/courses/${courseId}`);
  return response.data;
};

/**
 * 특정 과제의 성적을 가져옵니다.
 */
export const fetchAssignmentGrade = async (assignmentId: string): Promise<any> => {
  const response = await apiClient.get(`/grades/assignments/${assignmentId}`);
  return response.data;
};