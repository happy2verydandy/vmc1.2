import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCloseAssignmentMutation } from '../hooks/useCloseAssignmentMutation';
import { Assignment } from '../lib/dto';

interface AssignmentCloseButtonProps {
  assignment: Assignment;
  onAssignmentUpdated?: (assignment: Assignment) => void;
  disabled?: boolean;
}

const AssignmentCloseButton: React.FC<AssignmentCloseButtonProps> = ({
  assignment,
  onAssignmentUpdated,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: closeAssignment, isPending, error } = useCloseAssignmentMutation();

  const handleConfirmClose = () => {
    closeAssignment(
      { assignmentId: assignment.id },
      {
        onSuccess: (updatedAssignment) => {
          setIsOpen(false);
          if (onAssignmentUpdated) {
            onAssignmentUpdated(updatedAssignment);
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-end">
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled || assignment.status !== 'published' || isPending}
        variant="destructive"
        className="w-full md:w-auto"
      >
        {isPending ? '처리 중...' : '과제 마감'}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">과제 마감 확인</h3>
            <p className="text-gray-600 mb-4">
              &quot;{assignment.title}&quot; 과제를 마감하시겠습니까? 마감 후에는 학습자가 과제를 제출할 수 없습니다.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmClose}
                disabled={isPending}
              >
                {isPending ? '처리 중...' : '마감'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          오류: {error.message}
        </div>
      )}
    </div>
  );
};

export default AssignmentCloseButton;