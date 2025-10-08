import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';
import { GradeSummary } from '@/features/grade/components/GradeSummary';
import { GradeDetail } from '@/features/grade/components/GradeDetail';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy, AlertCircle } from 'lucide-react';

const GradePage = async () => {
  const currentUserSnapshot = await loadCurrentUser();

  if (currentUserSnapshot.status !== 'authenticated' || !currentUserSnapshot.user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    redirect('/login?redirectedFrom=/my/grades');
  }

  // 인증된 사용자만 페이지 내용을 볼 수 있음
  // 클라이언트 컴포넌트에 인증 상태 전달
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="h-8 w-8" />
        My Grades
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GradeSummary className="h-full" />
        </div>
        
        <div className="lg:col-span-2">
          <GradeDetail courseId="placeholder" /> {/* 실제 courseId는 클라이언트 컴포넌트 내에서 처리 */}
        </div>
      </div>
    </div>
  );
};

export default GradePage;