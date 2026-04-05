import React from 'react';
import { Radio, Select } from 'antd';

interface ConfigProps {
  config: {
    browser: string;
    device: string;
    os: string;
    viewport: string;
    onTestFailure?: string;
  };
  onConfigChange: (config: {
    browser: string;
    device: string;
    os: string;
    viewport: string;
    onTestFailure?: string;
  }) => void;
  title?: string;
  className?: string;
}

const Config: React.FC<ConfigProps> = ({ config, onConfigChange, title = "Configuration", className = "" }) => {
  const handleConfigChange = (field: string, value: any) => {
    if (field === 'device') {
      const newDevice = value;
      const newOs = newDevice === 'desktop' ? 'windows' : 'android';
      const newViewport = newDevice === 'desktop' ? '1920x1080' : '414x896';
      onConfigChange({
        ...config,
        device: newDevice,
        os: newOs,
        viewport: newViewport
      });
    } else {
      onConfigChange({
        ...config,
        [field]: value
      });
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {title && <div className="font-hanken font-semibold text-[16px]">{title}</div>}
      
      {/* Browser */}
      <div className="mb-4">
        <label className="font-hanken text-sm mb-2 block">Browser</label>
        <Radio.Group
          value={config.browser}
          onChange={(e) => handleConfigChange("browser", e.target.value)}
          className="font-hanken"
        >
          {['chrome', 'firefox', 'safari', 'edge'].map((browser) => (
            <Radio key={browser} value={browser} className="font-hanken text-sm capitalize">
              {browser}
            </Radio>
          ))}
        </Radio.Group>
      </div>

      {/* Device */}
      <div className="mb-4">
        <label className="font-hanken text-sm mb-2 block">Device</label>
        <Radio.Group
          value={config.device}
          onChange={(e) => handleConfigChange("device", e.target.value)}
          className="font-hanken"
        >
          {['desktop', 'mobile'].map((device) => (
            <Radio key={device} value={device} className="font-hanken text-sm capitalize">
              {device}
            </Radio>
          ))}
        </Radio.Group>
      </div>

      {/* OS */}
      <div className="mb-4">
        <label className="font-hanken text-sm mb-2 block">OS</label>
        <Radio.Group
          value={config.os}
          onChange={(e) => handleConfigChange("os", e.target.value)}
          className="font-hanken"
        >
          {config.device === 'desktop' 
            ? ['windows', 'macos'].map((os) => (
                <Radio key={os} value={os} className="font-hanken text-sm capitalize">
                  {os}
                </Radio>
              ))
            : ['android', 'ios'].map((os) => (
                <Radio key={os} value={os} className="font-hanken text-sm">
                  {os === 'ios' ? 'iOS' : 'Android'}
                </Radio>
              ))
          }
        </Radio.Group>
      </div>

      {/* Viewport */}
      <div className="mb-4">
        <label className="font-hanken text-sm mb-2 block">Viewport</label>
        <Select
          value={config.viewport}
          onChange={(value) => handleConfigChange("viewport", value)}
          className="w-full font-hanken"
          size="middle"
        >
          {config.device === 'desktop' ? (
            <>
              <Select.Option value="1920x1080">1920 x 1080 - Standard Full HD (Desktop)</Select.Option>
              <Select.Option value="1366x768">1366 x 768 - Widescreen Laptop</Select.Option>
              <Select.Option value="1536x864">1536 x 864 - High-Resolution Laptop</Select.Option>
              <Select.Option value="1280x720">1280 x 720 - Small Desktop Monitor</Select.Option>
              <Select.Option value="1024x768">1024 x 768 - Minimum Supported Desktop Viewport</Select.Option>
            </>
          ) : (
            <>
              <Select.Option value="414x896">414 x 896 - iPhone XR, iPhone 11</Select.Option>
              <Select.Option value="390x844">390 x 844 - iPhone 12, iPhone 13, iPhone 14</Select.Option>
              <Select.Option value="375x812">375 x 812 - iPhone X, iPhone XS</Select.Option>
              <Select.Option value="360x800">360 x 800 - Standard Android Phone</Select.Option>
              <Select.Option value="320x568">320 x 568 - iPhone SE, Small Devices</Select.Option>
            </>
          )}
        </Select>
      </div>

      {/* On test failure, do */}
      {config.onTestFailure !== undefined && (
        <div className="mb-4">
          <label className="font-hanken text-sm mb-2 block">On test failure, do</label>
          <Select
            value={config.onTestFailure}
            onChange={(value) => handleConfigChange("onTestFailure", value)}
            className="w-full font-hanken"
            size="middle"
          >
            <Select.Option value="nothing">Nothing</Select.Option>
            <Select.Option value="triage_only">Triage only</Select.Option>
            <Select.Option value="offer_heal_suggestions">
              Offer heal suggestions{' '}
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">
                Beta
              </span>
            </Select.Option>
          </Select>
        </div>
      )}
    </div>
  );
};

export default Config; 