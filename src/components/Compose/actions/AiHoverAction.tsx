'use client'
import React from 'react';
import { Input, Select, Radio } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

interface AiHoverActionProps extends BaseActionEditorProps {
  elementType: 'existing' | 'new';
  onElementTypeChange: (type: 'existing' | 'new') => void;
  elements: Array<{ element_id: string; element_description?: string; store_name?: string }>;
}

export const AiHoverAction: React.FC<AiHoverActionProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
  elementType,
  onElementTypeChange,
  elements,
}) => {
  return (
    <div className="space-y-3">
      <Radio.Group
        value={elementType}
        onChange={(e) => onElementTypeChange(e.target.value)}
        className="w-full"
      >
        <Radio value="existing" className="font-hanken">Existing Element</Radio>
        <Radio value="new" className="font-hanken">New Element</Radio>
      </Radio.Group>

      {elementType === 'existing' ? (
        <Select
          className="w-full"
          placeholder="Select or search for an element"
          value={instructionArgs.element_id as string}
          onChange={(value) => onArgChange('element_id', value)}
          status={showValidationErrors && validationErrors.prompt ? 'error' : ''}
          showSearch
          filterOption={(input, option) => {
            const value = option?.value as string;
            return value?.toLowerCase().includes(input.toLowerCase()) || false;
          }}
          optionRender={(option) => {
            const element = elements.find(el => el.element_id === option.value);
            return (
              <div className="flex flex-col">
                <span className="font-medium">{element?.element_id}</span>
                <span className="text-xs text-gray-500">{element?.element_description}</span>
                {element?.store_name && (
                  <span className="text-xs text-blue-500">{element.store_name}</span>
                )}
              </div>
            );
          }}
          options={elements.map(element => ({
            value: element.element_id,
            label: element.element_id
          }))}
        />
      ) : (
        <Input
          className="w-full"
          placeholder="Enter your prompt"
          value={instructionArgs.prompt as string}
          onChange={(e) => onArgChange('prompt', e.target.value)}
          status={showValidationErrors && (validationErrors.prompt || validationErrors.element_id) ? 'error' : ''}
        />
      )}

      {showValidationErrors && (validationErrors.prompt || validationErrors.element_id) && (
        <span className="text-red-500 text-sm">{validationErrors.prompt || validationErrors.element_id}</span>
      )}
    </div>
  );
};
