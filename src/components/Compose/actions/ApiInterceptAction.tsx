'use client'
import React from 'react';
import { Input, Select } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';
import ScriptEditor from '../ScriptEditor';

export const ApiInterceptAction: React.FC<BaseActionEditorProps> = ({
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
        <div className="text-sm text-gray-400 mb-1">Action</div>
        <Select
          className="w-full"
          placeholder="Select Action"
          value={instructionArgs.action as string}
          onChange={(value) => onArgChange('action', value)}
          status={showValidationErrors && validationErrors.action ? 'error' : ''}
        >
          <Select.Option value="modify_request">Modify Request</Select.Option>
          <Select.Option value="modify_response">Modify Response</Select.Option>
          <Select.Option value="abort_request">Abort Request</Select.Option>
          <Select.Option value="record_only">Record Only</Select.Option>
        </Select>
        {showValidationErrors && validationErrors.action && (
          <span className="text-red-500 text-sm">{validationErrors.action}</span>
        )}
      </div>

      {(instructionArgs.action === 'modify_request' || instructionArgs.action === 'modify_response') && (
        <div>
          <div className="text-sm text-gray-400 mb-1">JavaScript code</div>
          <ScriptEditor
            value={(instructionArgs.js_code != null ? String(instructionArgs.js_code) : '') || ''}
            onChange={(value) => onArgChange('js_code', value)}
          />
          {showValidationErrors && validationErrors.js_code && (
            <span className="text-red-500 text-sm">{validationErrors.js_code}</span>
          )}
        </div>
      )}

      <div>
        <div className="text-sm text-gray-400 mb-1">Variable name</div>
        <Input
          className="w-full"
          placeholder="Enter variable name"
          value={instructionArgs.variable_name as string}
          onChange={(e) => onArgChange('variable_name', e.target.value)}
          status={showValidationErrors && validationErrors.variable_name ? 'error' : ''}
        />
        {showValidationErrors && validationErrors.variable_name && (
          <span className="text-red-500 text-sm">{validationErrors.variable_name}</span>
        )}
      </div>
    </div>
  );
};
