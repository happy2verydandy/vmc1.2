import { Suspense } from 'react';
import CourseDetailComponent from '@/features/course/components/course-detail';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage(props: CourseDetailPageProps) {
  const params = await props.params;
  
  return (
    <div>
      <Suspense fallback={<CourseDetailPageSkeleton />}>
        <CourseDetailComponentWrapper id={params.id} />
      </Suspense>
    </div>
  );
}

function CourseDetailComponentWrapper({ id }: { id: string }) {
  return <CourseDetailComponent />;
}

function CourseDetailPageSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-3/4 bg-muted rounded mb-4"></div>
        <div className="h-4 w-full bg-muted rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-muted rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
        <div className="h-32 bg-muted rounded mb-6"></div>
        <div className="h-10 w-1/3 bg-muted rounded mb-4"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    </div>
  );
}