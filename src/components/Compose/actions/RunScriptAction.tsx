'use client'
import React from 'react';
import { Input } from 'antd';
import ScriptEditor from '../ScriptEditor';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const RunScriptAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        className="w-full"
        placeholder="Enter description here"
        value={instructionArgs.description as string}
        onChange={(e) => onArgChange('description', e.target.value)}
        status={showValidationErrors && validationErrors.description ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.description && (
        <span className="text-red-500 text-sm">{validationErrors.description}</span>
      )}
      <ScriptEditor
        value={(instructionArgs.script != null ? String(instructionArgs.script) : '') || ''}
        onChange={(value) => onArgChange('script', value)}
      />
      {showValidationErrors && validationErrors.script && (
        <span className="text-red-500 text-sm">{validationErrors.script}</span>
      )}
    </div>
  );
};
