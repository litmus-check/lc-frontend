'use client'
import React from 'react';
import { Input, Select, Radio, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

interface SwitchTabActionProps extends BaseActionEditorProps {
  availableLiveUrls: Array<{ title: string; url: string; live_url: string }>;
  liveUrlsLoading: boolean;
  onLiveUrlsFetch: () => void;
  supportedUrlPatterns?: React.ReactNode;
}

export const SwitchTabAction: React.FC<SwitchTabActionProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
  availableLiveUrls,
  liveUrlsLoading,
  onLiveUrlsFetch,
  supportedUrlPatterns,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Radio.Group
        value={instructionArgs.tabSelectionMethod || 'dropdown'}
        onChange={(e) => onArgChange('tabSelectionMethod', e.target.value)}
        className="w-full"
      >
        <div className="flex gap-2">
          <Radio value="dropdown" className="!text-sm">
            Select from open tabs
          </Radio>
          <Radio value="regex" className="!text-sm">
            Enter URL or pattern
          </Radio>
        </div>
      </Radio.Group>
      {showValidationErrors && validationErrors.tabSelectionMethod && (
        <span className="text-red-500 text-sm">{validationErrors.tabSelectionMethod}</span>
      )}

      {instructionArgs.tabSelectionMethod === 'dropdown' ? (
        <Select
          placeholder="Select a tab by title"
          value={instructionArgs.url || undefined}
          onDropdownVisibleChange={(open) => {
            if (open) {
              onLiveUrlsFetch();
            }
          }}
          onChange={(value) => onArgChange('url', value)}
          loading={liveUrlsLoading}
          className="w-full"
          status={showValidationErrors && validationErrors.url ? 'error' : ''}
        >
          {availableLiveUrls.map((tab) => (
            <Select.Option key={tab.url} value={tab.url} title={tab.title}>
              <Tooltip title={tab.url} placement="right">
                <div className="flex flex-col">
                  <span className="font-medium">{tab.title}</span>
                  <span className="text-xs text-gray-500 truncate select-option-url">{tab.url}</span>
                </div>
              </Tooltip>
            </Select.Option>
          ))}
        </Select>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="https?://*.xyz.co*/abc/*/def?query=*"
            value={instructionArgs.url || ''}
            onChange={(e) => onArgChange('url', e.target.value)}
            status={showValidationErrors && validationErrors.url ? 'error' : ''}
          />
          {supportedUrlPatterns && (
            <Tooltip title={supportedUrlPatterns} placement="right">
              <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};
