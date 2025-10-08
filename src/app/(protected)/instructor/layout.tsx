import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';
import { ReactNode } from 'react';

type InstructorLayoutProps = {
  children: ReactNode;
};

export default async function InstructorLayout({ children }: InstructorLayoutProps) {
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

  return <>{children}</>;
}