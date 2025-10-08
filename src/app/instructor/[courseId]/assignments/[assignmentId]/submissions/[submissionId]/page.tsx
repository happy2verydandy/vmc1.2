import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';
import { SubmissionDetailView } from '@/features/assignment/components/SubmissionDetailView';
import { GradeSubmissionForm } from '@/features/assignment/components/GradeSubmissionForm';
import { SubmissionDetail } from '@/features/assignment/lib/dto';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

interface SubmissionPageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}

interface RawSubmissionData {
  id: string;
  assignment_id: string;
  learner_id: string;
  content: string;
  link: string | null;
  submitted_at: string;
  status: string;
  is_late: boolean;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
  learners: {
    full_name: string | null;
  } | null;
}

const getSubmissionDetail = async (submissionId: string, userId: string) => {
  // Supabase client로 submission 정보 가져오기
  const supabase = await createSupabaseServerClient();

  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      id,
      assignment_id,
      learner_id,
      content,
      link,
      submitted_at,
      status,
      is_late,
      grade,
      feedback,
      graded_at,
      created_at,
      updated_at,
      assignments!inner(
        course_id,
        courses!inner(
          instructor_id
        )
      ),
      learners:profiles!learner_id(
        full_name
      )
    `)
    .eq('id', submissionId)
    .eq('assignments.courses.instructor_id', userId) // Instructor가 해당 과제의 강사인지 확인
    .single<RawSubmissionData>();

  if (error) {
    console.error('Error fetching submission:', error);
    return null;
  }

  if (!submission) {
    return null;
  }

  // SubmissionDetail 타입에 맞게 데이터 매핑
  return {
    id: submission.id,
    assignment_id: submission.assignment_id,
    learner_id: submission.learner_id,
    learner_name: submission.learners?.full_name || 'Unknown Learner',
    content: submission.content,
    link: submission.link,
    submitted_at: submission.submitted_at,
    status: submission.status as 'submitted' | 'graded' | 'resubmission_required',
    is_late: submission.is_late,
    grade: submission.grade,
    feedback: submission.feedback,
    graded_at: submission.graded_at,
    created_at: submission.created_at,
    updated_at: submission.updated_at,
  } as SubmissionDetail;
};

const SubmissionPage = async ({ params }: SubmissionPageProps) => {
  const awaitedParams = await params;
  const { courseId, assignmentId, submissionId } = awaitedParams;

  // 인증 상태 확인
  const currentUserSnapshot = await loadCurrentUser();

  if (currentUserSnapshot.status !== 'authenticated' || !currentUserSnapshot.user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    redirect(`/login?redirectedFrom=/instructor/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`);
  }

  // 사용자 역할 확인
  const userRole = currentUserSnapshot.user.userMetadata?.role as string | undefined;
  
  if (userRole !== 'instructor') {
    // instructor가 아닌 경우 일반 대시보드로 리디렉션
    redirect('/dashboard');
  }

  // submission 데이터 가져오기
  const submission = await getSubmissionDetail(submissionId, currentUserSnapshot.user.id);

  if (!submission) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Submission Details</h1>
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          Submission not found or you don't have permission to view this submission.
        </div>
      </div>
    );
  }

  // 인증된 instructor만 접근 가능
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Submission Details</h1>
      
      <div className="mb-8">
        <SubmissionDetailView submission={submission} />
      </div>
      
      <div>
        <GradeSubmissionForm 
          submission={submission} 
          onGradeComplete={() => {}} // 실제 구현에서는 적절한 콜백 함수가 필요할 수 있음
        />
      </div>
    </div>
  );
};

export default SubmissionPage;