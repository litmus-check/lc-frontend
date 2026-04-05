import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { actions } from '@/lib/constants/actions';
import { validateVerifyArguments, shouldIncludeVerifyArg, getFieldDisplayName, transformCheckValueForBackend } from '@/lib/verifyUtils';
import { validateJSON } from '@/lib/utils';

// Helper function to validate state variable names
const validateStateVariableName = (value: string): string | null => {
  const variableNamePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!variableNamePattern.test(value)) {
    return 'Variable name must start with a letter and can only contain letters, numbers, and underscores';
  }
  return null;
};

interface InstructionObj {
  id: string;
  value: string | {
    type: string;
    action: string;
    args: Array<{
      key: string;
      value: any;
    }>;
    prompt?: string;
    element_id?: string;
    ai_use?: string;
  };
  playwright_actions?: any[];
  selectors?: any[];
  status?: string;
}

interface UseInstructionHandlersProps {
  selectedAction: string;
  instructionArgs: Record<string, string>;
  elementType: 'existing' | 'new';
  selectedTestId: string;
  selectedSegmentId: string;
  selectedFileId: string;
  aiUse: 'generate_script' | 'always_ai';
  availableTests: Array<{ id: string; name: string }>;
  availableSegments: Array<{ segment_id: string; segment_name: string; test_id: string; test_name: string }>;
  availableFiles: Array<{ file_id: string; file_name: string }>;
  elements: Array<{ element_id: string }>;
  editSelectedAction: string;
  editInstructionArgs: Record<string, string>;
  editAiUse: 'generate_script' | 'always_ai';
  editingId: string | null;
  instructions: InstructionObj[];
  composeModeStatus: { status: string };
  setSelectedAction: (action: string) => void;
  setInstructionArgs: (args: Record<string, string>) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  setShowValidationErrors: (show: boolean) => void;
  setSelectedTestId: (id: string) => void;
  setSelectedSegmentId: (id: string) => void;
  setAvailableTests: (tests: Array<{ id: string; name: string }>) => void;
  setAvailableSegments: (segments: Array<any>) => void;
  setSelectedFileId: (id: string) => void;
  setAvailableFiles: (files: Array<{ file_id: string; file_name: string }>) => void;
  setInstructions: (instructions: InstructionObj[] | ((prev: InstructionObj[]) => InstructionObj[])) => void;
  setEditingId: (id: string | null) => void;
  setEditSelectedAction: (action: string) => void;
  setEditInstructionArgs: (args: Record<string, string>) => void;
  setEditValidationErrors: (errors: Record<string, string>) => void;
  setShowEditValidationErrors: (show: boolean) => void;
  setElementType: (type: 'existing' | 'new') => void;
  setEditAiUse: (use: 'generate_script' | 'always_ai') => void;
  setEditVerifyCurrentArgIndex: (index: number) => void;
  setTestSearchQuery: (query: string) => void;
  shouldRunCompose: React.MutableRefObject<boolean>;
  fetchSuiteTests: () => Promise<void>;
  fetchSuiteSegments: () => Promise<void>;
  fetchSuiteFiles: () => Promise<void>;
}

export const useInstructionHandlers = ({
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
}: UseInstructionHandlersProps) => {
  const [messageApi] = message.useMessage();

  const handleAddAndRun = () => {
    if (!selectedAction) {
      messageApi.error("Please select an action first");
      return;
    }

    const errors: Record<string, string> = {};
    if ((actions[selectedAction]?.type === 'AI' && selectedAction !== 'ai_script' && selectedAction !== 'ai_assert')) {
      if (elementType === 'existing' && !instructionArgs.element_id) {
        errors.element_id = 'Please select an element';
      } else if (elementType === 'new' && !instructionArgs.prompt) {
        errors.prompt = 'Prompt cannot be empty';
      }
    }
    if (selectedAction === 'ai_assert' && !instructionArgs.prompt) {
      errors.prompt = 'Prompt cannot be empty';
    }
    if (selectedAction === 'run_script' && !instructionArgs.description) {
      errors.description = 'Description cannot be empty';
    }
    if (selectedAction === 'reuse_test' && !selectedTestId && !selectedSegmentId) {
      errors.source_test_id = 'Please select a test or segment to reuse';
    }
    if (selectedAction === 'ai_file_upload' && !selectedFileId) {
      errors.file_id = 'Please select a file to upload';
    }
    if (selectedAction === 'switch_tab' && !instructionArgs.tabSelectionMethod) {
      errors.tabSelectionMethod = 'Please select a tab selection method';
    }

    if (selectedAction === 'api_mock') {
      const responseHeaderError = validateJSON(instructionArgs.response_header as string || '', 'Response header');
      if (responseHeaderError) {
        errors.response_header = responseHeaderError;
      }
      const responseBodyError = validateJSON(instructionArgs.response_body as string || '', 'Response body');
      if (responseBodyError) {
        errors.response_body = responseBodyError;
      }
      // Validate status_code: must be a number >= 100 and < 1000
      const statusCode = instructionArgs.status_code as string;
      if (!statusCode || statusCode.trim() === '') {
        errors.status_code = 'Status code cannot be empty';
      } else {
        const num = Number(statusCode);
        if (isNaN(num) || !Number.isInteger(num)) {
          errors.status_code = 'Status code must be a valid number';
        } else if (num < 100 || num >= 1000) {
          errors.status_code = 'Status code must be >= 100 and < 1000';
        }
      }
    }

    if (selectedAction === 'verify') {
      const verifyErrors = validateVerifyArguments(instructionArgs, elementType);
      Object.assign(errors, verifyErrors);
    } else {
      actions[selectedAction]?.args?.forEach(arg => {
        if (selectedAction === 'reuse_test' || selectedAction === 'ai_file_upload') {
          return;
        }
        // Skip js_code validation for api_intercept when action is abort_request or record_only
        if (selectedAction === 'api_intercept' && arg.key === 'js_code') {
          const action = instructionArgs.action as string;
          if (action === 'abort_request' || action === 'record_only') {
            return;
          }
        }
        if (instructionArgs[arg.key] === undefined || instructionArgs[arg.key] === null) {
          errors[arg.key] = `${getFieldDisplayName(arg.key)} cannot be empty`;
        } else if (selectedAction === 'set_state_variable' && arg.key === 'key') {
          const error = validateStateVariableName(instructionArgs[arg.key]);
          if (error) {
            errors[arg.key] = error;
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      messageApi.error("Please fill in all required fields");
      return;
    }

    let newInstruction: any;

    if (selectedAction === 'reuse_test') {
      if (selectedTestId) {
        const selectedTest = availableTests.find(test => test.id === selectedTestId);
        newInstruction = {
          type: 'Test-Segment',
          action: 'reuse_test',
          args: [{
            key: 'source_test_id',
            value: selectedTestId
          }, {
            key: 'test_name',
            value: selectedTest?.name || ''
          }],
          playwright_actions: [],
          status: 'success'
        };
      } else if (selectedSegmentId) {
        const selectedSegment = availableSegments.find(segment => segment.segment_id === selectedSegmentId);
        newInstruction = {
          type: 'Test-Segment',
          action: 'reuse_test',
          args: [{
            key: 'source_test_id',
            value: selectedSegment?.test_id || ''
          }, {
            key: 'test_name',
            value: selectedSegment?.test_name || ''
          }, {
            key: 'segment_id',
            value: selectedSegmentId
          }, {
            key: 'segment_name',
            value: selectedSegment?.segment_name || ''
          }],
          playwright_actions: [],
          status: 'success'
        };
      }
    } else if (selectedAction === 'ai_file_upload') {
      const selectedFile = availableFiles.find(file => file.file_id === selectedFileId);
      newInstruction = {
        type: 'AI',
        action: 'ai_file_upload',
        args: [{
          key: 'file_id',
          value: selectedFileId
        }, {
          key: 'file_name',
          value: selectedFile?.file_name || ''
        }],
        prompt: instructionArgs.prompt || '',
        ...(aiUse && { ai_use: aiUse })
      };
      
      // Handle element_id for existing elements
      if (elementType === 'existing' && instructionArgs.element_id) {
        const selectedElement = elements.find(el => el.element_id === instructionArgs.element_id);
        if (selectedElement) {
          delete newInstruction.prompt;
          newInstruction.element_id = selectedElement.element_id;
        }
      }
    } else {
      let argsToInclude = actions[selectedAction]?.args || [];

      if (selectedAction === 'verify') {
        argsToInclude = argsToInclude.filter(arg => shouldIncludeVerifyArg(arg.key, instructionArgs));
      }

      // Filter out js_code for api_intercept when action is abort_request or record_only
      if (selectedAction === 'api_intercept') {
        const action = instructionArgs.action as string;
        if (action === 'abort_request' || action === 'record_only') {
          argsToInclude = argsToInclude.filter(arg => arg.key !== 'js_code');
        }
      }

      newInstruction = {
        type: actions[selectedAction]?.type || 'Non-AI',
        action: selectedAction,
        args: argsToInclude.map(arg => ({
          key: arg.key,
          value: (arg.key === 'fail_test' || arg.key === 'expected_result')
            ? (instructionArgs[arg.key] === 'true' ? true : false)
            : (arg.key === 'check' && selectedAction === 'verify')
              ? transformCheckValueForBackend(instructionArgs[arg.key] || '')
              : (instructionArgs[arg.key] || '')
        })),
        ...(actions[selectedAction]?.type === 'AI' && selectedAction !== 'ai_script' && { prompt: instructionArgs.prompt || '' }),
        ...(((actions[selectedAction]?.type === 'AI' && selectedAction !== 'ai_assert') || (selectedAction === 'verify' && instructionArgs.locator_type === 'ai')) && { ai_use: aiUse })
      };

      if ((actions[selectedAction]?.type === 'AI' && selectedAction !== 'ai_script' && selectedAction !== 'ai_assert') || (selectedAction === 'verify' && instructionArgs.target === 'element' && instructionArgs.locator_type === 'ai')) {
        if (elementType === 'existing' && instructionArgs.element_id) {
          const selectedElement = elements.find(el => el.element_id === instructionArgs.element_id);
          if (selectedElement) {
            delete newInstruction.prompt;
            newInstruction.element_id = selectedElement.element_id;
          }
        }
      }

      if (selectedAction === 'switch_tab') {
        newInstruction.args.push({
          key: 'tabSelectionMethod',
          value: instructionArgs.tabSelectionMethod || 'dropdown'
        });
      }
    }

    shouldRunCompose.current = true;

    const newInstructionId = uuidv4();
    setInstructions(prev => [...prev, {
      id: newInstructionId,
      value: newInstruction as InstructionObj['value'],
      playwright_actions: [],
      selectors: [],
      status: 'pending'
    }]);

    setSelectedAction('');
    setInstructionArgs({});
    setValidationErrors({});
    setShowValidationErrors(false);
    setSelectedTestId('');
    setSelectedSegmentId('');
    setAvailableTests([]);
    setAvailableSegments([]);
    setSelectedFileId('');
    setAvailableFiles([]);

    if ((actions[selectedAction]?.type === 'AI' && selectedAction !== 'ai_assert') || (selectedAction === 'verify' && instructionArgs.locator_type === 'ai')) {
      newInstruction.ai_use = aiUse;
    }
  };

  const handleDeleteInstruction = (id: string) => {
    shouldRunCompose.current = false;
    setInstructions(prev => prev.filter(instr => instr.id !== id));
  };

  const handleAddInstructionBetween = (index: number) => {
    if (composeModeStatus.status === 'running' || composeModeStatus.status === 'completed' || composeModeStatus.status === 'failed') {
      return;
    }

    // Check if there's an existing empty instruction being edited and remove it
    let adjustedIndex = index;
    let newInstructionId = uuidv4();
    
    setInstructions(prev => {
      const newInstructions = [...prev];
      
      // Find and remove the existing empty instruction if it exists
      if (editingId) {
        const existingEmptyIndex = newInstructions.findIndex(instr => instr.id === editingId);
        if (existingEmptyIndex !== -1) {
          const existingInstruction = newInstructions[existingEmptyIndex];
          if (typeof existingInstruction.value === 'object' && existingInstruction.value !== null) {
            const value = existingInstruction.value as { action?: string; args?: any[] };
            // Check if it's an empty instruction (no action selected)
            if (value.action === '' && (!value.args || value.args.length === 0)) {
              newInstructions.splice(existingEmptyIndex, 1);
              // Adjust the target index if the removed instruction was before the target position
              if (existingEmptyIndex < index) {
                adjustedIndex = index - 1;
              }
            }
          }
        }
      }
      
      // Create and insert the new empty instruction
      const newInstruction: InstructionObj = {
        id: newInstructionId,
        value: {
          type: 'Non-AI',
          action: '',
          args: []
        },
        playwright_actions: [],
        selectors: [],
        status: 'pending'
      };
      
      newInstructions.splice(adjustedIndex, 0, newInstruction);
      
      return newInstructions;
    });
    
    // Set the new instruction as the one being edited
    setEditingId(newInstructionId);
    setEditSelectedAction('');
    setEditInstructionArgs({});
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || composeModeStatus.status === 'running') return;
    const reordered = Array.from(instructions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setInstructions(reordered);
  };

  const handleEditInstruction = (id: string, value: InstructionObj['value']) => {
    setEditingId(id);
    if (typeof value === 'string') {
      setEditSelectedAction('run_script');
      setEditInstructionArgs({
        description: value,
        script: ''
      });
    } else {
      setEditSelectedAction(value.action);
      setEditAiUse((value as any).ai_use || 'generate_script');
      const args: Record<string, string> = {};

      if (value.args) {
        value.args.forEach(arg => {
          if (arg.key === 'fail_test' || arg.key === 'expected_result') {
            args[arg.key] = arg.value === true ? 'true' : 'false';
          } else {
            const stringValue = arg.value != null ? String(arg.value) : '';
            args[arg.key] = stringValue;
          }
        });
      }

      if (value.prompt) {
        args.prompt = value.prompt;
      }

      if (value.element_id) {
        args.element_id = value.element_id;
        setElementType('existing');
      } else if (value.prompt && actions[editSelectedAction]?.type === 'AI') {
        setElementType('new');
      }

      setEditInstructionArgs(args);

      if (value.action === 'reuse_test') {
        setTestSearchQuery('');
        fetchSuiteTests();
        fetchSuiteSegments();
        const sourceTestId = value.args?.find(arg => arg.key === 'source_test_id')?.value || '';
        const segmentId = value.args?.find(arg => arg.key === 'segment_id')?.value || '';

        if (segmentId) {
          setSelectedTestId('');
          setSelectedSegmentId(segmentId as string);
        } else {
          setSelectedTestId(sourceTestId as string);
          setSelectedSegmentId('');
        }
      }

      if (value.action === 'ai_file_upload') {
        fetchSuiteFiles();
        const fileId = value.args?.find(arg => arg.key === 'file_id')?.value || '';
        setSelectedFileId(fileId as string);
      }

      if (value.action === 'verify') {
        const target = args.target;
        let currentIndex = 0;

        if (target === 'page') {
          const visibleArgs = actions.verify.args.slice(0, -2).filter(arg =>
            !(arg.key === 'locator_type' || arg.key === 'prompt' || arg.key === 'locator' ||
              arg.key === 'sub_property' || arg.key === 'value')
          );

          for (let i = 0; i < visibleArgs.length; i++) {
            if (args[visibleArgs[i].key]) {
              currentIndex = i;
            } else {
              break;
            }
          }
        } else {
          const visibleArgs = actions.verify.args.slice(0, -2);
          for (let i = 0; i < visibleArgs.length; i++) {
            if (args[visibleArgs[i].key]) {
              currentIndex = i;
            } else {
              break;
            }
          }
        }

        setEditVerifyCurrentArgIndex(currentIndex);
      }

      if (value.action === 'switch_tab') {
        const tabSelectionMethod = value.args?.find(arg => arg.key === 'tabSelectionMethod')?.value || 'dropdown';
        args.tabSelectionMethod = String(tabSelectionMethod);
      }

      if (value.action === 'ai_assert') {
        if (!args.fail_test) {
          args.fail_test = 'true';
        }
        if (!args.expected_result) {
          args.expected_result = 'true';
        }
      }
    }
  };

  const handleSaveEdit = () => {
    if (!editSelectedAction) {
      messageApi.error("Please select an action first");
      return;
    }

    const errors: Record<string, string> = {};
    if ((actions[editSelectedAction]?.type === 'AI' && editSelectedAction !== 'ai_script' && editSelectedAction !== 'ai_assert')) {
      if (elementType === 'existing' && !editInstructionArgs.element_id) {
        errors.element_id = 'Please select an element';
      } else if (elementType === 'new' && !editInstructionArgs.prompt) {
        errors.prompt = 'Prompt cannot be empty';
      }
    }
    if (editSelectedAction === 'ai_assert' && !editInstructionArgs.prompt) {
      errors.prompt = 'Prompt cannot be empty';
    }
    if (editSelectedAction === 'run_script' && !editInstructionArgs.description) {
      errors.description = 'Description cannot be empty';
    }
    if (editSelectedAction === 'reuse_test' && !selectedTestId && !selectedSegmentId) {
      errors.source_test_id = 'Please select a test or segment to reuse';
    }
    if (editSelectedAction === 'ai_file_upload' && !selectedFileId) {
      errors.file_id = 'Please select a file to upload';
    }
    if (editSelectedAction === 'switch_tab' && !editInstructionArgs.tabSelectionMethod) {
      errors.tabSelectionMethod = 'Please select a tab selection method';
    }

    if (editSelectedAction === 'api_mock') {
      const responseHeaderError = validateJSON(editInstructionArgs.response_header as string || '', 'Response header');
      if (responseHeaderError) {
        errors.response_header = responseHeaderError;
      }
      const responseBodyError = validateJSON(editInstructionArgs.response_body as string || '', 'Response body');
      if (responseBodyError) {
        errors.response_body = responseBodyError;
      }
      // Validate status_code: must be a number >= 100 and < 1000
      const statusCode = editInstructionArgs.status_code as string;
      if (!statusCode || statusCode.trim() === '') {
        errors.status_code = 'Status code cannot be empty';
      } else {
        const num = Number(statusCode);
        if (isNaN(num) || !Number.isInteger(num)) {
          errors.status_code = 'Status code must be a valid number';
        } else if (num < 100 || num >= 1000) {
          errors.status_code = 'Status code must be >= 100 and < 1000';
        }
      }
    }

    if (editSelectedAction === 'verify') {
      const verifyErrors = validateVerifyArguments(editInstructionArgs, elementType);
      Object.assign(errors, verifyErrors);
    } else {
      actions[editSelectedAction]?.args?.forEach(arg => {
        if (editSelectedAction === 'reuse_test' || editSelectedAction === 'ai_file_upload') {
          return;
        }
        // Skip js_code validation for api_intercept when action is abort_request or record_only
        if (editSelectedAction === 'api_intercept' && arg.key === 'js_code') {
          const action = editInstructionArgs.action as string;
          if (action === 'abort_request' || action === 'record_only') {
            return;
          }
        }
        if (editInstructionArgs[arg.key] === undefined || editInstructionArgs[arg.key] === null) {
          errors[arg.key] = `${getFieldDisplayName(arg.key)} cannot be empty`;
        } else if (editSelectedAction === 'set_state_variable' && arg.key === 'key') {
          const error = validateStateVariableName(editInstructionArgs[arg.key]);
          if (error) {
            errors[arg.key] = error;
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      setShowEditValidationErrors(true);
      messageApi.error("Please fill in all required fields");
      return;
    }

    let newInstruction: any;

    if (editSelectedAction === 'reuse_test') {
      if (selectedTestId) {
        const selectedTest = availableTests.find(test => test.id === selectedTestId);
        newInstruction = {
          type: 'Test-Segment',
          action: editSelectedAction,
          args: [{
            key: 'source_test_id',
            value: selectedTestId
          }, {
            key: 'test_name',
            value: selectedTest?.name || ''
          }],
          playwright_actions: [],
          status: 'success'
        };
      } else if (selectedSegmentId) {
        const selectedSegment = availableSegments.find(segment => segment.segment_id === selectedSegmentId);
        newInstruction = {
          type: 'Test-Segment',
          action: editSelectedAction,
          args: [{
            key: 'source_test_id',
            value: selectedSegment?.test_id || ''
          }, {
            key: 'test_name',
            value: selectedSegment?.test_name || ''
          }, {
            key: 'segment_id',
            value: selectedSegmentId
          }, {
            key: 'segment_name',
            value: selectedSegment?.segment_name || ''
          }],
          playwright_actions: [],
          status: 'success'
        };
      }
    } else if (editSelectedAction === 'ai_file_upload') {
      const selectedFile = availableFiles.find(file => file.file_id === selectedFileId);
      newInstruction = {
        type: 'AI',
        action: editSelectedAction,
        args: [{
          key: 'file_id',
          value: selectedFileId
        }, {
          key: 'file_name',
          value: selectedFile?.file_name || ''
        }],
        prompt: editInstructionArgs.prompt || '',
        ...(editAiUse && { ai_use: editAiUse })
      };
      
      // Handle element_id for existing elements
      if (elementType === 'existing' && editInstructionArgs.element_id) {
        const selectedElement = elements.find(el => el.element_id === editInstructionArgs.element_id);
        if (selectedElement) {
          delete newInstruction.prompt;
          newInstruction.element_id = selectedElement.element_id;
        }
      } else if (elementType === 'new' && editInstructionArgs.prompt) {
        newInstruction.prompt = editInstructionArgs.prompt;
      }
    } else {
      let argsToInclude = actions[editSelectedAction]?.args || [];

      if (editSelectedAction === 'verify') {
        argsToInclude = argsToInclude.filter(arg => shouldIncludeVerifyArg(arg.key, editInstructionArgs));
      }

      // Filter out js_code for api_intercept when action is abort_request or record_only
      if (editSelectedAction === 'api_intercept') {
        const action = editInstructionArgs.action as string;
        if (action === 'abort_request' || action === 'record_only') {
          argsToInclude = argsToInclude.filter(arg => arg.key !== 'js_code');
        }
      }

      newInstruction = {
        type: actions[editSelectedAction]?.type || 'Non-AI',
        action: editSelectedAction,
        args: argsToInclude.map(arg => ({
          key: arg.key,
          value: (arg.key === 'fail_test' || arg.key === 'expected_result')
            ? (editInstructionArgs[arg.key] === 'true' ? true : false)
            : (arg.key === 'check' && editSelectedAction === 'verify')
              ? transformCheckValueForBackend(editInstructionArgs[arg.key] || '')
              : (editInstructionArgs[arg.key] || '')
        })),
        ...(actions[editSelectedAction]?.type === 'AI' && editSelectedAction !== 'ai_script' && { prompt: editInstructionArgs.prompt || '' }),
        ...((actions[editSelectedAction]?.type === 'AI' && editSelectedAction !== 'ai_assert') || (editSelectedAction === 'verify' && editInstructionArgs.locator_type === 'ai')) && { ai_use: editAiUse }
      };

      if ((actions[editSelectedAction]?.type === 'AI' && editSelectedAction !== 'ai_script' && editSelectedAction !== 'ai_assert') || (editSelectedAction === 'verify' && editInstructionArgs.target === 'element' && editInstructionArgs.locator_type === 'ai')) {
        if (elementType === 'existing' && editInstructionArgs.element_id) {
          const selectedElement = elements.find(el => el.element_id === editInstructionArgs.element_id);
          if (selectedElement) {
            delete newInstruction.prompt;
            newInstruction.element_id = selectedElement.element_id;
          }
        } else if (elementType === 'new' && editInstructionArgs.prompt) {
          newInstruction.prompt = editInstructionArgs.prompt;
        }
      }

      if (editSelectedAction === 'switch_tab') {
        newInstruction.args.push({
          key: 'tabSelectionMethod',
          value: editInstructionArgs.tabSelectionMethod || 'dropdown'
        });
      }
    }

    shouldRunCompose.current = false;
    setInstructions(prev => prev.map(instr => {
      if (instr.id === editingId) {
        if (editSelectedAction === 'ai_script') {
          const currentPrompt = (instr.value as any)?.prompt || '';
          const newPrompt = editInstructionArgs.prompt || '';
          const promptChanged = currentPrompt !== newPrompt;

          return {
            ...instr,
            value: newInstruction as InstructionObj['value'],
            playwright_actions: promptChanged ? [] : (instr.playwright_actions || []),
            selectors: promptChanged ? [] : (instr.selectors || []),
            status: 'pending'
          };
        }
        return { ...instr, value: newInstruction as InstructionObj['value'], playwright_actions: [], selectors: [], status: 'pending' };
      }
      return instr;
    }));

    setEditingId(null);
    setEditSelectedAction('');
    setEditInstructionArgs({});
    setEditValidationErrors({});
    setShowEditValidationErrors(false);
    setSelectedTestId('');
    setSelectedSegmentId('');
    setAvailableTests([]);
    setAvailableSegments([]);
  };

  const handleCancelEdit = () => {
    if (editingId) {
      const instructionToCancel = instructions.find(instr => instr.id === editingId);
      if (instructionToCancel && typeof instructionToCancel.value === 'object' && instructionToCancel.value !== null) {
        const value = instructionToCancel.value as { action?: string; args?: any[] };
        if (value.action === '' && (!value.args || value.args.length === 0)) {
          setInstructions(prev => prev.filter(instr => instr.id !== editingId));
        }
      }
    }
    
    setEditingId(null);
    setEditSelectedAction('');
    setEditInstructionArgs({});
    setEditValidationErrors({});
    setShowEditValidationErrors(false);
    setSelectedTestId('');
    setSelectedSegmentId('');
    setAvailableTests([]);
    setAvailableSegments([]);
  };

  return {
    handleAddAndRun,
    handleDeleteInstruction,
    handleAddInstructionBetween,
    onDragEnd,
    handleEditInstruction,
    handleSaveEdit,
    handleCancelEdit,
  };
};
