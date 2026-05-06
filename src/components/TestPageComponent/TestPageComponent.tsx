"use client";
import {
  Spin,
  Table,
  message,
  Button,
  Input,
  Divider,
  Tabs,
  Dropdown,
  Upload,
  Tooltip,
  Switch,
  Modal,
  Radio,
  Select,
} from "antd";
import Link from "next/link";
import { actions } from "@/lib/constants/actions";
import { DeleteFilled, LeftOutlined, PlusOutlined, UploadOutlined, ExportOutlined } from "@ant-design/icons";
import JSONPretty from "react-json-pretty";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Header from "@/components/AgentHeader/Header";
import { EditTwoTone, DownOutlined, EditOutlined, PlayCircleOutlined } from "@ant-design/icons";
import {
  createTestAPI,
  getTestAPI,
  getTestRunsBulkAPI,
  getTestRunsAPI,
  updateTestAPI,
  runTestAPI,
  getLogStreamAPI,
  generateInstructionsFromGoalAPI,
  runTestWithAIAPI,
  exportScriptAPI
} from "@/lib/apis/testAI/test";
import Image from "next/image";
import "@/styles/globals.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { DragOutlined } from "@ant-design/icons";
import LogsComponent from "@/components/LogsComponent/LogsComponent";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Config from "@/components/Config/Config";
import { extractErrorMessage } from "@/lib/utils";
import { getPropertyDisplayText, getTargetDisplayText } from '@/lib/verifyUtils';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { RoleBasedButton } from "../ui/role-based-button"
import SendInviteModal from "../SendInviteModal/SendInviteModal";
import { ShareAltOutlined } from "@ant-design/icons";
import SegmentDetailsModal from "../SegmentDetailsModal/SegmentDetailsModal";
import { InstructionDisplay, InstructionObj } from "../InstructionDisplay/InstructionDisplay";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});


interface Instruction {
  type: string;
  action: string;
  args: Array<{
    key: string;
    value: string;
  }>;
  playwright_actions?: string[];
  prompt?: string;
  element_id?: string;
  id?: string;
}

export default function TestPageComponent({ test_id, suite_id, duplicate_from, showHeader = true }: any) {
  const { getToken } = useAuth();
  const { TextArea } = Input;
  const router = useRouter();
  const { selectedEnvironment } = useEnvironment();
  const environment_id = selectedEnvironment?.environment_id || null;
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(true);
  const [goal, setGoal] = useState<string>("");
  const [testsLoading, setTestsLoading] = useState<boolean>(false);
  const [poll, setPoll] = useState<NodeJS.Timeout | null>(null);
  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const { currentUserDetails, userLoading } = useUser();
  const [testLoading, setTestLoading] = useState<boolean>(true);
  const [triggerGetTestRuns, setTriggerGetTestRuns] = useState<boolean>(false);
  const [createTestLoading, setCreateTestLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [editGoal, setEditGoal] = useState<boolean>(false);
  const [editName, setEditName] = useState<boolean>(false);
  const [editDescription, setEditDescription] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [customTestId, setCustomTestId] = useState<string>("");
  const [editCustomTestId, setEditCustomTestId] = useState<boolean>(false);
  const [isTestProcessing, setIsTestProcessing] = useState<boolean>(false);
  const [instructionsLoading, setInstructionsLoading] =
    useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tests, setTests] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [updateTestLoading, setUpdateTestLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
    position: ["bottomRight" as "bottomRight"],
  });
  const [testStatus, setTestStatus] = useState<string>("draft");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  const streams: EventSource[] = [];
  const [editingScripts, setEditingScripts] = useState<Record<string, boolean>>(
    {}
  );
  const [editedScripts, setEditedScripts] = useState<Record<string, string[]>>({});
  const [savingScripts, setSavingScripts] = useState<Record<string, boolean>>(
    {}
  );
  const [currentlyEditingIndex, setCurrentlyEditingIndex] = useState<
    string | null
  >(null);
  const [selectedActions, setSelectedActions] = useState<Record<number, string>>({});
  const [instructionArgs, setInstructionArgs] = useState<Record<number, Record<string, string>>>({});
  const [initialInstructions, setInitialInstructions] = useState<Instruction[]>([]);
  const [initialSelectedActions, setInitialSelectedActions] = useState<Record<number, string>>({});
  const [initialInstructionArgs, setInitialInstructionArgs] = useState<Record<number, Record<string, string>>>({});
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [testConfig, setTestConfig] = useState({
    browser: "chrome",
    device: "desktop",
    os: "windows",
    viewport: "1920x1080",
    environment: "litmus_cloud"
  });
  const [isTestConfigModalOpen, setIsTestConfigModalOpen] = useState(false);
  const [isViewSegmentModalOpen, setIsViewSegmentModalOpen] = useState<boolean>(false);
  const [viewSegmentModalId, setViewSegmentModalId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  //   const agentId = params?.agentId;

  useEffect(() => {
    document.title = `${title} - Litmus Check`;
  }, [title]);

  useEffect(() => {
    // Don't automatically enter edit mode when there are no instructions
    // Let the user manually enter edit mode if they want to add instructions
    setEdit(false);
  }, [testResponse]);

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
            setTitle(`${response.data.name} (Copy)`);
            setGoal(response.data.goal || '');
            setTestStatus(response.data.status || 'draft');
            if (response.data.instructions && Array.isArray(response.data.instructions)) {
              const newInstructions = response.data.instructions.map((instruction: any) => {
                if (typeof instruction === 'string') {
                  return {
                    type: 'Non-AI',
                    action: 'run_script',
                    args: [
                      {
                        key: 'description',
                        value: instruction
                      },
                      {
                        key: 'script',
                        value: ''
                      }
                    ],
                    playwright_actions: []
                  };
                }
                return instruction;
              });

              // Set instructions
              setInstructions(newInstructions);

              // Set selected actions and args
              const newSelectedActions: Record<number, string> = {};
              const newInstructionArgs: Record<number, Record<string, string>> = {};

              newInstructions.forEach((instruction: any, index: number) => {
                newSelectedActions[index] = instruction.action;
                newInstructionArgs[index] = instruction.args.reduce((acc: Record<string, string>, arg: any) => {
                  acc[arg.key] = arg.value;
                  return acc;
                }, {});
                if (instruction.prompt) {
                  newInstructionArgs[index].prompt = instruction.prompt;
                }
                if (instruction.element_id) {
                  newInstructionArgs[index].element_id = instruction.element_id;
                }
              });

              setSelectedActions(newSelectedActions);
              setInstructionArgs(newInstructionArgs);

              // Store initial values
              setInitialInstructions(newInstructions);
              setInitialSelectedActions(newSelectedActions);
              setInitialInstructionArgs(newInstructionArgs);
            }
          }
        } catch (error: any) {
          messageApi.error(extractErrorMessage(error));
        }
      };

      fetchDuplicateTest();
    }
  }, [duplicate_from]);

  const startPolling = async () => {
    if (poll) {
      clearInterval(poll);
    }
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    const pollInterval = setInterval(async () => {
      setPoll(pollInterval);
      const testResponse = await getTestAPI(token, test_id);
      if (testResponse.status === 200) {
        if (testResponse.data.status === "processing") {
          setInstructionsLoading(true);
        } else if (testResponse.data.status !== "failed") {
          clearInterval(pollInterval);
          setInstructionsLoading(false);
          setInstructions(testResponse.data.instructions);
          messageApi.open({
            type: "success",
            content: "Instructions generated successfully",
            duration: 3,
          });
        }
      } else {
        clearInterval(pollInterval);
        setInstructionsLoading(false);
        messageApi.open({
          type: "error",
          content: "Failed to generate instructions",
          duration: 3,
        });
      }
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    if (poll) {
      clearInterval(poll);
      setPoll(null);
    }
  };

  const generateInstructionsFromGoal = async () => {
    setInstructionsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    try {
      const response = await generateInstructionsFromGoalAPI(token, test_id);
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "Instructions generation started",
          duration: 3,
        });
        startPolling();
      }
    } catch (error: any) {
      setInstructionsLoading(false);
      messageApi.open({
        type: "error",
        content: "Could not generate instructions from goal",
        duration: 3,
      });
    }
  };

  useEffect(() => {
    if (testResponse?.status === "processing") {
      console.log("testResponse", testResponse);
      startPolling();
      setIsTestProcessing(true);
      setInstructionsLoading(true);
    } else {
      setIsTestProcessing(false);
      setInstructionsLoading(false);
    }
    return () => {
      stopPolling();
    };
  }, [testResponse, test_id]);

  const getTest = async () => {
    setLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    try {
      const response = await getTestAPI(token, test_id);
      if (response.status === 200) {
        if (response.data.status !== "processing") {
          setInstructionsLoading(false);
        }
        setTestResponse(response?.data);
        setTitle(response.data.name);
        setTestStatus(response.data.status || "draft");
        setDescription(response.data.description || "");
        setCustomTestId(response.data.custom_test_id || "");

        // Update instructions and related states
        if (response.data.instructions && Array.isArray(response.data.instructions)) {
          const newInstructions = response.data.instructions.map((instruction: any) => {
            if (typeof instruction === 'string') {
              return {
                type: 'Non-AI',
                action: 'run_script',
                args: [
                  {
                    key: 'description',
                    value: instruction
                  },
                  {
                    key: 'script',
                    value: ''
                  }
                ],
                playwright_actions: []
              };
            }
            return instruction;
          });
          const newSelectedActions: Record<number, string> = {};
          const newInstructionArgs: Record<number, Record<string, string>> = {};

          newInstructions.forEach((instruction: any, index: number) => {
            if (typeof instruction === 'string') {
              newSelectedActions[index] = 'run_script';
              newInstructionArgs[index] = {
                description: instruction,
                script: ''
              };
            } else if (typeof instruction === 'object') {
              newSelectedActions[index] = instruction.action;
              newInstructionArgs[index] = instruction.args.reduce((acc: Record<string, string>, arg: any) => {
                acc[arg.key] = arg.value;
                return acc;
              }, {});
              if (instruction.prompt) {
                newInstructionArgs[index].prompt = instruction.prompt;
              }
              if (instruction.element_id) {
                newInstructionArgs[index].element_id = instruction.element_id;
              }
            }
          });

          setInstructions(newInstructions);
          setSelectedActions(newSelectedActions);
          setInstructionArgs(newInstructionArgs);

          // Store initial values
          setInitialInstructions(newInstructions);
          setInitialSelectedActions(newSelectedActions);
          setInitialInstructionArgs(newInstructionArgs);
        } else {
          setInstructions([]);
          setSelectedActions({});
          setInstructionArgs({});
          setInitialInstructions([]);
          setInitialSelectedActions({});
          setInitialInstructionArgs({});
        }

        setGoal(response.data.goal);
        setLoading(false);
      } else {
        setInstructionsLoading(false);
        setLoading(false);
        queueMicrotask(() => {
          messageApi.open({
            type: "error",
            content: extractErrorMessage(response),
            duration: 3,
          });
        });
      }
    } catch (error: any) {
      setLoading(false);
      setInstructionsLoading(false);
      queueMicrotask(() => {
        messageApi.open({
          type: "error",
          content: extractErrorMessage(error),
          duration: 3,
        });
      });
    }
  };

  useEffect(() => {
    if (test_id) getTest();
  }, [test_id]);


  const createTest = async (mode = "") => {
    setCreateTestLoading(true);
    if (mode === "goal" && !goal?.length) {
      messageApi.open({
        type: "error",
        content: "Goal cannot be empty",
        duration: 3,
      });
      setCreateTestLoading(false);
      return;
    }
    if (!title?.trim()) {
      messageApi.open({
        type: "error",
        content: "Test name cannot be empty",
        duration: 3,
      });
      setCreateTestLoading(false);
      return;
    }
    if (title?.length > 255) {
      messageApi.open({
        type: "error",
        content: "Test name cannot exceed 255 characters",
        duration: 3,
      });
      setCreateTestLoading(false);
      return;
    }
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    try {
      const response =
        mode === "goal"
          ? await createTestAPI(token, {
            name: title,
            mode: "goal",
            goal: goal,
            suite_id: suite_id,
            status: testStatus,
          })
          : await createTestAPI(token, {
            name: title,
            instructions: instructions,
            goal: goal,
            suite_id: suite_id,
            status: testStatus,
          });
      if (response.status === 200) {
        setTestResponse(response?.data);
        setCreateTestLoading(false);
        setTitle(response?.data?.name);
        setInstructions(response?.data?.instructions);
        setGoal(response?.data?.goal);
        setTestStatus(response?.data?.status || "draft");
        messageApi.open({
          type: "success",
          content: "Test created successfully",
          duration: 3,
        });
        router.push(`/dashboard/suite/${suite_id}/test/${response?.data?.id}`);
      } else {
        setCreateTestLoading(false);
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      setCreateTestLoading(false);
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    }
  };

  const runTest = useMutation({
    mutationKey: ["runTest"],
    mutationFn: async (params: { testId: string; browser?: string; config?: any }) => {
      const token = await getToken({ template: "basic" });
      if (!token) router.push("/sign-in");
      // Wrap config in config object if it exists
      const payload = params.config ? { config: params.config } : undefined;
      return runTestAPI(token, params.testId, params.browser ?? "", payload, environment_id);
    },
    onSuccess: (res) => {
      setTriggerGetTestRuns(true);
      messageApi.open({
        type: "success",
        content: res.data.message,
        duration: 3,
      });
    },
    onError: (error: any) => {
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    },
  });


  // useEffect(() => {
  //   getTestRuns();
  // }, [pagination?.current]);

  const validateInput = (action: string, key: string, value: string): string | null => {
    if (!value) {
      if (action === 'run_script' && key === 'script') {
        return 'Script cannot be empty';
      }
      if (actions[action]?.type === 'AI' && key === 'prompt') {
        return 'Prompt cannot be empty';
      }
      if ((action === 'go_to_url' || action === 'open_tab' || action === 'switch_tab') && key === 'url') {
        return 'URL cannot be empty';
      }
      if (action === 'wait_time' && key === 'time') {
        return 'Time cannot be empty';
      }
      return null;
    }

    switch (action) {
      case 'go_to_url':
      case 'open_tab':
      case 'switch_tab':
        if (key === 'url') {
          try {
            new URL(value);
            return null;
          } catch {
            return 'Please enter a valid URL (e.g., https://example.com)';
          }
        }
        break;
      case 'wait_time':
        if (key === 'time') {
          const num = Number(value);
          if (isNaN(num)) {
            return 'Please enter a valid number';
          }
          if (num <= 0) {
            return 'Time must be greater than 0';
          }
          if (!Number.isInteger(num)) {
            return 'Time must be a whole number';
          }
          return null;
        }
        break;
    }
    return null;
  };

  const updateTest = async () => {
    setUpdateTestLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    if (instructions?.length === 0) {
      messageApi.open({
        type: "error",
        content: "Instructions cannot be empty",
        duration: 3,
      });
      setUpdateTestLoading(false);
      return;
    }

    // Validate all fields
    const newValidationErrors: Record<number, Record<string, string>> = {};
    instructions.forEach((_, index) => {
      const action = selectedActions[index];
      if (action) {
        if (actions[action]?.type === 'AI') {
          const error = validateInput(action, 'prompt', instructionArgs[index]?.prompt || '');
          if (error) {
            newValidationErrors[index] = {
              ...newValidationErrors[index],
              prompt: error
            };
          }
        }
        actions[action]?.args?.forEach(arg => {
          const error = validateInput(action, arg.key, instructionArgs[index]?.[arg.key] || '');
          if (error) {
            newValidationErrors[index] = {
              ...newValidationErrors[index],
              [arg.key]: error
            };
          }
        });
      }
    });

    setValidationErrors(newValidationErrors);
    setShowValidationErrors(true);

    // Check for validation errors
    const hasErrors = Object.values(newValidationErrors).some(
      errors => Object.values(errors).some(error => error)
    );
    if (hasErrors) {
      messageApi.open({
        type: "error",
        content: "Please fix validation errors before saving",
        duration: 3,
      });
      setUpdateTestLoading(false);
      return;
    }

    try {
      // Format instructions with proper structure
      const formattedInstructions = instructions.map((instruction, index) => {
        const action = selectedActions[index];
        const args = actions[action]?.args.map(arg => ({
          key: arg.key,
          value: instructionArgs[index]?.[arg.key] || ''
        })) || [];

        return {
          action,
          args,
          type: actions[action]?.type || 'Non-AI',
          playwright_actions: instruction.playwright_actions || [],
          ...(actions[action]?.type === 'AI' && { prompt: instructionArgs[index]?.prompt || '' }),
          ...(instructionArgs[index]?.element_id && { element_id: instructionArgs[index].element_id })
        };
      });

      const response = await updateTestAPI(token, test_id, {
        name: title,
        suite_id: suite_id,
        instructions: formattedInstructions,
        goal: goal,
        status: testStatus,
      });
      if (response.status === 200) {
        setTestResponse(response?.data);
        setTitle(response?.data?.name);
        setInstructions(response?.data?.instructions);
        setGoal(response?.data?.goal);
        setTestStatus(response?.data?.status || "draft");
        setEdit(false);
        setEditGoal(false);
        messageApi.open({
          type: "success",
          content: "Test updated successfully",
          duration: 3,
        });
        setUpdateTestLoading(false);
      } else {
        setUpdateTestLoading(false);
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      setUpdateTestLoading(false);
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    }
  };

  const getTestRuns = async () => {
    setTestsLoading(true);
    setTriggerGetTestRuns(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }

    try {
      const response = await getTestRunsBulkAPI(
        token,
        pagination?.current,
        pagination?.pageSize,
        test_id
      );
      if (response.status === 200) {
        setTests(response.data);
        setTestsLoading(false);
        setTriggerGetTestRuns(false);
        setPagination((prev) => {
          return {
            ...prev,
            total: response?.data?.metadata?.total_records,
          };
        });
      } else {
        messageApi.error(extractErrorMessage(response));
        setTestsLoading(false);
        setTriggerGetTestRuns(false);
      }
    } catch (error: any) {
      //   setIsWorkFlowLoading(false);
      messageApi.error(extractErrorMessage(error));
      setTestsLoading(false);
      setTriggerGetTestRuns(false);
      // setError(true);
    }
  };

  const handleGenerateInstructions = () => {
    if (goal?.length) {
      generateInstructionsFromGoal();
    } else {
      messageApi.open({
        type: "error",
        content: "Goal cannot be empty",
        duration: 3,
      });
    }
  };

  const getTestRun = async () => {
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");
    setTestLoading(true);
    // Clear previous logs when switching test runs
    setLogs([]);
    try {
      const response = await getTestRunsAPI(token, selectedRow?.runId);
      if (response.status === 200) {
        setTest(response.data);
        setTestLoading(false);
      } else {
        messageApi.error(extractErrorMessage(response));
        setTestLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setTestLoading(false);
    }
  };



  const startLogStream = async (runId: string) => {
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    try {
      const response = await getTestRunsAPI(token, selectedRow.runId);
      if (response.status === 200) {
        setTest(response.data);
        messageApi.open({
          type: "success",
          content: "Logs refreshed successfully",
          duration: 3,
        });
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRow) {
      getTestRun();
    }
  }, [selectedRow?.runId]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Create new arrays for all states
    const newInstructions = [...instructions];
    const newSelectedActions = { ...selectedActions };
    const newInstructionArgs = { ...instructionArgs };

    // Remove the item from source position
    const [movedInstruction] = newInstructions.splice(sourceIndex, 1);
    const movedAction = newSelectedActions[sourceIndex];
    const movedArgs = newInstructionArgs[sourceIndex];

    // Delete the old entries
    delete newSelectedActions[sourceIndex];
    delete newInstructionArgs[sourceIndex];

    // Insert at destination position
    newInstructions.splice(destinationIndex, 0, movedInstruction);

    // Create new state objects with correct indices
    const updatedSelectedActions: Record<number, string> = {};
    const updatedInstructionArgs: Record<number, Record<string, string>> = {};

    // Rebuild the state objects with correct indices
    newInstructions.forEach((_, index) => {
      if (index === destinationIndex) {
        // Place the moved item's data at its new position
        if (movedAction) updatedSelectedActions[index] = movedAction;
        if (movedArgs) updatedInstructionArgs[index] = movedArgs;
      } else {
        // For other items, find their original data
        const originalIndex = index < destinationIndex
          ? (index < sourceIndex ? index : index + 1)
          : (index <= sourceIndex ? index - 1 : index);

        if (selectedActions[originalIndex]) {
          updatedSelectedActions[index] = selectedActions[originalIndex];
        }
        if (instructionArgs[originalIndex]) {
          updatedInstructionArgs[index] = instructionArgs[originalIndex];
        }
      }
    });

    setInstructions(newInstructions);
    setSelectedActions(updatedSelectedActions);
    setInstructionArgs(updatedInstructionArgs);
  };

  const handleCancel = () => {
    setEdit(false);
    setEditGoal(false);
    setEditName(false);
    setTitle(testResponse?.name);
    setGoal(testResponse?.goal);
    setTestStatus(testResponse?.status || "draft");
    setInstructions(initialInstructions);
    setSelectedActions(initialSelectedActions);
    setInstructionArgs(initialInstructionArgs);
  };

  const handleSaveName = async () => {
    setUpdateTestLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    if (!title?.trim()) {
      messageApi.open({
        type: "error",
        content: "Test name cannot be empty",
        duration: 3,
      });
      setUpdateTestLoading(false);
      return;
    }

    if (title?.length > 255) {
      messageApi.open({
        type: "error",
        content: "Test name cannot exceed 255 characters",
        duration: 3,
      });
      setUpdateTestLoading(false);
      return;
    }

    try {
      const response = await updateTestAPI(token, test_id, {
        name: title,
        suite_id: suite_id,
        instructions: testResponse?.instructions || [],
        goal: testResponse?.goal,
        status: testStatus,
      });
      if (response.status === 200) {
        setTestResponse(response?.data);
        setTitle(response?.data?.name);
        setTestStatus(response?.data?.status || "draft");
        setEditName(false);
        messageApi.open({
          type: "success",
          content: "Test name updated successfully",
          duration: 3,
        });
        setUpdateTestLoading(false);
      } else {
        setUpdateTestLoading(false);
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      setUpdateTestLoading(false);
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    }
  };

  const handleSaveDescription = async () => {
    setUpdateTestLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    try {
      const response = await updateTestAPI(token, test_id, {
        name: testResponse?.name,
        description: description,
        suite_id: suite_id,
        instructions: testResponse?.instructions || [],
        goal: testResponse?.goal,
        status: testStatus,
      });
      if (response.status === 200) {
        setTestResponse(response?.data);
        setDescription(response?.data?.description || "");
        setEditDescription(false);
        messageApi.open({
          type: "success",
          content: "Test description updated successfully",
          duration: 3,
        });
        setUpdateTestLoading(false);
      } else {
        setUpdateTestLoading(false);
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      setUpdateTestLoading(false);
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    }
  };

  const handleSaveCustomTestId = async () => {
    setUpdateTestLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    try {
      const response = await updateTestAPI(token, test_id, {
        name: title,
        suite_id: suite_id,
        instructions: testResponse?.instructions || [],
        goal: testResponse?.goal,
        status: testStatus,
        custom_test_id: customTestId,
        description: description,
      });
      if (response.status === 200) {
        setTestResponse(response?.data);
        setCustomTestId(response?.data?.custom_test_id || "");
        setEditCustomTestId(false);
        messageApi.open({
          type: "success",
          content: "Test ID updated successfully",
          duration: 3,
        });
      } else {
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    } finally {
      setUpdateTestLoading(false);
    }
  };

  const handleScriptEdit = (index: string) => {
    // Set all other scripts to not editing
    const newEditingState: Record<string, boolean> = {};
    Object.keys(editingScripts).forEach((key) => {
      newEditingState[key] = false;
    });
    newEditingState[index] = true;
    setEditingScripts(newEditingState);
    setCurrentlyEditingIndex(index);
    setEditedScripts((prev) => ({
      ...prev,
      [index]: [...(instructions[parseInt(index)]?.playwright_actions || [])],
    }));
  };

  const handleScriptChange = (index: string, value: string | undefined) => {
    if (value !== undefined) {
      // Split the script into lines
      const lines = value.split("\n");
      const blocks: string[] = [];
      let currentBlock: string[] = [];
      let indentLevel = 0;
      let inBlock = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        const currentIndent = line.search(/\S|$/);

        // Check if line starts a block (if statement, for loop, etc.)
        if (trimmedLine.endsWith(':') || trimmedLine.startsWith('if ') || trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ')) {
          if (currentBlock.length > 0) {
            blocks.push(currentBlock.join('\n'));
            currentBlock = [];
          }
          inBlock = true;
          indentLevel = currentIndent;
          currentBlock.push(line);
        }
        // Check if line is part of a block (indented content)
        else if (inBlock && currentIndent > indentLevel) {
          currentBlock.push(line);
        }
        // Check if block has ended (indentation returned to original level or less)
        else if (inBlock && currentIndent <= indentLevel) {
          if (currentBlock.length > 0) {
            blocks.push(currentBlock.join('\n'));
            currentBlock = [];
          }
          inBlock = false;
          currentBlock.push(line);
        }
        // Regular line
        else {
          if (currentBlock.length > 0) {
            blocks.push(currentBlock.join('\n'));
            currentBlock = [];
          }
          currentBlock.push(line);
        }
      }

      // Add any remaining block
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
      }

      setEditedScripts(prev => ({
        ...prev,
        [index]: blocks
      }));
    }
  };

  const handleScriptSave = async (index: string) => {
    setSavingScripts(prev => ({ ...prev, [index]: true }));
    setCurrentlyEditingIndex(null);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    try {
      const updatedInstructions = [...instructions];
      // Update the specific instruction's playwright_actions
      updatedInstructions[parseInt(index)] = {
        ...updatedInstructions[parseInt(index)],
        playwright_actions: editedScripts[index] || []
      };

      const response = await updateTestAPI(token, test_id, {
        name: title,
        suite_id: suite_id,
        instructions: updatedInstructions,
        goal: goal,
        status: testStatus,
      });

      if (response.status === 200) {
        setTestResponse(response?.data);
        setTestStatus(response?.data?.status || "draft");
        setEditingScripts(prev => ({ ...prev, [index]: false }));
        messageApi.open({
          type: "success",
          content: "Script updated successfully",
          duration: 3,
        });
      } else {
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    } finally {
      setSavingScripts(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleActionSelect = (index: number, action: string) => {
    setSelectedActions(prev => ({ ...prev, [index]: action }));
    setInstructionArgs(prev => ({ ...prev, [index]: {} }));
    setInstructions(prev => {
      const newInstructions = [...prev];
      newInstructions[index] = {
        type: actions[action]?.type,
        action: action,
        args: actions[action]?.args?.map(arg => ({
          key: arg.key,
          value: ''
        })),
        playwright_actions: []
      };
      return newInstructions;
    });
  };

  const handleArgChange = (index: number, key: string, value: string) => {
    const error = validateInput(selectedActions[index], key, value);
    setValidationErrors(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [key]: error || ''
      }
    }));

    setInstructionArgs(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [key]: value
      }
    }));
  };

  // Update when entering edit mode
  useEffect(() => {
    if (edit) {
      setInitialInstructions(instructions);
      setInitialSelectedActions(selectedActions);
      setInitialInstructionArgs(instructionArgs);
    }
  }, [edit]);

  const handleAddInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 0, {
      type: 'Non-AI',
      action: '',
      args: [],
      playwright_actions: []
    } as Instruction);

    // Create new objects with reindexed keys
    const newSelectedActions: Record<number, string> = {};
    const newInstructionArgs: Record<number, Record<string, string>> = {};

    // Reindex remaining items
    newInstructions.forEach((_, newIndex) => {
      if (newIndex === index) {
        // For the new instruction, initialize with empty values
        newSelectedActions[newIndex] = '';
        newInstructionArgs[newIndex] = {};
      } else {
        // For existing instructions, maintain their values
        const oldIndex = newIndex > index ? newIndex - 1 : newIndex;
        if (selectedActions[oldIndex]) {
          newSelectedActions[newIndex] = selectedActions[oldIndex];
        }
        if (instructionArgs[oldIndex]) {
          newInstructionArgs[newIndex] = instructionArgs[oldIndex];
        }
      }
    });

    setInstructions(newInstructions);
    setSelectedActions(newSelectedActions);
    setInstructionArgs(newInstructionArgs);
  };

  const formatInstructionValue = (instruction: any): React.ReactNode => {
    if (typeof instruction === 'string') {
      return instruction;
    }

    const action = instruction.action || '';
    const args = instruction.args || [];
    const prompt = instruction.prompt || '';
    const element_id = instruction.element_id || '';

    // Get the display structure from actions
    const actionConfig = actions[action];
    if (!actionConfig?.displayStructure) {
      // Fallback to old format if no displayStructure
      if (action === 'run_script') {
        const description = args.find((arg: { key: string; value: string }) => arg.key === 'description')?.value || '';
        return `${action}: ${description}`;
      }
      const argsStr = args.map((arg: { key: string; value: string }) => arg.value).join(', ');
      const displayValue = element_id || prompt;
      return `${action}${argsStr ? ': ' + argsStr : ''}${displayValue ? ': ' + displayValue : ''}`;
    }

    // Create React elements with Tailwind classes
    const createFormattedText = (text: string): React.ReactNode => {
      let result = text;

      // Handle reuse_test specially
      if (action === 'reuse_test') {
        const sourceTestId = args.find((arg: { key: string; value: string }) => arg.key === 'source_test_id')?.value || '';
        const segmentId = args.find((arg: { key: string; value: string }) => arg.key === 'segment_id')?.value || '';
        const testName = args.find((arg: { key: string; value: string }) => arg.key === 'test_name')?.value || sourceTestId;
        const segmentName = args.find((arg: { key: string; value: string }) => arg.key === 'segment_name')?.value || '';

        if (segmentId) {
          // Display segment
          return (
            <div className="flex items-center gap-2">
              <span>Reuse segment <span className='font-semibold'>{segmentName}</span></span>
              <Tooltip title="View segment">
                <ExportOutlined
                  className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs"
                  onClick={() => handleViewSegment(segmentId)}
                />
              </Tooltip>
            </div>
          );
        } else {
          // Display test
          return (
            <div className="flex items-center gap-2">
              <span>Reuse test <span className='font-semibold'>{testName}</span></span>
              <Tooltip title="Go to test">
                <Link target='_blank' href={`/dashboard/suite/${suite_id}/test/${sourceTestId}`}>
                  <ExportOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs" />
                </Link>
              </Tooltip>
            </div>
          );
        }
      }

      // Handle ai_file_upload specially
      if (action === 'ai_file_upload') {
        const fileId = args.find((arg: { key: string; value: string }) => arg.key === 'file_id')?.value || '';
        const fileName = args.find((arg: { key: string; value: string }) => arg.key === 'file_name')?.value || '';
        return (
          <div className="flex items-center gap-2">
            <span>Upload file <span className='font-semibold underline cursor-pointer hover:text-[#AE00FF]' style={{ textDecorationColor: '#AE00FF' }} onClick={() => window.open(`/dashboard/suite/${suite_id}?tab=2`, '_blank')}>{fileName}</span> in <span className='font-semibold'>{element_id || prompt}</span></span>
          </div>
        );
      }

      // Handle verify action specially
      if (action === 'verify') {
        const target = args.find((arg: { key: string; value: string }) => arg.key === 'target')?.value || '';
        const property = args.find((arg: { key: string; value: string }) => arg.key === 'property')?.value || '';
        const check = args.find((arg: { key: string; value: string }) => arg.key === 'check')?.value || '';
        const value = args.find((arg: { key: string; value: string }) => arg.key === 'value')?.value || '';
        const locator = args.find((arg: { key: string; value: string }) => arg.key === 'locator')?.value || '';
        const promptValue = args.find((arg: { key: string; value: string }) => arg.key === 'prompt')?.value || '';
        const elementIdValue = args.find((arg: { key: string; value: string }) => arg.key === 'element_id')?.value || '';
        const subProperty = args.find((arg: { key: string; value: string }) => arg.key === 'sub_property')?.value || '';
        const expectedResult = args.find((arg: { key: string; value: string }) => arg.key === 'expected_result')?.value;
        const failTest = args.find((arg: { key: string; value: string }) => arg.key === 'fail_test')?.value;

        // Build the verification text based on target and property
        let verifyText = `Verify ${getTargetDisplayText(target)}: `;

        if (target === 'element') {
          if (elementIdValue) {
            verifyText += `${elementIdValue}: `;
          } else if (promptValue) {
            verifyText += `${promptValue}: `;
          } else if (locator) {
            verifyText += `${locator}: `;
          }
        }

        verifyText += getPropertyDisplayText(property);

        if (check) {
          verifyText += ` ${check}`;
        }

        // For verify_attribute and verify_css, show sub_property and value
        if (property === 'verify_attribute' || property === 'verify_css') {
          if (subProperty) {
            verifyText += ` ${subProperty}`;
          }
          if (value) {
            verifyText += `: ${value}`;
          }
        } else if (value) {
          // For other properties, show the value field
          verifyText += ` ${value}`;
        }

        if (expectedResult === false) {
          verifyText += ` (Expected to fail)`;
        }

        if (failTest === false) {
          verifyText += ` (Continue on failure)`;
        }

        return <span>{verifyText}</span>;
      }

      // Replace [prompt] with the actual prompt or element_id (for non-verify actions)
      const displayPrompt = element_id || prompt;
      if (displayPrompt) {
        result = result.replace('[prompt]', `<span class="font-semibold">${displayPrompt}</span>`);
      }

      // Replace other placeholders with actual values
      args.forEach((arg: { key: string; value: string }) => {
        const placeholder = `[${arg.key}]`;
        if (result.includes(placeholder)) {
          let displayValue = arg.value;

          // Map API values back to display text for verify action
          if (action === 'verify' && arg.key === 'property') {
            displayValue = getPropertyDisplayText(arg.value);
          }

          // Map target values to display text for verify action
          if (action === 'verify' && arg.key === 'target') {
            displayValue = getTargetDisplayText(arg.value);
          }

          result = result.replace(placeholder, `<span class="font-semibold">${displayValue}</span>`);
        }
      });

      return <span dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return createFormattedText(actionConfig.displayStructure);
  };

  const handleExport = async () => {
    setExportLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}/test/${test_id}/script`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the response is a file download (stream) or JSON error
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        // Handle JSON error response
        const errorData = await response.json();
        const errorMessage = extractErrorMessage(errorData) || "Failed to export script";
        messageApi.open({
          type: "error",
          content: errorMessage,
          duration: 3,
        });
      } else {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.test.js`; // Use test name with .test.js extension
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        messageApi.open({
          type: "success",
          content: "Script exported successfully",
          duration: 3,
        });
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error) || "Failed to export script";
      messageApi.open({
        type: "error",
        content: errorMessage,
        duration: 3,
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    setStatusUpdateLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) router.push("/sign-in");

    const newStatus = checked ? "ready" : "draft";

    try {
      const response = await updateTestAPI(token, test_id, {
        name: title,
        suite_id: suite_id,
        instructions: testResponse?.instructions || [],
        goal: testResponse?.goal,
        status: newStatus,
      });

      if (response.status === 200) {
        setTestResponse(response?.data);
        setTestStatus(newStatus);
        messageApi.open({
          type: "success",
          content: `Test status updated to ${newStatus}`,
          duration: 3,
        });
      } else {
        messageApi.open({
          type: "error",
          content: extractErrorMessage(response),
          duration: 3,
        });
      }
    } catch (error: any) {
      messageApi.open({
        type: "error",
        content: extractErrorMessage(error),
        duration: 3,
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleViewSegment = async (segmentId: string) => {
    setViewSegmentModalId(segmentId);
    setIsViewSegmentModalOpen(true);
  };

  return (
    <>
      {(loading && test_id) || userLoading ? (
        <div className="h-[500px] flex justify-center items-center">
          <Spin />
        </div>
      ) : (
        <div className="bg-[#F8F9FD] pb-10">
          {contextHolder}
          {showHeader && <Header />}
          <div className="flex gap-5">
            <div className="w-[30%] min-w-[480px] flex-shrink-0 h-[calc(100vh-60px)] relative bg-white">
              <div className="flex flex-col h-full w-full">
                <div
                  className={`overflow-y-auto overflow-x-hidden flex-1 w-full ${edit
                    ? "max-h-[calc(100vh-130px)]"
                    : "max-h-[calc(100vh-70px)]"
                    } box-border mt-2`}
                >
                  <div className="flex px-4">
                    {(!test_id || edit) && (
                      <h1 className="font-hanken my-1 text-[18px] font-medium">
                        Name
                      </h1>
                    )}
                  </div>
                  <div>
                    {test_id && !edit ? (
                      <>
                        <div className="px-4 flex w-full overflow-x-hidden justify-between">
                          <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center gap-2">
                              {editName ? (
                                <div className="flex flex-col items-end mb-2 gap-2 flex-1" data-testid="test-name-edit-form">
                                  <Input
                                    className="flex-1"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onPressEnter={handleSaveName}
                                    autoFocus
                                    data-testid="test-name-input"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="small"
                                      onClick={handleSaveName}
                                      loading={updateTestLoading}
                                      className="bg-[#AE00FF] border-2 border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                                      data-testid="test-name-save-button"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        setEditName(false);
                                        setTitle(testResponse?.name);
                                      }}
                                      className="bg-white hover:!bg-white text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken"
                                      data-testid="test-name-cancel-button"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2 w-full">

                                  <div className="flex items-start gap-2 flex-1 min-w-0">

                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {currentUserDetails?.role !== 'viewer' && <Image src="/assets/pencil.svg"
                                        width={16}
                                        height={16}
                                        alt="edit"
                                        className="cursor-pointer"
                                        onClick={() => setEditName(true)}
                                        data-testid="test-name-edit-icon"
                                      />}
                                      <p className="font-hanken text-[18px] font-medium break-words min-w-0 flex-1" data-testid="test-name">
                                        {title}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Test ID */}
                            <div className="flex items-start gap-2 w-full mt-2">
                              {editCustomTestId ? (
                                <div className="flex flex-col gap-2 flex-1">
                                  <Input
                                    className="w-full font-hanken"
                                    value={customTestId}
                                    onChange={(e) => setCustomTestId(e.target.value)}
                                    placeholder="Enter Test ID"
                                    autoFocus
                                    data-testid="test-id-input"
                                  />
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button
                                      size="small"
                                      onClick={handleSaveCustomTestId}
                                      loading={updateTestLoading}
                                      className="bg-[#AE00FF] border-2 border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                                      data-testid="test-id-save-button"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        setEditCustomTestId(false);
                                        setCustomTestId(testResponse?.custom_test_id || "");
                                      }}
                                      className="bg-white hover:!bg-white text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken"
                                      data-testid="test-id-cancel-button"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {currentUserDetails?.role !== 'viewer' && <Image src="/assets/pencil.svg"
                                      width={16}
                                      height={16}
                                      alt="edit"
                                      className="cursor-pointer"
                                      onClick={() => setEditCustomTestId(true)}
                                      data-testid="test-id-edit-icon"
                                    />}
                                    <p className="font-hanken text-[14px] text-gray-600 break-words flex-1 min-w-0" data-testid="test-id-text">
                                      {customTestId ? `ID: ${customTestId}` : "No Test ID provided"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Test Description */}
                            <div className="flex items-start gap-2 w-full mt-4">
                              {editDescription ? (
                                <div className="flex flex-col gap-2 flex-1">
                                  <Input.TextArea
                                    className="w-full font-hanken"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter test description"
                                    rows={2}
                                    autoFocus
                                    data-testid="test-description-input"
                                  />
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button
                                      size="small"
                                      onClick={handleSaveDescription}
                                      loading={updateTestLoading}
                                      className="bg-[#AE00FF] border-2 border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                                      data-testid="test-description-save-button"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        setEditDescription(false);
                                        setDescription(testResponse?.description || "");
                                      }}
                                      className="bg-white hover:!bg-white text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken"
                                      data-testid="test-description-cancel-button"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-2 flex-1 min-w-0">

                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {currentUserDetails?.role !== 'viewer' && <Image src="/assets/pencil.svg"
                                      width={16}
                                      height={16}
                                      alt="edit"
                                      className="cursor-pointer"
                                      onClick={() => setEditDescription(true)}
                                      data-testid="test-description-edit-icon"
                                    />}
                                    <p className="font-hanken text-[14px] text-gray-600 break-words text-justify flex-1 min-w-0" data-testid="test-description-text">
                                      {description || "No description provided"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                              {currentUserDetails?.role !== 'viewer' ? <Link href={`/dashboard/suite/${suite_id}/test/${test_id}/compose`}>
                                <Button
                                  size="middle"
                                  icon={<Image src="/assets/compose-icon.svg" width={16} height={16} alt="compose" />}
                                  className="font-hanken text-[14px] rounded-[6px] hover:!bg-[#AE00FF] hover:!text-white bg-[#AE00FF] border-2 text-white border-[#AE00FF]"
                                  data-testid="test-compose-button"
                                >
                                  Compose
                                </Button>
                              </Link> : <RoleBasedButton
                                size="middle"
                                icon={<Image src="/assets/compose-icon.svg" width={16} height={16} alt="compose" />}
                                className="font-hanken text-[14px] rounded-[6px] hover:!bg-[#AE00FF] hover:!text-white !bg-[#AE00FF] border-2 !text-white !border-[#AE00FF]"
                                data-testid="test-compose-button"
                              >
                                Compose
                              </RoleBasedButton>}
                              <div className="flex items-center">
                                <Button
                                  loading={runTest.isPending}
                                  onClick={() =>
                                    runTest.mutate({ testId: test_id })
                                  }
                                  size="middle"
                                  icon={<Image src="/assets/run-icon.svg" width={11} height={14} alt="run" />}
                                  className="font-hanken text-[14px] rounded-r-none rounded-l-[6px] border-r-0 hover:!bg-[#AE00FF] hover:!text-white bg-[#AE00FF] border-2 text-white border-[#AE00FF]"
                                  data-testid="test-run-button"
                                >
                                  Run
                                </Button>
                                <div className="w-[2px] h-[32px] bg-white border-t-2 border-b-2 border-l-0 border-r-0 border-t-[#AE00FF] border-b-[#AE00FF]"></div>
                                <div className="text-[14px] bg-[#AE00FF] border-l-white rounded-r-[6px] text-white h-[32px] w-[32px] flex items-center justify-center border-l-0 border-[#AE00FF]">
                                  <Dropdown
                                    placement="bottom"
                                    className="text-[14px] cursor-pointer flex items-center justify-center !rounded-[6px]"
                                    data-testid="test-run-dropdown"
                                    menu={{
                                      items: [
                                        {
                                          label: "Default config",
                                          key: "1",
                                          onClick: () =>
                                            runTest.mutate({
                                              testId: test_id,
                                            }),
                                        },
                                        {
                                          label: "Choose config",
                                          key: "2",
                                          onClick: () => setIsTestConfigModalOpen(true),
                                        },
                                      ],
                                    }}
                                  >
                                    <DownOutlined className="text-xs" data-testid="test-run-dropdown-trigger" />
                                  </Dropdown>
                                </div>
                              </div>
                              {currentUserDetails?.role !== 'viewer' && (
                                <Tooltip title="Share Test">
                                  <RoleBasedButton
                                    type="default"
                                    icon={<Image src="/assets/share.svg" width={19} height={19} alt="share" />}
                                    onClick={() => setShowShareModal(true)}
                                    className="font-hanken bg-white border-2 border-[#DD94FF] !text-[#AE00FF] hover:!bg-white hover:!text-[#AE00FF] hover:!border-[#AE00FF]"
                                    data-testid="test-share-button"
                                  >

                                  </RoleBasedButton>
                                </Tooltip>
                              )}
                            </div>

                          </div>
                        </div>

                      </>
                    ) : (
                      <Input
                        className="mx-4 w-[calc(100%-32px)]"
                        placeholder="Name your test"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    )}
                  </div>
                  {test_id && !edit && (
                    <>

                      <div className="px-4 mt-4" data-testid="test-status-content">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 flex-1" data-testid="test-status-display">
                            <span className={`font-hanken text-[15px]`} data-testid="test-status-text">
                              Status
                            </span>
                          </div>
                          {currentUserDetails?.role !== 'viewer' && <Switch
                            checked={testStatus === "ready"}
                            onChange={handleStatusToggle}
                            loading={statusUpdateLoading}
                            checkedChildren="Ready"
                            unCheckedChildren="Draft"
                            className="bg-gray-300"
                            data-testid="test-status-toggle"
                          />}
                        </div>
                      </div>
                      <Divider className="my-[10px] border shadow-md" />
                    </>
                  )}
                  {/* <div className="flex justify-between mt-2 items-center px-4">
                    <h1 className="font-hanken my-1 text-[18px] font-medium">
                      Goal
                    </h1>
                  </div>
                  <div>
                    {test_id && !edit ? (
                      <>
                        <p className="font-hanken text-[15px] px-4 max-h-[68px] overflow-y-auto w-full break-words">
                          {goal}
                        </p>
                        <Divider className="my-[10px] border shadow-md" />
                      </>
                    ) : (
                      <TextArea
                        className="mx-4 w-[calc(100%-32px)]"
                        rows={3}
                        placeholder="Enter a testing goal here. E.g. 'Test the sign up flow by using an email and password'"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    )}
                  </div> */}

                  <div className="flex justify-between mt-2 items-center px-4">
                    {(test_id || duplicate_from) && (
                      <h1 className="font-hanken mb-4 text-[16px] font-medium">
                        Instructions
                      </h1>
                    )}
                    {edit && (
                      <Button
                        onClick={handleGenerateInstructions}
                        size="small"
                        className="bg-[#4542CC] border-2 border-[#4542CC] hover:!text-white hover:!bg-[#4542CC] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                        data-testid="generate-instructions-button"
                      >
                        Generate
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    {instructionsLoading ||
                      testResponse?.status === "processing" ? (
                      <div className="flex flex-col items-center gap-2 p-4" data-testid="instructions-loading">
                        <Spin />
                        <p className="text-gray-500 font-hanken">
                          Generating instructions from goal...
                        </p>
                      </div>
                    ) : (
                      (test_id || duplicate_from) && (
                        <div className="w-full px-1">
                          <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="instructions">
                              {(provided) => {
                                return (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    data-testid="test-instructions-list"
                                  >
                                    {instructions?.map((instruction: any, i: number) => {
                                      // Convert Instruction to InstructionObj format
                                      const instructionObj: InstructionObj = {
                                        id: instruction.id || `instruction-${i}`,
                                        value: instruction,
                                        playwright_actions: instruction.playwright_actions,
                                        selectors: instruction.selectors,
                                        status: instruction.status
                                      };

                                      return test_id && !edit ? (
                                        <div key={i} className="px-4" data-testid="test-instruction">

                                          <div className="mb-3">
                                            <div className="group">
                                              <InstructionDisplay
                                                instruction={instructionObj}
                                                suite_id={suite_id}
                                                showMenu={false}
                                                showStatus={false}
                                                onViewSegment={handleViewSegment}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div
                                            className="h-2 hover:mb-3 transition-all duration-200 relative"
                                            onClick={() => handleAddInstruction(i)}
                                          >
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                              <div className="h-[2px] w-full bg-[#AE00FF] rounded-full flex items-center justify-center">
                                                <div className="bg-white border-2 border-[#AE00FF] rounded-full p-1 w-6 h-6 flex items-center justify-center">
                                                  <PlusOutlined className="text-[#AE00FF] text-sm" />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <Draggable
                                            key={i}
                                            draggableId={`instruction-${i}`}
                                            index={i}
                                          >
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="flex flex-col gap-3 group w-full mb-4 cursor-move"
                                              >
                                                <div className="flex items-start gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-[#B8B8B8] text-white rounded-md flex items-center justify-center text-xs font-medium">
                                                      {i + 1}
                                                    </div>
                                                    <div className="flex ml-1 items-center justify-center w-6 h-6 text-gray-400">
                                                      <DragOutlined />
                                                    </div>
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex flex-col gap-2">
                                                      <div className="flex flex-row gap-2 items-start">
                                                        <div>
                                                          <Dropdown
                                                            menu={{
                                                              items: Object.entries(actions).map(([key, value]) => ({
                                                                key,
                                                                label: key,
                                                                onClick: () => handleActionSelect(i, key)
                                                              }))
                                                            }}
                                                            trigger={['click']}
                                                          >
                                                            <Button className="font-hanken text-left">
                                                              {selectedActions[i] || 'Select action'} <DownOutlined />
                                                            </Button>
                                                          </Dropdown>
                                                        </div>
                                                        {selectedActions[i] && actions[selectedActions[i]] && actions[selectedActions[i]].args.map((arg) => (
                                                          selectedActions[i] !== 'run_script' && (
                                                            <div key={arg.key} className="flex-1">
                                                              {arg.key !== 'file' ? (
                                                                <Input
                                                                  className="w-full"
                                                                  placeholder={arg.description}
                                                                  value={instructionArgs[i]?.[arg.key] || ''}
                                                                  onChange={(e) => handleArgChange(i, arg.key, e.target.value)}
                                                                  status={showValidationErrors && validationErrors[i]?.[arg.key] ? 'error' : ''}
                                                                />
                                                              ) : (
                                                                <div>
                                                                  <Upload
                                                                    beforeUpload={(file) => {
                                                                      handleArgChange(i, 'file', file.name);
                                                                      return false;
                                                                    }}
                                                                    maxCount={1}
                                                                  >
                                                                    <Button icon={<UploadOutlined />}>Upload a file</Button>
                                                                  </Upload>
                                                                </div>
                                                              )}
                                                              {showValidationErrors && validationErrors[i]?.[arg.key] && (
                                                                <span className="text-red-500 text-sm">{validationErrors[i][arg.key]}</span>
                                                              )}
                                                            </div>
                                                          )
                                                        ))}
                                                      </div>
                                                      {selectedActions[i] && actions[selectedActions[i]] && actions[selectedActions[i]].type === 'AI' && (
                                                        <div>
                                                          <Input.TextArea
                                                            className="w-full"
                                                            placeholder="Enter your prompt here"
                                                            value={instructionArgs[i]?.prompt || ''}
                                                            onChange={(e) => handleArgChange(i, 'prompt', e.target.value)}
                                                            rows={1}
                                                            status={showValidationErrors && validationErrors[i]?.prompt ? 'error' : ''}
                                                          />
                                                          {showValidationErrors && validationErrors[i]?.prompt && (
                                                            <span className="text-red-500 text-sm">{validationErrors[i].prompt}</span>
                                                          )}
                                                        </div>
                                                      )}
                                                      {selectedActions[i] === 'run_script' && (
                                                        <div className="flex flex-col gap-2">
                                                          <Input.TextArea
                                                            className="w-full"
                                                            placeholder="Enter description here"
                                                            value={instructionArgs[i]?.description || ''}
                                                            onChange={(e) => handleArgChange(i, 'description', e.target.value)}
                                                            rows={2}
                                                            status={showValidationErrors && validationErrors[i]?.description ? 'error' : ''}
                                                          />
                                                          {showValidationErrors && validationErrors[i]?.description && (
                                                            <span className="text-red-500 text-sm">{validationErrors[i].description}</span>
                                                          )}
                                                          <Input.TextArea
                                                            className="w-full"
                                                            placeholder="Enter your script here"
                                                            value={instructionArgs[i]?.script || ''}
                                                            onChange={(e) => handleArgChange(i, 'script', e.target.value)}
                                                            rows={6}
                                                            status={showValidationErrors && validationErrors[i]?.script ? 'error' : ''}
                                                          />
                                                          {showValidationErrors && validationErrors[i]?.script && (
                                                            <span className="text-red-500 text-sm">{validationErrors[i].script}</span>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div>
                                                    <div className="opacity-0 mr-1 group-hover:opacity-100 transition-opacity duration-200 text-red-500">
                                                      <DeleteFilled
                                                        onClick={() => {
                                                          // Remove the instruction and reindex all arrays/objects
                                                          const newInstructions = [...instructions];
                                                          newInstructions.splice(i, 1);
                                                          setInstructions(newInstructions);

                                                          // Create new objects with reindexed keys
                                                          const newSelectedActions: Record<number, string> = {};
                                                          const newInstructionArgs: Record<number, Record<string, string>> = {};

                                                          // Reindex remaining items
                                                          newInstructions.forEach((_, newIndex) => {
                                                            const oldIndex = newIndex >= i ? newIndex + 1 : newIndex;
                                                            if (selectedActions[oldIndex]) {
                                                              newSelectedActions[newIndex] = selectedActions[oldIndex];
                                                            }
                                                            if (instructionArgs[oldIndex]) {
                                                              newInstructionArgs[newIndex] = instructionArgs[oldIndex];
                                                            }
                                                          });

                                                          setSelectedActions(newSelectedActions);
                                                          setInstructionArgs(newInstructionArgs);
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        </>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                );
                              }}
                            </Droppable>
                          </DragDropContext>
                          {instructions?.length === 0 && test_id && !edit && (
                            <div className="px-4 py-8 text-center" data-testid="instructions-empty-state">
                              <div className="text-gray-500 mb-4">
                                <p className="font-hanken text-[16px] mb-2">No instructions added yet</p>
                                <p className="text-sm">Go to compose mode to add instructions</p>
                              </div>
                              <RoleBasedButton
                                type="primary"
                                onClick={() => setEdit(true)}
                                className="font-hanken !bg-[#AE00FF] !text-white !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                                data-testid="go-to-compose-mode-button"
                              >
                                Go to Compose Mode
                              </RoleBasedButton>

                            </div>
                          )}

                        </div>
                      )
                    )}
                  </div>
                </div>
                {(edit || !test_id) && (
                  <div className="flex border-t-2 shadow-[0_-2px_5px_0_rgba(0,0,0,0.05)] bg-white h-[50px] justify-center items-center gap-10">
                    <Button
                      className={`bg-white hover:!bg-white h-[30px] w-[160px] text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken `}
                      type="primary"
                      onClick={handleCancel}
                      data-testid="test-cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      loading={updateTestLoading || createTestLoading}
                      className={`h-[30px] w-[160px] text-white font-hanken`}
                      type="primary"
                      onClick={() => (edit || editGoal) && test_id ? updateTest() : createTest()}
                      data-testid="test-save-button"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Tabs
              size="small"
              className="font-hanken w-full mr-5 my-5 rounded-md overflow-y-auto bg-white"
              tabBarStyle={{ padding: "0 25px", margin: "0px" }}
              data-testid="test-tabs"
              items={[
                {
                  key: "logs",
                  label: "Logs",
                  children: !test_id ? (
                    <div className="flex flex-col justify-center items-center w-full min-h-[350px]" data-testid="test-logs-empty">
                      <Image
                        src="/assets/blank_test_page.svg"
                        alt="blank test page"
                        width={250}
                        height={250}
                      />
                      <p className="font-hanken text-[16px] mt-2 font-normal">
                        Add details and run your test
                      </p>
                    </div>
                  ) : instructionsLoading ? (
                    <div className="flex flex-col justify-center items-center min-h-[350px]" data-testid="test-logs-loading">
                      <div className="bg-black p-4 rounded h-[360px] min-w-[750px] w-full" data-testid="test-logs-container">
                        <h3 className="font-hanken text-[16px] mb-2 text-white">
                          Logs:
                        </h3>
                        <div className="overflow-auto h-[calc(100%-30px)]" data-testid="test-logs-content">

                          {logs.map((log, index) => (
                            <div
                              key={index}
                              className="text-[#4EC9B0] text-[14px] mb-2"
                              data-testid="test-log"
                            >
                              {log.timestamp && (
                                <span className="text-gray-500 mr-2">
                                  [{log.timestamp}]
                                </span>
                              )}
                              {log.info && <span>{log.info}</span>}
                              {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                              {log.error && (
                                <span className="text-red-500">
                                  {log.error}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (

                    <LogsComponent
                      type="test"
                      id={test_id}
                      triggerGetTestRuns={triggerGetTestRuns}
                      onTriggerProcessed={() => setTriggerGetTestRuns(false)}
                    />

                  ),
                },
                {
                  key: "script",
                  label: "Script",
                  children: (
                    <div className="flex flex-col font-hanken overflow-hidden min-h-[350px]" data-testid="test-script-tab">
                      {instructions?.length > 0 ? (
                        <div className="w-full" data-testid="test-script-content">
                          <div className="flex justify-between mx-[15px] mt-[10px] mb-2 items-center">
                            <p className="font-hanken  font-medium text-[20px]">
                              Playwright script
                            </p>
                            <RoleBasedButton
                              className="font-hanken text-[14px] rounded-[6px] hover:!bg-[#AE00FF] hover:!text-white  !bg-[#AE00FF] border-2 !text-white !border-[#AE00FF]"
                              onClick={handleExport}
                              loading={exportLoading}
                              data-testid="test-script-export-button"
                            >
                              Export
                            </RoleBasedButton>
                          </div>

                          <div className="flex flex-col gap-4">
                            {instructions.map((instruction, index) => {
                              const isEditing = editingScripts[index.toString()];
                              const isSaving = savingScripts[index.toString()];

                              // For run_script actions, show the script content from args
                              let codeArray: string[] = [];
                              if (instruction.action === 'run_script') {
                                const scriptArg = instruction.args?.find((arg: any) => arg.key === 'script');
                                if (scriptArg?.value) {
                                  codeArray = [scriptArg.value];
                                }
                              } else {
                                codeArray = instruction.playwright_actions || [];
                              }

                              const lineCount = codeArray.length || 1;
                              const editorHeight = lineCount * 20 + 50;
                              return (
                                <div
                                  key={index}
                                  className="bg-white w-full shadow"
                                  data-testid="test-script-instruction"
                                >
                                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-shrink-0 w-6 h-6 bg-[#B8B8B8] text-white rounded-md flex items-center justify-center text-xs font-medium" data-testid="test-script-instruction-number">
                                        {index + 1}
                                      </div>
                                      <p className="text-gray-600 break-words" data-testid="test-script-instruction-content">
                                        {selectedActions[index]}
                                        {selectedActions[index] && actions[selectedActions[index]] && (
                                          <>
                                            {actions[selectedActions[index]].args.map((arg) => (
                                              <span key={arg.key} className="break-words">
                                                {selectedActions[index] === 'run_script' && arg.key === 'script' ? '' : `: ${instructionArgs[index]?.[arg.key] || 'Not set'}`}
                                              </span>
                                            ))}
                                            {actions[selectedActions[index]].type === 'AI' && (
                                              <span className="break-words">
                                                : {instructionArgs[index]?.element_id || instructionArgs[index]?.prompt || 'Not set'}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </p>
                                    </div>

                                    {/* {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          className={`bg-white hover:!bg-white h-[30px] text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken `}
                                          type="primary"
                                          onClick={()=>setEditingScripts(prev=>({...prev, [index.toString()]: false}))}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                        className="h-[30px] rounded-[6px] border-2"
                                          type="primary"
                                          loading={isSaving}
                                          onClick={() =>
                                            handleScriptSave(index.toString())
                                          }
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    ) : (
                                      <EditTwoTone
                                        onClick={() => handleScriptEdit(index.toString())}
                                        twoToneColor={["#AE00FF", "#AE00FF"]}
                                        className="border-2 border-[#AE00FF] cursor-pointer h-[32px] rounded-[6px] px-2 hover:!border-[#AE00FF] hover:!text-white"
                                      />
                                    )} */}
                                  </div>
                                  <div className="px-4">
                                    <MonacoEditor
                                      height={editorHeight}
                                      defaultLanguage="python"
                                      value={
                                        isEditing
                                          ? editedScripts[index.toString()]?.join("\n") || ''
                                          : codeArray.join("\n")
                                      }
                                      theme="vs-light"
                                      options={{
                                        readOnly: !isEditing,
                                        minimap: { enabled: false },
                                        lineNumbers: "on",
                                        scrollBeyondLastLine: false,
                                        fontSize: 14,
                                        fontFamily: "monospace",
                                        wordWrap: "on",
                                        cursorStyle: "line",
                                        cursorBlinking: "blink",
                                        cursorSmoothCaretAnimation: "on",
                                        cursorWidth: 1,
                                        renderLineHighlight: "all",
                                        selectOnLineNumbers: true,
                                        selectionHighlight: true,
                                        hover: {
                                          enabled: true,
                                        },
                                        contextmenu: true,
                                        scrollbar: {
                                          vertical: "visible",
                                          horizontal: "visible",
                                          useShadows: false,
                                          verticalScrollbarSize: 10,
                                          horizontalScrollbarSize: 10,
                                        },
                                      }}
                                      onChange={(value) => handleScriptChange(index.toString(), value)}
                                      beforeMount={(monaco) => {
                                        monaco.editor.defineTheme("vs-light", {
                                          base: "vs",
                                          inherit: true,
                                          rules: [],
                                          colors: {
                                            "editor.background": "#f5f5f5",
                                            "editor.lineHighlightBackground": "#f5f5f5",
                                            "editor.lineHighlightBorder": "#f5f5f5",
                                            "editor.selectionBackground": "#b3d4fc",
                                            "editor.inactiveSelectionBackground": "#e5ebf1",
                                            "editorCursor.foreground": "#000000",
                                            "editor.lineNumbers.foreground": "#666666",
                                            "editor.foreground": "#333333",
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center w-full h-[350px]">
                          <Image
                            src="/assets/blank_test_page.svg"
                            alt="blank test page"
                            width={250}
                            height={250}
                          />
                          <p className="font-hanken text-[16px] mt-2 font-normal">
                            Add details and run your test
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Test Config Modal */}
      <Modal
        title="Test Run Configuration"
        open={isTestConfigModalOpen}
        onCancel={() => setIsTestConfigModalOpen(false)}
        data-testid="test-config-modal"
        footer={[
          <Button
            key="cancel"
            className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
            onClick={() => setIsTestConfigModalOpen(false)}
            data-testid="test-config-cancel-button"
          >
            Cancel
          </Button>,
          <Button
            key="run"
            type="primary"
            onClick={() => {
              const [width, height] = testConfig.viewport.split('x').map(Number);
              const browser = testConfig.environment === "browserbase" ? "browserbase" : undefined;
              runTest.mutate({
                testId: test_id,
                browser: browser,
                config: {
                  browser: testConfig.browser,
                  device: {
                    type: testConfig.device,
                    device_config: {
                      os: testConfig.os,
                    }
                  },
                  viewport: {
                    width: width,
                    height: height
                  }
                }
              });
              setIsTestConfigModalOpen(false);
            }}
            className="font-hanken text-[14px] border-2 bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
            data-testid="test-config-run-button"
          >
            Run Test
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-6">
          <Config
            config={{
              browser: testConfig.browser,
              device: testConfig.device,
              os: testConfig.os,
              viewport: testConfig.viewport
            }}
            onConfigChange={(config) => setTestConfig({
              ...testConfig,
              ...config
            })}
            title=""
            className=""
          />

          {/* Environment Selection */}
          <div className="border-t pt-4">
            <div className="font-hanken font-semibold text-[16px] mb-4">Environment</div>
            <Radio.Group
              value={testConfig.environment}
              onChange={(e) => setTestConfig({ ...testConfig, environment: e.target.value })}
              className="font-hanken"
              data-testid="test-environment-radio-group"
            >
              <Radio value="litmus_cloud" className="font-hanken text-sm" data-testid="test-environment-litmus-cloud">
                Litmus Cloud
              </Radio>
            </Radio.Group>
          </div>
        </div>
      </Modal>

      {/* View Segment Modal */}
      <SegmentDetailsModal
        open={isViewSegmentModalOpen}
        onClose={() => {
          setIsViewSegmentModalOpen(false);
          setViewSegmentModalId(null);
        }}
        segmentId={viewSegmentModalId}
        suiteId={suite_id || null}
        getToken={async (options: { template: string }) => {
          const token = await getToken(options);
          if (!token) {
            router.push("/sign-in");
          }
          return token;
        }}
      />

      {/* Share Test Modal */}
      {test_id && (
        <SendInviteModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          orgId={currentUserDetails?.org_id || ""}
          resourceType="test"
          resourceId={test_id}
          resourceUrl={typeof window !== 'undefined' ? window.location.href : null}
          getToken={async () => {
            const token = await getToken({ template: "basic" });
            if (!token) {
              router.push("/sign-in");
            }
            return token;
          }}
          title="Share Test"
        />
      )}
    </>
  );
}

