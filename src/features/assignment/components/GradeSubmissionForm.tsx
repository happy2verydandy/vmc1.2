'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { SubmissionDetail } from '../lib/dto';
import { useGradeSubmissionMutation } from '../hooks/useGradeSubmissionMutation';

interface GradeSubmissionFormProps {
  submission: SubmissionDetail;
  onGradeComplete: () => void;
}

export const GradeSubmissionForm: React.FC<GradeSubmissionFormProps> = ({ 
  submission, 
  onGradeComplete 
}) => {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState<string>(submission.feedback || '');
  const [status, setStatus] = useState<'graded' | 'resubmission_required'>(submission.status as 'graded' | 'resubmission_required' || 'graded');
  
  const mutation = useGradeSubmissionMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate grade input (0-100)
    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      return;
    }
    
    // Validate feedback is not empty
    if (!feedback.trim()) {
      return;
    }
    
    mutation.mutate({
      submissionId: submission.id,
      gradeData: {
        grade: gradeValue,
        feedback,
        status
      }
    });
  };

  const handleRequestResubmission = () => {
    setStatus('resubmission_required');
  };

  const handleGrade = () => {
    setStatus('graded');
  };

  // Handle mutation success
  React.useEffect(() => {
    if (mutation.isSuccess) {
      onGradeComplete();
    }
  }, [mutation.isSuccess, onGradeComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Submission</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="grade">Grade (0-100)</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={mutation.isPending}
            />
            {!grade && (
              <p className="text-sm text-destructive mt-1">Grade is required.</p>
            )}
            {grade && (parseFloat(grade) < 0 || parseFloat(grade) > 100) && (
              <p className="text-sm text-destructive mt-1">Grade must be between 0 and 100.</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={mutation.isPending}
              rows={4}
              placeholder="Provide feedback for the submission..."
            />
            {!feedback.trim() && (
              <p className="text-sm text-destructive mt-1">Feedback is required.</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={status === 'graded' ? 'default' : 'outline'}
              onClick={handleGrade}
              disabled={mutation.isPending}
            >
              Mark as Graded
            </Button>
            <Button
              type="button"
              variant={status === 'resubmission_required' ? 'destructive' : 'outline'}
              onClick={handleRequestResubmission}
              disabled={mutation.isPending}
            >
              Request Resubmission
            </Button>
          </div>
          
          <div>
            <Label>Status</Label>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-1 rounded ${status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {status === 'graded' ? 'Graded' : 'Resubmission Required'}
              </span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={
              mutation.isPending || 
              !grade || 
              !feedback.trim() || 
              parseFloat(grade) < 0 || 
              parseFloat(grade) > 100
            }
          >
            {mutation.isPending ? 'Submitting Grade...' : 'Submit Grade'}
          </Button>
        </form>

        {mutation.isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {mutation.error.message || 'An error occurred while submitting the grade.'}
            </AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && !mutation.isPending && (
          <Alert variant="default" className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Submission graded successfully!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};