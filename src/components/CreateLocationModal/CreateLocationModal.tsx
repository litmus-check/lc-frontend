"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { createLocationAPI, updateLocationAPI, type Location } from "@/lib/apis/geology/projects";
import { extractErrorMessage } from "@/lib/utils";

interface CreateLocationModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
  location?: Location | null; // For edit mode
}

export default function CreateLocationModal({
  open,
  onClose,
  projectId,
  onSuccess,
  getToken,
  location,
}: CreateLocationModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isEditMode = !!location;

  // Set form values when location is provided (edit mode)
  useEffect(() => {
    if (open && location) {
      form.setFieldsValue({
        city: location.city,
        region: location.region,
        country: location.country,
      });
    } else if (open && !location) {
      // Reset form for create mode
      form.resetFields();
    }
  }, [open, location, form]);

  const handleSubmit = async (values: {
    city: string | null;
    region: string | null;
    country: string;
  }) => {
    if (!projectId) {
      messageApi.error("Project ID is missing");
      return;
    }

    if (isEditMode && !location?.id) {
      messageApi.error("Location ID is missing");
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

      // Convert empty string to null for city and region
      const payload: { city: string | null; region: string | null; country: string } = {
        city: values.city?.trim() || null,
        region: values.region?.trim() || null,
        country: values.country,
      };

      let response;
      if (isEditMode) {
        response = await updateLocationAPI(authToken, projectId, location!.id, payload);
      } else {
        response = await createLocationAPI(authToken, projectId, payload);
      }

      if (response.status >= 200 && response.status < 300) {
        messageApi.success(isEditMode ? "Location updated successfully" : "Location created successfully");
        onClose();
        form.resetFields();
        onSuccess();
      } else {
        messageApi.error(isEditMode ? "Failed to update location" : "Failed to create location");
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error) || `An error occurred while ${isEditMode ? "updating" : "creating"} the location`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEditMode ? "Edit Location" : "Create Location"}
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
            label={<span className="font-hanken text-sm font-medium">City</span>}
            name="city"
          >
            <Input
              placeholder="Enter city (optional)"
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Region</span>}
            name="region"
          >
            <Input
              placeholder="Enter region (optional)"
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Country</span>}
            name="country"
            rules={[
              { required: true, message: "Country is required" },
              { len: 2, message: "Country must be a 2-character ISO 3166-1 alpha-2 code (e.g., US, IN, GB)" }
            ]}
          >
            <Input
              placeholder="Enter 2-character ISO code (e.g., US, IN, GB)"
              className="font-hanken"
              maxLength={2}
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

