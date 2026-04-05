'use client'
import React from 'react';
import { Input, Select } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const ScrollAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Select
        placeholder="Direction to scroll"
        value={instructionArgs.direction || undefined}
        onChange={(value) => onArgChange('direction', value)}
        className="w-full"
        status={showValidationErrors && validationErrors.direction ? 'error' : ''}
      >
        <Select.Option value="up">up</Select.Option>
        <Select.Option value="down">down</Select.Option>
        <Select.Option value="right">right</Select.Option>
        <Select.Option value="left">left</Select.Option>
      </Select>
      {showValidationErrors && validationErrors.direction && (
        <span className="text-red-500 text-sm">{validationErrors.direction}</span>
      )}
      <Input
        className="w-full"
        placeholder="Number of pixels to scroll"
        type="number"
        value={instructionArgs.value || ''}
        onChange={(e) => onArgChange('value', e.target.value)}
        status={showValidationErrors && validationErrors.value ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.value && (
        <span className="text-red-500 text-sm">{validationErrors.value}</span>
      )}
    </div>
  );
};
