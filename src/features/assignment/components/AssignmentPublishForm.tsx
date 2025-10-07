import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAssignmentMutation } from '../hooks/useCreateAssignmentMutation';
import { useUpdateAssignmentMutation } from '../hooks/useUpdateAssignmentMutation';
import { usePublishAssignmentMutation } from '../hooks/usePublishAssignmentMutation';
import { Assignment } from '../lib/dto';
import { isValidStatusTransition } from '../lib/assignmentStatusService';

interface AssignmentPublishFormProps {
  course_id: string;
  initialAssignment?: Assignment;
  onSuccess?: (assignment: Assignment) => void;
  onCancel?: () => void;
}

const AssignmentPublishForm: React.FC<AssignmentPublishFormProps> = ({
  course_id,
  initialAssignment,
  onSuccess,
  onCancel,
}) => {
  // 상태 초기화
  const [formData, setFormData] = useState({
    title: initialAssignment?.title || '',
    description: initialAssignment?.description || '',
    due_date: initialAssignment?.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 일주일 후 기본값
    weight: initialAssignment?.weight?.toString() || '10',
    late_submission_allowed: initialAssignment?.late_submission_allowed || false,
    resubmission_allowed: initialAssignment?.resubmission_allowed || false,
    status: initialAssignment?.status || 'draft',
  });

  // 훅 가져오기
  const createMutation = useCreateAssignmentMutation();
  const updateMutation = useUpdateAssignmentMutation();
  const publishMutation = usePublishAssignmentMutation();

  // 폼 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 상태 변경 핸들러
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'draft' | 'published' | 'closed'
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 기존 과제가 있는 경우 업데이트
    if (initialAssignment) {
      const hasChanges = Object.entries(formData).some(([key, value]) => {
        if (key === 'status') return false; // 상태는 별도 처리
        return initialAssignment[key as keyof Assignment] !== value;
      });

      if (hasChanges) {
        // 업데이트
        updateMutation.mutate(
          {
            assignmentId: initialAssignment.id,
            updateData: {
              title: formData.title,
              description: formData.description,
              due_date: formData.due_date,
              weight: Number(formData.weight),
              late_submission_allowed: formData.late_submission_allowed,
              resubmission_allowed: formData.resubmission_allowed,
            }
          },
          {
            onSuccess: (updatedAssignment) => {
              // 상태가 draft에서 published로 변경 요청인 경우 게시
              if (initialAssignment.status === 'draft' && formData.status === 'published') {
                publishMutation.mutate(
                  { assignmentId: updatedAssignment.id },
                  {
                    onSuccess: (publishedAssignment) => {
                      if (onSuccess) onSuccess(publishedAssignment);
                    }
                  }
                );
              } else if (onSuccess) {
                onSuccess(updatedAssignment);
              }
            }
          }
        );
      } else if (initialAssignment.status === 'draft' && formData.status === 'published') {
        // 상태만 변경된 경우 게시
        publishMutation.mutate(
          { assignmentId: initialAssignment.id },
          {
            onSuccess: (publishedAssignment) => {
              if (onSuccess) onSuccess(publishedAssignment);
            }
          }
        );
      } else if (onSuccess) {
        onSuccess(initialAssignment);
      }
    } else {
      // 신규 과제 생성
      const newAssignmentData = {
        course_id,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        weight: Number(formData.weight),
        late_submission_allowed: formData.late_submission_allowed,
        resubmission_allowed: formData.resubmission_allowed,
        status: formData.status === 'published' ? 'published' : 'draft',
      };

      createMutation.mutate({
        ...newAssignmentData,
        status: formData.status as 'draft' | 'published',
      }, {
        onSuccess: (createdAssignment) => {
          // 게시 상태로 설정된 경우 게시 (이미 생성 시에 published로 설정됨)
          if (formData.status === 'published') {
            if (onSuccess) onSuccess(createdAssignment);
          } else if (onSuccess) {
            onSuccess(createdAssignment);
          }
        }
      });
    }
  };

  // 폼 제출 중 여부
  const isSubmitting = createMutation.isPending || updateMutation.isPending || publishMutation.isPending;
  const errorMessage = createMutation.error?.message || 
                      updateMutation.error?.message || 
                      publishMutation.error?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">과제 제목</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="due_date">마감일</Label>
            <Input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="weight">점수 비중 (%)</Label>
            <Input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="0"
              max="100"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="late_submission_allowed"
              name="late_submission_allowed"
              checked={formData.late_submission_allowed}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, late_submission_allowed: Boolean(checked) }))
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="late_submission_allowed">지각 제출 허용</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="resubmission_allowed"
              name="resubmission_allowed"
              checked={formData.resubmission_allowed}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, resubmission_allowed: Boolean(checked) }))
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="resubmission_allowed">재제출 허용</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="status">상태</Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger disabled={isSubmitting}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">작성 중 (Draft)</SelectItem>
              <SelectItem value="published">게시 (Published)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600">
          오류: {errorMessage}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : 
           initialAssignment ? '업데이트 및 게시' : '생성 및 게시'}
        </Button>
      </div>
    </form>
  );
};

export default AssignmentPublishForm;