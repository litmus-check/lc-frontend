"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Checkbox, Button, message, Select, Skeleton } from "antd";
import { 
  createTrackerAPI, 
  updateTrackerAPI, 
  getLocationsByProjectAPI,
  getPersonasByProjectAPI,
  getTagsByProjectAPI,
  getLLMModelsAPI,
  type Tracker,
  type TrackerDetail,
  type LocationsByProjectResponse,
  type PersonasByProjectResponse,
  type TagsByProjectResponse,
  type LLMModelsResponse,
} from "@/lib/apis/geology/projects";
import { extractErrorMessage, formatLocation } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface CreateTrackerModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
  tracker?: Tracker | null; // For edit mode
}


export default function CreateTrackerModal({
  open,
  onClose,
  projectId,
  onSuccess,
  getToken,
  tracker,
}: CreateTrackerModalProps) {
  const [form] = Form.useForm();
  const [isCreating, setIsCreating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isEditMode = !!tracker;
  const [token, setToken] = useState<string | null>(null);
  const trackerType = Form.useWatch("type", form) ?? "automated";

  // Get token for API calls
  useEffect(() => {
    if (open && projectId) {
      getToken().then(setToken);
    }
  }, [open, projectId, getToken]);

  // Fetch locations for the project
  const getLocations = useQuery<LocationsByProjectResponse, Error>({
    queryKey: ["getLocationsByProjectAPI", projectId],
    queryFn: async () => {
      if (!token) throw new Error("Token not available");
      const response = await getLocationsByProjectAPI(token, projectId!);
      return response.data;
    },
    enabled: !!token && !!projectId && open,
    refetchOnWindowFocus: false,
  });

  // Fetch personas for the project
  const getPersonas = useQuery<PersonasByProjectResponse, Error>({
    queryKey: ["getPersonasByProjectAPI", projectId],
    queryFn: async () => {
      if (!token) throw new Error("Token not available");
      const response = await getPersonasByProjectAPI(token, projectId!);
      return response.data;
    },
    enabled: !!token && !!projectId && open,
    refetchOnWindowFocus: false,
  });

  // Fetch tags for the project
  const getTags = useQuery<TagsByProjectResponse, Error>({
    queryKey: ["getTagsByProjectAPI", projectId],
    queryFn: async () => {
      if (!token) throw new Error("Token not available");
      const response = await getTagsByProjectAPI(token, projectId!);
      return response.data;
    },
    enabled: !!token && !!projectId && open,
    refetchOnWindowFocus: false,
  });

  // Fetch LLM models
  const getLLMModels = useQuery<LLMModelsResponse, Error>({
    queryKey: ["getLLMModelsAPI"],
    queryFn: async () => {
      if (!token) throw new Error("Token not available");
      const response = await getLLMModelsAPI(token);
      return response.data;
    },
    enabled: !!token && open,
    refetchOnWindowFocus: false,
  });

  // Parse llm_models from string to array if needed
  const parseLlmModels = (llmModels: string | string[]): string[] => {
    if (Array.isArray(llmModels)) {
      return llmModels;
    }
    try {
      return JSON.parse(llmModels);
    } catch {
      return [];
    }
  };

  // Set form values when tracker is provided (edit mode)
  useEffect(() => {
    if (open && tracker) {
      const llmModels = parseLlmModels(tracker.llm_models);
      const isManual = llmModels.length === 1 && llmModels[0] === "CHATGPT_UI";

      // Extract location IDs from tracker
      const locationIds = Array.isArray(tracker.locations)
        ? tracker.locations.map((loc: any) => loc.id || loc)
        : [];

      // Extract persona IDs from tracker
      const personaIds = Array.isArray(tracker.personas)
        ? tracker.personas.map((persona: any) => persona.id || persona)
        : [];

      // Extract tag names from tracker
      const tagNames = Array.isArray(tracker.tags)
        ? tracker.tags
        : typeof tracker.tags === "string"
          ? JSON.parse(tracker.tags || "[]")
          : [];

      form.setFieldsValue({
        prompt: tracker.prompt,
        type: isManual ? "manual" : "automated",
        llm_models: llmModels,
        location_ids: locationIds,
        persona_ids: personaIds,
        tag_names: tagNames,
      });
    } else if (open && !tracker && getLLMModels.data?.models) {
      // Reset form for create mode - wait for LLM models to load
      form.resetFields();
      // Default: only ChatGPT Web and Google AI Overview
      const DEFAULT_MODEL_LABELS = ["ChatGPT Web", "Google AI Overview"];
      const defaultModels = Object.entries(getLLMModels.data.models)
        .filter(([, label]) => DEFAULT_MODEL_LABELS.includes(String(label)))
        .map(([key]) => key);
      form.setFieldsValue({
        type: "automated",
        llm_models: defaultModels,
      });
    }
  }, [open, tracker, form, getLLMModels.data?.models]);

  const handleSubmit = async (values: {
    prompt: string;
    type: string;
    llm_models: string[];
    location_ids?: string[];
    persona_ids?: string[];
    tag_names?: string[];
  }) => {
    if (!projectId) {
      messageApi.error("Project ID is missing");
      return;
    }

    if (isEditMode && !tracker?.id) {
      messageApi.error("Tracker ID is missing");
      return;
    }

    setIsCreating(true);
    try {
      const authToken = await getToken();
      if (!authToken) {
        messageApi.error("Authentication required");
        setIsCreating(false);
        return;
      }

      let response;
      if (isEditMode) {
        response = await updateTrackerAPI(authToken, projectId, tracker!.id, values);
      } else {
        response = await createTrackerAPI(authToken, projectId, values);
      }

      if (response.status >= 200 && response.status < 300) {
        messageApi.success(isEditMode ? "Tracker updated successfully" : "Tracker created successfully");
        onClose();
        form.resetFields();
        onSuccess();
      } else {
        messageApi.error(isEditMode ? "Failed to update tracker" : "Failed to create tracker");
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error) || `An error occurred while ${isEditMode ? "updating" : "creating"} the tracker`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEditMode ? "Edit Tracker" : "Create Tracker"}
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
            label={<span className="font-hanken text-sm font-medium">Prompt</span>}
            name="prompt"
            rules={[{ required: true, message: "Prompt is required" }]}
          >
            <Input.TextArea
              placeholder="Enter your prompt"
              rows={4}
              className="font-hanken"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Type</span>}
            name="type"
            initialValue="automated"
          >
            <Select
              className="font-hanken"
              options={[
                { value: "automated", label: "Automated" },
                { value: "manual", label: "Manual" },
              ]}
              onChange={(value) => {
                if (value === "manual") {
                  form.setFieldsValue({ llm_models: ["CHATGPT_UI"] });
                } else if (getLLMModels.data?.models) {
                  form.setFieldsValue({
                    llm_models: Object.keys(getLLMModels.data.models),
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Platforms</span>}
            name="llm_models"
            rules={[{ required: true, message: "At least one platform must be selected" }]}
          >
            {getLLMModels.isLoading && trackerType !== "manual" ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Checkbox.Group
                className="flex flex-col gap-2"
                disabled={trackerType === "manual"}
              >
                {trackerType === "manual" ? (
                  <Checkbox value="CHATGPT_UI" className="font-hanken">
                    {getLLMModels.data?.models?.CHATGPT_UI ?? "ChatGPT UI"}
                  </Checkbox>
                ) : (
                  getLLMModels.data?.models &&
                  Object.entries(getLLMModels.data.models).map(([key, label]) => (
                    <Checkbox key={key} value={key} className="font-hanken">
                      {label}
                    </Checkbox>
                  ))
                )}
              </Checkbox.Group>
            )}
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Locations</span>}
            name="location_ids"
          >
            <Select
              mode="multiple"
              placeholder="Select locations"
              allowClear
              className="font-hanken"
              loading={getLocations.isLoading}
            >
              {getLocations.data?.locations?.map((location: any) => {
                const formatted = formatLocation(location);
                const displayText = typeof formatted === 'string' 
                  ? formatted 
                  : (Array.isArray(formatted) && formatted.length > 0 
                      ? formatted[0] 
                      : location.country || 'Unknown');
                return (
                <Select.Option key={location.id} value={location.id}>
                    {displayText}
                </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Personas</span>}
            name="persona_ids"
          >
            <Select
              mode="multiple"
              placeholder="Select personas"
              allowClear
              className="font-hanken"
              loading={getPersonas.isLoading}
            >
              {getPersonas.data?.personas?.map((persona: any) => (
                <Select.Option key={persona.id} value={persona.id}>
                  {persona.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-hanken text-sm font-medium">Tags</span>}
            name="tag_names"
           
          >
            <Select
              mode="tags"
              placeholder="Select or create tags"
              allowClear
              className="font-hanken"
              loading={getTags.isLoading}
              tokenSeparators={[',']}
            >
              {getTags.data?.tags?.map((tag: any) => (
                <Select.Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
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
                loading={isCreating}
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
