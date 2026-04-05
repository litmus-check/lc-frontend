'use client'
import React from 'react';
import { Modal, Button, Switch, Select } from 'antd';
import { RoleBasedButton } from '@/components/ui/role-based-button';

interface TestDataFile {
  file_id: string;
  file_name: string;
}

interface SettingsModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  useTestData: boolean;
  onUseTestDataChange: (checked: boolean) => void;
  selectedTestDataFile: string;
  onTestDataFileChange: (fileId: string) => void;
  availableTestDataFiles: TestDataFile[];
  testDataFilesLoading: boolean;
  saveLoading: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onCancel,
  onSave,
  useTestData,
  onUseTestDataChange,
  selectedTestDataFile,
  onTestDataFileChange,
  availableTestDataFiles,
  testDataFilesLoading,
  saveLoading,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" className="mr-2" onClick={onCancel}>
          Cancel
        </Button>,
        <RoleBasedButton key="save" type="primary" className="!bg-[#AE00FF] !border-[#AE00FF] !text-white" loading={saveLoading} onClick={onSave}>
          Save
        </RoleBasedButton>
      ]}
      title="Settings"
      centered
    >
      <div className="flex flex-col p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Use test data</span>
            <Switch
              checked={useTestData}
              onChange={onUseTestDataChange}
            />
          </div>

          {useTestData && (
            <div className="mt-4">
              <div className="mb-2">
                <span className="font-medium">Data file</span>
              </div>
              <Select
                placeholder="Select a file"
                value={selectedTestDataFile}
                onChange={onTestDataFileChange}
                loading={testDataFilesLoading}
                className="w-full"
              >
                {availableTestDataFiles.map((file) => (
                  <Select.Option key={file.file_id} value={file.file_id}>
                    {file.file_name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
