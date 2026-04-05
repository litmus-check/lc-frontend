import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';

interface CreateStoreModalProps {
  open: boolean;
  onClose: () => void;
  onCreateStore: (data: { store_name: string; store_description?: string }) => Promise<void>;
  loading?: boolean;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ 
  open, 
  onClose, 
  onCreateStore, 
  loading = false 
}) => {
  const [newStoreForm, setNewStoreForm] = useState({
    store_name: "",
    store_description: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    store_name: "",
  });

  // Validation function
  const validateStoreName = (value: string): string => {
    if (!value) return 'Store name is required';
    if (!/^[a-zA-Z]/.test(value)) return 'Store name must start with a letter';
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) return 'Store name can only contain letters, numbers, underscore (_) and hyphen (-)';
    return '';
  };

  const validateForm = () => {
    const storeNameError = validateStoreName(newStoreForm.store_name);
    const errors = {
      store_name: storeNameError,
    };

    setValidationErrors(errors);
    return !storeNameError;
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setNewStoreForm({
        store_name: "",
        store_description: "",
      });
      setValidationErrors({
        store_name: "",
      });
    }
  }, [open]);

  const handleCreateStore = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onCreateStore({
        store_name: newStoreForm.store_name,
        store_description: newStoreForm.store_description || undefined,
      });
      
      // Close the modal
      onClose();
      
      // Reset the form
      setNewStoreForm({
        store_name: "",
        store_description: "",
      });
      setValidationErrors({
        store_name: "",
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    onClose();
    setNewStoreForm({
      store_name: "",
      store_description: "",
    });
    setValidationErrors({
      store_name: "",
    });
  };

  return (
    <Modal
      title="Create New Store"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
        >
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          onClick={handleCreateStore}
          loading={loading}
        >
          Create Store
        </Button>,
      ]}
      width={500}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Store Name <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <Input
            value={newStoreForm.store_name}
            onChange={(e) => {
              const newValue = e.target.value;
              setNewStoreForm({ ...newStoreForm, store_name: newValue });
              setValidationErrors({ ...validationErrors, store_name: validateStoreName(newValue) });
            }}
            placeholder="Enter store name (letters, numbers, _ and -)"
            status={validationErrors.store_name ? 'error' : undefined}
          />
          {validationErrors.store_name && (
            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
              {validationErrors.store_name}
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Store Description (Optional)
          </label>
          <Input.TextArea
            value={newStoreForm.store_description}
            onChange={(e) => setNewStoreForm({ ...newStoreForm, store_description: e.target.value })}
            placeholder="Enter store description"
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
};
