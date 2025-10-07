'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, MessageCircle, Trophy } from 'lucide-react';
import { AssignmentGrade } from '../lib/dto';
import { useCourseGradeDetailQuery } from '../hooks/useGradeQuery';
import { format } from 'date-fns';

interface GradeDetailProps {
  courseId: string;
  className?: string;
}

export const GradeDetail: React.FC<GradeDetailProps> = ({ courseId, className }) => {
  const { data: gradeDetail, isLoading, error } = useCourseGradeDetailQuery(courseId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Assignment Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading assignment grades...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Assignment Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading assignment grades: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!gradeDetail || !gradeDetail.assignments || gradeDetail.assignments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Assignment Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No assignment grades available for this course.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {gradeDetail.course_title} - Assignment Grades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gradeDetail.assignments.map((assignment: AssignmentGrade) => (
            <div 
              key={assignment.id} 
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {assignment.assignment_title}
                </h3>
                <div className="flex items-center gap-2">
                  {assignment.score !== null ? (
                    <>
                      <span className="text-xl font-bold text-primary">
                        {assignment.score}%
                      </span>
                      <Badge 
                        variant={assignment.score >= 90 ? 'default' : 
                                assignment.score >= 80 ? 'secondary' : 
                                assignment.score >= 70 ? 'outline' : 'destructive'}
                      >
                        {assignment.score >= 90 ? 'A' : 
                         assignment.score >= 80 ? 'B' : 
                         assignment.score >= 70 ? 'C' : 'D'}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline">Not Graded</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Submitted: {format(new Date(assignment.submitted_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {assignment.graded_at && (
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span>Graded: {format(new Date(assignment.graded_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="gap-1">
                  Weight: {assignment.weight}%
                </Badge>
                <Badge 
                  variant={
                    assignment.status === 'graded' ? 'default' :
                    assignment.status === 'resubmission_required' ? 'destructive' : 'secondary'
                  }
                >
                  Status: {assignment.status.replace('_', ' ')}
                </Badge>
                {assignment.is_late && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Submitted Late
                  </Badge>
                )}
              </div>
              
              {assignment.feedback && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="h-4 w-4" />
                    <h4 className="font-medium">Feedback</h4>
                  </div>
                  <p className="text-sm whitespace-pre-line">{assignment.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};