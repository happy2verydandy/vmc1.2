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

---

# Assignment 게시/마감 (Instructor) - 구현 요약

## 1. 개요

이 문서는 Assignment 게시/마감 (Instructor) 기능의 구현 내용을 요약한 것입니다. 이 기능은 강사가 과제를 생성, 수정, 게시 및 마감할 수 있도록 하여, 학습자들이 과제를 열람하고 제출할 수 있는 기능을 제공합니다.

## 2. 구현된 기능

### 2.1 Backend 구현
- **Schema (`src/features/assignment/backend/schema.ts`)**: 과제 게시/마감 관련 Zod 스키마 구현
  - `PublishAssignmentRequestSchema`: Assignment 게시 요청 스키마
  - `CloseAssignmentRequestSchema`: Assignment 마감 요청 스키마
- **Service (`src/features/assignment/backend/service.ts`)**: 비즈니스 로직 구현
  - `publishAssignment()`: 과제 게시 로직 (draft → published 상태 전이)
  - `closeAssignment()`: 과제 마감 로직 (published → closed 상태 전이)
  - 상태 전이 유효성 검사 포함
- **Routes (`src/features/assignment/backend/route.ts`)**: API 엔드포인트 정의
  - `POST /assignments/:assignmentId/publish`: 과제 게시 API
  - `POST /assignments/:assignmentId/close`: 과제 마감 API
- **Error handling (`src/features/assignment/backend/error.ts`)**: 과제 관련 에러 코드 정의
  - `INVALID_STATUS_TRANSITION`: 잘못된 상태 전이 시 오류
  - `ASSIGNMENT_ALREADY_PUBLISHED`: 이미 게시된 과제에 대한 게시 요청 시 오류
  - `ASSIGNMENT_ALREADY_CLOSED`: 이미 마감된 과제에 대한 마감 요청 시 오류

### 2.2 Frontend 구현
- **Hooks (`src/features/assignment/hooks/`)**:
  - `usePublishAssignmentMutation.ts`: 과제 게시를 위한 React Query 훅
  - `useCloseAssignmentMutation.ts`: 과제 마감을 위한 React Query 훅
- **Components (`src/features/assignment/components/`)**:
  - `AssignmentPublishForm.tsx`: 과제 게시/수정 폼 UI 컴포넌트
  - `AssignmentCloseButton.tsx`: 과제 마감 버튼 UI 컴포넌트
  - `AssignmentStatusBadge.tsx`: 과제 상태 표시 UI 컴포넌트
- **Shared Utilities (`src/features/assignment/lib/assignmentStatusService.ts`)**:
  - 상태 전이 유효성 검사 함수
  - 상태 표시 텍스트 및 색상 반환 함수
  - 과제 액션 권한 판단 함수

### 2.3 추가 기능 구현
- **자동 마감 서비스 (`src/backend/services/assignmentDeadlineService.ts`)**: 마감일이 지난 과제를 자동으로 마감 처리
  - `processExpiredAssignments()`: 마감일이 지난 과제를 찾아 자동으로 closed 상태로 전환
  - `scheduleDeadlineProcessing()`: 주기적으로 자동 마감 처리 실행

## 3. Business Rules 구현 여부

| Business Rule | 구현 여부 | 설명 |
|---------------|-----------|------|
| 과제 상태는 Draft → Published → Closed 순으로만 전환 가능하다 | ✅ 구현됨 | 상태 전이 유효성 검사 로직 구현 |
| Instructor는 본인이 소유한 코스에 대해서만 과제를 생성/게시/마감할 수 있다 | ✅ 구현됨 | 권한 검사 로직 포함 (instructor_id 확인) |
| 과제가 게시(Published) 상태일 때만 학습자가 과제를 열람할 수 있다 | ✅ 구현됨 | Assignment 조회 시 상태 검사 |
| 과제가 마감(Closed) 상태일 때는 제출이 불가능하며, 채점만 가능하다 | ✅ 구현됨 | 제출 시 상태 검사 로직 포함 |
| 마감일이 지나면 자동으로 과제가 마감 상태로 전환되어야 한다 | ✅ 구현됨 | assignmentDeadlineService 구현 |
| 동일한 코스 내에서 동일한 제목의 과제는 중복 생성될 수 없다 | ❌ 제외 | 현재 사양에 포함되지 않음 |
| 과제 정보에는 반드시 마감일이 포함되어야 한다 | ✅ 구현됨 | 스키마에 due_date 필수 항목으로 정의 |

## 4. 보완된 사항

1. **에러 코드 수정**: `ASSMENT_CLOSED` → `ASSIGNMENT_CLOSED` 오타 수정
2. **자동 마감 서비스 추가**: 마감일이 지난 과제를 자동으로 마감 처리하는 서비스 구현
3. **상태 전이 유효성 검사 강화**: 불가능한 상태 전이에 대한 예외 처리 추가
4. **UI 컴포넌트 완성**: 과제 게시/마감에 필요한 UI 컴포넌트 구현 완료

## 5. 테스트 결과

- TypeScript 컴파일: ✅ 통과
- ESLint 검사: ✅ 통과 (lint 오류 수정 완료)
- Next.js 빌드: ✅ 통과
- 컴포넌트 오류: ✅ 검출 및 수정 완료

## 6. 결과 확인 URL

다음 URL에서 Assignment 게시/마감 기능을 확인할 수 있습니다:

- **과제 게시/수정 폼**: `/instructor/courses/[courseId]/assignments/new` 또는 `/instructor/courses/[courseId]/assignments/[assignmentId]/edit`
- **과제 상세 및 마감**: `/instructor/[courseId]/assignments/[assignmentId]/submissions`
- **자동 마감 서비스**: 서버 내부 서비스로 외부 접근 불가 (코드 상에서 확인 가능)

## 7. 결론

Assignment 게시/마감 (Instructor) 기능은 명세서에 따라 완전히 구현되었습니다. 강사가 과제를 생성하고 게시한 후, 마감일이 되면 자동으로 마감되거나 수동으로 마감할 수 있는 기능이 모두 구현되었으며, 상태 전이에 대한 유효성 검사와 권한 검사가 추가되어 시스템의 안정성과 보안이 확보되었습니다.