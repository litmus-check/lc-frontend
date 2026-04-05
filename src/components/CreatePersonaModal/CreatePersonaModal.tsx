"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { createPersonaAPI, updatePersonaAPI, type Persona } from "@/lib/apis/geology/projects";
import { extractErrorMessage } from "@/lib/utils";

interface CreatePersonaModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
  persona?: Persona | null; // For edit mode
}

export default function CreatePersonaModal({
  open,
  onClose,
  projectId,
  onSuccess,
  getToken,
  persona,
}: CreatePersonaModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isEditMode = !!persona;

  // Set form values when persona is provided (edit mode)
  useEffect(() => {
    if (open && persona) {
      form.setFieldsValue({
        name: persona.name,
        description: persona.description,
      });
    } else if (open && !persona) {
      // Reset form for create mode
      form.resetFields();
    }
  }, [open, persona, form]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    if (!projectId) {
      messageApi.error("Project ID is missing");
      return;
    }

    if (isEditMode && !persona?.id) {
      messageApi.error("Persona ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      const authToken = await getToken();
      if (!authToken) {
        messageApi.error("Authentication required");
        setIsSubmitting(false);
        return;
      }

      let response;
      if (isEditMode) {
        response = await updatePersonaAPI(authToken, projectId, persona!.id, values);
      } else {
        response = await createPersonaAPI(authToken, projectId, values);
      }

      if (response.status >= 200 && response.status < 300) {
        messageApi.success(isEditMode ? "Persona updated successfully" : "Persona created successfully");
        onClose();
        form.resetFields();
        onSuccess();
      } else {
        messageApi.error(isEditMode ? "Failed to update persona" : "Failed to create persona");
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error) || `An error occurred while ${isEditMode ? "updating" : "creating"} the persona`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEditMode ? "Edit Persona" : "Create Persona"}
        open={open}
        onCancel={() => {
          onClose();
          form.resetFields();
        }}
        footer={null}
        className="font-hanken"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Name</span>}
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input
              placeholder="Enter persona name"
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Description</span>}
            name="description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea
              placeholder="Enter persona description"
              rows={4}
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  onClose();
                  form.resetFields();
                }}
                className="font-hanken"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="font-hanken"
              >
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

