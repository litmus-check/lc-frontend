"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Input, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTestAPI } from "@/lib/apis/testAI/test";
import { extractErrorMessage } from "@/lib/utils";
import { actions } from "@/lib/constants/actions";
import TestSelect from "@/components/TestSelect/TestSelect";
import React from "react";

interface SegmentForm {
  segment_name: string;
  test_id: string;
  start_instruction_id: string;
  end_instruction_id: string;
}

interface SegmentModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  initialForm?: SegmentForm;
  suiteId: string;
  onSubmit: (form: SegmentForm) => Promise<void>;
  loading?: boolean;
}

export default function SegmentModal({
  open,
  onClose,
  mode,
  initialForm,
  suiteId,
  onSubmit,
  loading = false,
}: SegmentModalProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [form, setForm] = useState<SegmentForm>({
    segment_name: "",
    test_id: "",
    start_instruction_id: "",
    end_instruction_id: "",
  });
  const [testInstructions, setTestInstructions] = useState<any[]>([]);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [selectedStartInstruction, setSelectedStartInstruction] = useState<any>(null);
  const [selectedEndInstruction, setSelectedEndInstruction] = useState<any>(null);

  // Initialize form when modal opens or initialForm changes
  useEffect(() => {
    if (open) {
      if (mode === "update" && initialForm) {
        setForm(initialForm);
        if (initialForm.test_id) {
          loadTestInstructions(initialForm.test_id);
        }
      } else {
        setForm({
          segment_name: "",
          test_id: "",
          start_instruction_id: "",
          end_instruction_id: "",
        });
      }
      setTestInstructions([]);
      setSelectedStartInstruction(null);
      setSelectedEndInstruction(null);
    }
  }, [open, mode, initialForm]);

  // Pre-select instructions when testInstructions are loaded and we have initialForm (update mode)
  useEffect(() => {
    if (mode === "update" && initialForm && testInstructions.length > 0) {
      const startInstruction = testInstructions.find(
        (inst) => inst.id === initialForm.start_instruction_id
      );
      const endInstruction = testInstructions.find(
        (inst) => inst.id === initialForm.end_instruction_id
      );
      if (startInstruction) {
        setSelectedStartInstruction(startInstruction);
      }
      if (endInstruction) {
        setSelectedEndInstruction(endInstruction);
      }
    }
  }, [testInstructions, mode, initialForm]);

  const formatInstructionValue = (instruction: any): React.ReactNode => {
    if (typeof instruction === "string") {
      return instruction;
    }

    const action = instruction.action || "";
    const args = instruction.args || [];
    const element_id = instruction.element_id || "";
    const prompt = instruction.prompt || "";

    // Get the display structure from actions
    const actionConfig = actions[action];
    if (!actionConfig?.displayStructure) {
      // Fallback to old format if no displayStructure
      if (action === "run_script") {
        const description = args.find(
          (arg: { key: string; value: string }) => arg.key === "description"
        )?.value || "";
        return `${action}: ${description}`;
      }
      const argsStr = args
        .map((arg: { key: string; value: string }) => arg.value)
        .join(", ");
      // Use element_id if it exists, otherwise use prompt
      const displayValue = element_id || prompt;
      return `${action}${argsStr ? ": " + argsStr : ""}${displayValue ? ": " + displayValue : ""}`;
    }

    // Create React elements with Tailwind classes
    const parts = actionConfig.displayStructure.split(/(\[[^\]]+\])/);
    return parts.map((part, index) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        const key = part.slice(1, -1);
        if (key === "prompt") {
          // Use element_id if it exists (element_id takes precedence over prompt)
          const displayValue = element_id || prompt;
          return (
            <span key={index} className="font-semibold text-[#4542CC]">
              {displayValue}
            </span>
          );
        }
        const arg = args.find((a: { key: string; value: string }) => a.key === key);
        if (arg) {
          return (
            <span key={index} className="font-semibold text-[#4542CC]">
              {arg.value}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const loadTestInstructions = async (testId: string) => {
    try {
      setInstructionsLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getTestAPI(token, testId);
      if (response.status === 200) {
        setTestInstructions(response.data.instructions || []);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setInstructionsLoading(false);
    }
  };

  const handleTestSelection = (testId: string) => {
    setForm({ ...form, test_id: testId });
    setTestInstructions([]);
    setSelectedStartInstruction(null);
    setSelectedEndInstruction(null);
    setForm((prev) => ({ ...prev, start_instruction_id: "", end_instruction_id: "" }));
    if (testId) {
      loadTestInstructions(testId);
    }
  };

  const handleInstructionSelection = (instruction: any, type: "start" | "end") => {
    if (type === "start") {
      setSelectedStartInstruction(instruction);
      setForm({ ...form, start_instruction_id: instruction.id });
    } else {
      setSelectedEndInstruction(instruction);
      setForm({ ...form, end_instruction_id: instruction.id });
    }
  };

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  const handleCancel = () => {
    setForm({
      segment_name: "",
      test_id: "",
      start_instruction_id: "",
      end_instruction_id: "",
    });
    setTestInstructions([]);
    setSelectedStartInstruction(null);
    setSelectedEndInstruction(null);
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={mode === "create" ? "Create Segment" : "Update Segment"}
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
            onClick={handleCancel}
          >
            Cancel
          </Button>,
          <Button
            key={mode}
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            className="font-hanken text-[14px] border-2 bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
          >
            {mode === "create" ? "Create Segment" : "Update Segment"}
          </Button>,
        ]}
        width={800}
      >
        <div className="space-y-6">
          {/* Segment Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment Name
            </label>
            <Input
              value={form.segment_name}
              onChange={(e) => setForm({ ...form, segment_name: e.target.value })}
              placeholder="Enter segment name"
              className="font-hanken"
            />
          </div>

          {/* Test Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Test
            </label>
            <TestSelect
              value={form.test_id}
              onChange={handleTestSelection}
              suiteId={suiteId}
              placeholder="Choose a test"
              className="w-full"
            />
          </div>

          {/* Instructions Selection */}
          {testInstructions.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Start Instruction
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {testInstructions.map((instruction, index) => (
                    <div
                      key={instruction.id || index}
                      className={`p-3 cursor-pointer border-b border-gray-100 ${
                        (mode === "create"
                          ? selectedStartInstruction?.id === instruction.id
                          : form.start_instruction_id === instruction.id)
                          ? "bg-purple-100 border-2 border-purple-100"
                          : "hover:bg-purple-50"
                      }`}
                      onClick={() => handleInstructionSelection(instruction, "start")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                        <div className="flex-1 text-sm">{formatInstructionValue(instruction)}</div>
                        {(mode === "create"
                          ? selectedStartInstruction?.id === instruction.id
                          : form.start_instruction_id === instruction.id) && (
                          <span className="text-purple-600 text-xs">✓ Selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select End Instruction
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {testInstructions.map((instruction, index) => (
                    <div
                      key={instruction.id || index}
                      className={`p-3 cursor-pointer border-b border-gray-100 ${
                        (mode === "create"
                          ? selectedEndInstruction?.id === instruction.id
                          : form.end_instruction_id === instruction.id)
                          ? "bg-purple-100 border-2 border-purple-100"
                          : "hover:bg-purple-50"
                      }`}
                      onClick={() => handleInstructionSelection(instruction, "end")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                        <div className="flex-1 text-sm">{formatInstructionValue(instruction)}</div>
                        {(mode === "create"
                          ? selectedEndInstruction?.id === instruction.id
                          : form.end_instruction_id === instruction.id) && (
                          <span className="text-purple-600 text-xs">✓ Selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {instructionsLoading && (
            <div className="text-center py-4">
              <Spin size="small" />
              <span className="ml-2 text-sm text-gray-500">Loading instructions...</span>
            </div>
          )}

          {form.test_id && testInstructions.length === 0 && !instructionsLoading && (
            <div className="text-center py-4 text-gray-500">
              <p>No instructions found for this test.</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

