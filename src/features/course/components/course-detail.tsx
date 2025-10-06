'use client';

import { useParams } from 'next/navigation';
import { useCourseQuery, useEnrollmentStatusQuery, useEnrollCourseMutation } from '../hooks/use-course';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, User, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const { data: course, isLoading, isError, error } = useCourseQuery(id);
  const { data: enrollmentStatus, isLoading: isEnrollmentLoading } = useEnrollmentStatusQuery(id);
  const { mutate: enroll, isPending: isEnrolling } = useEnrollCourseMutation();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 bg-muted rounded mb-4"></div>
            <div className="h-4 w-full bg-muted rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            <p>Error loading course: {error?.message || 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            <p>Course not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!enrollmentStatus?.is_enrolled) {
      enroll(id, {
        onSuccess: () => {
          toast.success('Successfully enrolled in the course!');
          router.refresh(); // Refresh to update UI
        },
        onError: (error) => {
          toast.error('Failed to enroll', {
            description: error.message || 'Please try again'
          });
        }
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{course.instructor_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.current_enrollment} students enrolled</span>
                  </div>
                </div>
              </div>
              <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                  <p className="font-medium">{course.instructor_name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Enrolled Students</p>
                  <p className="font-medium">{course.current_enrollment}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {course.description || 'No description available for this course.'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>{course.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty Level</p>
                  <p>{course.difficulty_level || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {(course.max_enrollment !== undefined && course.max_enrollment > 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Enrollment</h3>
                <div className="flex items-center">
                  <div className="flex-1 bg-muted rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (course.current_enrollment / course.max_enrollment) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">
                    {course.current_enrollment}/{course.max_enrollment}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            {course.status === 'published' && (
              <Button 
                className="w-full" 
                onClick={handleEnroll}
                disabled={isEnrollmentLoading || isEnrolling || enrollmentStatus?.is_enrolled}
              >
                {isEnrollmentLoading ? 'Loading...' : 
                 enrollmentStatus?.is_enrolled ? 'Already Enrolled' : 
                 isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            )}
            {course.status !== 'published' && (
              <div className="text-center py-4 text-muted-foreground">
                This course is not available for enrollment
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}