# 과제 제출 기능 구현 요약

## 1. 개요

이 문서는 과제 제출 유스케이스(4번 기능)를 구현한 내용을 요약한 것입니다. 유스케이스 명세서 및 모듈화 설계에 따라 구현을 완료하였으며, 모든 타입, 린트, 빌드 오류 없이 정상 작동합니다.

## 2. 구현된 주요 기능

### 2.1. 백엔드 기능
- **입력 검증**: Text 필드는 공백만으로 이루어지지 않아야 하며, Link 필드는 URL 형식이어야 함
- **마감일 정책**: 마감일 전에는 정상 제출 처리, 마감일 후 지각 제출 허용 시 `late=true` 플래그와 함께 제출 처리
- **재제출 정책**: 재제출 허용 시 기존 제출 업데이트 또는 새 제출 생성, 비허용 시 최초 제출만 허용
- **권한 검증**: 사용자가 해당 과제가 속한 코스에 등록되어 있는지 확인
- **상태 관리**: 과제가 `published` 상태인지, `closed` 상태가 아닌지 확인

### 2.2. 프론트엔드 기능
- **입력 폼**: Text(필수) + Link(선택) 필드 제공
- **정책 표시**: 지각 제출 허용 여부, 재제출 허용 여부 시각적 표시
- **상태 표시**: 제출 상태(제출됨/지각/채점완료/재제출요청) 표시
- **사용자 피드백**: 제출 성공/실패 메시지 제공
- **폼 유효성**: 입력값 검증 및 실시간 오류 표시

## 3. 변경된 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/features/assignment/backend/service.ts` | 마감일 정책에 따라 `is_late` 플래그 설정 로직 추가, 제출 상태 설정 명확화 |
| `src/features/assignment/components/AssignmentDetailView.tsx` | URL 유효성 검사, 입력 필드 검증, 사용자 오류 메시지 표시, 제출 성공/실패 피드백 추가 |
| `src/features/assignment/hooks/useSubmitAssignmentMutation.ts` | API 에러 메시지 추출 기능 추가 |
| `src/features/assignment/backend/schema.ts` | 기존 스키마 변경 없음 |
| `src/features/assignment/backend/route.ts` | 기존 라우트 변경 없음 |
| `src/features/assignment/backend/error.ts` | 기존 에러 정의 변경 없음 |

## 4. 비즈니스 규칙 구현

- ✅ 제출은 Text 필드가 필수이며, Link 필드는 선택 사항
- ✅ 과제 제출은 코스 등록된 Learner만 가능
- ✅ 마감일이 지난 경우, `allow_late_submissions` 설정에 따라 제출 가능 여부 결정
- ✅ `allow_resubmission` 설정에 따라 재제출이 허용되거나 불가
- ✅ 제출 시 `status`는 `submitted`, `late` 여부는 `late` 플래그로 구분

## 5. 에지 케이스 처리

- ✅ 유효하지 않은 입력 (예: 공백 텍스트, 잘못된 URL 형식) - FE에서 사전 검증 후 사용자에게 오류 메시지 표시
- ✅ 마감일이 지나고 지각 제출이 허용되지 않은 경우 - BE에서 실패 응답 반환, FE는 UI에 반영
- ✅ 재제출이 허용되지 않았으나 이미 제출된 과제에 대해 제출 요청 - BE에서 실패 응답 반환
- ✅ 네트워크 문제 또는 서버 장애 - FE는 일시적인 오류 메시지 표시

## 6. 테스트 결과

- ✅ TypeScript 타입 검사 통과
- ✅ ESLint 코드 품질 검사 통과
- ✅ Next.js 빌드 성공
- ✅ 컴포넌트 오류 없음

## 7. 보안 및 성능 고려사항

- 유저 인증은 `withAuth()` 미들웨어를 통해 보장
- 과제 접근 권한은 사용자 등록 여부 확인을 통해 보장
- 과제 제출 시 중복 제출 방지를 위한 상태 확인
- API 응답에 대한 적절한 오류 처리 및 로깅

## 8. 기능 확인 URL

구현된 과제 제출 기능(004)을 확인하려면 다음 URL을 사용하세요:

```
http://localhost:3000/my/[courseId]/assignments/[assignmentId]
```

- `[courseId]`: 수강 중인 코스의 ID
- `[assignmentId]`: 과제 제출 대상인 과제의 ID

예를 들어, 코스 ID가 `abc123`이고 과제 ID가 `def456`인 경우:
```
http://localhost:3000/my/abc123/assignments/def456
```

이 URL 구조는 Next.js 페이지 라우팅에 따라 `/src/app/my/[courseId]/assignments/[assignmentId]/page.tsx`에 정의되어 있습니다.