'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Button, Spin, Input, message, Tooltip, Breadcrumb, Dropdown, Modal, Radio, Select, Switch } from 'antd';
import Image from 'next/image';
import { EditOutlined, DeleteOutlined, DragOutlined, CiCircleOutlined, DownOutlined, ReloadOutlined, ConsoleSqlOutlined, ExportOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Header from '@/components/AgentHeader/Header';
import { getTestAPI, getTestSuiteAPI, getTestSuitesAPI, getFilesAPI } from '@/lib/apis/testAI/test';
import { getElementsAPI, createElementAPI, updateElementAPI } from '@/lib/apis/testAI/element';
import { createStoreAPI } from '@/lib/apis/testAI/store';
import { TestAIEndpoints } from '@/lib/endpoints/testAI/endpoints';
import { getSegmentsBySuiteAPI, getSegmentAPI } from '@/lib/apis/testAI/segments';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser as useAppUser } from '@/contexts/UserContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createComposeAPI, getComposeAPI, updateTestComposeAPI, runComposeAPI, deleteComposeAPI, createTestComposeAPI, createGoalAPI, getGoalStatusAPI, getLiveUrlsAPI } from '@/lib/apis/testAI/compose';
import { getStoresAPI } from '@/lib/apis/testAI/store';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import Link from 'next/link';
import { actions } from "@/lib/constants/actions";
import { supportedUrlPatterns } from "@/lib/constants/urlPatterns";
import { useMutation, useQuery } from '@tanstack/react-query';
import DeleteConfirmation from "@/components/DeleteConfirmation/DeleteConfirmation";
import { v4 as uuidv4 } from 'uuid';
import { SaveToStoreModal } from "@/components/SaveToStoreModal/SaveToStoreModal";
import { extractErrorMessage } from '@/lib/utils';
import {
  shouldSkipVerifyValidation,
  shouldIncludeVerifyArg,
  clearVerifyFieldsOnTargetChange,
  getPropertyDisplayText,
  getTargetDisplayText,
  getFieldDisplayName,
  transformCheckValueForBackend,
  validateVerifyArguments
} from '@/lib/verifyUtils';
import { RoleBasedButton } from '../ui/role-based-button';
import { ElementResponse } from '@/types/element';
import SegmentDetailsModal from '../SegmentDetailsModal/SegmentDetailsModal';
import { InstructionDisplay } from '../InstructionDisplay/InstructionDisplay';
import { SaveModal, SelectorsModal, ComposeConfigModal, SettingsModal, StoreElementModal } from './modals';
import { ActionEditor } from './actions';
import { useActionHandlers, useInstructionHandlers, useWebSocketStream } from './hooks';
import { GoalModeProvider, GoalInstructionsDisplay, GoalInput } from './GoalMode';
import { 
  validateStateVariableName, 
  getStatusColor, 
  getStatusTooltip, 
  generateInstructionId,
  getCurrentEnvironment,
  getIframeContainerStyle,
  getComposeDuration,
  formatInstructionsPayload,
  formatInstructionValue
} from './utils';

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



interface ComposePageParams {
  params: {
    test_id: string | null;
    suite_id?: string | null;
  };
}

// Add new interface for compose mode tracking
interface ComposeModeStatus {
  isActive: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  startTime?: Date;
  endTime?: Date;
  currentInstruction?: number;
  totalInstructions: number;
}

// Add viewport interface
interface ViewportOption {
  label: string;
  width: number;
  height: number;
}

const Compose = ({ params }: ComposePageParams) => {
  const { getToken } = useAuth();
  const { currentUserDetails } = useAppUser();
  const { selectedEnvironment } = useEnvironment();
  const environment_id = selectedEnvironment?.environment_id || null;
  const [initCompose, setInitCompose] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('litmus');
  const [testName, setTestName] = useState('');
  const [suiteName, setSuiteName] = useState('');

  const [instructions, setInstructions] = useState<InstructionObj[]>([]);
  const shouldRunCompose = useRef(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const test_id = params?.test_id;
  const suite_id = params?.suite_id;
  const [newInstruction, setNewInstruction] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [suiteLoading, setSuiteLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeId, setComposeId] = useState<string>('');
  const [saveComposeLoading, setSaveComposeLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [instructionArgs, setInstructionArgs] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [editSelectedAction, setEditSelectedAction] = useState<string>('');
  const [editInstructionArgs, setEditInstructionArgs] = useState<Record<string, string>>({});
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string>>({});
  const [showEditValidationErrors, setShowEditValidationErrors] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMode, setSaveMode] = useState<'existing' | 'new'>('existing');

  // Element management states
  const [elements, setElements] = useState<ElementResponse[]>([]);
  const [elementsLoading, setElementsLoading] = useState(false);
  const [elementType, setElementType] = useState<'existing' | 'new'>('existing');
  const [selectedSuite, setSelectedSuite] = useState<string | undefined>(undefined);
  const [saveTestName, setSaveTestName] = useState('');
  const [customTestId, setCustomTestId] = useState('');
  const [verifyCurrentArgIndex, setVerifyCurrentArgIndex] = useState(0);
  const [editVerifyCurrentArgIndex, setEditVerifyCurrentArgIndex] = useState(0);
  const [saveError, setSaveError] = useState('');
  const [suiteOptions, setSuiteOptions] = useState<{ label: string, value: string }[]>([]);
  const [newSuiteName, setNewSuiteName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [isStreamConnected, setIsStreamConnected] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [eventStream, setEventStream] = useState<EventSource | null>(null);
  const [logStatus, setLogStatus] = useState<string>('');

  // New state for environment selection
  const [isFinigamiUser, setIsFinigamiUser] = useState<boolean>(false);
  const [userCheckComplete, setUserCheckComplete] = useState<boolean>(false);
  const [isNewlyCreatedCompose, setIsNewlyCreatedCompose] = useState<boolean>(false);
  // Goal mode state moved to GoalMode component
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Add state for selectors modal
  const [showSelectorsModal, setShowSelectorsModal] = useState<boolean>(false);
  const [showSaveToStoreModal, setShowSaveToStoreModal] = useState<boolean>(false);
  const [showStoreElementModal, setShowStoreElementModal] = useState<boolean>(false);
  const [currentStoreElement, setCurrentStoreElement] = useState<string>('');

  const { data: storesData, refetch: fetchStores, isFetching: storesLoading } = useQuery({
    queryKey: ['stores', suite_id],
    queryFn: async () => {
      if (!suite_id) return { stores: [] };
      const token = await getToken({ template: "basic" });
      if (!token) return { stores: [] };

      return getStoresAPI(token, suite_id);
    },
    enabled: false // Don't fetch automatically
  });
  const [currentSelectors, setCurrentSelectors] = useState<Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>>([]);
  const [currentInstructionId, setCurrentInstructionId] = useState<string | null>(null);
  const [selectedSelectorIndex, setSelectedSelectorIndex] = useState<number>(0);

  // Add state for reuse test functionality
  const [suiteTestsLoading, setSuiteTestsLoading] = useState<boolean>(false);
  // Live URLs for switch_tab
  const [liveUrlsLoading, setLiveUrlsLoading] = useState<boolean>(false);
  const [availableLiveUrls, setAvailableLiveUrls] = useState<Array<{ title: string; url: string; live_url: string }>>([]);
  const [selectedLiveUrlIndex, setSelectedLiveUrlIndex] = useState<number>(0);
  const [availableTests, setAvailableTests] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [testSearchQuery, setTestSearchQuery] = useState<string>('');
  const testSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [availableSegments, setAvailableSegments] = useState<Array<{ segment_id: string; segment_name: string; test_id: string; test_name: string; start_instruction_id: string; end_instruction_id: string }>>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [segmentsLoading, setSegmentsLoading] = useState<boolean>(false);
  const [isViewSegmentModalOpen, setIsViewSegmentModalOpen] = useState<boolean>(false);
  const [viewSegmentModalId, setViewSegmentModalId] = useState<string | null>(null);

  // Add state for file upload functionality
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [availableFiles, setAvailableFiles] = useState<Array<{ file_id: string; file_name: string }>>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');

  // Add state for settings modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [useTestData, setUseTestData] = useState<boolean>(false);
  const [selectedTestDataFile, setSelectedTestDataFile] = useState<string>('');
  const [testDataFilesLoading, setTestDataFilesLoading] = useState<boolean>(false);
  const [availableTestDataFiles, setAvailableTestDataFiles] = useState<Array<{ file_id: string; file_name: string }>>([]);
  const [hasTestData, setHasTestData] = useState<boolean>(false);

  // Add ref to track status polling interval
  const statusPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add viewport state
  const [selectedViewport, setSelectedViewport] = useState<{ width: number, height: number }>({ width: 1366, height: 768 });

  // Add flag to track first iframe load
  const [isFirstIframeLoad, setIsFirstIframeLoad] = useState(true);

  // Add config state for compose run
  const [composeConfig, setComposeConfig] = useState({
    browser: "chrome",
    device: "desktop",
    os: "windows",
    viewport: "1920x1080",
    environment: "litmus_cloud"
  });
  const [isComposeConfigModalOpen, setIsComposeConfigModalOpen] = useState(false);

  // WebSocket hook for litmus cloud image streaming
  const { websocket, currentImage, isConnecting: isWebSocketConnecting, connectWebSocket, disconnectWebSocket, clearImage } = useWebSocketStream();

  // Helper function to get current viewport dimensions
  const getCurrentViewport = () => {
    return selectedViewport;
  };

  // Helper function to handle live URL selection
  const handleLiveUrlChange = async (index: number) => {
    setSelectedLiveUrlIndex(index);
    // Update the initCompose with the new live_url
    if (availableLiveUrls[index]) {
      setInitCompose((prev: any) => ({
        ...prev,
        live_url: availableLiveUrls[index].live_url
      }));

    }
  };

  // Helper function to calculate iframe container dimensions
  const getIframeContainerStyleLocal = () => {
    return getIframeContainerStyle(getCurrentViewport());
  };


  // Goal mode query and effects moved to GoalMode component

  // Start polling with interval
  const startPolling = () => {
    if (statusPollingIntervalRef.current) {
      clearInterval(statusPollingIntervalRef.current);
    }
    statusPollingIntervalRef.current = setInterval(() => {
      if (currentPollingInstructionId && composeModeStatus.status === 'running' && instructions.length > 0) {
        getComposeStatus();
      }
    }, 1000); // Poll every 1 second
  };

  // Stop polling
  const stopPolling = () => {
    if (statusPollingIntervalRef.current) {
      clearInterval(statusPollingIntervalRef.current);
      statusPollingIntervalRef.current = null;
    }
  };

  // Add ref and state for gradient overlay
  const instructionsContainerRef = useRef<HTMLDivElement>(null);
  const [showGradientOverlay, setShowGradientOverlay] = useState<boolean>(false);

  // Add compose mode tracking state
  const [composeModeStatus, setComposeModeStatus] = useState<ComposeModeStatus>({
    isActive: false,
    status: 'idle',
    totalInstructions: 0
  });

  // Add ref to track if we should delete compose on unmount
  const shouldDeleteOnUnmount = useRef<boolean>(false);
  // Add ref to track if compose was auto-started from URL query
  const isAutoStartedFromQuery = useRef<boolean>(false);

  // Add ref to track if we've already started a log stream for the current composeId
  const logStreamStarted = useRef<string>('');

  // Add state to track current instruction being polled
  const [currentPollingInstructionId, setCurrentPollingInstructionId] = useState<string>('');

  // Add ref to store latest instructions for polling logic
  const latestInstructionsRef = useRef<InstructionObj[]>([]);

  const [aiUse, setAiUse] = useState<'generate_script' | 'always_ai'>('generate_script');
  const [editAiUse, setEditAiUse] = useState<'generate_script' | 'always_ai'>('generate_script');

  // Helper functions to update compose mode status
  const updateComposeModeStatus = (updates: Partial<ComposeModeStatus>) => {
    setComposeModeStatus(prev => ({ ...prev, ...updates }));
  };

  const startComposeMode = (specificInstructionId: string, shouldChangePollingInstruction: boolean = true) => {
    updateComposeModeStatus({
      isActive: true,
      status: 'running',
      startTime: new Date(),
      endTime: undefined,
      currentInstruction: 0,
      totalInstructions: instructions.length
    });

    // Only change polling instruction if we're not already running or if explicitly requested
    if (shouldChangePollingInstruction) {
      if (specificInstructionId) {
        setCurrentPollingInstructionId(specificInstructionId);
      } else if (instructions.length > 0) {
        // If no specific instruction provided, use the first one
        setCurrentPollingInstructionId(instructions[0].id);
      }
    }
  };

  const stopComposeMode = async () => {
    // Close websocket connection if open
    disconnectWebSocket();
    // Clear current image
    clearImage();

    // Stop status polling
    if (statusPollingIntervalRef.current) {
      clearInterval(statusPollingIntervalRef.current);
      statusPollingIntervalRef.current = null;
    }

    // Reset sequential polling state
    setCurrentPollingInstructionId(instructions[0]?.id?.toString());
  };

  const completeComposeMode = () => {
    updateComposeModeStatus({
      isActive: true,
      status: 'completed',
      endTime: new Date()
    });
  };

  const updateCurrentInstruction = (instructionIndex: number) => {
    updateComposeModeStatus({
      currentInstruction: instructionIndex
    });
  };



  // Utility function to get current compose mode status
  const getComposeModeStatus = () => {
    return composeModeStatus;
  };

  // Utility function to check if compose is currently active
  const isComposeActive = () => {
    return composeModeStatus.isActive;
  };

  // Utility function to get compose duration
  const getComposeDurationLocal = () => {
    return getComposeDuration(composeModeStatus.startTime, composeModeStatus.endTime);
  };

  // Get search params for duplicate_from and url
  const searchParams = useSearchParams();
  const duplicate_from = searchParams?.get('duplicate_from');
  const urlFromQuery = searchParams?.get('url');

  // Fetch duplicate test instructions when duplicate_from is provided
  useEffect(() => {
    if (duplicate_from) {
      const fetchDuplicateTest = async () => {
        try {
          const token = await getToken({ template: "basic" });
          if (!token) {
            router.push("/sign-in");
            return;
          }

          const response = await getTestAPI(token, duplicate_from);
          if (response.status === 200) {
            setTestName(`Untitled`);
            if (response.data.instructions && Array.isArray(response.data.instructions)) {
              const formatted = response.data.instructions.map((instruction: any) => {
                // If it's already a structured instruction, keep it as is
                if (instruction && typeof instruction === 'object' && 'action' in instruction) {
                  return {
                    id: uuidv4(), // Always generate new ID for duplicated instructions
                    value: instruction,
                    playwright_actions: instruction.playwright_actions || []
                  };
                }
                // If it's a string, convert to run_script
                if (typeof instruction === 'string') {
                  return {
                    id: uuidv4(), // Always generate new ID for duplicated instructions
                    value: {
                      type: 'Non-AI',
                      action: 'run_script',
                      args: [{
                        key: 'description',
                        value: instruction
                      }]
                    },
                    playwright_actions: []
                  };
                }
                return {
                  id: uuidv4(), // Always generate new ID for duplicated instructions
                  value: instruction,
                  playwright_actions: instruction.playwright_actions || []
                };
              });

              setInstructions(formatted);
            }

            // Handle test data settings for duplicate
            if (response.data.has_test_data === true && response.data.file_id) {
              setUseTestData(true);
              setSelectedTestDataFile(response.data.file_id);
              // Fetch the file details to populate the dropdown
              fetchTestDataFiles();
            }
          }
        } catch (error: any) {
          messageApi.error(extractErrorMessage(error));
        }
      };

      fetchDuplicateTest();
    }
  }, [duplicate_from]);

  const stopLogStream = async (refresh?: boolean) => {
    if (eventStream) {
      eventStream.close();
      setEventStream(null);
      setIsStreamConnected(false);
      setStreamError(false);
    }
    if (refresh && composeId) {
      setIsRefreshing(true);
      setLogs([]);
      logStreamStarted.current = ''; // Reset tracking to allow new stream
      await startLogStream(composeId);
    }
  };

  const startLogStream = async (composeId: string) => {
    // Don't create a new stream if one already exists
    if (eventStream) {
      return;
    }

    // Don't start log stream if compose session is not active
    if (!composeModeStatus.isActive || composeModeStatus.status === 'idle') {
      return;
    }

    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    const encodedToken = encodeURIComponent(token ?? "");

    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}/log_stream?token=${encodedToken}&testrun_id=${composeId}`
    );
    setEventStream(source);
    setIsStreamConnected(false);
    setStreamError(false);

    source.onopen = () => {
      setIsStreamConnected(true);
      setStreamError(false);
      setIsRefreshing(false);
    };

    source.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data);
        if (logData.logs && typeof logData.logs === 'object') {
          // Handle the new format where logs is an object with numbered keys
          const allLogs: any[] = [];
          Object.values(logData.logs).forEach((logArray: any) => {
            if (Array.isArray(logArray)) {
              allLogs.push(...logArray);
            }
          });
          if (allLogs.length > 0) {
            setLogs((prevLogs) => [...prevLogs, ...allLogs]);
          }
        }
      } catch (error) {
        setStreamError(true);
        stopLogStream();
      }
    };

    source.onerror = (error) => {
      setStreamError(true);
      setIsRefreshing(false);
      setIsStreamConnected(false);
    };
  };

  useEffect(() => {
    if (composeId && !eventStream && logStreamStarted.current !== composeId && composeModeStatus.isActive) {
      // Only start log stream if we don't already have one, haven't started one for this composeId, and compose is active
      setLogs([]); // clear logs when composeId changes
      startLogStream(composeId);
      logStreamStarted.current = composeId;
    }
    return () => {
      stopLogStream();
    };
  }, [composeId, eventStream, composeModeStatus.isActive]);

  useEffect(() => {
    if (isRefreshing) {
      setLogStatus('Re-establishing connection...');
    } else if (streamError) {
      setLogStatus('Could not establish connection. Please try again.');
    } else if (!isStreamConnected && eventStream) {
      setLogStatus('Establishing connection...');
    }
    // else if (!isStreamConnected && logs.length === 0) {
    //   setLogStatus('Waiting for logs...');
    // }
    else {
      setLogStatus('');
    }
  }, [isRefreshing, streamError, isStreamConnected, logs.length, eventStream]);

  const tabItems = [
    {
      key: 'litmus',
      label: 'LITMUS LOGS',
      children: (
        <div className="flex flex-col gap-5 mt-2 h-[360px] min-w-0">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {<div className="bg-black p-4 rounded overflow-x-hidden overflow-y-hidden w-full h-[360px] min-w-0">
              <div className="flex justify-between items-center max-mb-2">
                <h3 className="font-hanken text-[16px] text-white">Live Logs:</h3>
                <Tooltip title="Refresh">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={async () => await stopLogStream(true)}
                    className="!text-white"
                  />
                </Tooltip>
              </div>
              <div className="overflow-auto h-[calc(100%-30px)] min-w-0">
                {logStatus && (
                  <div className={`text-center mt-4 ${streamError ? 'text-red-500' :
                    'text-gray-400'
                    }`}>
                    {logStatus}
                  </div>
                )}
                {logs.map((log, index) => (
                  <div key={index} className="text-[#4EC9B0] text-[14px] mb-2 break-all min-w-0">
                    {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                    {log.info && <span>{log.info}</span>}
                    {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                    {log.error && <span className="text-red-500">{log.error}</span>}
                  </div>
                ))}
              </div>
            </div>
              // : <div className="flex items-center text-gray-400 justify-center">Live logs can be seen here during the run</div>
            }
          </div>
        </div>
      )
    },
    {
      key: 'console',
      label: 'CONSOLE',
      children: (
        <div className="flex flex-col items-center justify-center h-[360px] gap-2">
          <img
            src="/assets/robot.jpg"
            alt="Robot"
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div className=" text-center">
            <div className="text-lg font-medium mb-1">Coming Soon</div>
            <div className="text-sm">Console logs will be available here</div>
          </div>
        </div>
      )
    },
    {
      key: 'network',
      label: 'NETWORK',
      children: (
        <div className="flex flex-col items-center justify-center h-[360px] gap-2">
          <img
            src="/assets/robot.jpg"
            alt="Robot"
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div className="text-center">
            <div className="text-lg font-medium mb-1">Coming Soon</div>
            <div className="text-sm">Network requests will be available here</div>
          </div>
        </div>
      )
    },
  ];

  // Helper function to format instructions for API payload
  const formatInstructionsPayloadLocal = () => {
    return formatInstructionsPayload(instructions);
  };

  const saveCompose = async () => {
    setSaveComposeLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    try {
      // Create payload with instructions including status and playwright_actions
      const payload = {
        instructions: formatInstructionsPayloadLocal(),
        has_test_data: useTestData,
        ...(useTestData && selectedTestDataFile && {
          file_id: selectedTestDataFile
        })
      };

      const response = await updateTestComposeAPI(token, test_id ?? '', composeId, payload);
      if (response.status === 200) {
        // Update hasTestData state based on current useTestData setting
        setHasTestData(useTestData && !!selectedTestDataFile);
        messageApi.success("Test saved successfully");
        setSaveComposeLoading(false);
        // Close settings modal if it's open
        setShowSettingsModal(false);
        // Don't delete compose on unmount after successful save
        shouldDeleteOnUnmount.current = false;
      } else {
        messageApi.error(extractErrorMessage(response));
        setSaveComposeLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setSaveComposeLoading(false);
    }
  }

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    // Only trigger re-render on first load
    if (isFirstIframeLoad) {
      setIsFirstIframeLoad(false);

      setTimeout(() => {
        const liveUrl = initCompose?.live_url;

        // Force iframe re-render by setting live_url to null first
        setInitCompose((prev: any) => ({
          ...prev,
          live_url: null
        }));

        // Reset to previous URL after a brief delay
        setTimeout(() => {
          setInitCompose((prev: any) => ({
            ...prev,
            live_url: liveUrl
          }));
        }, 100);

      }, 10000);
    }
  };

  // Use action handlers hook
  const {
    handleActionSelect,
    handleEditActionSelect,
    handleArgChange,
    handleEditArgChange,
    handleVerifyArgChange,
    handleEditVerifyArgChange,
    handleTestSearch,
    fetchSuiteTests,
    fetchSuiteSegments,
    fetchSuiteFiles,
    fetchLiveUrls,
    contextHolder: actionContextHolder,
  } = useActionHandlers({
    suite_id: suite_id ?? undefined,
    test_id: test_id ?? undefined,
    composeId,
    composeConfig,
    selectedAction,
    setSelectedAction,
    instructionArgs,
    setInstructionArgs,
    validationErrors,
    setValidationErrors,
    showValidationErrors,
    setShowValidationErrors,
    editSelectedAction,
    setEditSelectedAction,
    editInstructionArgs,
    setEditInstructionArgs,
    editValidationErrors,
    setEditValidationErrors,
    showEditValidationErrors,
    setShowEditValidationErrors,
    elementType,
    setElementType,
    setVerifyCurrentArgIndex,
    setEditVerifyCurrentArgIndex,
    setTestSearchQuery,
    setAvailableTests,
    setAvailableSegments,
    setAvailableFiles,
    setAvailableLiveUrls,
    setSuiteTestsLoading,
    setSegmentsLoading,
    setFilesLoading,
    setLiveUrlsLoading,
    setAiUse,
    setEditAiUse,
  });

  // Use instruction handlers hook
  const {
    handleAddAndRun,
    handleDeleteInstruction,
    handleAddInstructionBetween,
    onDragEnd,
    handleEditInstruction,
    handleSaveEdit,
    handleCancelEdit,
  } = useInstructionHandlers({
    selectedAction,
    instructionArgs,
    elementType,
    selectedTestId,
    selectedSegmentId,
    selectedFileId,
    aiUse,
    availableTests,
    availableSegments,
    availableFiles,
    elements,
    editSelectedAction,
    editInstructionArgs,
    editAiUse,
    editingId,
    instructions,
    composeModeStatus,
    setSelectedAction,
    setInstructionArgs,
    setValidationErrors,
    setShowValidationErrors,
    setSelectedTestId,
    setSelectedSegmentId,
    setAvailableTests,
    setAvailableSegments,
    setSelectedFileId,
    setAvailableFiles,
    // @ts-ignore - Type mismatch between hook's InstructionObj and Compose's InstructionObj (status type differs)
    setInstructions,
    setEditingId,
    setEditSelectedAction,
    setEditInstructionArgs,
    setEditValidationErrors,
    setShowEditValidationErrors,
    setElementType,
    setEditAiUse,
    setEditVerifyCurrentArgIndex,
    setTestSearchQuery,
    shouldRunCompose,
    fetchSuiteTests,
    fetchSuiteSegments,
    fetchSuiteFiles,
  });

  // Old handler definitions removed - now using hooks above

  const fetchTestDataFiles = async () => {
    if (!suite_id) {
      messageApi.error("No suite ID available");
      return;
    }

    setTestDataFilesLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await getFilesAPI(token, suite_id, "data");
      if (response.status === 200 && response.data.files) {
        // Filter to only show CSV files
        const csvFiles = response.data.files
          .filter((file: any) => file.file_name.toLowerCase().endsWith('.csv'))
          .map((file: any) => ({
            file_id: file.file_id,
            file_name: file.file_name
          }));
        setAvailableTestDataFiles(csvFiles);
      } else {
        messageApi.error("Failed to fetch test data files");
      }
    } catch (error: any) {
      messageApi.error(error.message || "Failed to fetch test data files");
    } finally {
      setTestDataFilesLoading(false);
    }
  };

  const getTestSuite = async () => {
    setSuiteLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }

    try {
      const response = await getTestSuiteAPI(token, suite_id ?? "");
      if (response.status === 200) {
        setSuiteName(response.data.name);
        setSuiteLoading(false);
      } else {
        messageApi.error(extractErrorMessage(response) || "There was an error");
        setSuiteLoading(false);
        // setError(true);
      }
    } catch (error: any) {
      //   setIsWorkFlowLoading(false);
      messageApi.error(extractErrorMessage(error));
      setSuiteLoading(false);
      // setError(true);
    }
  };

  useEffect(() => {
    if (shouldRunCompose.current) {
      runCompose(false, true);
      shouldRunCompose.current = false;
    }
  }, [instructions]);

  const runCompose = async (runFromStart: boolean, singleInstruction: boolean) => {
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    if (!composeId) {
      messageApi.info("Please start the test.");
      return;
    }

    // Check if environment is litmus_cloud
    const environment = composeConfig?.environment as 'browserbase' | 'litmus_cloud';
    const isLitmusCloud = environment === 'litmus_cloud';

    // For litmus cloud, establish websocket connection after composeId is available
    if (isLitmusCloud) {
      try {
        // Ensure composeId is available before connecting
        if (!composeId) {
          console.error('Cannot connect websocket: composeId is not available');
          messageApi.error('Compose ID is required for websocket connection');
          setComposeLoading(false);
          return;
        }

        console.log('Connecting websocket with composeId:', composeId);
        // Get websocket URL from environment variable or use localhost for testing
        
        const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
        if (!token) {
          messageApi.error('Authentication token is required for websocket connection');
          setComposeLoading(false);
          return;
        }
        await connectWebSocket(composeId, websocketUrl, token);
        // Clear any previous image
        clearImage();
      } catch (error) {
        console.error('Failed to connect websocket:', error);
        messageApi.warning('WebSocket connection failed, live view cannot be displayed');
      }
    }

    // Clear status of all instructions when running from start
    if (runFromStart) {
      setInstructions(prev => prev.map(instr => ({
        ...instr,
        status: 'pending'
      })));
    }

    if (singleInstruction && instructions.length > 0) {
      // For single instruction, don't change the current polling instruction
      // Just run the instruction without affecting polling
      if (!composeModeStatus.isActive) {
        startComposeMode(instructions[instructions.length - 1]?.id);
      } else {
        // If already running, just run the instruction without changing polling
        startComposeMode(instructions[instructions.length - 1]?.id, false);
      }
    } else {
      startComposeMode(instructions[0]?.id);
    }


    const makePayload = () => ({
      run_from_start: runFromStart,
      instructions: singleInstruction
        ? [{
          id: instructions[instructions.length - 1].id,
          type: typeof instructions[instructions.length - 1].value === 'string'
            ? 'Non-AI'
            : (instructions[instructions.length - 1].value as any).type,
          action: typeof instructions[instructions.length - 1].value === 'string'
            ? 'run_script'
            : (instructions[instructions.length - 1].value as any).action,
          args: typeof instructions[instructions.length - 1].value === 'string'
            ? [{
              key: 'description',
              value: instructions[instructions.length - 1].value
            }]
            : (instructions[instructions.length - 1].value as any).args,
          ...(typeof instructions[instructions.length - 1].value !== 'string' &&
            (instructions[instructions.length - 1].value as any).prompt && {
            prompt: (instructions[instructions.length - 1].value as any).prompt
          }),
          ...(typeof instructions[instructions.length - 1].value !== 'string' &&
            (instructions[instructions.length - 1].value as any).ai_use && {
            ai_use: (instructions[instructions.length - 1].value as any).ai_use
          }),
          ...(typeof instructions[instructions.length - 1].value !== 'string' &&
            (instructions[instructions.length - 1].value as any).element_id && {
            element_id: (instructions[instructions.length - 1].value as any).element_id
          }),
          playwright_actions: instructions[instructions.length - 1].playwright_actions || [],
          selectors: instructions[instructions.length - 1].selectors || []
        }]
        : instructions.map((instr) => {
          const finalActions = instr.playwright_actions || [];
          const finalSelectors = instr.selectors || [];

          if (typeof instr.value === 'string') {
            return {
              id: instr.id,
              type: 'Non-AI',
              action: 'run_script',
              args: [{
                key: 'description',
                value: instr.value
              }],
              playwright_actions: finalActions,
              selectors: finalSelectors
            };
          }
          const value = instr.value as any;

          // Handle reuse_test action specially
          if (value.action === 'reuse_test') {
            return {
              id: instr.id,
              type: 'Test-Segment',
              action: value.action,
              args: value.args,
              playwright_actions: finalActions,
              selectors: finalSelectors
            };
          }

          return {
            id: instr.id,
            type: value.type,
            action: value.action,
            args: value.args,
            ...(value.prompt && { prompt: value.prompt }),
            ...(value.ai_use && { ai_use: value.ai_use }),
            ...(value.element_id && { element_id: value.element_id }),
            playwright_actions: finalActions,
            selectors: finalSelectors
          };
        })
    });

    try {

      if (runFromStart) {
        const payload = makePayload();
        const response = await runComposeAPI(token, composeId, payload);
        if (response.status === 200) {
          // Update live URL if returned from API
          if (response.data?.live_url) {
            setInitCompose((prev: any) => ({
              ...prev,
              live_url: response.data.live_url
            }));
          }

          messageApi.success("Test run started successfully");
          setComposeLoading(false);

          // Polling will start via useEffect when compose mode becomes active
        } else {
          messageApi.error(extractErrorMessage(response) || "There was an error running the test");
        }
      } else {
        const response = await runComposeAPI(token, composeId, makePayload());
        if (response.status === 200) {
          // Update live URL if returned from API
          if (response.data?.live_url) {
            setInitCompose((prev: any) => ({
              ...prev,
              live_url: response.data.live_url
            }));
          }

          messageApi.success("Test run started successfully");
          setComposeLoading(false);

          // Polling will start via useEffect when compose mode becomes active
        } else {
          messageApi.error(extractErrorMessage(response) || "There was an error running the test");
        }
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    }
  }

  const handleStartRun = (config?: any) => {
    // For all users, create compose and then run
    const environment = composeConfig?.environment as 'browserbase' | 'litmus_cloud';
    const configPayload = config || undefined;
    createCompose(environment, configPayload);
  }

  const createCompose = async (environment?: 'browserbase' | 'litmus_cloud', configPayload?: any) => {
    setComposeLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    try {
      const response = await createComposeAPI(token, environment, configPayload, suite_id, test_id, hasTestData, environment_id);
      if (response.status === 200) {
        setInitCompose(response.data);
        setComposeId(response.data.compose_id);
        setIsNewlyCreatedCompose(true);
        setComposeLoading(false);
        setIsFirstIframeLoad(true); // Reset flag for new compose session
        if (response?.data?.config?.viewport) {
          setSelectedViewport({ width: response?.data?.config?.viewport?.width, height: response?.data?.config?.viewport?.height });
        }
        else {
          setSelectedViewport({ width: 1366, height: 768 });
        }

        // Fetch live URLs for the new compose (skip for litmus_cloud)
        if (environment !== 'litmus_cloud') {
          try {
            const liveUrlsResponse = await getLiveUrlsAPI(token, response.data.compose_id);
            if (liveUrlsResponse.status === 200 && Array.isArray(liveUrlsResponse.data?.live_urls)) {
              const urls = liveUrlsResponse.data.live_urls.map((item: any) => ({
                title: item.title,
                url: item.url,
                live_url: item.live_url
              }));
              setAvailableLiveUrls(urls);
              setSelectedLiveUrlIndex(0); // Reset to first tab
            }
          } catch (error) {
            console.error('Failed to fetch live URLs:', error);
          }
        } else {
          // Clear live URLs and live_url for litmus_cloud environment
          setAvailableLiveUrls([]);
          setSelectedLiveUrlIndex(0);
          setInitCompose((prev: any) => ({
            ...prev,
            live_url: null
          }));
        }



        // Set flag to delete compose on unmount for newly created composes
        shouldDeleteOnUnmount.current = true;
        // The useEffect will automatically trigger runCompose when composeId is set
      }
      else {
        messageApi.error(extractErrorMessage(response) || "There was an error creating the test");
        setComposeLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setComposeLoading(false);
    }
  }

  const getComposeStatus = async () => {
    if (!composeId || !currentPollingInstructionId) return;

    // Check if the current instruction already has a success status
    // If so, move to the next instruction without polling
    const currentInstruction = instructions.find(instr => instr.id === currentPollingInstructionId);
    if (currentInstruction && (currentInstruction.status === 'success' || currentInstruction?.status === 'failed')) {
      // Move to the next instruction
      const currentIndex = instructions.findIndex(instr => instr.id === currentPollingInstructionId);
      if (currentIndex !== -1 && currentIndex < instructions.length - 1) {
        const nextInstruction = instructions[currentIndex + 1];
        setCurrentPollingInstructionId(nextInstruction.id);
        return; // Return early, the interval will handle the next poll
      } else {
        // This was the last instruction, complete the compose mode
        completeComposeMode();
        stopPolling();
        return;
      }
    }

    const token = await getToken({ template: "basic" });
    if (!token) return;

    try {
      const response = await getComposeAPI(token, composeId, currentPollingInstructionId);
      if (response.status === 200) {
        const result = response.data.result;

        // Handle array response format
        const instructionResult = Array.isArray(result) ? result[0] : result;

        // Check if the response contains an error
        if (instructionResult.error) {
          messageApi.error(instructionResult.error);
          // Stop polling on error
          updateComposeModeStatus({
            isActive: true,
            status: 'failed',
            endTime: new Date()
          });
          // stopPolling();
          return;
        }

        // Update the specific instruction with the status
        setInstructions(prev => prev.map((instr) => {
          if (instr.id === currentPollingInstructionId) {
            // Check if this instruction has element_id
            if (typeof instr.value === 'object' && instr.value.element_id) {
              // For instructions with element_id, only update the status
              return {
                ...instr,
                status: instructionResult.status
              };
            }
            // For other instructions, update everything
            return {
              ...instr,
              status: instructionResult.status,
              playwright_actions: instructionResult.playwright_actions && instructionResult.playwright_actions.length > 0
                ? instructionResult.playwright_actions
                : instr.playwright_actions || [],
              selectors: instructionResult.selectors || instr.selectors || []
            };
          }
          return instr;
        }));

        // Current instruction index is now handled by useEffect

        // Handle the status response
        if (instructionResult.status === 'success' || instructionResult.status === 'failed') {
          // Use ref to get the latest instructions state for finding next instruction
          const latestInstructions = latestInstructionsRef.current;
          const currentIndex = latestInstructions.findIndex(instr => instr.id === currentPollingInstructionId);
          if (currentIndex !== -1 && currentIndex < latestInstructions.length - 1) {
            // Move to the next instruction
            const nextInstruction = latestInstructions[currentIndex + 1];
            setCurrentPollingInstructionId(nextInstruction.id);
            // Continue polling with the new instruction ID (interval will handle it)
          } else {
            // This was the last instruction, complete the compose mode
            completeComposeMode();
            stopPolling();
          }
        }
        // else if (instructionResult.status === 'failed') {
        //   // Stop polling on failure
        //   updateComposeModeStatus({
        //     isActive: true,
        //     status: 'failed',
        //     endTime: new Date()
        //   });
        //  // stopPolling();
        // } 
        else if (instructionResult.status === 'running' || instructionResult.status === 'pending') {
          // Continue polling the same instruction
          updateComposeModeStatus({ status: 'running' });
          // The interval will continue polling automatically
        }
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error) || 'Failed to get compose status');
      stopPolling();
    }
  };

  const deleteComposeMutation = useMutation({
    mutationKey: ['deleteCompose'],
    mutationFn: async (actionType: 'stop' | 'discard' = 'discard') => {
      const token = await getToken({ template: "basic" });
      if (!token) router.push("/sign-in");
      // Stop compose mode if it's currently running
      if (composeModeStatus.isActive) {
        stopComposeMode();
      }
      const response = await deleteComposeAPI(token, composeId);
      if (response.status !== 200) {
        setShowDeleteModal(false);
        throw new Error(response.data?.message);
      }
      return { response, actionType };
    },
    onSuccess: (data) => {
      const { response, actionType } = data;

      if (actionType === 'stop') {
        messageApi.success("Test run stopped successfully");

        // Close websocket connection if open
        disconnectWebSocket();
        clearImage();

        // Clear compose-related states but keep instructions and Playwright actions
        setInitCompose(null);
        setIsNewlyCreatedCompose(false);
        setComposeId(''); // Clear composeId to prevent log stream recreation
        logStreamStarted.current = ''; // Reset log stream tracking
        stopLogStream();

        // Reset compose mode status
        updateComposeModeStatus({
          isActive: false,
          status: 'stopped',
          startTime: undefined,
          endTime: undefined,
          currentInstruction: undefined,
          totalInstructions: 0
        });

        // Stop status polling
        stopPolling();

        // Reset sequential polling state
        setCurrentPollingInstructionId(instructions[0].id);

        // Goal-related states cleared by GoalMode component
      } else {
        messageApi.success("Compose session deleted successfully");
        setShowDeleteModal(false);

        // Close websocket connection if open
        disconnectWebSocket();
        clearImage();

        // Clear compose-related states

        setInitCompose(null);
        setLogs([]);
        setIsNewlyCreatedCompose(false);
        setComposeId(''); // Clear composeId to prevent log stream recreation
        logStreamStarted.current = ''; // Reset log stream tracking
        stopLogStream();

        // Reset compose mode status
        updateComposeModeStatus({
          isActive: false,
          status: 'stopped',
          startTime: undefined,
          endTime: undefined,
          currentInstruction: undefined,
          totalInstructions: 0
        });


        // Stop status polling
        stopPolling();

        // Reset sequential polling state
        setCurrentPollingInstructionId(instructions[0].id);

        // Goal-related states cleared by GoalMode component

        if (!test_id && suite_id) {
          router.push(`/dashboard/suite/${suite_id}`);
        } else if (test_id) {
          router.push(`/dashboard/suite/${suite_id}/test/${test_id}`);
        } else {
          window.location.reload();
        }
      }
      //    // Update local state
      // updateComposeModeStatus({
      //   isActive: true,
      //   status: 'stopped',
      //   endTime: new Date()
      // });
    },
    onError: (error: any) => {
      setShowDeleteModal(false);
      messageApi.error(extractErrorMessage(error) || "There was an error deleting the compose session");
    }
  });



  // Reset compose mode status when composeId changes
  useEffect(() => {

    // Fetch live URLs when composeId is available

    if (composeId)
      fetchLiveUrls();

  }, [composeId]);

  // Cleanup websocket on unmount (handled by useWebSocketStream hook)

  useEffect(() => {
    // Get URL from query parameter
    const urlToUse = urlFromQuery ? decodeURIComponent(urlFromQuery) : '';

    // If URL is provided from query or it's a new test (no test_id), set it as first instruction
    if ((!test_id || urlToUse) && urlToUse) {
      const firstInstruction = instructions[0];
      const currentUrl = typeof firstInstruction?.value === 'object' && firstInstruction?.value?.action === 'go_to_url'
        ? firstInstruction.value.args?.[0]?.value
        : null;

      // Only update if URL is different or no instruction exists
      if (currentUrl !== urlToUse || !instructions.length) {
        setInstructions([
          {
            id: uuidv4(),
            value: {
              type: 'Non-AI',
              action: 'go_to_url',
              args: [{
                key: 'url',
                value: urlToUse
              }]
            },
            playwright_actions: []
          }
        ]);
      }
    }

  }, [test_id, urlFromQuery]);

  useEffect(() => {
    const fetchInstructions = async () => {
      // If it's a new test (no test_id), we don't need to fetch instructions
      if (!test_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = await getToken({ template: "basic" });
        if (!token) router.push("/sign-in");
        const response = await getTestAPI(token, test_id ?? '');
        if (response.status === 200 && Array.isArray(response.data.instructions)) {
          const formatted: InstructionObj[] = response.data.instructions.map((instruction: any, idx: number) => {
            // If it's already a structured instruction, keep it as is
            if (instruction && typeof instruction === 'object' && 'action' in instruction) {
              return {
                id: generateInstructionId(instruction),
                value: instruction,
                playwright_actions: instruction.playwright_actions || [],
                selectors: instruction.selectors || []
              };
            }
            // If it's a string, convert to run_script
            if (typeof instruction === 'string') {
              return {
                id: generateInstructionId(),
                value: {
                  type: 'Non-AI',
                  action: 'run_script',
                  args: [{
                    key: 'description',
                    value: instruction
                  }]
                },
                playwright_actions: [],
                selectors: []
              };
            }
            return {
              id: generateInstructionId(instruction),
              value: instruction,
              playwright_actions: instruction.playwright_actions || [],
              selectors: instruction.selectors || []
            };
          });

          setInstructions(formatted);
          setTestName(response.data.name);

          // Store has_test_data from the test response
          setHasTestData(response.data.has_test_data === true);

          // Handle test data settings
          if (response.data.has_test_data === true && response.data.file_id) {
            setUseTestData(true);
            setSelectedTestDataFile(response.data.file_id);
            // Fetch the file details to populate the dropdown
            fetchTestDataFiles();
          }
        } else {
          setInstructions([]);
        }
      } catch (e) {
        setInstructions([]);
      }
      setLoading(false);
    };

    // Call fetchInstructions for all cases, not just when test_id exists
    fetchInstructions();
  }, [test_id]);

  useEffect(() => {
    if (suite_id) getTestSuite();
  }, [suite_id]);

  // Fetch elements when suite_id is available
  useEffect(() => {
    const fetchElements = async () => {
      if (!suite_id || !getToken) return;

      try {
        setElementsLoading(true);
        const token = await getToken({ template: 'basic' });
        const response = await getElementsAPI(token, suite_id);
        // Parse the JSON string response
        const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        setElements(parsedData.elements || []);
      } catch (error) {
        console.error('Error fetching elements:', error);
        messageApi.error('Failed to fetch elements');
      } finally {
        setElementsLoading(false);
      }
    };

    fetchElements();
  }, [suite_id, getToken]);

  // Check if user has @finigami.com email
  useEffect(() => {
    const email = currentUserDetails?.email;
    if (typeof email === "string" && email.length > 0) {
      if (email.includes("@finigami.com")) {
        setIsFinigamiUser(true);
      }
      setUserCheckComplete(true);
    }
  }, [currentUserDetails]);

  // Set loading to false immediately for new tests (no test_id)
  useEffect(() => {
    // For new tests, show the page immediately
    if (!test_id) {
      setLoading(false);
    }
  }, [test_id]);

  // Trigger runCompose when composeId is available and it's a newly created compose
  useEffect(() => {
    if (composeId && isNewlyCreatedCompose) {
      runCompose(true, false);
      setIsNewlyCreatedCompose(false); // Reset the flag after triggering
    }
  }, [composeId, isNewlyCreatedCompose]);

  // Auto-create and start compose session when URL is provided from query parameter
  useEffect(() => {
    const autoStartCompose = async () => {
      // Only auto-start if:
      // 1. URL is provided from query
      // 2. We have instructions (with the URL)
      // 3. Compose session doesn't exist yet
      // 4. Not already loading/composing
      // 5. Not previously auto-started (to prevent restart after discard)
      if (urlFromQuery && instructions.length > 0 && !composeId && !composeLoading && !loading && !isAutoStartedFromQuery.current) {
        const urlToUse = decodeURIComponent(urlFromQuery);
        // Verify the instruction matches the URL
        const firstInstruction = instructions[0];
        if (firstInstruction &&
          typeof firstInstruction.value === 'object' &&
          'action' in firstInstruction.value &&
          firstInstruction.value.action === 'go_to_url' &&
          firstInstruction.value.args?.[0]?.value === urlToUse) {
          // Create compose session
          const environment = composeConfig?.environment as 'browserbase' | 'litmus_cloud';
          const configPayload = {
            browser: composeConfig.browser,
            device: {
              type: composeConfig.device,
              device_config: {
                os: composeConfig.os,
              }
            },
            viewport: {
              width: composeConfig.viewport.split('x')[0],
              height: composeConfig.viewport.split('x')[1]
            }
          };
          await createCompose(environment || 'browserbase', configPayload);
          // Mark as auto-started from query after successful creation
          isAutoStartedFromQuery.current = true;
        }
      }
    };

    autoStartCompose();
  }, [urlFromQuery, instructions, composeId, composeLoading, loading, composeConfig]);

  // Cleanup goal status polling on unmount
  useEffect(() => {
    return () => {
      // React Query handles cleanup automatically
      // Reset log stream tracking on unmount
      logStreamStarted.current = '';
    };
  }, []);

  // Set up beforeunload event listener and cleanup
  useEffect(() => {
    // Set up beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function for component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Delete compose on unmount if needed
      if (composeId && shouldDeleteOnUnmount.current) {
        deleteComposeMutation.mutate('discard');
      }
    };
  }, []);



  // Handle polling when compose mode becomes active
  useEffect(() => {

    if (composeModeStatus.isActive && composeModeStatus.status === 'running' && currentPollingInstructionId && instructions.length > 0) {
      // Start polling the current instruction
      startPolling();
    }
  }, [composeModeStatus.isActive, composeModeStatus.status, currentPollingInstructionId, instructions.length]);

  // Update current instruction index when polling instruction changes
  useEffect(() => {
    if (currentPollingInstructionId && instructions.length > 0) {
      const currentInstructionIndex = instructions.findIndex(instr => instr.id === currentPollingInstructionId);
      if (currentInstructionIndex !== -1) {
        updateCurrentInstruction(currentInstructionIndex);
      }
    }
  }, [currentPollingInstructionId, instructions]);

  // Keep ref updated with latest instructions
  useEffect(() => {
    latestInstructionsRef.current = instructions;
  }, [instructions]);

  // Clear polling instruction ID when instructions are cleared or when current instruction is deleted
  useEffect(() => {
    if (instructions.length === 0) {
      setCurrentPollingInstructionId('');
    } else if (currentPollingInstructionId && !instructions.find(instr => instr.id === currentPollingInstructionId)) {
      // Current polling instruction was deleted, set to first available instruction
      setCurrentPollingInstructionId(instructions[0].id);
    }
  }, [instructions, currentPollingInstructionId]);

  // Fetch suite options for dropdown
  useEffect(() => {
    async function fetchSuites() {
      const token = await getToken({ template: "basic" });
      if (!token) return;
      try {
        // Use getTestSuitesAPI with a large limit to get all suites
        const res = await getTestSuitesAPI(token, 1, 10000);
        if (res?.data?.items) {
          setSuiteOptions(res.data.items.map((s: any) => ({ label: s.name, value: s.suite_id })));
        }
      } catch { }
    }
    if (showSaveModal && saveMode === 'existing') fetchSuites();
  }, [showSaveModal, saveMode]);

  const handleFinish = () => {
    // Show save modal for new tests (no test_id), otherwise save directly
    if (!test_id) {
      setShowSaveModal(true);
    } else {
      saveCompose();
    }
  };

  const handleModalSave = async () => {
    // If suite_id exists but no test_id, it's a new test within a suite
    if (suite_id && !test_id) {
      if (!saveTestName.trim()) {
        setSaveError('Please enter a test name');
        return;
      }
      setSaveError('');
      setSaveComposeLoading(true);

      try {
        const token = await getToken({ template: "basic" });
        if (!token) {
          router.push("/sign-in");
          return;
        }

        const payload = {
          suite_id: suite_id,
          suite_name: suiteName,
          name: saveTestName,
          custom_test_id: customTestId,
          instructions: formatInstructionsPayloadLocal(),
          has_test_data: useTestData,
          ...(useTestData && selectedTestDataFile && {
            file_id: selectedTestDataFile
          })
        };

        const response = await createTestComposeAPI(token, composeId, payload);

        if (response.status === 200) {
          // Update hasTestData state based on current useTestData setting
          setHasTestData(useTestData && !!selectedTestDataFile);
          messageApi.success("Test saved successfully");
          setShowSaveModal(false);
          // Don't delete compose on unmount after successful save
          shouldDeleteOnUnmount.current = false;

          // Update the URL to reflect the new test ID
          router.replace(`/dashboard/suite/${response.data.suite_id}/test/${response.data.id}/compose`);
        } else {
          messageApi.error("Failed to save test");
        }
      } catch (error: any) {
        messageApi.error(extractErrorMessage(error) || "There was an error saving the test");
      } finally {
        setSaveComposeLoading(false);
      }
    } else {
      if (saveMode === 'existing' && !selectedSuite) {
        setSaveError('Please select a suite');
        return;
      }
      if (saveMode === 'new' && !newSuiteName.trim()) {
        setSaveError('Please enter a suite name');
        return;
      }
      if (!saveTestName.trim()) {
        setSaveError('Please enter a test name');
        return;
      }
      setSaveError('');
      setSaveComposeLoading(true);

      try {
        const token = await getToken({ template: "basic" });
        if (!token) {
          router.push("/sign-in");
          return;
        }

        const payload = {
          suite_id: saveMode === 'existing' ? selectedSuite : null,
          suite_name: saveMode === 'existing' ? suiteOptions.find(s => s.value === selectedSuite)?.label : newSuiteName,
          name: saveTestName,
          custom_test_id: customTestId,
          kill_compose_session: true,
          instructions: formatInstructionsPayloadLocal(),
          has_test_data: useTestData,
          ...(useTestData && selectedTestDataFile && {
            file_id: selectedTestDataFile
          })
        };

        const response = await createTestComposeAPI(token, composeId, payload);

        if (response.status === 200) {
          // Update hasTestData state based on current useTestData setting
          setHasTestData(useTestData && !!selectedTestDataFile);
          messageApi.success("Test saved successfully");
          setShowSaveModal(false);
          // Don't delete compose on unmount after successful save
          shouldDeleteOnUnmount.current = false;

          // If it was a new test (no test_id), update the URL to reflect the new test ID
          if (!test_id) {
            router.replace(`/dashboard/suite/${response.data.suite_id}/test/${response.data.id}/compose`);
          }
        } else {
          messageApi.error("Failed to save test");
        }
      } catch (error: any) {
        messageApi.error(extractErrorMessage(error) || "There was an error saving the test");
      } finally {
        setSaveComposeLoading(false);
      }
    }
  };




  // Wrapper function for formatInstructionValue with component dependencies
  const formatInstructionValueLocal = (value: InstructionObj['value'], instruction?: InstructionObj): React.ReactNode => {
    return formatInstructionValue({
      value,
      instruction,
      actions,
      suite_id,
      onViewSegment: handleViewSegment,
      onShowSelectors: handleShowSelectors
    });
  };

  const handleStopCompose = async () => {
    if (composeModeStatus.isActive) {
      await stopComposeMode();
    }

    deleteComposeMutation.mutate('stop');
  }

  const handleCancel = () => {
    setShowDeleteModal(true);
  }

  // handleAcceptInstructions and handleRejectInstructions moved to GoalMode component

  const handleShowSelectors = (selectors: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>, playwrightActions: string[] = [], instructionId?: string) => {
    if (!instructionId) return;

    const instruction = instructions.find(instr => instr.id === instructionId);
    if (!instruction) return;

    // Check if this is a store element by checking if element_id exists
    if (typeof instruction.value !== 'string' && instruction.value.element_id) {
      setCurrentStoreElement(String(instruction.value.element_id));
      setShowStoreElementModal(true);
      return;
    }

    // Regular selector handling
    setCurrentSelectors(selectors);
    setCurrentInstructionId(instructionId);

    // Find the currently selected selector index
    if (playwrightActions && playwrightActions.length > 0 && selectors.length > 0) {
      const currentScript = playwrightActions[0];
      const currentIndex = selectors.findIndex(selector =>
        selector.script === currentScript
      );
      setSelectedSelectorIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      setSelectedSelectorIndex(0);
    }

    setShowSelectorsModal(true);
  };

  const handleGoToStore = () => {
    setShowStoreElementModal(false);
    window.open(`/dashboard/suite/${suite_id}?tab=10`, '_blank');
  };

  const handleSelectorSelect = (index: number) => {
    setSelectedSelectorIndex(index);
  };

  const handleSaveSelector = () => {
    if (currentInstructionId && currentSelectors.length > 0) {
      const selectedScript = currentSelectors[selectedSelectorIndex].script;
      setInstructions(prev => prev.map(instr => {
        if (instr.id === currentInstructionId) {
          return {
            ...instr,
            playwright_actions: [selectedScript]
          };
        }
        return instr;
      }));

      messageApi.success("Selector updated successfully");
      setShowSelectorsModal(false);
    }
  }

  const [saveToStoreLoading, setSaveToStoreLoading] = useState(false);
  const [createStoreLoading, setCreateStoreLoading] = useState(false);

  const handleCreateStore = async (data: { store_name: string; store_description?: string }) => {
    try {
      setCreateStoreLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token || !suite_id) {
        messageApi.error("Authentication required");
        return;
      }

      const payload = {
        store_name: data.store_name,
        store_description: data.store_description || undefined,
        suite_id: suite_id,
      };

      await createStoreAPI(token, suite_id, payload);
      messageApi.success("Store created successfully");

      // Refresh the stores list
      await fetchStores();
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setCreateStoreLoading(false);
    }
  };

  const handleSaveToStore = async (data: {
    type: 'new' | 'update';
    name: string;
    description: string;
    store: string;
    elementToUpdate?: string;
  }) => {
    setSaveToStoreLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token || !suite_id) {
        setSaveToStoreLoading(false);
        return;
      }

      const instruction = instructions.find(instr => instr.id === currentInstructionId);
      if (!instruction) return;

      if (data.type === 'new' && currentInstructionId && currentSelectors.length > 0) {
        // Create new element
        const payload = {
          element_id: data.name,
          element_description: data.description,
          element_prompt: typeof instruction.value === 'string' ? instruction.value : instruction.value.prompt || '',
          store_name: data.store || undefined,
          selectors: currentSelectors.map(selector => ({
            display: selector.display,
            method: selector.method,
            selector: selector.selector
          }))
        };

        await createElementAPI(token, suite_id, payload);
        messageApi.success("Element created successfully");

        // Update the current instruction to use this element
        setInstructions(prev => prev.map(instr => {
          if (instr.id === currentInstructionId) {
            const baseInstruction = typeof instr.value === 'string' ? {
              type: 'AI',
              action: 'ai_click',
              args: [],
              prompt: instr.value
            } : instr.value;

            return {
              ...instr,
              value: {
                ...baseInstruction,
                element_id: data.name,
                // Remove prompt when element_id is set
                prompt: undefined
              },
              // Remove playwright_actions and selectors when element is saved
              playwright_actions: undefined,
              selectors: undefined
            };
          }
          return instr;
        }));

        // Refresh elements list
        const newToken = await getToken({ template: "basic" });
        if (newToken && suite_id) {
          try {
            const response = await getElementsAPI(newToken, suite_id);
            // Parse the JSON string response
            const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setElements(parsedData.elements || []);
          } catch (error) {
            console.error('Error fetching elements:', error);
            messageApi.error('Failed to fetch elements');
          }
        }
      } else if (data.type === 'update' && data.elementToUpdate && currentSelectors.length > 0) {
        // Update existing element
        const payload = {
          element_id: data.elementToUpdate,
          element_description: data.description,
          element_prompt: typeof instruction.value === 'string' ? instruction.value : instruction.value.prompt || '',
          store_name: data.store || undefined,
          selectors: currentSelectors.map(selector => ({
            display: selector.display,
            method: selector.method,
            selector: selector.selector
          }))
        };

        await updateElementAPI(token, suite_id, data.elementToUpdate, payload);
        messageApi.success("Element updated successfully");

        // Update the current instruction to use this element
        setInstructions(prev => prev.map(instr => {
          if (instr.id === currentInstructionId) {
            const baseInstruction = typeof instr.value === 'string' ? {
              type: 'AI',
              action: 'ai_click',
              args: [],
              prompt: instr.value
            } : instr.value;

            return {
              ...instr,
              value: {
                ...baseInstruction,
                element_id: data.elementToUpdate,
                // Remove prompt when element_id is set
                prompt: undefined
              },
              // Remove playwright_actions and selectors when element is saved
              playwright_actions: undefined,
              selectors: undefined
            };
          }
          return instr;
        }));

        // Refresh elements list
        const newToken = await getToken({ template: "basic" });
        if (newToken && suite_id) {
          try {
            const response = await getElementsAPI(newToken, suite_id);
            // Parse the JSON string response
            const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setElements(parsedData.elements || []);
          } catch (error) {
            console.error('Error fetching elements:', error);
            messageApi.error('Failed to fetch elements');
          }
        }
      }

      setShowSaveToStoreModal(false);
      setShowSelectorsModal(false);

      // Close the modal and reset state only on success
      setShowSelectorsModal(false);
      setCurrentInstructionId(null);
      setCurrentSelectors([]);
      setSelectedSelectorIndex(0);
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSaveToStoreLoading(false);
    }
  };

  // handleCreateGoal moved to GoalMode component

  const handleViewSegment = async (segmentId: string) => {
    setViewSegmentModalId(segmentId);
    setIsViewSegmentModalOpen(true);
  };

  // Function to handle page unload/back button
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (composeId && shouldDeleteOnUnmount.current) {
      // Use sendBeacon for reliable API call during page unload
      try {
        const payload = JSON.stringify({ compose_id: composeId });
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}/api/compose/delete`,
          payload
        );
      } catch (error) {
        console.error('Error deleting compose on unload:', error);
      }
    }
  };

  useEffect(() => {
    if (instructions.length === 0) {
      handleActionSelect('go_to_url');
    } else {
      setSelectedAction('');
    }
  }, [instructions.length]);

  // Handle scroll detection for gradient overlay
  useEffect(() => {
    const container = instructionsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollable = scrollHeight > clientHeight;
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 1; // 1px tolerance

      setShowGradientOverlay(isScrollable && !isScrolledToBottom);
    };

    const handleResize = () => {
      setTimeout(handleScroll, 100); // Small delay to ensure DOM is updated
    };

    // Add event listeners
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Only run once on mount

  // Check scroll state when instructions change
  useEffect(() => {
    const container = instructionsContainerRef.current;
    if (!container) return;

    // Small delay to ensure DOM is updated after instructions change
    const timeoutId = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollable = scrollHeight > clientHeight;
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 1;

      setShowGradientOverlay(isScrollable && !isScrolledToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [instructions.length]);

  useEffect(() => {
    if (
      instructions.length > 0 &&
      !currentPollingInstructionId
    ) {
      setCurrentPollingInstructionId(instructions[0].id);

    }
  }, [instructions, currentPollingInstructionId]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-select-selection-item .select-option-url {
          display: none;
        }
      `}} />

      {contextHolder}

      {/*Show loading state until the get test API and user check is complete */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin />
        </div>
      ) : (
        <>
          <div className="flex flex-col w-full bg-white pl-1 pt-2 pr-4 h-screen">
            {/* Main Content Area */}
            <div className="flex flex-1 gap-4 w-full h-full">
              {/* Left Main Content */}

              <div className="flex flex-col w-[460px] h-[calc(100vh-120px)]">

                <div className='flex justify-between mb-2 items-center w-[450px] flex-shrink-0'>

                  <Link className="hover:!bg-white text-[19px] ml-4 font-hanken font-normal" href={`/dashboard/suite/${suite_id}/test/${test_id}`}>{testName ? testName : 'Untitled Test'}</Link>
                  {/* {params.mode==='new' ? 'Untitled Suite' : suiteName} / {params.mode==='new' ? 'Untitled Test' : testName} */}


                  <div className='flex gap-2 items-center'>
                    {/* Add close and save button */}
                    <Tooltip title="Settings">
                      <Button
                        type="text"
                        icon={<Image src="/assets/settings-icon.svg" width={20} height={20} alt="settings" />}
                        onClick={() => {
                          setShowSettingsModal(true);
                          if (useTestData) {
                            fetchTestDataFiles();
                          }
                        }}
                        className="!text-[#AE00FF] hover:!border-[#AE00FF] hover:!bg-white !border-2 !border-[#DD94FF]"
                        data-testid="compose-settings-button"
                      />
                    </Tooltip>
                    <Button
                      type="primary"
                      className="!bg-white hover:!border-[#AE00FF] !border-2 !border-[#DD94FF] !text-black"
                      onClick={handleCancel}
                      data-testid="compose-close-button"
                    >Close</Button>
                    <RoleBasedButton
                      type="primary"
                      className="!bg-[#AE00FF] !border-2 !border-[#AE00FF] !text-white"
                      loading={!showSaveModal && saveComposeLoading}
                      onClick={handleFinish}
                      data-testid="compose-save-button"
                    >Save</RoleBasedButton>

                  </div>
                </div>
                <div className="space-y-1 mb-2 flex-1 overflow-x-hidden overflow-y-auto relative" ref={instructionsContainerRef} data-testid="compose-instructions-container">
                  {instructions.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-40" data-testid="compose-no-instructions">
                      <p className="font-hanken mb-2 text-lg">No instructions</p>
                      <p className="font-hanken text-sm">Add instructions by selecting an action</p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="instructions-droppable" isDropDisabled={composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed'}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="pl-0" data-testid="compose-instructions-list">
                            {instructions.map((instr: InstructionObj, idx: number) => (
                              <React.Fragment key={instr.id}>
                                {/* Add instruction button - appears on hover between instructions */}
                                <div
                                  className="h-1 hover:h-6 transition-all duration-200 relative group cursor-pointer"
                                  onClick={() => handleAddInstructionBetween(idx)}
                                  data-testid="add-instruction-between"
                                >
                                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                    <div className="h-[2px] w-full bg-[#AE00FF] rounded-md flex items-center justify-center">
                                      <div className="border-2  border-[#AE00FF] bg-[#AE00FF] rounded-md p-1 w-6 h-6 flex items-center justify-center">
                                        <Image src="/assets/plus-icon.svg" width={14} height={14} alt="plus" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Draggable
                                  key={instr.id}
                                  draggableId={`instruction-${instr.id}`}
                                  index={idx}
                                  isDragDisabled={composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed'}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-start p-1 justify-between mb-1 mt-1 pl-0 group"
                                      data-testid="instruction"
                                    >
                                      {/* Left vertical button stack - only visible on hover */}
                                      <div className="flex flex-col items-center mr-1 mt-3 space-y-1 pl-0 opacity-0 group-hover:opacity-100 transition-opacity" data-testid="instruction-actions">
                                        <Tooltip placement="right" title={(composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed') ? "Stop the run to perform this action" : "Drag to reorder"}>
                                          <span
                                            {...provided.dragHandleProps}
                                            className={`${(composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed')
                                              ? 'cursor-not-allowed'
                                              : 'cursor-move'
                                              }`}
                                            onClick={(composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed') ? (e) => e.preventDefault() : undefined}
                                            data-testid="instruction-drag-handle"
                                          >
                                            <Image src="/assets/drag.svg" alt="drag" width={15} height={15} style={{ width: '15px', height: '15px' }} />
                                          </span>
                                        </Tooltip>
                                      </div>
                                      {/* Instruction content or edit mode */}
                                      <div className="flex-1 flex flex-col space-y-1">
                                        {editingId === instr.id ? (
                                          <div className="flex flex-col gap-2">
                                            <ActionEditor
                                              selectedAction={editSelectedAction}
                                              onActionSelect={handleEditActionSelect}
                                              instructionArgs={editInstructionArgs}
                                              onArgChange={handleEditArgChange}
                                              validationErrors={editValidationErrors}
                                              showValidationErrors={showEditValidationErrors}
                                              elementType={elementType}
                                              onElementTypeChange={setElementType}
                                              elements={elements}
                                              aiUse={editAiUse}
                                              onAiUseChange={setEditAiUse}
                                              selectedTestId={selectedTestId}
                                              selectedSegmentId={selectedSegmentId}
                                              onTestIdChange={setSelectedTestId}
                                              onSegmentIdChange={setSelectedSegmentId}
                                              availableTests={availableTests}
                                              availableSegments={availableSegments}
                                              testSearchQuery={testSearchQuery}
                                              onTestSearch={handleTestSearch}
                                              suiteTestsLoading={suiteTestsLoading}
                                              segmentsLoading={segmentsLoading}
                                              selectedFileId={selectedFileId}
                                              onFileIdChange={setSelectedFileId}
                                              availableFiles={availableFiles}
                                              filesLoading={filesLoading}
                                              availableLiveUrls={availableLiveUrls}
                                              liveUrlsLoading={liveUrlsLoading}
                                              onLiveUrlsFetch={fetchLiveUrls}
                                              supportedUrlPatterns={supportedUrlPatterns}
                                              isEditMode={true}
                                            />
                                            <div className="flex mt-2 space-x-2">
                                              <Button type="primary" size="small" onClick={handleSaveEdit} data-testid="edit-instruction-save-button">Save</Button>
                                              <Button size="small" onClick={handleCancelEdit} data-testid="edit-instruction-cancel-button">Cancel</Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-start">
                                            <div className="group">
                                              <InstructionDisplay
                                                instruction={instr}
                                                suite_id={suite_id || undefined}
                                                showMenu={true}
                                                onEdit={handleEditInstruction}
                                                onDelete={handleDeleteInstruction}
                                                onViewSegment={handleViewSegment}
                                                onShowSelectors={handleShowSelectors}
                                                menuDisabled={composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed'}
                                                openDropdownId={openDropdownId ?? undefined}
                                                onDropdownOpenChange={(open) => {
                                                  if (open) {
                                                    setOpenDropdownId(instr.id);
                                                  } else {
                                                    setOpenDropdownId(null);
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              </React.Fragment>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}

                  {/* Goal Mode Provider - wraps goal-related components to share state */}
                  <GoalModeProvider
                    composeId={composeId}
                    composeModeStatus={composeModeStatus}
                    instructions={instructions}
                    suite_id={suite_id}
                    onInstructionsUpdate={setInstructions}
                    formatInstructionValueLocal={formatInstructionValueLocal}
                  >
                    {/* Goal Instructions Display - only shown when generating, appears before add icon */}
                    <GoalInstructionsDisplay />

                    {/* Add Instruction Input */}
                  <div className="flex flex-col gap-4 flex-shrink-0 ml-5 mr-2" data-testid="compose-add-instruction-form">
                    <div className="flex flex-col gap-2" data-testid="compose-instruction-form-container">
                      <ActionEditor
                        selectedAction={selectedAction}
                        onActionSelect={handleActionSelect}
                        instructionArgs={instructionArgs}
                        onArgChange={handleArgChange}
                              validationErrors={validationErrors}
                              showValidationErrors={showValidationErrors}
                        elementType={elementType}
                        onElementTypeChange={setElementType}
                        elements={elements}
                        aiUse={aiUse}
                        onAiUseChange={setAiUse}
                        selectedTestId={selectedTestId}
                        selectedSegmentId={selectedSegmentId}
                        onTestIdChange={setSelectedTestId}
                        onSegmentIdChange={setSelectedSegmentId}
                        availableTests={availableTests}
                        availableSegments={availableSegments}
                        testSearchQuery={testSearchQuery}
                        onTestSearch={handleTestSearch}
                        suiteTestsLoading={suiteTestsLoading}
                        segmentsLoading={segmentsLoading}
                        selectedFileId={selectedFileId}
                        onFileIdChange={setSelectedFileId}
                        availableFiles={availableFiles}
                        filesLoading={filesLoading}
                        availableLiveUrls={availableLiveUrls}
                        liveUrlsLoading={liveUrlsLoading}
                        onLiveUrlsFetch={fetchLiveUrls}
                        supportedUrlPatterns={supportedUrlPatterns}
                      />
                      {/* Add Button - only show when instruction is selected */}
                      {selectedAction && (
                          <div className="flex items-center justify-end gap-2" data-testid="compose-form-buttons">
                            <Button className="!bg-white !border-2 !border-[#EA3962] !text-black w-[80px]" onClick={() => setSelectedAction('')} data-testid="compose-form-cancel-button">Cancel</Button>
                            <Button
                              type="primary"
                              className="!bg-[#AE00FF] !border-2 !border-[#AE00FF] w-[80px] !text-white "
                              onClick={handleAddAndRun}
                              data-testid="compose-form-add-button"
                            >
                              Add
                            </Button>
                          </div>
                      )}
                    </div>

                    {/* Goal Input - always shown after the add icon */}
                    <GoalInput />
                  </div>
                  </GoalModeProvider>

                  </div>
                </div>
              {/* Right Side Instructions Bar */}
              <div className="flex-1 flex flex-col gap-2">
                {(composeModeStatus?.status === 'idle' || composeModeStatus?.status === 'stopped') && (
                  <div className="text-[16px] mt-2 mb-2">
                    Browser is off.
                  </div>
                )}
                {composeModeStatus?.status !== 'idle' && composeModeStatus?.status !== 'stopped' && <div className='flex gap-2 items-center justify-end'>
                  {isFinigamiUser && (
                    <div className="flex items-center gap-4 mr-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getCurrentEnvironment(composeConfig)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{getCurrentViewport().width} × {getCurrentViewport().height}</span>
                      </div>
                    </div>
                  )}
                  <Button
                    type="primary"
                    onClick={handleStopCompose}
                    loading={deleteComposeMutation.isPending}
                    className='!bg-white !border-2 !border-[#EA3962] !text-black'
                  >
                    Stop
                  </Button>
                  {/* <Button
                    type="primary"
                    className="!bg-[#AE00FF] !border-2 !border-[#AE00FF] !text-white"
                    onClick={() => runCompose(true, false)}
                  >
                    Rerun
                  </Button> */}
                </div>}
                <div className="flex-1 border relative rounded-lg flex flex-col">
                  {/* Tabs Dropdown */}
                  {composeId && availableLiveUrls.length > 0 &&(
                    <div className="flex items-center justify-end border-b bg-gray-50">

                      <div className="flex items-center">
                        <Tooltip title="Refresh URLs">
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            loading={liveUrlsLoading}
                            onClick={async () => {
                              if (composeId) {
                                setLiveUrlsLoading(true);
                                try {
                                  const token = await getToken({ template: "basic" });
                                  if (token) {
                                    const liveUrlsResponse = await getLiveUrlsAPI(token, composeId);
                                    if (liveUrlsResponse.status === 200 && Array.isArray(liveUrlsResponse.data?.live_urls)) {
                                      const urls = liveUrlsResponse.data.live_urls.map((item: any) => ({
                                        title: item.title,
                                        url: item.url,
                                        live_url: item.live_url
                                      }));
                                      setAvailableLiveUrls(urls);
                                      setSelectedLiveUrlIndex(0);
                                    }
                                  }
                                } catch (error) {
                                  console.error('Failed to refresh live URLs:', error);
                                } finally {
                                  setLiveUrlsLoading(false);
                                }
                              }
                            }}
                            className="flex items-center justify-center w-8 h-8 p-0 border border-gray-300 rounded-md rounded-r-none rounded-bl-none hover:bg-gray-50"
                          />
                        </Tooltip>


                        <Dropdown
                          menu={{
                            items: availableLiveUrls.map((item, index) => ({
                              key: index.toString(),
                              label: (
                                <div className="flex flex-col py-1">
                                  <span className="font-medium text-sm">{item.title}</span>
                                  <span className="text-xs text-gray-500 truncate max-w-[250px]">{item.url}</span>
                                </div>
                              ),
                              onClick: () => handleLiveUrlChange(index)
                            }))
                          }}
                          trigger={["click"]}
                        >
                          <Button
                            type="text"
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md rounded-l-none rounded-br-none px-3 py-1"
                          >
                            <span className="font-medium">
                              {availableLiveUrls[selectedLiveUrlIndex]?.title || 'Select Tab'}
                            </span>
                            <DownOutlined className="text-xs" />
                          </Button>
                        </Dropdown>

                      </div>
                    </div>
                  )}

                  <div className="flex-1 relative flex items-center justify-center p-2 overflow-hidden" data-testid="compose-viewport-container">
                    {/* Render iframe for browserbase environment */}
                    {(availableLiveUrls[selectedLiveUrlIndex]?.live_url || initCompose?.live_url) && composeModeStatus.status !== 'stopped' && composeConfig?.environment !== 'litmus_cloud' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full max-w-full max-h-full" data-testid="compose-iframe-wrapper">
                        {/* Device frame for mobile viewports */}
                        {(
                          <div className="relative flex items-center justify-center max-w-full max-h-full" data-testid="compose-device-frame">
                            {/* Phone frame */}
                            <div className="relative rounded-[3rem]" data-testid="compose-phone-frame">
                              <div className="bg-white rounded-[2.5rem] overflow-hidden" style={getIframeContainerStyleLocal()} data-testid="compose-iframe-container">
                                <iframe
                                  onLoad={handleIframeLoad}
                                  src={availableLiveUrls[selectedLiveUrlIndex]?.live_url || initCompose?.live_url}
                                  className="w-full h-full"
                                  referrerPolicy="no-referrer"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    // pointerEvents: 'none',
                                    background: '#fff',
                                  }}
                                  title="Compose Session"
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                  data-testid="compose-iframe"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : composeConfig?.environment === 'litmus_cloud' && composeModeStatus.status !== 'stopped' && currentImage ? (
                      /* Render image stream for litmus cloud environment */
                      <div className="flex flex-col items-center justify-center w-full h-full max-w-full max-h-full" data-testid="compose-image-wrapper">
                        <div className="relative flex items-center justify-center max-w-full max-h-full" data-testid="compose-image-frame">
                          <div className="relative rounded-[3rem]" data-testid="compose-image-container">
                            <div className="bg-white rounded-[2.5rem] overflow-hidden" style={getIframeContainerStyleLocal()} data-testid="compose-image-display">
                              <img
                                src={currentImage}
                                alt="Compose Session Stream"
                                className="w-full h-full object-contain"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'block',
                                }}
                                data-testid="compose-stream-image"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <div className="text-gray-400 font-hanken">
                          {composeLoading || (composeConfig?.environment === 'litmus_cloud' && isWebSocketConnecting) ? (
                            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                              <Spin />
                            </div>
                          ) : (composeModeStatus.status === 'stopped' || composeModeStatus.status === 'idle') && (
                              <div className="flex">
                                <RoleBasedButton
                                  type="primary"
                                  className="font-hanken text-[14px] rounded-r-none rounded-[6px] border-r-0 hover:!bg-[#AE00FF] hover:!text-white  !bg-[#AE00FF] border-2 !text-white !border-[#AE00FF]"
                                  onClick={() => handleStartRun()}
                                  data-testid="compose-start-run-button"
                                >
                                  Start Run
                                </RoleBasedButton>
                                <div className="w-[2px] h-[32px] bg-white border-t-2 border-b-2 border-l-0 border-r-0 border-t-[#AE00FF] border-b-[#AE00FF] rounded-none"></div>
                                <div className="text-[14px] bg-[#AE00FF]  border-l-white rounded-r-[6px] text-white h-[32px] w-[32px] flex items-center justify-center px-2 border-l-0 border-[#AE00FF]">
                                  <Dropdown
                                    className="text-[14px] cursor-pointer flex items-center justify-center !rounded-[6px]"
                                    menu={{
                                      items: [
                                        {
                                          label: "Default config",
                                          key: "1",
                                          onClick: () => handleStartRun(),
                                        },
                                        {
                                          label: "Choose config",
                                          key: "2",
                                          onClick: () => setIsComposeConfigModalOpen(true),
                                        },
                                      ],
                                    }}
                                    trigger={["click"]}
                                  >

                                    <DownOutlined className="text-xs" />

                                  </Dropdown>
                                </div>
                              </div>
                            )
                          }
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Bottom Tabs Section */}
                  <div className="border-t px-4 pt-2 pb-4" data-testid="compose-tabs-container">
                    <Tabs
                      activeKey={activeTab}
                      onChange={setActiveTab}
                      items={tabItems}
                      tabBarGutter={32}
                      className="mb-2"
                      data-testid="compose-tabs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals - rendered outside the loading conditional but inside the main fragment */}
      <SaveModal
        open={showSaveModal}
        onCancel={() => setShowSaveModal(false)}
        onSave={handleModalSave}
        loading={saveComposeLoading}
        suiteId={suite_id}
        testId={test_id}
        saveMode={saveMode}
        onSaveModeChange={setSaveMode}
        selectedSuite={selectedSuite}
        onSuiteChange={setSelectedSuite}
        suiteOptions={suiteOptions}
        newSuiteName={newSuiteName}
        onNewSuiteNameChange={setNewSuiteName}
        saveTestName={saveTestName}
        onTestNameChange={setSaveTestName}
        customTestId={customTestId}
        onCustomTestIdChange={setCustomTestId}
        saveError={saveError}
      />

      <DeleteConfirmation
        id={composeId}
        handleCancel={() => setShowDeleteModal(false)}
        titleText="Close Session"
        open={showDeleteModal}
        buttonText="Close"
        confirmationText="Are you sure you want to close this session? Unsaved changes will be lost."
        handleDelete={() => {
          if (composeId) {
            deleteComposeMutation.mutate('discard')
          } else {
            setShowDeleteModal(false)
            if (!test_id && suite_id) {
              router.push(`/dashboard/suite/${suite_id}`);
            } else if (test_id) {
              router.push(`/dashboard/suite/${suite_id}/test/${test_id}`);
            } else {
              window.location.reload();
            }
          }
        }}
        loading={deleteComposeMutation.isPending}
        data-testid="compose-delete-confirmation-modal"
      />

      <SelectorsModal
        open={showSelectorsModal}
        onCancel={() => {
          setShowSelectorsModal(false);
          setCurrentInstructionId(null);
          setCurrentSelectors([]);
          setSelectedSelectorIndex(0);
        }}
        onSave={handleSaveSelector}
        onSaveToStore={() => setShowSaveToStoreModal(true)}
        selectors={currentSelectors}
        selectedIndex={selectedSelectorIndex}
        onSelect={handleSelectorSelect}
      />

      <ComposeConfigModal
        open={isComposeConfigModalOpen}
        onCancel={() => setIsComposeConfigModalOpen(false)}
        config={composeConfig}
        onConfigChange={(config) => setComposeConfig({ ...composeConfig, ...config })}
        onRun={(config) => {
          handleStartRun(config);
              setIsComposeConfigModalOpen(false);
            }}
      />

      <SettingsModal
        open={showSettingsModal}
        onCancel={() => setShowSettingsModal(false)}
        onSave={saveCompose}
        useTestData={useTestData}
        onUseTestDataChange={(checked) => {
                  setUseTestData(checked);
                  if (checked) {
                    fetchTestDataFiles();
                  }
                }}
        selectedTestDataFile={selectedTestDataFile}
        onTestDataFileChange={setSelectedTestDataFile}
        availableTestDataFiles={availableTestDataFiles}
        testDataFilesLoading={testDataFilesLoading}
        saveLoading={saveComposeLoading}
      />

      <SaveToStoreModal
        open={showSaveToStoreModal}
        onClose={() => setShowSaveToStoreModal(false)}
        onSave={handleSaveToStore}
        stores={(storesData?.stores || []).map(store => ({
          id: store.store_name,
          name: store.store_name
        }))}
        elements={elements.map((element) => ({
          id: element.element_id,
          name: element.element_id
        }))}
        onLoadStores={fetchStores}
        storesLoading={storesLoading}
        loading={saveToStoreLoading}
        createStoreLoading={createStoreLoading}
        onCreateStore={handleCreateStore}
      />

      <StoreElementModal
        open={showStoreElementModal}
        onCancel={() => {
          setShowStoreElementModal(false);
          setCurrentStoreElement('');
        }}
        onGoToStore={handleGoToStore}
        elementName={currentStoreElement}
      />
      {/* View Segment Modal */}
      <SegmentDetailsModal
        open={isViewSegmentModalOpen}
        onClose={() => {
          setIsViewSegmentModalOpen(false);
          setViewSegmentModalId(null);
        }}
        segmentId={viewSegmentModalId}
        suiteId={suite_id || null}
        getToken={getToken}
      />
    </>
  );
};

export default Compose;