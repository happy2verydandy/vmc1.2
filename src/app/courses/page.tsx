import { Suspense } from 'react';
import CourseCatalogComponent from '@/features/course/components/course-catalog';
import { Skeleton } from '@/components/ui/skeleton';

interface CoursesPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    difficulty_level?: string;
    sort?: 'latest' | 'popular';
    page?: string;
    limit?: string;
  }>;
}

export default async function CoursesPage(props: CoursesPageProps) {
  const searchParams = await props.searchParams;
  
  return (
    <div>
      <Suspense fallback={<CoursesPageSkeleton />}>
        <CourseCatalogComponent />
      </Suspense>
    </div>
  );
}

function CoursesPageSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Skeleton className="h-10 md:col-span-2" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex space-x-2 mb-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full mt-2" />
          </div>
        ))}
      </div>
      
      <div className="flex justify-center space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}