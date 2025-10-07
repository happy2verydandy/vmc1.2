'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { SubmissionDetail } from '../lib/dto';

interface SubmissionDetailViewProps {
  submission: SubmissionDetail;
}

export const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({ submission }) => {
  if (!submission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Submission not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Learner</h3>
              <p>{submission.learner_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Submitted At</h3>
              <p>{new Date(submission.submitted_at).toLocaleString()}</p>
              {submission.is_late && (
                <Badge variant="outline" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Late Submission
                </Badge>
              )}
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <div className="flex items-center">
                <Badge 
                  variant={getStatusVariant(submission.status)} 
                  className="capitalize flex items-center"
                >
                  {renderStatusIcon(submission.status)}
                  {submission.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Grade</h3>
              <p>
                {submission.grade !== null 
                  ? `${submission.grade}/100` 
                  : 'Not graded'}
              </p>
            </div>
          </div>
          
          {submission.link && (
            <div>
              <h3 className="font-medium">Link</h3>
              <a 
                href={submission.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {submission.link}
              </a>
            </div>
          )}
          
          <div>
            <h3 className="font-medium">Content</h3>
            <div className="p-4 bg-muted rounded-lg mt-1 whitespace-pre-wrap">
              {submission.content}
            </div>
          </div>
          
          {submission.feedback && (
            <div>
              <h3 className="font-medium">Feedback</h3>
              <div className="p-4 bg-muted rounded-lg mt-1">
                {submission.feedback}
              </div>
            </div>
          )}
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