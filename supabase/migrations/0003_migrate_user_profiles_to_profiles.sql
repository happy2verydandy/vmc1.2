-- 마이그레이션: user_profiles 테이블의 데이터를 profiles 테이블로 이전

-- 1. 먼저 profiles 테이블이 존재하지 않으면 생성 (기존 마이그레이션과 동일)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. updated_at 트리거 설정
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 3. 기존 user_profiles 테이블이 존재하고 데이터가 있는 경우만 마이그레이션 수행
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- user_profiles 테이블의 데이터를 profiles 테이블로 복사
        -- 기존 user_profiles 테이블에는 name 필드가 있었으므로 full_name으로 매핑
        INSERT INTO profiles (id, email, role, full_name, phone, created_at, updated_at)
        SELECT 
            id,
            (SELECT email FROM auth.users WHERE id = user_profiles.id), -- auth.users에서 이메일 가져오기
            role::text, -- enum을 text로 변환
            name, -- 기존 name 필드를 full_name으로 사용
            phone,
            created_at,
            updated_at
        FROM user_profiles
        WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = user_profiles.id); -- 중복 방지
    END IF;
END $$;

-- 4. 기존 user_profiles 테이블이 존재하면 삭제
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 참고: 이 마이그레이션은 기존 테이블이 존재할 경우에만 작동하며,
-- 새로운 설치에서는 기존 테이블이 없기 때문에 무시됩니다.