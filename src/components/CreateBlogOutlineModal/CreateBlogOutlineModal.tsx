"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { createBlogOutlineAPI } from "@/lib/apis/geology/projects";
import { extractErrorMessage } from "@/lib/utils";

interface CreateBlogOutlineModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
}

export default function CreateBlogOutlineModal({
  open,
  onClose,
  projectId,
  onSuccess,
  getToken,
}: CreateBlogOutlineModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values: {
    topics_text: string;
    brand_url: string;
    description: string;
  }) => {
    if (!projectId) {
      messageApi.error("Project ID is missing");
      return;
    }

    // Parse topics: each line = one topic; trim and filter empty
    const topics = (values.topics_text || "")
      .split(/\n/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (topics.length === 0) {
      messageApi.error("Please enter at least one topic (one per line)");
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

      const response = await createBlogOutlineAPI(authToken, projectId, {
        topics,
        brand_url: values.brand_url,
        description: values.description || "",
      });

      if (response.status >= 200 && response.status < 300) {
        messageApi.success("Blog outline created successfully");
        onClose();
        form.resetFields();
        onSuccess();
      } else {
        messageApi.error("Failed to create blog outline");
      }
    } catch (error: any) {
      messageApi.error(
        extractErrorMessage(error) || "An error occurred while creating the blog outline"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Create Blog Outline"
        open={open}
        onCancel={() => {
          onClose();
          form.resetFields();
        }}
        footer={null}
        className="font-hanken"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Topics</span>}
            name="topics_text"
            rules={[{ required: true, message: "Please enter at least one topic (one per line)" }]}
            extra="Enter one topic per line."
          >
            <Input.TextArea
              placeholder={"e.g.\nBenefits of working out with foam sole shoes\nAnother topic"}
              className="font-hanken"
              rows={5}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Brand URL</span>}
            name="brand_url"
            rules={[
              { required: true, message: "Brand URL is required" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input
              placeholder="Enter brand URL (e.g., https://example.com)"
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Description</span>}
            name="description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea
              placeholder="Enter brand or project description"
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
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
