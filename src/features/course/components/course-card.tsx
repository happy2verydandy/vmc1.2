'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, User } from 'lucide-react';
import { Course } from '../lib/dto';
import { useEnrollmentStatusQuery, useEnrollCourseMutation } from '../hooks/use-course';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter();
  const { data: enrollmentStatus, isLoading: isEnrollmentLoading } = useEnrollmentStatusQuery(course.id);
  const { mutate: enroll, isPending: isEnrolling } = useEnrollCourseMutation();
  
  const handleEnroll = () => {
    if (!enrollmentStatus?.is_enrolled) {
      enroll(course.id, {
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

  const handleViewDetails = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {course.description || 'No description available'}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {course.category && (
            <Badge variant="outline">{course.category}</Badge>
          )}
          {course.difficulty_level && (
            <Badge variant="outline">{course.difficulty_level}</Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground space-x-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{course.instructor_name}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.current_enrollment} enrolled</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={handleViewDetails}
          variant="outline"
        >
          View Details
        </Button>
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
      </CardFooter>
    </Card>
  );
};