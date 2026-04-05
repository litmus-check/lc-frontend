'use client'
import React from 'react';
import { Input } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const RemoveApiHandlersAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-sm text-gray-400 mb-1">URL (string or glob pattern)</div>
        <Input
          className="w-full"
          placeholder="Enter URL or glob pattern"
          value={instructionArgs.url as string}
          onChange={(e) => onArgChange('url', e.target.value)}
          status={showValidationErrors && validationErrors.url ? 'error' : ''}
        />
        {showValidationErrors && validationErrors.url && (
          <span className="text-red-500 text-sm">{validationErrors.url}</span>
        )}
      </div>
    </div>
  );
};
