'use client';

import React from 'react';
import { useGradeSummaryQuery } from '@/features/grade/hooks/useGradeQuery';
import { GradeSummary } from '@/features/grade/components/GradeSummary';
import { GradeDetail } from '@/features/grade/components/GradeDetail';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy, AlertCircle } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

const GradePage = () => {
  const { user: currentUser, isLoading: isUserLoading, isAuthenticated } = useCurrentUser();
  const { data: gradeSummaries, isLoading: isGradesLoading, error } = useGradeSummaryQuery();

  if (isUserLoading || isGradesLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Grades</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Grades</h1>
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Please log in to view your grades.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Grades</h1>
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Error loading grades: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="h-8 w-8" />
        My Grades
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GradeSummary className="h-full" />
        </div>
        
        <div className="lg:col-span-2">
          {gradeSummaries && gradeSummaries.length > 0 ? (
            <Tabs defaultValue={gradeSummaries[0]?.course_id} className="w-full">
              <TabsList className="grid w-full grid-cols-2 overflow-x-auto">
                {gradeSummaries.map((summary) => (
                  <TabsTrigger key={summary.course_id} value={summary.course_id}>
                    {summary.course_title.substring(0, 15)}{summary.course_title.length > 15 ? '...' : ''}
                  </TabsTrigger>
                ))}
              </TabsList>
              {gradeSummaries.map((summary) => (
                <TabsContent key={summary.course_id} value={summary.course_id} className="mt-4">
                  <GradeDetail courseId={summary.course_id} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium mt-2">No Grades Available</h3>
                <p className="text-muted-foreground mt-1">
                  You have not received any grades yet. Complete assignments to see your progress here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradePage;