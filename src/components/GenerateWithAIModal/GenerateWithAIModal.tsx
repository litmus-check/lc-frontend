"use client";

import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message, Checkbox, Select } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  generatePromptsAPI,
  bulkCreateTrackersAPI,
  getLLMModelsAPI,
  getLocationsByProjectAPI,
  getPersonasByProjectAPI,
  type GeneratedPrompt,
  type LLMModelsResponse,
  type LocationsByProjectResponse,
  type PersonasByProjectResponse,
} from "@/lib/apis/geology/projects";
import { extractErrorMessage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export interface EditablePromptItem {
  prompt: string;
  tag: string;
  llm_models: string[];
  location_ids?: string[];
  persona_ids?: string[];
}

export interface GenerateWithAIModalProps {
  open: boolean;
  onClose: () => void;
  onAfterOpenChange?: (open: boolean) => void;
  projectId: string | null;
  getToken: () => Promise<string | null>;
  onSuccess: () => void;
}

export default function GenerateWithAIModal({
  open,
  onClose,
  onAfterOpenChange,
  projectId,
  getToken,
  onSuccess,
}: GenerateWithAIModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [keywordsText, setKeywordsText] = useState("");
  const [maxPrompts, setMaxPrompts] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<GeneratedPrompt[] | null>(null);
  const [editableList, setEditableList] = useState<EditablePromptItem[]>([]);
  const [isCreatingTrackers, setIsCreatingTrackers] = useState(false);

  const getLLMModels = useQuery<LLMModelsResponse, Error>({
    queryKey: ["getLLMModelsAPI", open],
    queryFn: async () => {
      const token = await getToken();
      const response = await getLLMModelsAPI(token ?? "");
      return response.data;
    },
    enabled: open,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const getLocations = useQuery<LocationsByProjectResponse, Error>({
    queryKey: ["getLocationsByProjectAPI", projectId, open],
    queryFn: async () => {
      const token = await getToken();
      if (!projectId) throw new Error("Project ID required");
      const response = await getLocationsByProjectAPI(token ?? "", projectId);
      return response.data;
    },
    enabled: !!open && !!projectId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const getPersonas = useQuery<PersonasByProjectResponse, Error>({
    queryKey: ["getPersonasByProjectAPI", projectId, open],
    queryFn: async () => {
      const token = await getToken();
      if (!projectId) throw new Error("Project ID required");
      const response = await getPersonasByProjectAPI(token ?? "", projectId);
      return response.data;
    },
    enabled: !!open && !!projectId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    const models = getLLMModels.data?.models;
    if (!generatedList?.length || !models) return;
    const entries = Object.entries(models);
    const chatgptWebKey = entries.find(([k, label]) => /chatgpt\s*web/i.test(String(label)))?.[0];
    const googleOverviewKey = entries.find(([k, label]) => /google\s*ai\s*overview/i.test(String(label)))?.[0];
    const defaultModels =
      [chatgptWebKey, googleOverviewKey].filter(Boolean).length > 0
        ? ([chatgptWebKey, googleOverviewKey].filter(Boolean) as string[])
        : Object.keys(models);
    setEditableList(
      generatedList.map((p) => ({
        prompt: p.prompt,
        tag: p.tag,
        llm_models: defaultModels,
        location_ids: [],
        persona_ids: [],
      }))
    );
  }, [generatedList, getLLMModels.data?.models]);

  const handleGenerate = async () => {
    if (!projectId) {
      messageApi.error("Project ID is missing");
      return;
    }
    setIsGenerating(true);
    try {
      const authToken = await getToken();
      if (!authToken) {
        messageApi.error("Authentication required");
        setIsGenerating(false);
        return;
      }
      const validKeywords = keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      if (validKeywords.length === 0) {
        messageApi.error("Please provide at least one keyword");
        setIsGenerating(false);
        return;
      }
      const maxPromptsNum = parseInt(maxPrompts, 10);
      if (isNaN(maxPromptsNum) || maxPromptsNum < 1) {
        messageApi.error("Max prompts must be a number greater than or equal to 1");
        setIsGenerating(false);
        return;
      }
      const response = await generatePromptsAPI(authToken, {
        keywords: validKeywords,
        max_prompts: maxPromptsNum,
      });
      if (response.status >= 200 && response.status < 300) {
        messageApi.success("Prompts generated successfully");
        setGeneratedList(response.data.prompts);
      } else {
        const errorMsg = extractErrorMessage(response);
        messageApi.error(errorMsg || "Failed to generate prompts");
      }
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error);
      messageApi.error(errorMsg || "An error occurred while generating prompts");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTrackers = async () => {
    if (!projectId || !editableList.length) return;
    setIsCreatingTrackers(true);
    try {
      const authToken = await getToken();
      if (!authToken) {
        messageApi.error("Authentication required");
        setIsCreatingTrackers(false);
        return;
      }
      const trackers = editableList.map((item) => ({
        prompt: item.prompt,
        llm_models: item.llm_models,
        tag_names: item.tag
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        location_ids: item.location_ids && item.location_ids.length > 0 ? item.location_ids : undefined,
        persona_ids: item.persona_ids && item.persona_ids.length > 0 ? item.persona_ids : undefined,
      }));
      const response = await bulkCreateTrackersAPI(authToken, projectId, { trackers });
      if (response.status >= 200 && response.status < 300) {
        messageApi.success(`${response.data.created_count} trackers created successfully`);
        handleClose();
        onSuccess();
      } else {
        const errorMsg = extractErrorMessage(response);
        messageApi.error(errorMsg || "Failed to create trackers");
      }
    } catch (error: unknown) {
      const errorMsg = extractErrorMessage(error);
      messageApi.error(errorMsg || "An error occurred while creating trackers");
    } finally {
      setIsCreatingTrackers(false);
    }
  };

  const handleClose = () => {
    onClose();
    setGeneratedList(null);
    setEditableList([]);
    setKeywordsText("");
    setMaxPrompts("5");
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Generate with AI"
        open={open}
        onCancel={handleClose}
        afterOpenChange={onAfterOpenChange}
        footer={null}
        width={720}
        destroyOnClose
        className="font-hanken"
      >
        {generatedList === null ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="font-hanken text-sm font-medium mb-2 block">Keywords</label>
              <Input.TextArea
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="Enter keywords separated by commas (e.g., AI-powered IDE, playwright testing)"
                rows={3}
                className="font-hanken"
              />
            </div>
            <div>
              <label className="font-hanken text-sm font-medium mb-2 block">Max prompts to generate</label>
              <Input
                value={maxPrompts}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) setMaxPrompts(v);
                }}
                placeholder="e.g. 5"
                className="font-hanken"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleClose} className="font-hanken">
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleGenerate}
                loading={isGenerating}
                className="font-hanken"
              >
                Generate
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="font-hanken text-sm text-gray-600">
              {editableList.length} prompt(s) generated. Edit and create trackers below.
            </p>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
              {editableList.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="absolute top-3 right-3 font-hanken"
                    onClick={() => setEditableList(editableList.filter((_, i) => i !== index))}
                    aria-label="Discard prompt"
                  />
                  <div>
                    <label className="font-hanken text-xs text-gray-500 mb-1 block">Prompt</label>
                    <Input.TextArea
                      value={item.prompt}
                      onChange={(e) => {
                        const next = [...editableList];
                        next[index] = { ...next[index], prompt: e.target.value };
                        setEditableList(next);
                      }}
                      placeholder="Enter prompt"
                      rows={2}
                      className="font-hanken"
                    />
                  </div>
                  <div>
                    <label className="font-hanken text-xs text-gray-500 mb-1 block">Tags (comma-separated)</label>
                    <Input
                      value={item.tag}
                      onChange={(e) => {
                        const next = [...editableList];
                        next[index] = { ...next[index], tag: e.target.value };
                        setEditableList(next);
                      }}
                      placeholder="e.g. onboarding, ai, ml"
                      className="font-hanken"
                    />
                  </div>
                  <div>
                    <label className="font-hanken text-xs text-gray-500 mb-1 block">Platforms</label>
                    <Checkbox.Group
                      value={item.llm_models}
                      onChange={(values) => {
                        const next = [...editableList];
                        next[index] = { ...next[index], llm_models: values as string[] };
                        setEditableList(next);
                      }}
                      className="flex flex-wrap gap-2"
                    >
                      {getLLMModels.data?.models &&
                        Object.entries(getLLMModels.data.models).map(([key, label]) => (
                          <Checkbox key={key} value={key} className="font-hanken">
                            {label}
                          </Checkbox>
                        ))}
                    </Checkbox.Group>
                  </div>
                  {getLocations.data?.locations && getLocations.data.locations.length > 0 && (
                    <div>
                      <label className="font-hanken text-xs text-gray-500 mb-1 block">Locations</label>
                      <Select
                        mode="multiple"
                        placeholder="Select locations"
                        value={item.location_ids || []}
                        onChange={(values) => {
                          const next = [...editableList];
                          next[index] = { ...next[index], location_ids: values };
                          setEditableList(next);
                        }}
                        className="w-full font-hanken"
                        options={getLocations.data.locations.map((loc) => ({
                          value: loc.id,
                          label: `${loc.city}${loc.region ? `, ${loc.region}` : ""}, ${loc.country}`,
                        }))}
                      />
                    </div>
                  )}
                  {getPersonas.data?.personas && getPersonas.data.personas.length > 0 && (
                    <div>
                      <label className="font-hanken text-xs text-gray-500 mb-1 block">Personas</label>
                      <Select
                        mode="multiple"
                        placeholder="Select personas"
                        value={item.persona_ids || []}
                        onChange={(values) => {
                          const next = [...editableList];
                          next[index] = { ...next[index], persona_ids: values };
                          setEditableList(next);
                        }}
                        className="w-full font-hanken"
                        options={getPersonas.data.personas.map((persona) => ({
                          value: persona.id,
                          label: persona.name,
                        }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setGeneratedList(null);
                  setEditableList([]);
                }}
                className="font-hanken"
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleCreateTrackers}
                loading={isCreatingTrackers}
                disabled={!editableList.length}
                className="font-hanken"
              >
                Create trackers
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
