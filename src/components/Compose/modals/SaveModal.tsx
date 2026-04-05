'use client'
import React from 'react';
import { Modal, Button, Input, Radio, Select } from 'antd';

interface SuiteOption {
  label: string;
  value: string;
}

interface SaveModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  loading: boolean;
  suiteId?: string | null;
  testId?: string | null;
  saveMode: 'existing' | 'new';
  onSaveModeChange: (mode: 'existing' | 'new') => void;
  selectedSuite?: string;
  onSuiteChange: (suiteId: string) => void;
  suiteOptions: SuiteOption[];
  newSuiteName: string;
  onNewSuiteNameChange: (name: string) => void;
  saveTestName: string;
  onTestNameChange: (name: string) => void;
  customTestId: string;
  onCustomTestIdChange: (id: string) => void;
  saveError: string;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  open,
  onCancel,
  onSave,
  loading,
  suiteId,
  testId,
  saveMode,
  onSaveModeChange,
  selectedSuite,
  onSuiteChange,
  suiteOptions,
  newSuiteName,
  onNewSuiteNameChange,
  saveTestName,
  onTestNameChange,
  customTestId,
  onCustomTestIdChange,
  saveError,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={<Button type="primary" className="self-end !bg-[#AE00FF] !border-[#AE00FF]" loading={loading} onClick={onSave} data-testid="compose-save-modal-save-button">SAVE</Button>}
      title={'Save test'}
      centered
      data-testid="compose-save-modal"
    >
      <div className="flex flex-col p-4" data-testid="compose-save-modal-content">
        {suiteId && !testId ? (
          <>
            <Input
              placeholder="Test name"
              value={saveTestName}
              onChange={e => onTestNameChange(e.target.value)}
              className="mb-2"
              data-testid="compose-save-modal-test-name-input"
            />
            <Input
              placeholder="Test ID (optional)"
              value={customTestId}
              onChange={e => onCustomTestIdChange(e.target.value)}
              className="mb-2"
              data-testid="compose-save-modal-test-id-input"
            />
            {saveError && <div className="text-[#EA3962] text-sm mb-2" data-testid="compose-save-modal-error">{saveError}</div>}
          </>
        ) : (
          <>
            <Radio.Group
              value={saveMode}
              onChange={e => onSaveModeChange(e.target.value)}
              className="mb-2"
              data-testid="compose-save-modal-suite-mode-radio"
            >
              <Radio value="existing" data-testid="compose-save-modal-existing-suite-radio">Existing Suite</Radio>
              <Radio value="new" data-testid="compose-save-modal-new-suite-radio">New Suite</Radio>
            </Radio.Group>
            {saveMode === 'existing' && (
              <Select
                placeholder="Select a suite"
                options={suiteOptions}
                value={selectedSuite}
                onChange={onSuiteChange}
                className="mb-2"
                style={{ width: '100%' }}
                data-testid="compose-save-modal-suite-select"
              />
            )}
            {saveMode === 'new' && (
              <Input
                placeholder="Suite name"
                value={newSuiteName}
                onChange={e => onNewSuiteNameChange(e.target.value)}
                className="mb-2"
                data-testid="compose-save-modal-suite-name-input"
              />
            )}
            <Input
              placeholder="Test name"
              value={saveTestName}
              onChange={e => onTestNameChange(e.target.value)}
              className="mb-2"
              data-testid="compose-save-modal-test-name-input"
            />
            <Input
              placeholder="Test ID (optional)"
              value={customTestId}
              onChange={e => onCustomTestIdChange(e.target.value)}
              className="mb-2"
              data-testid="compose-save-modal-test-id-input"
            />
            {saveError && <div className="text-[#AE00FF] text-sm mb-2" data-testid="compose-save-modal-error">{saveError}</div>}
          </>
        )}
      </div>
    </Modal>
  );
};
