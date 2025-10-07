# 7. 성적 & 피드백 열람 (Learner) - Implementation Summary

## 개요

성적 및 피드백 열람 기능을 성공적으로 구현했습니다. 이 기능을 통해 학습자는 자신의 과제 성적, 코스별 총점, 과제별 피드백을 확인할 수 있습니다.

## 구현된 모듈

### 1. Grade DTO Module (`src/features/grade/lib/dto.ts`)
- 과제 성적, 코스 성적 요약 등 데이터 전송 객체 정의
- Type-safe한 데이터 구조 제공

### 2. Grade Schema Module (`src/features/grade/backend/schema.ts`)
- Zod 스키마 정의: AssignmentGrade, CourseGradeSummary, GradeSummary, GradeDetail
- 요청/응답 데이터 유효성 검사 제공

### 3. Grade Calculation Module (`src/features/grade/lib/calculateGrade.ts`)
- `calculateCourseTotalScore`: 코스별 총점 계산 (점수 × 비중 합산)
- `createCourseGradeSummary`: 코스 성적 요약 생성

### 4. Grade Service Module (`src/features/grade/backend/service.ts`)
- `getLearnerGradeSummary`: 사용자 전체 성적 요약 조회
- `getCourseGradeDetail`: 특정 코스 상세 성적 조회
- `getAssignmentGrade`: 특정 과제 성적 조회
- 데이터베이스 쿼리 및 비즈니스 로직 처리

### 5. Grade API Module (`src/features/grade/backend/route.ts`, `src/features/grade/lib/api.ts`)
- Hono 라우트 등록: `/grades`, `/grades/courses/:courseId`, `/grades/assignments/:assignmentId`
- 프론트엔드 API 클라이언트 함수 제공

### 6. Grade Query Hook Module (`src/features/grade/hooks/useGradeQuery.ts`)
- `useGradeSummaryQuery`: 전체 성적 요약 쿼리 훅
- `useCourseGradeDetailQuery`: 특정 코스 성적 상세 쿼리 훅
- `useAssignmentGradeQuery`: 특정 과제 성적 쿼리 훅

### 7. Grade Components (`src/features/grade/components/`)
- `GradeSummary.tsx`: 코스별 성적 요약 표시 컴포넌트
- `GradeDetail.tsx`: 과제별 성적 상세 표시 컴포넌트
- 상태, 점수, 피드백, 마감일 등 표시

### 8. Grade Page Module (`src/app/my/grades/page.tsx`)
- 사용자 전체 성적 페이지
- 탭 기반 코스별 성적 표시
- 사용자 인증 확인

## 주요 기능

- **성적 요약 보기**: 사용자의 모든 수강 코스별 총점 및 과제 진행 상황 표시
- **상세 성적 보기**: 과제별 점수, 상태(제출됨/지각/graded/재제출요청), 피드백 표시
- **성적 계산**: (각 Assignment 점수 × 비중) 합산을 통한 코스별 총점 계산
- **피드백 표시**: 강사의 피드백 메시지 표시
- **상태 표시**: 제출 상태, 지각 여부, 재제출 요청 여부 등 표시

## API 엔드포인트

- `GET /api/grades` - 사용자 전체 성적 요약
- `GET /api/grades/courses/:courseId` - 특정 코스 성적 상세
- `GET /api/grades/assignments/:assignmentId` - 특정 과제 성적

## 결과 확인용 URL

- **성적 페이지**: http://localhost:3000/my/grades

## 테스트 결과

- 빌드 성공 확인
- 타입스크립트 오류 없음 확인
- ESLint 경고 없음 확인
- 컴포넌트 오류 수정 완료

## 비고

- 사용자 인증이 필요한 기능으로, 로그인하지 않은 사용자는 접근할 수 없습니다.
- 데이터베이스에서 실제 제출된 과제 및 성적 정보를 기반으로 동작합니다.
- 성적 계산 로직은 과제별 점수와 가중치를 기반으로 코스별 총점을 산출합니다.