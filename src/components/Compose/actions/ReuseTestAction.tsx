'use client'
import React from 'react';
import { Select, Input } from 'antd';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

interface ReuseTestActionProps extends BaseActionEditorProps {
  selectedTestId: string;
  selectedSegmentId: string;
  onTestIdChange: (testId: string) => void;
  onSegmentIdChange: (segmentId: string) => void;
  availableTests: Array<{ id: string; name: string }>;
  availableSegments: Array<{ segment_id: string; segment_name: string }>;
  testSearchQuery: string;
  onTestSearch: (query: string) => void;
  suiteTestsLoading: boolean;
  segmentsLoading: boolean;
}

export const ReuseTestAction: React.FC<ReuseTestActionProps> = ({
  validationErrors,
  showValidationErrors,
  selectedTestId,
  selectedSegmentId,
  onTestIdChange,
  onSegmentIdChange,
  availableTests,
  availableSegments,
  testSearchQuery,
  onTestSearch,
  suiteTestsLoading,
  segmentsLoading,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Select
        placeholder="Select a test or segment to reuse"
        value={
          (suiteTestsLoading || segmentsLoading)
            ? ''
            : selectedTestId ? `test_${selectedTestId}` : selectedSegmentId ? `segment_${selectedSegmentId}` : ''
        }
        onChange={(value) => {
          if (value.startsWith('test_')) {
            onTestIdChange(value.replace('test_', ''));
            onSegmentIdChange('');
          } else if (value.startsWith('segment_')) {
            onSegmentIdChange(value.replace('segment_', ''));
            onTestIdChange('');
          }
        }}
        loading={suiteTestsLoading || segmentsLoading}
        className="w-full"
        status={showValidationErrors && validationErrors.source_test_id ? 'error' : ''}
        dropdownRender={(menu) => (
          <div>
            <div style={{ padding: '8px' }}>
              <Input
                placeholder="Search test"
                value={testSearchQuery}
                onChange={(e) => onTestSearch(e.target.value)}
                allowClear
                style={{ marginBottom: '8px' }}
              />
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {menu}
            </div>
          </div>
        )}
      >
        <Select.OptGroup label="Tests">
          {availableTests.map((test) => (
            <Select.Option key={`test_${test.id}`} value={`test_${test.id}`}>
              {test.name}
            </Select.Option>
          ))}
        </Select.OptGroup>
        <Select.OptGroup label="Segments">
          {availableSegments.map((segment) => (
            <Select.Option key={`segment_${segment.segment_id}`} value={`segment_${segment.segment_id}`}>
              {segment.segment_name}
            </Select.Option>
          ))}
        </Select.OptGroup>
      </Select>
      {showValidationErrors && validationErrors.source_test_id && (
        <span className="text-red-500 text-sm">{validationErrors.source_test_id}</span>
      )}
    </div>
  );
};
