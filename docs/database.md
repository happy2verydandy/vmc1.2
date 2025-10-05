# Database Design

## 1. 간략한 데이터플로우

유저플로우를 기반으로 한 최소 스펙의 데이터베이스 데이터플로우는 다음과 같습니다:

1. **인증 및 프로필 생성**: 사용자는 로그인/회원가입 시 Supabase Auth를 통해 계정이 생성되며, 역할 선택에 따라 프로필 테이블에 레코드가 저장됩니다.
2. **코스 탐색 및 수강**: 학습자는 코스 목록을 조회하고, `published` 상태의 코스에 대해 수강 신청이 가능하며, 수강 이력은 `enrollments` 테이블에 기록됩니다.
3. **과제 제출**: 학습자는 과제 마감일 전까지 제출 내용을 `submissions` 테이블에 저장하며, 마감 후 지각 여부는 플래그로 구분됩니다.
4. **채점 및 피드백**: 강사는 학습자의 제출물을 채점하여 점수와 피드백을 저장하며, 재제출 요청 시 상태가 업데이트되어 학습자에게 다시 제출 권한이 부여됩니다.
5. **성적 집계**: 과제별 점수는 비중을 고려해 코스별 총점으로 집계되어 학습자에게 제공됩니다.

## 2. 최소 스펙 데이터베이스 스키마 (PostgreSQL)

```sql
-- 0001_create_database_schema.sql

-- 강사/학습자 역할 enum 정의
CREATE TYPE user_role AS ENUM ('learner', 'instructor');

-- 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth ID
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor')), -- 역할 (Learner/Instructor)
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20), -- 전화번호
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 약관 동의 이력 테이블
CREATE TABLE IF NOT EXISTS terms_agreement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 사용자 ID
    terms_type VARCHAR(50) NOT NULL, -- 약관 종류 (예: 'general_terms', 'privacy_policy')
    agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 동의 일시
    ip_address INET, -- 동의 시 IP 주소
    user_agent TEXT, -- 동의 시 사용자 에이전트
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코스 테이블
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- 강사 ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced 등
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')), -- 코스 상태
    max_enrollment INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수강 이력 테이블
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- 학습자 ID
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, learner_id) -- 중복 수강 방지
);

-- 과제 테이블
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL, -- 마감일
    weight DECIMAL(5,2) DEFAULT 0.00, -- 총점에서의 비중 (0-100%)
    late_submission_allowed BOOLEAN DEFAULT FALSE, -- 지각 제출 허용 여부
    resubmission_allowed BOOLEAN DEFAULT FALSE, -- 재제출 허용 여부
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')), -- 과제 상태
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 제출물 테이블
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'resubmission_required');

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- 학습자 ID
    content TEXT NOT NULL, -- 제출한 텍스트 내용
    link VARCHAR(500), -- 제출한 링크 (선택)
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status submission_status DEFAULT 'submitted',
    is_late BOOLEAN DEFAULT FALSE, -- 지각 여부
    grade DECIMAL(5,2), -- 점수 (0-100)
    feedback TEXT, -- 강사 피드백
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, learner_id) -- 과제별 1회 제출 제한 (재제출 시 덮어쓰기)
);

-- 코스별 성적 요약 뷰 (필요 시)
-- 현재 제출물 기반으로 계산
-- 실제 구현 시 별도 요약 테이블 또는 실시간 계산 고려

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- 각 테이블에 updated_at 자동 갱신 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_terms_agreement_updated_at BEFORE UPDATE ON terms_agreement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

이 스키마는 유저플로우에 명시된 최소한의 데이터만 포함하며, 상태 기반 비즈니스 룰을 반영한 필드들로 구성되었습니다. RLS(Row Level Security)는 요구사항에 따라 비활성화되어 있습니다.