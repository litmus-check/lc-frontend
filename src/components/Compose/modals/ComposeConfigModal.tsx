'use client'
import React from 'react';
import { Modal, Button, Radio } from 'antd';
import Config from '@/components/Config/Config';
import { RoleBasedButton } from '@/components/ui/role-based-button';

interface ComposeConfig {
  browser: string;
  device: string;
  os: string;
  viewport: string;
  environment: string;
}

interface ComposeConfigModalProps {
  open: boolean;
  onCancel: () => void;
  config: ComposeConfig;
  onConfigChange: (config: Partial<ComposeConfig>) => void;
  onRun: (config: any) => void;
}

export const ComposeConfigModal: React.FC<ComposeConfigModalProps> = ({
  open,
  onCancel,
  config,
  onConfigChange,
  onRun,
}) => {
  const handleRun = () => {
    const [width, height] = config.viewport.split('x').map(Number);
    onRun({
      config: {
        browser: config.browser,
        device: {
          type: config.device,
          device_config: {
            os: config.os,
          }
        },
        viewport: {
          width: width,
          height: height
        }
      }
    });
  };

  return (
    <Modal
      title="Run Compose with Custom Config"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button
          key="cancel"
          className="font-hanken text-[14px] border-2 border-[#EA3962] mr-2 rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
          onClick={onCancel}
        >
          Cancel
        </Button>,
        <RoleBasedButton
          key="run"
          type="primary"
          onClick={handleRun}
          className="font-hanken text-[14px] border-2 !text-white !bg-[#AE00FF] !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
        >
          Run Compose
        </RoleBasedButton>,
      ]}
    >
      <div className="flex flex-col gap-6">
        <Config
          config={{
            browser: config.browser,
            device: config.device,
            os: config.os,
            viewport: config.viewport
          }}
          onConfigChange={(newConfig) => onConfigChange(newConfig)}
          title=""
          className=""
        />

        {/* Environment Selection */}
        <div className="border-t pt-4">
          <div className="font-hanken font-semibold text-[16px] mb-4">Environment</div>
          <Radio.Group
            value={config.environment}
            onChange={(e) => onConfigChange({ environment: e.target.value })}
            className="font-hanken"
          >
            <Radio value="browserbase" className="font-hanken text-sm">
              Browserbase
            </Radio>
            <Radio value="litmus_cloud" className="font-hanken text-sm">
              Litmus Cloud
            </Radio>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
};
