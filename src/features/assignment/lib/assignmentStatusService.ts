import { Assignment } from './dto';

/**
 * Assignment 상태 전이 유효성 검사
 * @param from 현재 상태
 * @param to 목표 상태
 * @returns 상태 전이가 유효한지 여부
 */
export const isValidStatusTransition = (from: string, to: string): boolean => {
  if (from === to) return true; // 동일한 상태로의 전이 허용

  // draft -> published, draft -> closed (초기 작성 후 바로 마감하는 경우)
  if (from === 'draft' && (to === 'published' || to === 'closed')) return true;

  // published -> closed (정상적인 마감 흐름)
  if (from === 'published' && to === 'closed') return true;

  // closed 상태에서 다른 상태로는 전이 불가 (역방향은 허용되지 않음)
  // draft/published -> draft (이전 상태로 되돌리는 것은 허용되지 않음)
  return false;
};

/**
 * Assignment 상태에 대한 사용자 친화적인 표시 문자열 반환
 * @param status Assignment 상태
 * @returns 표시할 상태 텍스트
 */
export const getAssignmentStatusDisplay = (status: string): string => {
  switch (status) {
    case 'draft':
      return '작성 중';
    case 'published':
      return '게시됨';
    case 'closed':
      return '마감됨';
    default:
      return status;
  }
};

/**
 * Assignment 상태에 대한 색상 클래스 반환
 * @param status Assignment 상태
 * @returns Tailwind CSS 색상 클래스
 */
export const getAssignmentStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'published':
      return 'bg-blue-100 text-blue-800';
    case 'closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Assignment 상태에 따라 버튼 활성화 여부 반환
 * @param assignment Assignment 객체
 * @returns 게시/마감 버튼 활성화 여부
 */
export const getAssignmentActions = (assignment: Assignment) => {
  return {
    canPublish: assignment.status === 'draft',
    canClose: assignment.status === 'published',
    canEdit: assignment.status === 'draft' || assignment.status === 'published',
    canSubmit: assignment.status === 'published',
  };
};