'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { SubmissionDetail } from '../lib/dto';
import { useSubmissionsQuery } from '../hooks/useSubmissionsQuery';
import Link from 'next/link';

interface SubmissionListViewProps {
  assignmentId: string;
}

export const SubmissionListView: React.FC<SubmissionListViewProps> = ({ assignmentId }) => {
  const { data: submissions, isLoading, error } = useSubmissionsQuery(assignmentId);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading submissions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-destructive">Error loading submissions: {error.message}</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No submissions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Learner</th>
                <th className="text-left py-2 px-4">Submitted At</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Grade</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4">{submission.learner_name}</td>
                  <td className="py-2 px-4">
                    {new Date(submission.submitted_at).toLocaleString()}
                    {submission.is_late && (
                      <Badge variant="outline" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Late
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <Badge 
                      variant={getStatusVariant(submission.status)} 
                      className="capitalize"
                    >
                      {renderStatusIcon(submission.status)}
                      {submission.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-2 px-4">
                    {submission.grade !== null ? `${submission.grade}/100` : 'Not graded'}
                  </td>
                  <td className="py-2 px-4">
                    <Button asChild size="sm">
                      <Link href={`/instructor/${getCourseIdFromAssignmentId(assignmentId)}/assignments/${assignmentId}/submissions/${submission.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine badge variant based on submission status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'secondary';
    case 'graded':
      return 'default';
    case 'resubmission_required':
      return 'destructive';
    default:
      return 'secondary';
  }
};

// Helper function to render status icons
const renderStatusIcon = (status: string) => {
  switch (status) {
    case 'graded':
      return <CheckCircle className="h-3 w-3 mr-1" />;
    case 'resubmission_required':
      return <AlertCircle className="h-3 w-3 mr-1" />;
    case 'submitted':
      return <XCircle className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

// Helper function to extract courseId from assignmentId (this is a placeholder implementation)
// In a real implementation, this would get the courseId from assignment details
const getCourseIdFromAssignmentId = (assignmentId: string): string => {
  // This is a placeholder - in real implementation, we would fetch assignment details
  // to get the course_id associated with the assignmentId
  return 'default-course-id';
};