'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 직접 Supabase 클라이언트를 사용하여 로그인
      const supabase = createClient();
      
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        setError('Invalid email or password.');
      } else if (data?.user) {
        // 로그인 성공 시 대시보드로 이동
        // 쿠키는 Supabase가 자동으로 처리
        router.push('/dashboard');
        router.refresh(); // 새로고침하여 인증 상태 갱신
      } else {
        setError('An unexpected error occurred during login.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
        <p className="text-center text-gray-500 mb-6">
          기존 계정으로 로그인해주세요
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="text-center pt-4">
          <a 
            href="/signup" 
            className="text-blue-600 hover:underline"
          >
            계정이 없으신가요? 회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;