import { SubmissionDetailView } from '@/features/assignment/components/SubmissionDetailView';
import { GradeSubmissionForm } from '@/features/assignment/components/GradeSubmissionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { SubmissionDetail } from '@/features/assignment/lib/dto';
import { useSubmissionDetailQuery } from '@/features/assignment/hooks/useSubmissionDetailQuery';

interface SubmissionPageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}

// 서버 컴포넌트에서 클라이언트 컴포넌트로 데이터를 전달하기 위한 래퍼 컴포넌트
const SubmissionDetailClient = ({ submissionId }: { submissionId: string }) => {
  const { data: submission, isLoading, error } = useSubmissionDetailQuery(submissionId);

  if (isLoading) {
    return <div>Loading submission...</div>;
  }

  if (error || !submission) {
    return <div>Error loading submission: {error?.message || 'Submission not found'}</div>;
  }

  return (
    <InstructorSubmissionPageContent submission={submission} />
  );
};

// 실제 Instructor용 과제 채점 UI를 담당하는 컴포넌트
const InstructorSubmissionPageContent = ({ submission }: { submission: SubmissionDetail }) => {
  const handleGradeComplete = () => {
    // 채점 완료 후 처리 (예: 목록으로 돌아가기, 새로고침 등)
    console.log('Grade submission completed');
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Instructor Dashboard - Assignment Grading</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubmissionDetailView submission={submission} />
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Grade Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <GradeSubmissionForm 
                submission={submission} 
                onGradeComplete={handleGradeComplete} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SubmissionPage = async ({ params }: SubmissionPageProps) => {
  const awaitedParams = await params;
  const { submissionId } = awaitedParams;

  // Validate submissionId format
  if (!submissionId || typeof submissionId !== 'string') {
    notFound();
  }

  return <SubmissionDetailClient submissionId={submissionId} />;
};

export default SubmissionPage;