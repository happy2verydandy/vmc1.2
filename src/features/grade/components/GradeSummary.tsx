'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, GraduationCap, Trophy, FileText } from 'lucide-react';
import { CourseGradeSummary } from '../lib/dto';
import { useGradeSummaryQuery } from '../hooks/useGradeQuery';

interface GradeSummaryProps {
  className?: string;
}

export const GradeSummary: React.FC<GradeSummaryProps> = ({ className }) => {
  const { data: gradeSummaries, isLoading, error } = useGradeSummaryQuery();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            My Grade Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading your grades...</p>
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
            My Grade Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading grades: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!gradeSummaries || gradeSummaries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            My Grade Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No grades available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          My Grade Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {gradeSummaries.map((summary) => {
            const progress = (summary.graded_assignments_count / summary.assignments_count) * 100;
            
            return (
              <div key={summary.course_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {summary.course_title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {summary.total_score.toFixed(2)}%
                    </span>
                    <Badge 
                      variant={summary.total_score >= 90 ? 'default' : 
                              summary.total_score >= 80 ? 'secondary' : 
                              summary.total_score >= 70 ? 'outline' : 'destructive'}
                    >
                      {summary.total_score >= 90 ? 'A' : 
                       summary.total_score >= 80 ? 'B' : 
                       summary.total_score >= 70 ? 'C' : 'D'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  <span>
                    {summary.graded_assignments_count} of {summary.assignments_count} assignments graded
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};