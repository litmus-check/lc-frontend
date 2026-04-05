'use client'
import React from 'react';
import { Input, Select } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';
import ScriptEditor from '../ScriptEditor';

export const ApiMockAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {

  const handleStatusCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      onArgChange('status_code', value);
    }
  };

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

      <div>
        <div className="text-sm text-gray-400 mb-1">HTTP Method</div>
        <Select
          className="w-full"
          placeholder="Select HTTP Method"
          value={instructionArgs.method as string}
          onChange={(value) => onArgChange('method', value)}
          status={showValidationErrors && validationErrors.method ? 'error' : ''}
        >
          <Select.Option value="GET">GET</Select.Option>
          <Select.Option value="POST">POST</Select.Option>
          <Select.Option value="PUT">PUT</Select.Option>
          <Select.Option value="PATCH">PATCH</Select.Option>
          <Select.Option value="DELETE">DELETE</Select.Option>
        </Select>
        {showValidationErrors && validationErrors.method && (
          <span className="text-red-500 text-sm">{validationErrors.method}</span>
        )}
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">Status Code</div>
        <Input
          className="w-full"
          placeholder="Enter status code (100-999)"
          type="text"
          inputMode="numeric"
          value={instructionArgs.status_code as string}
          onChange={handleStatusCodeChange}
          status={showValidationErrors && validationErrors.status_code ? 'error' : ''}
        />
        {showValidationErrors && validationErrors.status_code && (
          <span className="text-red-500 text-sm">{validationErrors.status_code}</span>
        )}
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">Response header (JSON)</div>
        <ScriptEditor
          value={(instructionArgs.response_header != null ? String(instructionArgs.response_header) : '') || ''}
          onChange={(value) => onArgChange('response_header', value)}
          language="json"
          height="150px"
        />
        {showValidationErrors && validationErrors.response_header && (
          <span className="text-red-500 text-sm">{validationErrors.response_header}</span>
        )}
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">Response body (JSON)</div>
        <ScriptEditor
          value={(instructionArgs.response_body != null ? String(instructionArgs.response_body) : '') || ''}
          onChange={(value) => onArgChange('response_body', value)}
          language="json"
        />
        {showValidationErrors && validationErrors.response_body && (
          <span className="text-red-500 text-sm">{validationErrors.response_body}</span>
        )}
      </div>
    </div>
  );
};
