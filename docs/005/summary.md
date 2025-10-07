# 과제 채점 & 피드백 기능 구현 요약

## 개요
Instructor가 Learner의 과제 제출물을 확인하고, 점수와 피드백을 제공하며, 필요시 재제출을 요청하는 기능을 구현했습니다. 이 기능은 유스케이스 문서(005/spec.md) 및 설계서(005/plan.md)를 기반으로 개발되었습니다.

## 구현된 모듈

### 백엔드 모듈

1. **Schema (`src/features/assignment/backend/schema.ts`)**:
   - `GradeSubmissionRequestSchema`: 채점기를 위한 요청 데이터 검증 스키마
   - `GetSubmissionsRequestSchema`: 제출물 목록 조회를 위한 파라미터 검증 스키마
   - `SubmissionDetailSchema`: 제출물 상세 정보를 위한 응답 스키마

2. **Service (`src/features/assignment/backend/service.ts`)**:
   - `getSubmissionsForAssignment`: 특정 Assignment의 모든 제출물 목록 조회
   - `getSubmissionDetail`: 특정 제출물의 상세 정보 조회
   - `gradeSubmission`: 제출물 채점 및 피드백 저장

3. **Error (`src/features/assignment/backend/error.ts`)**:
   - `UNAUTHORIZED_ACCESS`, `SUBMISSIONS_FETCH_ERROR`, `INVALID_GRADE`, `GRADE_SUBMISSION_ERROR` 등 새로운 에러 코드 추가

4. **Route (`src/features/assignment/backend/route.ts`)**:
   - `GET /assignments/:assignmentId/submissions`: Assignment별 제출물 목록 조회
   - `GET /submissions/:submissionId`: 제출물 상세 정보 조회
   - `POST /submissions/:submissionId/grade`: 제출물 채점

### 프론트엔드 모듈

1. **DTO (`src/features/assignment/lib/dto.ts`)**:
   - 새로운 스키마 타입 추가

2. **Hooks (`src/features/assignment/hooks/`)**:
   - `useSubmissionsQuery`: Assignment별 제출물 목록 조회 훅
   - `useSubmissionDetailQuery`: 제출물 상세 조회 훅
   - `useGradeSubmissionMutation`: 제출물 채점 훅

3. **Components (`src/features/assignment/components/`)**:
   - `SubmissionListView`: 제출물 목록 표시 컴포넌트
   - `SubmissionDetailView`: 제출물 상세 정보 표시 컴포넌트
   - `GradeSubmissionForm`: 점수 및 피드백 입력 폼 컴포넌트

4. **Pages (`src/app/(protected)/instructor/[courseId]/assignments/[assignmentId]/submissions/[submissionId]/page.tsx`)**:
   - Instructor용 채점 UI를 위한 페이지

## 주요 기능

1. **권한 검증**: Instructor는 본인의 코스에 속한 Assignment에 대해서만 접근 가능
2. **점수 검증**: 0~100 범위를 벗어나는 점수는 허용하지 않음
3. **채점 상태 관리**: `graded` 또는 `resubmission_required` 상태로 관리
4. **피드백 필수 입력**: 채점 시 피드백이 필수 입력 항목으로 설정
5. **실시간 반영**: 채점 후 관련 쿼리가 자동으로 무효화되어 최신 정보 표시

## 결과 확인 URL

- Instructor 채점 페이지: `http://localhost:3000/(protected)/instructor/[courseId]/assignments/[assignmentId]/submissions/[submissionId]`
- API 엔드포인트:
  - 제출물 목록: `GET /api/assignments/:assignmentId/submissions`
  - 제출물 상세: `GET /api/submissions/:submissionId`
  - 제출물 채점: `POST /api/submissions/:submissionId/grade`

## 기술적 고려사항

- 모든 컴포넌트는 Client Component로 구현 (AGENTS.md 준수)
- React Query를 사용한 서버 상태 관리
- Zod 스키마를 통한 요청/응답 데이터 검증
- Hono를 통한 타입 안전한 API 라우팅
- DTO를 통한 백엔드-프론트엔드 간 타입 공유

## 빌드 오류 수정 사항

- 기존 `@/components/ui/table` 컴포넌트 대신 표준 HTML 테이블 요소 사용
- `next-view-transitions` 대신 표준 `next/link` 사용
- 모든 컴포넌트 오류 수정 및 빌드 성공 확인