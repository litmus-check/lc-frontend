'use client'
import React from 'react';
import { InstructionDisplay } from '@/components/InstructionDisplay/InstructionDisplay';

interface InstructionObj {
  id: string;
  value: string | {
    type: string;
    action: string;
    args: Array<{
      key: string;
      value: string | boolean;
    }>;
    prompt?: string;
    element_id?: string;
  };
  playwright_actions?: string[];
  selectors?: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>;
  status?: 'pending' | 'running' | 'success' | 'failed';
}

interface ActionComponentProps {
  instruction: InstructionObj;
  isEditing: boolean;
  suiteId?: string;
  menuDisabled?: boolean;
  openDropdownId?: string;
  onEdit: (id: string, value: InstructionObj['value']) => void;
  onDelete: (id: string) => void;
  onViewSegment?: (segmentId: string) => void;
  onShowSelectors?: (selectors: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>, playwrightActions: string[], instructionId?: string) => void;
  onDropdownOpenChange?: (open: boolean) => void;
  editComponent?: React.ReactNode;
}

export const ActionComponent: React.FC<ActionComponentProps> = ({
  instruction,
  isEditing,
  suiteId,
  menuDisabled,
  openDropdownId,
  onEdit,
  onDelete,
  onViewSegment,
  onShowSelectors,
  onDropdownOpenChange,
  editComponent,
}) => {
  if (isEditing && editComponent) {
    return <>{editComponent}</>;
  }

  return (
    <div className="flex items-start">
      <div className="group">
        <InstructionDisplay
          instruction={instruction}
          suite_id={suiteId}
          showMenu={true}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewSegment={onViewSegment}
          onShowSelectors={onShowSelectors}
          menuDisabled={menuDisabled}
          openDropdownId={openDropdownId}
          onDropdownOpenChange={onDropdownOpenChange}
        />
      </div>
    </div>
  );
};
