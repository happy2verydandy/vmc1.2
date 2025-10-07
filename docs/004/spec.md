# 과제 제출 (Learner) - 유스케이스 명세서

## 개요
학습자가 과제를 제출하는 유스케이스이다. 마감일, 지각 허용 여부, 재제출 가능 여부 등의 정책을 고려하여 제출을 처리한다.

---

## Primary Actor
Learner (학습자)

---

## Precondition
- 사용자는 로그인 상태이며, 해당 과제가 속한 코스에 등록되어 있어야 한다.
- 과제는 `published` 상태이며, 아직 마감되지 않았거나 지각 제출이 허용된 상태이어야 한다.
- 과제가 `closed` 상태가 아니어야 한다. (마감일이 지났어도 `allow_late_submissions`가 `true`인 경우 제출 가능)

---

## Trigger
학습자가 과제 상세 페이지에서 Text 필드와 선택적 Link 필드를 입력한 후 "제출" 버튼을 클릭한다.

---

## Main Scenario

1. **FE** 학습자가 제출 버튼을 클릭하면, 입력된 Text 필드와 Link 필드 값을 검증한다.
   - Text 필드는 공백만으로 이루어지지 않아야 한다.
   - Link 필드가 있다면 URL 형식이어야 한다.
2. **FE** 필드 검증이 통과되면, 과제 제출 API 엔드포인트로 요청을 전송한다.
3. **BE** 요청을 받고 과제 ID 및 사용자 정보를 확인한다.
4. **BE** 과제의 `allow_resubmission` 속성을 확인한다.
   - `false`이고 이미 제출된 기록이 있는 경우, 실패 응답을 반환한다.
5. **BE** 현재 시간과 과제의 마감일을 비교한다.
   - 마감일 전이면 제출 처리를 진행한다 (`status = 'submitted'`, `late = false`).
   - 마감일 후이면:
     - `allow_late_submissions = true`인 경우, 제출 처리를 진행함 (`status = 'submitted'`, `late = true`).
     - `allow_late_submissions = false`인 경우, 실패 응답을 반환한다.
6. **BE** 제출 정보를 `submissions` 테이블에 저장한다. (재제출 허용 시 기존 레코드 업데이트 또는 새 레코드 생성)
7. **BE** 성공 응답을 FE에 반환한다.
8. **FE** 성공 응답을 받으면, UI를 갱신하여 제출 완료 상태를 표시한다.

---

## Edge Cases

- **오류 1**: 유효하지 않은 입력 (예: 공백 텍스트, 잘못된 URL 형식)
  - **처리**: FE에서 사전 검증 후 사용자에게 오류 메시지를 표시함.
- **오류 2**: 마감일이 지나고 지각 제출이 허용되지 않은 경우
  - **처리**: BE에서 실패 응답을 반환하고, FE는 이를 UI에 반영하여 제출이 불가능하다는 메시지를 표시함.
- **오류 3**: 재제출이 허용되지 않았으나 이미 제출된 과제에 대해 제출 요청이 들어온 경우
  - **처리**: BE에서 실패 응답을 반환하고, FE는 이를 UI에 반영함.
- **오류 4**: 네트워크 문제 또는 서버 장애 시
  - **처리**: FE는 일시적인 오류 메시지를 표시하고 재시도 로직을 수행할 수 있음.

---

## Business Rules

- 제출은 Text 필드가 필수이며, Link 필드는 선택 사항이다.
- 과제 제출은 코스 등록된 Learner만 가능하다.
- 마감일이 지난 경우, `allow_late_submissions` 설정에 따라 제출 가능 여부가 결정된다.
- `allow_resubmission` 설정에 따라 재제출이 허용되거나 불가하다.
- 제출 시 `status`는 `submitted`, `late` 여부는 `late` 플래그로 구분된다.

---

## Sequence Diagram

@startuml
participant User
participant FE
participant BE
database Database

User -> FE: 과제 제출 버튼 클릭 (Input: text, link)
FE -> FE: 입력값 유효성 검사 (Text 필수, URL 형식)
FE -> BE: 과제 제출 API 요청 (Assignment ID, User ID, Text, Link)
BE -> BE: 과제 권한 및 상태 확인 (등록 여부, 마감 여부, 허용 정책)
BE -> Database: 제출 정보 확인 (이미 제출 여부)
Database -> BE: 제출 정보 반환
alt 재제출 허용 여부 확인
    BE -> BE: allow_resubmission == false && 제출 존재 시 실패 처리
end
BE -> BE: 마감일 및 지각 허용 여부 확인
BE -> Database: 제출 정보 저장 (status, late 플래그 등)
Database -> BE: 저장 결과
BE -> FE: 제출 성공/실패 응답
FE -> User: 성공/실패 메시지 및 UI 갱신
@enduml
