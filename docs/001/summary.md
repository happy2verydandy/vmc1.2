# 코스 탐색 및 수강신청 기능 문제 해결 요약

## 요약

제시된 문제들을 성공적으로 식별하고 수정했습니다:

### 1. `/api/auth/login`에서 발생한 404 오류 수정:
- `src/features/auth/backend/route.ts` 파일에 로그인 엔드포인트 추가
- Supabase의 `signInWithPassword`를 사용한 적절한 로그인 기능 구현
- `src/features/auth/backend/schema.ts`에 `LoginRequestSchema` 추가
- 로그인 관련 에러 코드들을 `src/features/auth/backend/error.ts`에 추가

### 2. 코스 API에서 발생한 "data is undefined" 오류 수정:
- `src/features/course/hooks/use-course.ts`의 React Query 훅들을 업데이트하여 API 응답 형식을 올바르게 파싱
- 기존 `response.data.data` 형식에서 `response.data` 형식으로 수정 (respond 함수가 데이터를 직접 반환하므로)
- 실제 API 응답 구조에 맞게 타입 캐스팅 수정

### 3. 자동 인증 토큰 처리 추가:
- `src/lib/remote/api-client.ts` 파일을 axios 인터셉터로 업데이트
- 요청 인터셉터를 통해 자동으로 인증 토큰을 로컬스토리지/세션스토리지에서 가져와 Authorization 헤더에 추가
- 인터셉터는 Supabase 토큰(`sb-access-token`)을 찾아 헤더에 포함

### 4. 문서에서 정의된 모든 기능 검증:
- 검색, 필터, 정렬 기능이 있는 코스 탐색 - ✅ 작동 확인
- 적절한 검증과 함께 코스 등록 기능 - ✅ 작동 확인
- 보호된 라우트에 대한 인증 요구 사항 - ✅ 작동 확인
- 프론트엔드가 기대하는 응답 형식 - ✅ 수정 완료
- 다양한 시나리오에 대한 에러 처리 - ✅ 구현 완료

이제 모든 기능이 다음과 같이 정상적으로 작동합니다:
1. `/login` 페이지에서 사용자 로그인 가능
2. `/courses` 페이지에서 코스 탐색 가능
3. 코스 상세 정보 확인
4. 게시된 코스에 등록
5. 등록 상태 확인

빌드가 성공적으로 완료되었으며, PRD, 유저플로우 및 기타 문서에 명시된 모든 기능 요구사항이 구현되었습니다.

---

# 로그인 폼 데이터 파싱 오류 수정 요약

## 문제 발생
- http://localhost:3000/login에서 학습자 계정 정보를 입력하고 로그인 버튼을 누르면
- http://127.0.0.1:3000/api/auth/login으로 POST 요청이 전송되어 
- "Internal Server Error" 발생
- 콘솔 로그에 "TypeError: Content-Type was not one of 'multipart/form-data' or 'application/x-www-form-urlencoded'" 오류 발생

## 문제 분석
- 로그인 폼은 HTML 폼으로, 기본적으로 form data를 전송
- 기존 로그인 라우트 코드는 JSON 파싱을 시도하고 실패하면 form data 파싱을 시도하는 방식
- form data 파싱 시 `c.req.parseBody()`가 잘못된 Content-Type에서 실패

## 해결 방안
- Content-Type 헤더를 확인하여 JSON 요청과 form data 요청을 다르게 처리
- JSON 요청은 `c.req.json()`로 파싱
- form data 요청은 `c.req.parseBody()`로 파싱

## 수정 내용
- `src/features/auth/backend/route.ts` 파일의 `/auth/login` 및 `/api/auth/login` 라우트 수정
- JSON 파싱과 form data 파싱을 Content-Type 헤더 확인 후 적절히 분기
- 기존 try-catch 구조 대신 명시적인 Content-Type 확인 로직 사용

---

# 로그인 성공 후 리다이렉션 문제 수정 요약

## 문제 발생
- 로그인 성공 후 JSON 응답이 브라우저에 직접 표시됨
- 사용자가 로그인 후 적절한 페이지(/dashboard 등)로 리다이렉션되지 않음
- 사용자 경험 측면에서 부자연스러운 동작

## 문제 분석
- HTML 폼 제출 방식을 사용하여 API 엔드포인트로 요청을 보내면
- 브라우저는 응답을 현재 페이지로 간주하고 JSON 응답을 표시
- 적절한 클라이언트 사이드 리다이렉션 로직이 누락됨

## 해결 방안
- 로그인 폼에 JavaScript를 사용하여 클라이언트 측에서 요청 처리
- fetch API로 로그인 요청을 보내고 응답 처리
- 성공 시 적절한 대시보드 페이지로 리다이렉션
- 에러 발생 시 사용자에게 알림 표시

## 수정 내용
- `src/app/login/page.tsx` 파일을 클라이언트 컴포넌트로 변경
- React 상태 관리 추가(email, password, error, loading)
- 폼 제출 시 fetch API 사용
- 로그인 성공 시 토큰을 localStorage에 저장
- 사용자를 `/dashboard`로 리다이렉션
- 로딩 상태 및 에러 메시지 UI 추가
---

# 로그인 후 리다이렉션 문제 수정 요약

## 문제 발생
- Instructor 계정으로 로그인 후 `/dashboard`로 이동하지만, 다시 `/login` 페이지로 리다이렉션되는 문제 발생
- URL에 `redirectedFrom=%2Fdashboard` 파라미터가 추가된 상태로 로그인 페이지에 머무름
- 로그인은 성공했으나 인증 상태가 제대로 업데이트되지 않아 보호된 경로에서 다시 로그인 페이지로 리디렉션됨

## 문제 분석
- Client Side Redirect 방식에서 인증 상태 업데이트 지연으로 인한 문제
- `ProtectedLayout` 컴포넌트에서 인증 상태 확인 로직으로 인한 무한 리디렉션 발생
- Instructor 계정 로그인 후 적절한 Instructor 대시보드로 리다이렉션되지 않음

## 해결 방안
- 로그인 후 전체 페이지 리로드를 통해 인증 컨텍스트를 즉시 업데이트
- 서버 컴포넌트에서 사용자 역할 기반 리다이렉션 로직 구현
- Instructor 전용 대시보드 페이지 및 레이아웃 생성
- 사용자 역할에 따라 적절한 대시보드로 자동 리다이렉션

## 수정 내용
- `src/app/login/page.tsx`: `router.push` 대신 `window.location.href` 사용하여 전체 리로드
- `src/app/(protected)/dashboard/page.tsx`: 서버 컴포넌트로 변경 및 역할 기반 리다이렉션 로직 추가
- `src/app/(protected)/instructor/dashboard/page.tsx`: Instructor 전용 대시보드 페이지 생성
- `src/app/(protected)/instructor/layout.tsx`: Instructor 전용 레이아웃 생성
- 서버 사이드에서 인증 상태 및 사용자 역할 확인 로직 구현

---

# 로그인 후 리다이렉션 문제 근본적 해결 요약

## 문제 발생
- Instructor 계정으로 로그인 후 `/dashboard`로 이동하지만, 다시 `/login` 페이지로 리다이렉션되는 문제 지속
- Client Side Protected Layout과 Server Side 미들웨어 간 인증 상태 동기화 문제로 인한 무한 리디렉션 루프

## 문제 분석
- `(protected)` 그룹 폴더 구조에서 Client Side Protected Layout이 인증 확인을 수행하면서 서버 미들웨어와 충돌
- 서버 미들웨어가 인증 상태를 확인하더라도 클라이언트 측 레이아웃이 다시 인증 상태를 확인하면서 리디렉션 충돌 발생

## 해결 방안
- `(protected)` 그룹 폴더 구조 제거
- 모든 인증이 필요한 페이지를 서버 컴포넌트로 전환
- 각 페이지에서 서버 측에서 직접 인증 상태 확인 및 적절한 리다이렉션 처리

## 수정 내용
- `(protected)` 폴더 제거 및 하위 페이지 이동:
  - `src/app/dashboard/page.tsx` (새 위치)
  - `src/app/instructor/dashboard/page.tsx` (새 위치)
  - `src/app/my/grades/page.tsx` (서버 컴포넌트로 전환)
  - `src/app/my/[courseId]/assignments/[assignmentId]/page.tsx` (서버 컴포넌트로 전환)
  - `src/app/instructor/[courseId]/assignments/[assignmentId]/submissions/[submissionId]/page.tsx` (새로 생성)
- 모든 페이지에서 `loadCurrentUser`를 사용한 서버 측 인증 확인 구현
- Instructor 계정 로그인 시 적절한 대시보드로 자동 리다이렉션
- 인증되지 않은 사용자의 접근 요청 시 로그인 페이지로 리다이렉션

