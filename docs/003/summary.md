# 과제 상세 열람 기능 구현 요약

## 1. 개요

본 문서는 VMC LMS 프로젝트에 구현된 과제 상세 열람 기능에 대한 구현 요약입니다. 이 기능은 학습자가 자신의 수강 중인 코스의 과제를 상세히 열람하고 제출할 수 있도록 제공하는 기능입니다.

## 2. 구현 범위

- 과제 상세 정보 조회 기능 (`/my/[courseId]/assignments/[assignmentId]`)
- 과제 제출 기능
- 제출 상태 관리 및 표시
- 마감일 및 정책 정보 표시
- 사용자 인증 및 권한 검증

## 3. 아키텍처 구조

### Frontend (Presentation Layer)
- `src/features/assignment/components/AssignmentDetailView.tsx`: 과제 상세 정보를 표시하고 제출 UI를 제공하는 컴포넌트
- `src/features/assignment/hooks/useAssignmentDetailQuery.ts`: 과제 상세 정보를 가져오는 React Query 훅
- `src/features/assignment/hooks/useSubmitAssignmentMutation.ts`: 과제 제출을 처리하는 React Query 뮤테이션 훅
- `src/features/assignment/hooks/useAssignmentSubmissionQuery.ts`: 제출 정보를 조회하는 React Query 훅

### Backend (Business Logic & API Layer)
- `src/features/assignment/backend/route.ts`: Assignment 관련 API 라우트 정의
- `src/features/assignment/backend/service.ts`: Assignment 관련 비즈니스 로직 구현
- `src/features/assignment/backend/schema.ts`: API 요청/응답 스키마 정의 (Zod 사용)
- `src/features/assignment/backend/error.ts`: Assignment 관련 에러 코드 정의

### Shared (DTO & Types)
- `src/features/assignment/lib/dto.ts`: FE와 BE 간 공유되는 타입 정의

## 4. API Endpoints

- `GET /assignments/:assignmentId`: 과제 상세 정보 조회
- `POST /assignments/:assignmentId/submit`: 과제 제출
- `GET /assignments/:assignmentId/submission`: 제출 정보 조회

## 5. 주요 기능

### 과제 상세 정보 표시
- 과제 제목, 설명, 마감일, 점수 비중 표시
- 코스 정보, 마감 정책(지각 허용 여부, 재제출 허용 여부) 표시

### 과제 제출 기능
- 텍스트 및 링크 입력 필드 제공
- 마감일 검증 및 지각 제출 처리
- 재제출 허용 여부 검증
- 제출 후 상태 업데이트

### 상태 기반 비즈니스 룰
- Assignment 상태가 `published`인 경우에만 열람 가능
- `closed` 상태인 경우 제출 버튼 비활성화
- 사용자 코스 등록 여부 검증
- 마감일 이후 지각 제출 허용 여부 처리

## 6. 기술 스택

- Next.js App Router
- Hono.js (Backend API)
- React Query (서버 상태 관리)
- TypeScript
- Zod (스키마 검증)
- Tailwind CSS
- shadcn UI

## 7. 검증 및 테스트

- TypeScript 타입 검사 통과
- ESLint 검사 통과
- Next.js 빌드 성공
- 컴포넌트 오류 없음 확인

## 8. 특이 사항

- 모든 컴포넌트는 `"use client"` 지시문으로 구성됨
- API 요청은 `@/lib/remote/api-client`를 통해 처리
- 상태 기반 비즈니스 로직이 정확히 구현됨
- 오류 처리가 사용자 친화적으로 구현됨