import React from 'react';
import type { Workflow } from '../utils';

export interface WorkflowLabelProps {
  workflow: Workflow;
}

const WorkflowLabel: React.FC<WorkflowLabelProps> = ({ workflow }) => (
  <span className="inline-flex gap-2.5 items-center px-2 py-1 border bg-white rounded-lg shadow-lg border-gray-300 mr-1">
    {workflow.icon}
    {workflow.command}
  </span>
);

export default WorkflowLabel;
