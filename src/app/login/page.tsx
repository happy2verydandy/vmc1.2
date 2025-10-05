import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';

const LoginPage = async ({ 
  searchParams 
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Check if user is already authenticated
  const userSnapshot = await loadCurrentUser();
  
  // If user is already authenticated, redirect to appropriate dashboard
  if (userSnapshot.status === 'authenticated') {
    if (userSnapshot.user?.appMetadata?.role === 'instructor') {
      redirect('/dashboard/instructor');
    } else {
      redirect('/dashboard/learner');
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
        <p className="text-center text-gray-500 mb-6">
          기존 계정으로 로그인해주세요
        </p>
        <div className="space-y-4">
          <form action="/api/auth/login" method="post" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
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
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              로그인
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
    </div>
  );
};

export default LoginPage;