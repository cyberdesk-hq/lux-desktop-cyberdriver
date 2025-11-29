import React from 'react';
import { Mode } from '../../common';
import { workflows } from '../utils';
import WorkflowLabel from './WorkflowLabel';

export interface InstructionProps {
  mode: Mode;
  instruction: string;
}

const Instruction: React.FC<InstructionProps> = ({ mode, instruction }) => {
  if (mode === Mode.Tasker) {
    const parts = instruction.split(
      new RegExp(
        `/(${workflows.map(workflow => workflow.command).join('|')})`,
        'g',
      ),
    );
    if (parts.length > 1) {
      return (
        <span className="flex flex-wrap items-center break-all">
          {parts.map((part, idx) =>
            idx & 1 ? (
              <WorkflowLabel
                key={idx}
                workflow={
                  workflows.find(workflow => workflow.command === part)!
                }
              />
            ) : (
              part
            ),
          )}
        </span>
      );
    }
    return parts.map((part, idx) =>
      idx & 1 ? (
        <React.Fragment key={idx}>
          {workflows.find(workflow => workflow.command === part)!.icon}
        </React.Fragment>
      ) : (
        part
      ),
    );
  }

  return instruction;
};

export default Instruction;
