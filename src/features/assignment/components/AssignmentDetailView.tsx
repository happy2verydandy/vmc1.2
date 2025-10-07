'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Calendar, Percent, AlertCircle, CheckCircle } from 'lucide-react';
import { AssignmentResponse, Submission } from '../lib/dto';
import { useAssignmentDetailQuery } from '../hooks/useAssignmentDetailQuery';
import { useAssignmentSubmissionQuery, useSubmitAssignmentMutation } from '../hooks/useSubmitAssignmentMutation';

interface AssignmentDetailViewProps {
  assignmentId: string;
}

export const AssignmentDetailView: React.FC<AssignmentDetailViewProps> = ({ assignmentId }) => {
  const { data: assignment, isLoading, error } = useAssignmentDetailQuery(assignmentId);
  const { data: submission, isLoading: isSubmissionLoading } = useAssignmentSubmissionQuery(assignmentId);
  
  const mutation = useSubmitAssignmentMutation();
  
  const [content, setContent] = useState(submission?.content || '');
  const [link, setLink] = useState(submission?.link || '');

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading assignment...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!assignment) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Assignment not found</AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!content.trim()) {
      return;
    }
    
    // Check if link is provided and if it's a valid URL
    if (link && !isValidUrl(link)) {
      return;
    }
    
    mutation.mutate({
      assignment_id: assignmentId,
      content,
      link: link || null,
    });
  };

  // Helper function to validate URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const isOverdue = now > dueDate;
  const isClosed = assignment.status === 'closed';

  // Check if submission is blocked based on policies
  const isSubmissionBlocked = isClosed || (isOverdue && !assignment.late_submission_allowed);

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{assignment.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground gap-4">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(assignment.due_date).toLocaleString()}
            </span>
            <span className="flex items-center">
              <Percent className="h-4 w-4 mr-1" />
              {assignment.weight}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Course</h3>
            <p>{assignment.course_title}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="whitespace-pre-line">{assignment.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Late Submission Policy</h4>
              <p>{assignment.late_submission_allowed ? 'Allowed' : 'Not allowed'}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Resubmission Policy</h4>
              <p>{assignment.resubmission_allowed ? 'Allowed' : 'Not allowed'}</p>
            </div>
          </div>

          {isOverdue && !assignment.late_submission_allowed && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This assignment is overdue and late submission is not allowed.
              </AlertDescription>
            </Alert>
          )}

          {isClosed && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This assignment is closed. No more submissions are accepted.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your assignment content here..."
                  disabled={isSubmissionBlocked}
                  rows={6}
                />
                {!content.trim() && (
                  <p className="text-sm text-destructive mt-1">Content is required.</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/assignment-submission"
                  disabled={isSubmissionBlocked}
                />
                {link && !isValidUrl(link) && (
                  <p className="text-sm text-destructive mt-1">Please enter a valid URL.</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={
                  mutation.isPending || 
                  isSubmissionBlocked ||
                  !content.trim() ||
                  (link && !isValidUrl(link))
                }
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </form>

          {mutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error.message || 'An error occurred while submitting the assignment.'}
              </AlertDescription>
            </Alert>
          )}

          {mutation.isSuccess && !mutation.isPending && (
            <Alert variant="default" className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Assignment submitted successfully!
              </AlertDescription>
            </Alert>
          )}

          {submission && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Your Submission</h4>
              <p className="text-sm text-muted-foreground mb-1">Submitted at: {new Date(submission.submitted_at).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mb-2">Status: <span className="capitalize">{submission.status}</span></p>
              {submission.is_late && (
                <p className="text-sm text-destructive">Submitted late</p>
              )}
              {submission.grade !== null && (
                <p className="text-sm">Grade: {submission.grade}</p>
              )}
              {submission.feedback && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Feedback:</p>
                  <p className="text-sm">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};