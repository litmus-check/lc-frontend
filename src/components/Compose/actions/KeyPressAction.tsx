'use client'
import React from 'react';
import { Input, Select } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const KeyPressAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Select
        placeholder="Key type to press"
        value={instructionArgs.key_type || undefined}
        onChange={(value) => onArgChange('key_type', value)}
        className="w-full"
        status={showValidationErrors && validationErrors.key_type ? 'error' : ''}
      >
        <Select.Option value="up">up</Select.Option>
        <Select.Option value="down">down</Select.Option>
        <Select.Option value="press">press</Select.Option>
      </Select>
      {showValidationErrors && validationErrors.key_type && (
        <span className="text-red-500 text-sm">{validationErrors.key_type}</span>
      )}
      <Input
        className="w-full"
        placeholder="Value to press e.g. 'o', 'Control+c', 'Shift'"
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
