import { AssignmentDetailView } from '@/features/assignment/components/AssignmentDetailView';
import { notFound } from 'next/navigation';

interface AssignmentPageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
  }>;
}

const AssignmentPage = async ({ params }: AssignmentPageProps) => {
  const awaitedParams = await params;
  const { assignmentId } = awaitedParams;

  // Validate assignmentId format if needed
  if (!assignmentId || typeof assignmentId !== 'string') {
    notFound();
  }

  return <AssignmentDetailView assignmentId={assignmentId} />;
};

export default AssignmentPage;