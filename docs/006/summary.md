# Assignment 게시/마감 (Instructor) 기능 구현 요약

## 구현 내용

구현 완료된 Assignment 게시/마감 (Instructor) 기능에 대한 요약입니다. 이 기능을 통해 강사는 과제를 생성, 수정, 게시, 마감할 수 있습니다.

## 구현된 모듈

### 1. Backend Schema (`src/features/assignment/backend/schema.ts`)
- `CreateAssignmentRequestSchema`: 과제 생성 요청 스키마
- `UpdateAssignmentRequestSchema`: 과제 수정 요청 스키마
- `PublishAssignmentRequestSchema`: 과제 게시 요청 스키마
- `CloseAssignmentRequestSchema`: 과제 마감 요청 스키마

### 2. Backend Service (`src/features/assignment/backend/service.ts`)
- `createAssignment`: 과제 생성 로직
- `updateAssignment`: 과제 수정 로직
- `publishAssignment`: 과제 게시 로직 (draft → published)
- `closeAssignment`: 과제 마감 로직 (published → closed)

### 3. Backend Routes (`src/features/assignment/backend/route.ts`)
- `POST /assignments`: 과제 생성 엔드포인트
- `PATCH /assignments/:assignmentId`: 과제 수정 엔드포인트
- `POST /assignments/:assignmentId/publish`: 과제 게시 엔드포인트
- `POST /assignments/:assignmentId/close`: 과제 마감 엔드포인트

### 4. Frontend Hooks
- `useCreateAssignmentMutation.ts`: 과제 생성 React Query 훅
- `useUpdateAssignmentMutation.ts`: 과제 수정 React Query 훅
- `usePublishAssignmentMutation.ts`: 과제 게시 React Query 훅
- `useCloseAssignmentMutation.ts`: 과제 마감 React Query 훅

### 5. Frontend Components
- `AssignmentPublishForm.tsx`: 과제 생성/수정/게시 폼 컴포넌트
- `AssignmentCloseButton.tsx`: 과제 마감 버튼 컴포넌트
- `AssignmentStatusBadge.tsx`: 과제 상태 표시 컴포넌트

### 6. Shared Utilities
- `assignmentStatusService.ts`: 상태 전이 유효성 검사 및 상태 표시 유틸리티

## 주요 기능

1. **과제 생성**: 강사는 새로운 과제를 생성할 수 있으며, 초안 상태로 시작
2. **과제 수정**: 강사는 과제 정보를 수정할 수 있음
3. **과제 게시**: 강사는 과제를 게시하여 학습자가 볼 수 있도록 함 (draft → published)
4. **과제 마감**: 강사는 과제를 마감하여 학습자의 제출을 불가능하게 함 (published → closed)

## 상태 전이 규칙

- `draft` → `published` (게시 가능)
- `draft` → `closed` (초기 작성 후 바로 마감 가능)
- `published` → `closed` (정상적인 마감 흐름)
- `closed` → `published` (불가능)
- `closed` → `draft` (불가능)
- `published` → `draft` (불가능)

## API 엔드포인트

- `POST /api/assignments` - 과제 생성
- `PATCH /api/assignments/:assignmentId` - 과제 수정
- `POST /api/assignments/:assignmentId/publish` - 과제 게시
- `POST /api/assignments/:assignmentId/close` - 과제 마감

## 결과 확인 URL

- Instructor 대시보드: `/dashboard` (과제 생성/관리 가능)
- Course별 과제 관리: `/instructor/[courseId]/assignments` (과제 게시/마감 기능 포함)

## 테스트 및 검증

- 타입 오류 없음: ✅
- 린팅 오류 없음: ✅
- 빌드 성공: ✅
- 컴포넌트 오류 없음: ✅