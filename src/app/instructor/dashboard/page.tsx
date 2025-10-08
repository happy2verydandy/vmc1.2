import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';

export default async function InstructorDashboardPage() {
  const currentUserSnapshot = await loadCurrentUser();

  if (currentUserSnapshot.status !== 'authenticated' || !currentUserSnapshot.user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    redirect('/login?redirectedFrom=/instructor/dashboard');
  }

  // 사용자의 역할이 instructor가 아닌 경우 일반 대시보드로 리디렉션
  const userRole = currentUserSnapshot.user.userMetadata?.role as string | undefined;
  
  if (userRole !== 'instructor') {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Instructor 대시보드</h1>
        <p className="text-slate-500">
          {currentUserSnapshot.user.email} 님, 환영합니다.
        </p>
      </header>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-52" />
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-medium">내 강의</h2>
          <p className="mt-2 text-sm text-slate-500">
            관리 중인 강의 목록이 여기에 표시됩니다.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-medium">채점 대기 과제</h2>
          <p className="mt-2 text-sm text-slate-500">
            채점해야 할 과제가 여기에 표시됩니다.
          </p>
        </article>
      </section>
    </div>
  );
}