import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';

export default async function DashboardPage() {
  const currentUserSnapshot = await loadCurrentUser();

  if (currentUserSnapshot.status !== 'authenticated' || !currentUserSnapshot.user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    redirect('/login?redirectedFrom=/dashboard');
  }

  // 사용자의 역할에 따라 적절한 대시보드로 리디렉션
  const userRole = currentUserSnapshot.user.userMetadata?.role as string | undefined;
  
  if (userRole === 'instructor') {
    redirect('/instructor/dashboard');
  } else if (userRole === 'learner') {
    // Learner의 경우 일반 대시보드로
    // NOTE: 나중에 Learner 대시보드가 구현되면 해당 경로로 변경
  }

  // 나중에 Learner 대시보드 내용을 여기에 추가할 수 있음
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Learner 대시보드</h1>
        <p className="text-slate-500">
          {currentUserSnapshot.user.email} 님, 환영합니다.
        </p>
      </header>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-52" />
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-medium">수강 중인 코스</h2>
          <p className="mt-2 text-sm text-slate-500">
            현재 수강 중인 코스 목록이 여기에 표시됩니다.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-medium">마감 임박 과제</h2>
          <p className="mt-2 text-sm text-slate-500">
            제출해야 할 과제가 여기에 표시됩니다.
          </p>
        </article>
      </section>
    </div>
  );
}