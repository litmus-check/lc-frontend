'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { getTestAPI } from '@/lib/apis/testAI/test';
import { getSegmentAPI } from '@/lib/apis/testAI/segments';
import { actions } from '@/lib/constants/actions';
import { extractErrorMessage } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { message } from 'antd';

interface InstructionObj {
  id: string;
  value: string | {
    type: string;
    action: string;
    args: Array<{
      key: string;
      value: string | boolean;
    }>;
    prompt?: string;
    element_id?: string;
  };
  playwright_actions?: string[];
  selectors?: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>;
  status?: 'pending' | 'running' | 'success' | 'failed';
}

interface SegmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  segmentId: string | null;
  suiteId?: string | null;
  getToken: (options: { template: string }) => Promise<string | null>;
}

const generateInstructionId = (instruction: any): string => {
  // If instruction already has an id, use it
  if (instruction && instruction.id) {
    return instruction.id;
  }
  // Otherwise generate a new UUID
  return uuidv4();
};

// Format instruction value for display
const formatInstructionValue = (value: InstructionObj['value'], instruction?: InstructionObj): React.ReactNode => {
  if (typeof value === 'string') {
    return value;
  }

  const action = value.action || '';
  const args = value.args || [];
  const prompt = value.prompt || '';
  const element_id = value.element_id || '';

  // Get the display structure from actions
  const actionConfig = actions[action];
  if (!actionConfig?.displayStructure) {
    // Fallback to old format if no displayStructure
    if (action === 'run_script') {
      const description = args.find(arg => arg.key === 'description')?.value || '';
      return `${action}: ${description}`;
    }
    if (action === 'ai_script') {
      const description = args.find(arg => arg.key === 'description')?.value || '';
      return `Script (AI generated): ${description}`;
    }
    const argsStr = args.map(arg => arg.value).join(', ');
    const displayValue = element_id || prompt;
    return `${action}${argsStr ? ': ' + argsStr : ''}${displayValue ? ': ' + displayValue : ''}`;
  }

  // Create React elements with Tailwind classes
  const parts = actionConfig.displayStructure.split(/(\[[^\]]+\])/);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const key = part.slice(1, -1);
      if (key === 'prompt') {
        // Use element_id if it exists (element_id takes precedence over prompt)
        const displayValue = element_id || prompt;
        return <span key={index} className="font-semibold text-[#4542CC]">{displayValue}</span>;
      }
      const arg = args.find(a => a.key === key);
      if (arg) {
        return <span key={index} className="font-semibold text-[#4542CC]">{String(arg.value)}</span>;
      }
    }
    return <span key={index}>{part}</span>;
  });
};

const SegmentDetailsModal: React.FC<SegmentDetailsModalProps> = ({
  open,
  onClose,
  segmentId,
  suiteId,
  getToken,
}) => {
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [segmentTestName, setSegmentTestName] = useState<string>('');
  const [segmentTestInstructions, setSegmentTestInstructions] = useState<any[]>([]);
  const [segmentInstructionsLoading, setSegmentInstructionsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSegmentDetails = async () => {
      if (!open || !segmentId) {
        return;
      }

      try {
        const token = await getToken({ template: "basic" });
        if (!token) {
          message.error("Authentication required");
          return;
        }

        // Fetch segment details
        const response = await getSegmentAPI(token, segmentId);
        if (response.status === 200) {
          setSelectedSegment(response.data);
          
          // Fetch test details to get test name and instructions
          if (response.data.test_id) {
            setSegmentInstructionsLoading(true);
            try {
              const testResponse = await getTestAPI(token, response.data.test_id);
              if (testResponse.status === 200) {
                setSegmentTestName(testResponse.data.name || 'Untitled Test');
                // Format instructions similar to how they're formatted in useEffect
                const formattedInstructions = (testResponse.data.instructions || []).map((instruction: any, idx: number) => {
                  // If it's already a structured instruction, keep it as is
                  if (instruction && typeof instruction === 'object' && 'action' in instruction) {
                    return {
                      ...instruction,
                      id: instruction.id || generateInstructionId(instruction),
                    };
                  }
                  // If it's a string, convert to run_script
                  if (typeof instruction === 'string') {
                    return {
                      id: generateInstructionId(instruction),
                      type: 'Non-AI',
                      action: 'run_script',
                      args: [{
                        key: 'description',
                        value: instruction
                      }],
                      playwright_actions: [],
                      selectors: []
                    };
                  }
                  return {
                    ...instruction,
                    id: instruction.id || generateInstructionId(instruction),
                  };
                });
                setSegmentTestInstructions(formattedInstructions);
              } else {
                message.error(extractErrorMessage(testResponse));
              }
            } catch (error: any) {
              message.error(extractErrorMessage(error));
            } finally {
              setSegmentInstructionsLoading(false);
            }
          }
        } else {
          message.error(extractErrorMessage(response));
        }
      } catch (error: any) {
        message.error(extractErrorMessage(error));
      }
    };

    fetchSegmentDetails();
  }, [open, segmentId, getToken]);

  const handleClose = () => {
    setSelectedSegment(null);
    setSegmentTestName('');
    setSegmentTestInstructions([]);
    onClose();
  };

  const handleGoToTest = () => {
    if (selectedSegment?.test_id && suiteId) {
      window.open(`/dashboard/suite/${suiteId}/test/${selectedSegment.test_id}`, '_blank');
    }
  };

  return (
    <Modal
      title="Segment Details"
      open={open}
      onCancel={handleClose}
      footer={[
        selectedSegment?.test_id && suiteId && (
          <Button
            key="go-to-test"
            type="primary"
            className="font-hanken text-[14px] !bg-[#AE00FF] !border-2 !border-[#AE00FF] !text-white"
            onClick={handleGoToTest}
          >
            Go to Source
          </Button>
        ),
        <Button
          key="close"
          className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
          onClick={handleClose}
        >
          Close
        </Button>,
      ]}
      width={700}
    >
      {selectedSegment && (
        <div className="flex flex-col gap-4">
          {/* Test Name */}
          <div className="flex flex-col gap-2">
            <label className="font-hanken font-medium text-[16px]">Test Name</label>
            {segmentInstructionsLoading ? (
              <Spin size="small" />
            ) : (
              <p className="font-hanken text-[14px]">{segmentTestName || 'Loading...'}</p>
            )}
          </div>

          {/* Instruction Steps */}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
            {segmentInstructionsLoading ? (
              <div className="text-center py-4">
                <Spin size="small" />
                <span className="ml-2 text-sm text-gray-500">Loading instructions...</span>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                {(() => {
                  // Find the start and end instruction indices
                  const startIndex = segmentTestInstructions.findIndex(
                    (inst: any) => inst.id === selectedSegment.start_instruction_id
                  );
                  const endIndex = segmentTestInstructions.findIndex(
                    (inst: any) => inst.id === selectedSegment.end_instruction_id
                  );

                  if (startIndex === -1 || endIndex === -1) {
                    return (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">
                          Could not find instruction range. Showing all instructions.
                        </p>
                      </div>
                    );
                  }

                  return segmentTestInstructions.map((instruction: any, index: number) => {
                    const isInSegment = index >= Math.min(startIndex, endIndex) && 
                                       index <= Math.max(startIndex, endIndex);
                    const instructionId = instruction.id || generateInstructionId(instruction);
                    
                    // Convert API instruction format to InstructionObj format for formatInstructionValue
                    const instructionValue = typeof instruction === 'string' 
                      ? instruction 
                      : instruction;
                    
                    const instructionObj: InstructionObj = {
                      id: instructionId,
                      value: instructionValue,
                      playwright_actions: instruction.playwright_actions || [],
                      selectors: instruction.selectors || []
                    };
                    
                    return (
                      <div
                        key={instructionId || index}
                        className={`p-3 border-b border-gray-100 ${
                          isInSegment
                            ? 'bg-purple-100 border-2 border-purple-100'
                            : 'opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                          <div className="flex-1 text-sm">
                            {formatInstructionValue(instructionObj.value, instructionObj)}
                          </div>
                          {isInSegment && (
                            <span className="text-purple-600 text-xs">✓ In Segment</span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SegmentDetailsModal;

