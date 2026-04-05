'use client'
import React from 'react';
import { Input, Select, Radio } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';
import {
  shouldIncludeVerifyArg,
  clearVerifyFieldsOnTargetChange,
} from '@/lib/verifyUtils';

interface VerifyActionProps extends BaseActionEditorProps {
  elementType: 'existing' | 'new';
  onElementTypeChange: (type: 'existing' | 'new') => void;
  elements: Array<{ element_id: string; element_description?: string; store_name?: string }>;
  onVerifyArgChange: (key: string, value: string) => void;
}

export const VerifyAction: React.FC<VerifyActionProps> = ({
  instructionArgs,
  onVerifyArgChange,
  validationErrors,
  showValidationErrors,
  elementType,
  onElementTypeChange,
  elements,
}) => {
  const handleArgChange = (key: string, value: string) => {
    if (key === 'target') {
      const newArgs = { ...instructionArgs, [key]: value };
      const clearedArgs = clearVerifyFieldsOnTargetChange(newArgs, value);
      Object.keys(clearedArgs).forEach(k => {
        if (clearedArgs[k] !== instructionArgs[k]) {
          onVerifyArgChange(k, clearedArgs[k] || '');
        }
      });
    } else if (key === 'property') {
      const newArgs = { ...instructionArgs, [key]: value };
      delete (newArgs as any).check;
      delete (newArgs as any).value;
      onVerifyArgChange('property', value);
      onVerifyArgChange('check', '');
      onVerifyArgChange('value', '');
    } else {
      onVerifyArgChange(key, value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Progressive arguments for verify */}
      {[
        { key: 'target', description: 'Select target to verify' },
        { key: 'locator_type', description: 'Choose locator type' },
        { key: 'prompt', description: 'Prompt to find the element' },
        { key: 'locator', description: 'Enter CSS/XPATH locator' },
        { key: 'property', description: 'Select what to verify' },
        { key: 'check', description: 'Select check type' },
        { key: 'sub_property', description: 'Enter sub property' },
        { key: 'value', description: 'Enter value' },
      ].map((arg) => {
        // Skip locator-related args if target is 'page'
        if (instructionArgs.target === 'page' &&
          (arg.key === 'locator_type' || arg.key === 'prompt' || arg.key === 'locator')) {
          return null;
        }

        // Skip sub-property args if target is 'page'
        if (instructionArgs.target === 'page' && arg.key === 'sub_property') {
          return null;
        }

        // Skip sub-property args if property is not 'Verify attribute' or 'Verify css'
        if (arg.key === 'sub_property' &&
          instructionArgs.property !== 'verify_attribute' &&
          instructionArgs.property !== 'verify_css') {
          return null;
        }

        // Skip locator field if locator_type is 'ai'
        if (arg.key === 'locator' && instructionArgs.locator_type === 'ai') {
          return null;
        }

        // Skip prompt field if locator_type is not 'ai'
        if (arg.key === 'prompt' && instructionArgs.locator_type !== 'ai') {
          return null;
        }

        // Skip check and value fields if property is a "Verify if *" option
        if ((arg.key === 'check' || arg.key === 'value') &&
          (instructionArgs.property as string) &&
          (instructionArgs.property as string).startsWith('verify_if_')) {
          return null;
        }

        // Simplified field display logic
        let shouldShow = false;
        if (arg.key === 'target') {
          shouldShow = true;
        } else if (instructionArgs.target === 'page') {
          if (['property', 'check', 'value', 'fail_test', 'expected_result'].includes(arg.key)) {
            shouldShow = true;
          }
        } else if (instructionArgs.target === 'element') {
          if (['property', 'locator_type', 'check', 'fail_test', 'expected_result', 'sub_property', 'value'].includes(arg.key)) {
            shouldShow = true;
          }
          if (arg.key === 'prompt' && instructionArgs.locator_type === 'ai') {
            shouldShow = true;
          }
          if (arg.key === 'locator' && instructionArgs.locator_type === 'manual') {
            shouldShow = true;
          }
          if (arg.key === 'sub_property' &&
            (instructionArgs.property !== 'verify_css' && instructionArgs.property !== 'verify_attribute')) {
            shouldShow = false;
          }
        }

        if (!shouldShow) return null;

        return (
          <div key={arg.key}>
            <div className="text-sm text-gray-400 mb-1">{arg.description}</div>
            {arg.key === 'target' ? (
              <Select
                className="w-full !border-[#DD94FF]"
                placeholder={arg.description}
                value={instructionArgs[arg.key] as string}
                onChange={(value) => handleArgChange(arg.key, value)}
                status={showValidationErrors && validationErrors[arg.key] ? 'error' : ''}
              >
                <Select.Option value="page">Page</Select.Option>
                <Select.Option value="element">Element</Select.Option>
              </Select>
            ) : arg.key === 'property' && instructionArgs.target === 'page' ? (
              <Select
                className="w-full !border-[#DD94FF]"
                placeholder={arg.description}
                value={instructionArgs[arg.key] as string}
                onChange={(value) => handleArgChange(arg.key, value)}
                status={showValidationErrors && validationErrors[arg.key] ? 'error' : ''}
              >
                <Select.Option value="verify_url">Verify URL</Select.Option>
                <Select.Option value="verify_title">Verify Title</Select.Option>
              </Select>
            ) : arg.key === 'property' && instructionArgs.target === 'element' ? (
              <Select
                className="w-full !border-[#DD94FF]"
                placeholder={arg.description}
                value={instructionArgs[arg.key] as string}
                onChange={(value) => handleArgChange(arg.key, value)}
                status={showValidationErrors && validationErrors[arg.key] ? 'error' : ''}
              >
                <Select.Option value="verify_text">Verify Text</Select.Option>
                <Select.Option value="verify_class">Verify Class</Select.Option>
                <Select.Option value="verify_count">Verify Count</Select.Option>
                <Select.Option value="verify_value">Verify Value</Select.Option>
                <Select.Option value="verify_css">Verify CSS</Select.Option>
                <Select.Option value="verify_attribute">Verify Attribute</Select.Option>
                <Select.Option value="verify_if_visible">Verify if Visible</Select.Option>
                <Select.Option value="verify_if_checked">Verify if Checked</Select.Option>
                <Select.Option value="verify_if_empty">Verify if Empty</Select.Option>
                <Select.Option value="verify_if_in_viewport">Verify if in Viewport</Select.Option>
              </Select>
            ) : arg.key === 'check' ? (
              <Select
                className="w-full !border-[#DD94FF]"
                placeholder={arg.description}
                value={instructionArgs[arg.key] as string}
                onChange={(value) => handleArgChange(arg.key, value)}
                status={showValidationErrors && validationErrors[arg.key] ? 'error' : ''}
              >
                {instructionArgs.property === 'verify_count' ? (
                  <>
                    <Select.Option value="is">is</Select.Option>
                    <Select.Option value="is greater than">is greater than</Select.Option>
                    <Select.Option value="is lesser than">is lesser than</Select.Option>
                    <Select.Option value="is greater than or equal to">is greater than or equal to</Select.Option>
                    <Select.Option value="is lesser than or equal to">is lesser than or equal to</Select.Option>
                  </>
                ) : (
                  <>
                    <Select.Option value="is">is</Select.Option>
                    <Select.Option value="contains">contains</Select.Option>
                  </>
                )}
              </Select>
            ) : arg.key === 'locator_type' && instructionArgs.target === 'element' ? (
              <Radio.Group
                value={instructionArgs[arg.key] as string}
                onChange={(e) => handleArgChange(arg.key, e.target.value)}
                className="w-full"
              >
                <Radio value="ai">AI</Radio>
                <Radio value="manual">Manual</Radio>
              </Radio.Group>
            ) : arg.key === 'prompt' ? (
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
                    onChange={(value) => handleArgChange('element_id', value)}
                    status={showValidationErrors && (validationErrors[arg.key] || (arg.key === 'prompt' && elementType === 'existing' && validationErrors.element_id)) ? 'error' : ''}
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
                    value={instructionArgs[arg.key] as string}
                    onChange={(e) => handleArgChange(arg.key, e.target.value)}
                    status={showValidationErrors && validationErrors[arg.key] ? 'error' : ''}
                  />
                )}
              </div>
            ) : (
              <Input
                className="w-full !border-[#DD94FF]"
                value={instructionArgs[arg.key] as string}
                onChange={(e) => handleArgChange(arg.key, e.target.value)}
                status={showValidationErrors && validationErrors[arg.key] ? 'error' : ''}
              />
            )}
            {showValidationErrors && (validationErrors[arg.key] || (arg.key === 'prompt' && elementType === 'existing' && validationErrors.element_id)) && (
              <span className="text-red-500 text-sm">{validationErrors[arg.key] || (arg.key === 'prompt' && elementType === 'existing' ? validationErrors.element_id : '')}</span>
            )}
          </div>
        );
      })}

      {/* Last two arguments as radio buttons */}
      {[
        { key: 'fail_test', description: 'Fail test on verification failure?' },
        { key: 'expected_result', description: 'Expected result' },
      ].map((arg) => (
        <div key={arg.key}>
          <div className="text-sm text-gray-400 mb-1">{arg.description}</div>
          <Radio.Group
            value={instructionArgs[arg.key]}
            onChange={(e) => handleArgChange(arg.key, e.target.value)}
            className="w-full"
          >
            <Radio value="true">{arg.key === 'expected_result' ? 'Pass' : 'Yes'}</Radio>
            <Radio value="false">{arg.key === 'expected_result' ? 'Fail' : 'No'}</Radio>
          </Radio.Group>
          {showValidationErrors && validationErrors[arg.key] && (
            <span className="text-red-500 text-sm">{validationErrors[arg.key]}</span>
          )}
        </div>
      ))}
    </div>
  );
};
