'use client'
import React from 'react';
import { Input } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const GoToUrlAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        className="w-full"
        placeholder="URL to navigate to"
        value={instructionArgs.url || ''}
        onChange={(e) => onArgChange('url', e.target.value)}
        status={showValidationErrors && validationErrors.url ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.url && (
        <span className="text-red-500 text-sm">{validationErrors.url}</span>
      )}
    </div>
  );
};
