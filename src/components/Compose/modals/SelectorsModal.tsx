'use client'
import React from 'react';
import { Modal, Button, Radio } from 'antd';

interface Selector {
  display: string;
  script: string;
  selector: string;
  method: string;
}

interface SelectorsModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  onSaveToStore: () => void;
  selectors: Selector[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const SelectorsModal: React.FC<SelectorsModalProps> = ({
  open,
  onCancel,
  onSave,
  onSaveToStore,
  selectors,
  selectedIndex,
  onSelect,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Select a Selector"
      centered
      width={600}
      footer={[
        <Button key="save" type='primary' onClick={onSaveToStore} data-testid="compose-selectors-modal-save-to-store-button">
          Save to Store
        </Button>,
        <Button key="update-selector" type="primary" onClick={onSave} data-testid="compose-selectors-modal-save-button">
          Update Selector
        </Button>
      ]}
      data-testid="compose-selectors-modal"
    >
      <div className="mb-4 text-sm text-gray-600">
        Select a selector using the radio buttons below, then click either Save to Store to save the element to the store or Update Selector to only update the selector.
      </div>
      <div className="space-y-3">
        {selectors.length > 0 ? (
          selectors.map((selector, index) => (
            <div
              key={index}
              className="text-black w-full text-sm break-words flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-2 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Radio
                      checked={selectedIndex === index}
                      onChange={() => onSelect(index)}
                    />
                    <div className='font-hanken'>
                      {selector.display}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 ml-6">
                <div className="bg-[#4542CC0D] p-2 rounded text-xs font-mono overflow-x-auto">
                  <div className="text-gray-700">
                    {selector.method === 'page.getByRole'
                      ? `${selector.method}(${selector.selector})`
                      : `${selector.method}('${selector.selector}')`
                    }
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No alternate selectors
          </div>
        )}
      </div>
    </Modal>
  );
};
