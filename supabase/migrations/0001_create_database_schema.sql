-- 0001_create_database_schema.sql

-- 강사/학습자 역할 enum 정의
CREATE TYPE user_role AS ENUM ('learner', 'instructor');

-- 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth ID
    role user_role NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코스 테이블
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- 강사 ID
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
    learner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- 학습자 ID
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
    learner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- 학습자 ID
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
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 updated_at 자동 갱신 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();