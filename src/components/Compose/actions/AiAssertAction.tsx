'use client'
import React from 'react';
import { Input, Radio } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

interface AiAssertActionProps extends BaseActionEditorProps {}

export const AiAssertAction: React.FC<AiAssertActionProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <div className="space-y-3">
      <Input
        className="w-full"
        placeholder="Enter your prompt"
        value={instructionArgs.prompt as string}
        onChange={(e) => onArgChange('prompt', e.target.value)}
        status={showValidationErrors && validationErrors.prompt ? 'error' : ''}
      />

      {showValidationErrors && validationErrors.prompt && (
        <span className="text-red-500 text-sm">{validationErrors.prompt}</span>
      )}

      <div>
        <div className="text-sm text-gray-400 mb-1">Fail test on verification failure?</div>
        <Radio.Group
          value={instructionArgs.fail_test}
          onChange={(e) => onArgChange('fail_test', e.target.value)}
          className="w-full"
        >
          <Radio value="true">Yes</Radio>
          <Radio value="false">No</Radio>
        </Radio.Group>
        {showValidationErrors && validationErrors.fail_test && (
          <span className="text-red-500 text-sm">{validationErrors.fail_test}</span>
        )}
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">Expected result</div>
        <Radio.Group
          value={instructionArgs.expected_result}
          onChange={(e) => onArgChange('expected_result', e.target.value)}
          className="w-full"
        >
          <Radio value="true">Pass</Radio>
          <Radio value="false">Fail</Radio>
        </Radio.Group>
        {showValidationErrors && validationErrors.expected_result && (
          <span className="text-red-500 text-sm">{validationErrors.expected_result}</span>
        )}
      </div>
    </div>
  );
};
