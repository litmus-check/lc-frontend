'use client'
import React from 'react';
import { Input } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const SetStateVariableAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        className="w-full"
        placeholder="Variable name"
        value={instructionArgs.variable_name || ''}
        onChange={(e) => onArgChange('variable_name', e.target.value)}
        status={showValidationErrors && validationErrors.variable_name ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.variable_name && (
        <span className="text-red-500 text-sm">{validationErrors.variable_name}</span>
      )}
      <Input
        className="w-full"
        placeholder="Variable value"
        value={instructionArgs.variable_value || ''}
        onChange={(e) => onArgChange('variable_value', e.target.value)}
        status={showValidationErrors && validationErrors.variable_value ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.variable_value && (
        <span className="text-red-500 text-sm">{validationErrors.variable_value}</span>
      )}
    </div>
  );
};
