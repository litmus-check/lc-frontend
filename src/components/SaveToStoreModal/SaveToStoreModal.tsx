import React, { useState, useEffect } from 'react';
import { Modal, Radio, Input, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateStoreModal } from '../CreateStoreModal/CreateStoreModal';
const { TextArea } = Input;

interface SaveToStoreModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    type: 'new' | 'update';
    name: string;
    description: string;
    store: string;
    elementToUpdate?: string;
  }) => void;
  stores?: { id: string; name: string }[];
  elements?: { id: string; name: string }[];
  onLoadStores?: () => void;
  storesLoading?: boolean;
  loading?: boolean;
  createStoreLoading?: boolean;
  onCreateStore?: (data: { store_name: string; store_description?: string }) => Promise<void>;
}

export const SaveToStoreModal: React.FC<SaveToStoreModalProps> = ({ open, onClose, onSave, stores = [], elements = [], onLoadStores, storesLoading = false, loading = false, createStoreLoading = false, onCreateStore }) => { 
  const [type, setType] = useState<'new' | 'update'>('new');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);

  const validateName = (value: string): string => {
    if (!value) return 'Name is required';
    if (!/^[a-zA-Z]/.test(value)) return 'Name must start with a letter';
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) return 'Name can only contain letters, numbers, underscore (_) and hyphen (-)';
    return '';
  };

  const resetForm = () => {
    setType('new');
    setName('');
    setNameError('');
    setDescription('');
    setSelectedStore('');
    setSelectedElement('');
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSave = () => {
    if (type === 'new') {
      const error = validateName(name);
      setNameError(error);
      if (error) return;
    }

    onSave({
      type,
      name,
      description,
      store: selectedStore,
      ...(type === 'update' && { elementToUpdate: selectedElement })
    });
  };

  const handleCreateStoreSuccess = async (data: { store_name: string; store_description?: string }) => {
    if (!onCreateStore) return;

    try {
      await onCreateStore(data);
      
      // Close the create store modal
      setShowCreateStoreModal(false);
      
      // Set the newly created store as selected
      setSelectedStore(data.store_name);
    } catch (error) {
      // Error handling is done in the parent component
      throw error;
    }
  };

  return (
    <Modal
      title="Save to Store"
      data-testid="save-to-store-modal"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading}>
          Save
        </Button>
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Radio.Group value={type} onChange={e => setType(e.target.value)}>
          <Radio value="new">New</Radio>
          <Radio value="update">Update existing</Radio>
        </Radio.Group>

        {type === 'update' ? (
          <div>
            <div style={{ marginBottom: '8px' }}>Select element to update</div>
            <Select
              style={{ width: '100%' }}
              value={selectedElement}
              onChange={setSelectedElement}
              placeholder="Select element to update"
            >
              {elements.map((element) => (
                <Select.Option key={element.id} value={element.id}>
                  {element.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        ) : (
          <>
            <div>
              <div style={{ marginBottom: '8px' }}>Unique name</div>
              <Input
                value={name}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setName(newValue);
                  setNameError(validateName(newValue));
                }}
                placeholder="Enter a unique name (letters, numbers, _ and -)"
                status={nameError ? 'error' : undefined}
              />
              {nameError && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                  {nameError}
                </div>
              )}
            </div>

            <div>
              <div style={{ marginBottom: '8px' }}>Description</div>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description"
                rows={4}
              />
            </div>

            <div>
              <div style={{ marginBottom: '8px' }}>Store</div>
              <Select
                style={{ width: '100%' }}
                value={selectedStore}
                onChange={setSelectedStore}
                placeholder="Select a store"
                loading={storesLoading}
                onClick={onLoadStores}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px' }}>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => setShowCreateStoreModal(true)}
                        style={{ width: '100%', textAlign: 'left', color: '#AE00FF' }}
                        icon={<PlusOutlined />}
                      >
                        Create New Store
                      </Button>
                    </div>
                  </>
                )}
              >
                {stores.map((store) => (
                  <Select.Option key={store.id} value={store.id}>
                    {store.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Create Store Modal */}
      <CreateStoreModal
        open={showCreateStoreModal}
        onClose={() => setShowCreateStoreModal(false)}
        onCreateStore={handleCreateStoreSuccess}
        loading={createStoreLoading}
      />
    </Modal>
  );
}