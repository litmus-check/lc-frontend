'use client'
import React from 'react';
import { Input } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const WaitTimeAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        className="w-full"
        placeholder="Time to wait in seconds"
        type="number"
        value={instructionArgs.delay_seconds || ''}
        onChange={(e) => onArgChange('delay_seconds', e.target.value)}
        status={showValidationErrors && validationErrors.delay_seconds ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.delay_seconds && (
        <span className="text-red-500 text-sm">{validationErrors.delay_seconds}</span>
      )}
    </div>
  );
};
