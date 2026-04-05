"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";
import { createBrandAPI, updateBrandAPI, type Brand } from "@/lib/apis/geology/projects";
import { extractErrorMessage } from "@/lib/utils";

interface CreateBrandModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
  brand?: Brand | null; // For edit mode
}

export default function CreateBrandModal({
  open,
  onClose,
  projectId,
  onSuccess,
  getToken,
  brand,
}: CreateBrandModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isEditMode = !!brand;

  // Set form values when brand is provided (edit mode)
  useEffect(() => {
    if (open && brand) {
      form.setFieldsValue({
        brand_name: brand.brand_name,
        brand_url: brand.brand_url,
        brand_type: brand.brand_type,
        brand_description: brand.brand_description,
      });
    } else if (open && !brand) {
      // Reset form for create mode
      form.resetFields();
    }
  }, [open, brand, form]);

  const handleSubmit = async (values: {
    brand_name: string;
    brand_url: string;
    brand_type: "own" | "competition";
    brand_description?: string;
  }) => {
    if (!projectId) {
      messageApi.error("Project ID is missing");
      return;
    }

    if (isEditMode && !brand?.id) {
      messageApi.error("Brand ID is missing");
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
        response = await updateBrandAPI(authToken, projectId, brand!.id, values);
      } else {
        response = await createBrandAPI(authToken, projectId, values);
      }

      if (response.status >= 200 && response.status < 300) {
        messageApi.success(isEditMode ? "Brand updated successfully" : "Brand created successfully");
        onClose();
        form.resetFields();
        onSuccess();
      } else {
        messageApi.error(isEditMode ? "Failed to update brand" : "Failed to create brand");
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error) || `An error occurred while ${isEditMode ? "updating" : "creating"} the brand`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEditMode ? "Edit Brand" : "Create Brand"}
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
            label={<span className="font-hanken text-sm font-medium">Brand Name</span>}
            name="brand_name"
            rules={[{ required: true, message: "Brand name is required" }]}
          >
            <Input
              placeholder="Enter brand name"
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Brand URL</span>}
            name="brand_url"
            rules={[
              { required: true, message: "Brand URL is required" },
              { type: "url", message: "Please enter a valid URL" }
            ]}
          >
            <Input
              placeholder="Enter brand URL (e.g., https://example.com)"
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Brand Type</span>}
            name="brand_type"
            rules={[{ required: true, message: "Brand type is required" }]}
          >
            <Select
              placeholder="Select brand type"
              className="font-hanken"
            >
              <Select.Option value="own">Own</Select.Option>
              <Select.Option value="competition">Competition</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Brand Description</span>}
            name="brand_description"
          >
            <Input.TextArea
              placeholder="Enter brand description"
              className="font-hanken"
              rows={4}
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

