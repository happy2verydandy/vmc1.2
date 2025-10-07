import React from 'react';
import { getAssignmentStatusColor, getAssignmentStatusDisplay } from '../lib/assignmentStatusService';
import { Assignment } from '../lib/dto';

interface AssignmentStatusBadgeProps {
  status: Assignment['status'];
}

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status }) => {
  const displayText = getAssignmentStatusDisplay(status);
  const colorClass = getAssignmentStatusColor(status);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {displayText}
    </span>
  );
};

export default AssignmentStatusBadge;