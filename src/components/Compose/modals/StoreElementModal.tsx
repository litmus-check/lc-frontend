'use client'
import React from 'react';
import { Modal, Button } from 'antd';

interface StoreElementModalProps {
  open: boolean;
  onCancel: () => void;
  onGoToStore: () => void;
  elementName: string;
}

export const StoreElementModal: React.FC<StoreElementModalProps> = ({
  open,
  onCancel,
  onGoToStore,
  elementName,
}) => {
  return (
    <Modal
      data-testid="store-element-modal"
      open={open}
      onCancel={onCancel}
      title="Store Element"
      centered
      width={400}
      footer={[
        <Button
          key="go-to-store"
          type="primary"
          onClick={onGoToStore}
        >
          Go to Store
        </Button>
      ]}
    >
      <div className="mb-4">
        <p>This element is being used from the store.</p>
        <p className="mt-2">Name: {elementName}</p>
      </div>
    </Modal>
  );
};
