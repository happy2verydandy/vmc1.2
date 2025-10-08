import { AssignmentDetailView } from '@/features/assignment/components/AssignmentDetailView';
import { notFound, redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';

interface AssignmentPageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
  }>;
}

const AssignmentPage = async ({ params }: AssignmentPageProps) => {
  const awaitedParams = await params;
  const { assignmentId, courseId } = awaitedParams;

  // 인증 상태 확인
  const currentUserSnapshot = await loadCurrentUser();

  if (currentUserSnapshot.status !== 'authenticated' || !currentUserSnapshot.user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    redirect(`/login?redirectedFrom=/my/${courseId}/assignments/${assignmentId}`);
  }

  // Validate assignmentId format if needed
  if (!assignmentId || typeof assignmentId !== 'string') {
    notFound();
  }

  return <AssignmentDetailView assignmentId={assignmentId} />;
};

export default AssignmentPage;