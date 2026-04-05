'use client'
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Button, Input, Spin, Tooltip, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createGoalAPI, getGoalStatusAPI } from '@/lib/apis/testAI/compose';
import { extractErrorMessage } from '@/lib/utils';
import { getStatusColor, getStatusTooltip } from './utils';
import { actions } from '@/lib/constants/actions';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

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

interface GoalModeProps {
  composeId: string;
  composeModeStatus: {
    status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  };
  instructions: InstructionObj[];
  suite_id?: string | null;
  onInstructionsUpdate: (updates: (prev: InstructionObj[]) => InstructionObj[]) => void;
  formatInstructionValueLocal: (value: InstructionObj['value'], instruction?: InstructionObj) => React.ReactNode;
  children?: React.ReactNode;
}

interface GoalModeContextType {
  goalPrompt: string;
  setGoalPrompt: (value: string) => void;
  createGoalLoading: boolean;
  currentGoalId: string;
  goalStatus: any;
  goalCreationLoading: boolean;
  showAcceptRejectModal: boolean;
  pendingInstructions: any[];
  handleCreateGoal: () => Promise<void>;
  handleAcceptInstructions: () => void;
  handleRejectInstructions: () => void;
  composeModeStatus: GoalModeProps['composeModeStatus'];
  formatInstructionValueLocal: GoalModeProps['formatInstructionValueLocal'];
}

const GoalModeContext = createContext<GoalModeContextType | null>(null);

/**
 * GoalMode Provider Component
 * 
 * Manages all goal-related state and provides it via context to child components.
 * This component doesn't render anything itself - use GoalInstructionsDisplay and GoalInput instead.
 */
export const GoalModeProvider: React.FC<GoalModeProps> = ({
  composeId,
  composeModeStatus,
  instructions,
  suite_id,
  onInstructionsUpdate,
  formatInstructionValueLocal,
  children,
}) => {
  const { getToken } = useAuth();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [goalPrompt, setGoalPrompt] = useState<string>('');
  const [createGoalLoading, setCreateGoalLoading] = useState<boolean>(false);
  const [currentGoalId, setCurrentGoalId] = useState<string>('');
  const [goalStatus, setGoalStatus] = useState<any>(null);
  const [goalCreationLoading, setGoalCreationLoading] = useState<boolean>(false);
  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState<boolean>(false);
  const [pendingInstructions, setPendingInstructions] = useState<any[]>([]);
  const instructionsContainerRef = useRef<HTMLDivElement>(null);

  // React Query for goal status
  const goalStatusQuery = useQuery({
    queryKey: ['goalStatus', composeId, currentGoalId],
    queryFn: async () => {
      if (!composeId || !currentGoalId) {
        throw new Error('Missing composeId or goalId');
      }
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        throw new Error('No token available');
      }
      const response = await getGoalStatusAPI(token, composeId, currentGoalId);
      return response.data;
    },
    enabled: !!composeId && !!currentGoalId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'completed' || query.state.data?.status === 'failed') {
        return false;
      }
      return 3000;
    },
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: 1000,
  });

  // Effect to handle goal status query results
  useEffect(() => {
    if (goalStatusQuery.data) {
      const data = goalStatusQuery.data;
      setGoalStatus(data);
      setGoalCreationLoading(false);

      if (data.instructions && data.instructions.length > 0) {
        const formattedInstructions = data.instructions.map((item: any) => {
          if (item.element_id) {
            const { status } = item;
            const existingInstruction = instructions.find(instr => instr.id === item.id);
            if (existingInstruction) {
              const { playwright_actions, selectors, ...restExisting } = existingInstruction;
              return {
                ...restExisting,
                status: status || (data.output === 'SUCCESS' ? 'success' : 'failed')
              };
            }
          }

          return {
            id: item.id || uuidv4(),
            value: {
              type: item.type,
              action: item.action,
              args: item.args || [],
              ...(item.prompt && { prompt: item.prompt }),
              ...(item.element_id && { element_id: item.element_id })
            },
            playwright_actions: item.playwright_actions || [],
            selectors: item.selectors || [],
            status: item.status || (data.output === 'SUCCESS' ? 'success' : 'failed')
          };
        });
        setPendingInstructions(formattedInstructions);
      }

      if (data.status === 'completed') {
        if (data.output === 'FAILED') {
          setShowAcceptRejectModal(false);
          setCurrentGoalId('');
        } else {
          setShowAcceptRejectModal(true);
        }
      }
    }
  }, [goalStatusQuery.data, instructions]);

  // Effect to auto-scroll to bottom when goal status container appears
  useEffect(() => {
    if ((goalStatus || goalCreationLoading || showAcceptRejectModal || (pendingInstructions && pendingInstructions.length > 0)) && instructionsContainerRef.current) {
      setTimeout(() => {
        if (instructionsContainerRef.current) {
          instructionsContainerRef.current.scrollTop = instructionsContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [goalStatus, goalCreationLoading, showAcceptRejectModal, pendingInstructions]);

  // Effect to handle goal status query errors
  useEffect(() => {
    if (goalStatusQuery.error) {
      setGoalCreationLoading(false);
      setCurrentGoalId('');
      messageApi.error('Failed to fetch goal status');
    }
  }, [goalStatusQuery.error, messageApi]);

  const handleCreateGoal = async () => {
    if (!goalPrompt.trim()) {
      messageApi.error("Please enter a goal prompt");
      return;
    }

    if (!composeId) {
      messageApi.error("No compose session available");
      return;
    }

    setCreateGoalLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token) router.push("/sign-in");

      const response = await createGoalAPI(token, composeId, goalPrompt);
      if (response.status === 200) {
        messageApi.success("Goal created successfully");
        setGoalPrompt('');

        if (response.data?.goal_id) {
          setCurrentGoalId(response.data.goal_id);
          setGoalStatus(null);
          setPendingInstructions([]);
          setShowAcceptRejectModal(false);
          setGoalCreationLoading(true);
        }
      } else {
        messageApi.error(extractErrorMessage(response) || "Failed to create goal");
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error) || "There was an error creating the goal");
    } finally {
      setCreateGoalLoading(false);
    }
  };

  const handleAcceptInstructions = () => {
    onInstructionsUpdate(prev => [...prev, ...pendingInstructions]);
    setShowAcceptRejectModal(false);
    setPendingInstructions([]);
    setGoalStatus(null);
    setCurrentGoalId('');
    messageApi.success("Instructions added to compose successfully");
  };

  const handleRejectInstructions = async () => {
    setShowAcceptRejectModal(false);
    setPendingInstructions([]);
    setGoalStatus(null);
    setCurrentGoalId('');
    messageApi.info("Instructions discarded");
  };

  const contextValue: GoalModeContextType = {
    goalPrompt,
    setGoalPrompt,
    createGoalLoading,
    currentGoalId,
    goalStatus,
    goalCreationLoading,
    showAcceptRejectModal,
    pendingInstructions,
    handleCreateGoal,
    handleAcceptInstructions,
    handleRejectInstructions,
    composeModeStatus,
    formatInstructionValueLocal,
  };

  return (
    <GoalModeContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </GoalModeContext.Provider>
  );
};

/**
 * GoalInstructionsDisplay Component
 * 
 * Renders the goal instructions display (status, pending instructions, etc.)
 * Only shown when goal is actively generating.
 * Should be placed BEFORE the add icon in the instructions list.
 */
export const GoalInstructionsDisplay: React.FC = () => {
  const context = useContext(GoalModeContext);
  if (!context) return null;

  const { goalStatus, goalCreationLoading, showAcceptRejectModal, pendingInstructions, currentGoalId, handleAcceptInstructions, handleRejectInstructions, formatInstructionValueLocal } = context;

  const isGoalGenerating = goalStatus || goalCreationLoading || showAcceptRejectModal || (pendingInstructions && pendingInstructions.length > 0) || currentGoalId;

  if (!isGoalGenerating) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        {((pendingInstructions && pendingInstructions.length > 0) || currentGoalId || goalStatus) && (
          <div className="ml-5">
            <div className="text-black bg-[#FDF8FD] border border-[#DD94FF] w-[430px] rounded-lg p-2 text-sm break-words flex flex-col">
              {currentGoalId && !goalStatus && (
                <div className="flex items-center justify-between py-2 border-b border-[#DDE5FF]">
                  <div className="flex items-center gap-2">
                    <Spin size="small" />
                    <span className="text-sm text-black">Creating goal...</span>
                  </div>
                </div>
              )}

              {pendingInstructions && pendingInstructions.length > 0 && (
                pendingInstructions.map((instruction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-[#DDE5FF] last:border-b-0">
                    <div className="flex items-center gap-2">
                      {typeof instruction?.value !== 'string' && actions[instruction?.value?.action]?.displayIcon && (
                        <Image
                          src={actions[instruction?.value?.action].displayIcon}
                          alt={actions[instruction?.value?.action].displayName}
                          width={16}
                          height={16}
                          style={{ 
                            width: '16px', 
                            height: '16px',
                            filter: instruction?.value?.action === 'ai_assert' ? 'brightness(0)' : 'none'
                          }}
                        />
                      )}
                      <div className="text-sm text-black">
                        {formatInstructionValueLocal(instruction?.value, instruction)}
                      </div>
                    </div>
                    <div className={`${getStatusColor(instruction?.status || '')} rounded-[50%] flex-shrink-0`} data-testid="instruction-status">
                      <div className={`w-[16px] h-[16px]`}>
                        <Tooltip title={getStatusTooltip(instruction?.status || '')}>
                          <div className="w-full h-full cursor-pointer" data-testid="instruction-status-indicator" />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {((goalStatus?.status === 'completed' || goalStatus?.status === 'failed') && (!pendingInstructions || pendingInstructions.length === 0)) && (
                <div className="flex items-center py-2 border-b border-[#DDE5FF]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black">No instructions generated</span>
                  </div>
                </div>
              )}

              {goalStatus?.reasoning && (
                <div className="flex items-center py-2 border-b border-[#DDE5FF]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black">
                      <span className="font-semibold">Reasoning:</span> {goalStatus.reasoning}
                    </span>
                  </div>
                </div>
              )}

              {goalStatus?.status === 'running' && (
                <div className="flex items-center py-2 border-b border-[#DDE5FF]">
                  <div className="flex items-center gap-2">
                    <Spin size="small" />
                    <span className="text-sm text-black">Analyzing what to do next</span>
                  </div>
                </div>
              )}
              {goalStatus?.status === 'completed' && (
                <div className="flex items-center py-2 border-b border-[#DDE5FF]">
                  <div className="flex items-center gap-2">
                    {goalStatus?.output === 'FAILED' ? (
                      <span className="text-red-600 text-sm">Agent failed to complete the goal</span>
                    ) : (
                      <span className="text-sm text-black">Agent has finished</span>
                    )}
                  </div>
                </div>
              )}
              {goalStatus?.status === 'failed' && (
                <div className="flex items-center py-2 border-b border-[#DDE5FF]">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-sm">Agent failed</span>
                  </div>
                </div>
              )}

              {(goalStatus?.status === 'running' || goalStatus?.status === 'completed' || goalStatus?.status === 'failed') && (
                <div className="flex items-center justify-start py-2">
                  <div className="flex gap-2">
                    {goalStatus?.status === 'running' && (
                      <Button
                        className="!bg-[#FDF8FD] hover:!text-black !border-[#DD94FF] !rounded-lg !px-4 !py-1"
                        onClick={handleRejectInstructions}
                      >
                        Stop
                      </Button>
                    )}
                    {(goalStatus?.status === 'completed' || goalStatus?.status === 'failed') && (
                      <>
                        <Button
                          className="!bg-[#FDF8FD] !border-[#DD94FF] !text-black !rounded-lg !px-4 !py-1"
                          onClick={handleRejectInstructions}
                        >
                          Discard
                        </Button>
                        {goalStatus?.status === 'completed' && pendingInstructions && pendingInstructions.length > 0 && (
                          <Button
                            className="!bg-[#AE00FF] !border-[#AE00FF] !text-white !rounded-lg !px-4 !py-1 hover:!bg-[#8e00cc]"
                            onClick={handleAcceptInstructions}
                          >
                            Add to test
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * GoalInput Component
 * 
 * Renders the goal input text area that always appears after the add icon.
 */
export const GoalInput: React.FC = () => {
  const context = useContext(GoalModeContext);
  if (!context) return null;

  const { goalPrompt, setGoalPrompt, createGoalLoading, goalStatus, goalCreationLoading, showAcceptRejectModal, pendingInstructions, handleCreateGoal, composeModeStatus } = context;

  return (
    <div className="flex flex-col gap-2 mr-2 -mt-2" data-testid="compose-goal-input-section">
      <div className="relative w-full">
        <Input.TextArea
          placeholder="Describe your test step"
          rows={3}
          className="w-full pr-20"
          value={goalPrompt}
          onChange={e => setGoalPrompt(e.target.value)}
          onPressEnter={handleCreateGoal}
          disabled={goalCreationLoading || (goalStatus && (goalStatus.status === 'running' || (showAcceptRejectModal && goalStatus.output !== 'FAILED'))) || (pendingInstructions && pendingInstructions.length > 0)}
          data-testid="compose-goal-input"
        />
        <Tooltip title={
          (goalStatus && (goalStatus.status === 'running' || (showAcceptRejectModal && goalStatus.output !== 'FAILED'))) || goalCreationLoading || (pendingInstructions && pendingInstructions.length > 0)
            ? "Goal execution in progress"
            : composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed'
              ? "Create a new goal"
              : composeModeStatus.status === 'idle' || composeModeStatus.status === 'stopped'
                ? "Start the test run to create a goal"
                : "Please wait for the test run to complete"
        }>
          <Button
            type="primary"
            className="!border-2 !border-[#DD94FF] !text-black !bg-white absolute bottom-2 right-2 !w-[28px] !h-[28px] !p-0 !flex !items-center !justify-center"
            onClick={handleCreateGoal}
            loading={createGoalLoading}
            disabled={
              (composeModeStatus.status !== 'completed' && composeModeStatus.status !== 'failed') ||
              (goalStatus && (goalStatus.status === 'running' || (showAcceptRejectModal && goalStatus.output !== 'FAILED'))) ||
              goalCreationLoading || !goalPrompt.trim() || (pendingInstructions && pendingInstructions.length > 0)
            }
          >
            {!createGoalLoading && <Image src="/assets/goal-btn.svg" width={16} height={16} alt="goal-btn" />}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

// Backward compatibility - export GoalMode as the provider
export const GoalMode = GoalModeProvider;
