import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { Tooltip } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getPropertyDisplayText, getTargetDisplayText } from '@/lib/verifyUtils';

interface Viewport {
  width: number;
  height: number;
}

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
    ai_use?: string;
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

interface ComposeConfig {
  environment?: 'browserbase' | 'litmus_cloud' | string;
  browser?: string;
  device?: string;
  os?: string;
  viewport?: string;
}

interface FormatInstructionValueParams {
  value: InstructionObj['value'];
  instruction?: InstructionObj;
  actions: any;
  suite_id?: string | null;
  onViewSegment?: (segmentId: string) => void;
  onShowSelectors?: (selectors: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>, playwrightActions?: string[], instructionId?: string) => void;
}

/**
 * Validates state variable names
 * @param value - The variable name to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateStateVariableName = (value: string): string | null => {
  const variableNamePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!variableNamePattern.test(value)) {
    return 'Variable name must start with a letter and can only contain letters, numbers, and underscores';
  }
  return null;
};

/**
 * Gets the Tailwind CSS color class for a given status
 * @param status - The status string
 * @returns Tailwind CSS color class
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'bg-green-500';
    case 'running':
      return 'bg-yellow-500';
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-slate-300';
  }
};

/**
 * Gets the tooltip text for a given status
 * @param status - The status string
 * @returns Tooltip text
 */
export const getStatusTooltip = (status: string): string => {
  switch (status) {
    case 'success':
      return 'Instruction completed successfully';
    case 'running':
      return 'Instruction is running';
    case 'failed':
      return 'Instruction failed';
    default:
      return 'Instruction run pending';
  }
};

/**
 * Generates an instruction ID, using existing ID if present
 * @param instruction - The instruction object (optional)
 * @returns A UUID string
 */
export const generateInstructionId = (instruction?: { id?: string }): string => {
  // If instruction already has an id, use it
  if (instruction && instruction.id) {
    return instruction.id;
  }
  // Otherwise generate a new UUID
  return uuidv4();
};

/**
 * Gets the current environment name from compose config
 * @param composeConfig - The compose configuration object
 * @returns Environment name string
 */
export const getCurrentEnvironment = (composeConfig?: any): string => {
  if (composeConfig?.environment) {
    const env = composeConfig.environment as string;
    return env === 'browserbase' ? 'Browserbase' : 'Litmus Cloud';
  }
  return 'Browserbase'; // Default fallback
};

/**
 * Calculates iframe container style based on viewport dimensions
 * @param viewport - The viewport dimensions
 * @returns Style object for the iframe container
 */
export const getIframeContainerStyle = (viewport: Viewport): React.CSSProperties => {
  // Use a more conservative container size to prevent overflow
  const maxContainerWidth = 900; // Reduced to prevent overflow
  const maxContainerHeight = 600; // Reduced to prevent overflow

  // Calculate scale to fit within the container
  const scaleX = maxContainerWidth / viewport.width;
  const scaleY = maxContainerHeight / viewport.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

  const scaledWidth = viewport.width * scale;
  const scaledHeight = viewport.height * scale;

  return {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff'
  };
};

/**
 * Calculates compose duration in seconds
 * @param startTime - Start time Date object
 * @param endTime - End time Date object (optional, defaults to now)
 * @returns Duration in seconds, or null if startTime is not provided
 */
export const getComposeDuration = (startTime?: Date, endTime?: Date): number | null => {
  if (!startTime) return null;

  const end = endTime || new Date();
  const duration = end.getTime() - startTime.getTime();
  return Math.floor(duration / 1000); // Return duration in seconds
};

/**
 * Formats instructions array for API payload
 * @param instructions - Array of instruction objects
 * @returns Formatted instructions array for API
 */
export const formatInstructionsPayload = (instructions: InstructionObj[]): any[] => {
  return instructions.map((instr) => {
    if (typeof instr.value === 'string') {
      return {
        id: instr.id,
        type: 'Non-AI',
        action: 'run_script',
        args: [{
          key: 'description',
          value: instr.value
        }],
        playwright_actions: instr.playwright_actions || [],
        selectors: instr.selectors || [],
        status: instr.status || 'pending'
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
        status: instr.status || 'success'
      };
    }

    // Base instruction fields
    const baseInstruction = {
      id: instr.id,
      type: value.type,
      action: value.action,
      args: value.args,
      ...(value.prompt && { prompt: value.prompt }),
      ...(value.ai_use && { ai_use: value.ai_use }),
      status: instr.status || 'pending'
    };

    // If it has element_id, return without playwright_actions and selectors
    if (value.element_id) {
      return {
        ...baseInstruction,
        element_id: value.element_id
      };
    }

    // Otherwise include playwright_actions and selectors
    return {
      ...baseInstruction,
      playwright_actions: instr.playwright_actions || [],
      selectors: instr.selectors || []
    };
  });
};

/**
 * Creates formatted text for instruction display
 * @param text - The display structure template
 * @param params - Parameters including action, args, instruction, and callbacks
 * @returns React node with formatted text
 */
const createFormattedText = (
  text: string,
  params: {
    action: string;
    args: Array<{ key: string; value: string | boolean }>;
    prompt: string;
    element_id: string;
    instruction?: InstructionObj;
    suite_id?: string | null;
    onViewSegment?: (segmentId: string) => void;
    onShowSelectors?: (selectors: Array<{
      display: string;
      script: string;
      selector: string;
      method: string;
    }>, playwrightActions?: string[], instructionId?: string) => void;
  }
): React.ReactNode => {
  const { action, args, prompt, element_id, instruction, suite_id, onViewSegment, onShowSelectors } = params;
  let result = text;

  // Handle reuse_test specially
  if (action === 'reuse_test') {
    const sourceTestId = args.find(arg => arg.key === 'source_test_id')?.value || '';
    const segmentId = args.find(arg => arg.key === 'segment_id')?.value || '';
    const testName = args.find(arg => arg.key === 'test_name')?.value || sourceTestId;
    const segmentName = args.find(arg => arg.key === 'segment_name')?.value || '';

    if (segmentId) {
      // Display segment
      return (
        <div className="flex items-center gap-2">
          <span>Reuse segment <span className='font-semibold'>{segmentName}</span></span>
          <Tooltip title="View segment">
            <ExportOutlined
              className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs"
              onClick={() => onViewSegment?.(segmentId as string)}
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
    const fileId = args.find(arg => arg.key === 'file_id')?.value || '';
    const fileName = args.find(arg => arg.key === 'file_name')?.value || '';
    const displayPrompt = element_id || prompt;
    
    // Check if prompt should be clickable (has selectors or is a store element)
    const isClickable = (instruction?.selectors && instruction.selectors.length > 0) ||
      (instruction?.value && typeof instruction.value !== 'string' && 'element_id' in instruction.value);
    
    return (
      <div className="flex items-center gap-2">
        <span>Upload file <span className='font-semibold underline cursor-pointer hover:text-[#AE00FF]' style={{ textDecorationColor: '#AE00FF' }} onClick={() => window.open(`/dashboard/suite/${suite_id}?tab=2`, '_blank')}>{fileName}</span> in {
          displayPrompt && isClickable && onShowSelectors ? (
            <Tooltip title="View alternate selectors">
              <span
                className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
                style={{ textDecorationColor: '#AE00FF' }}
                onClick={() => onShowSelectors?.(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
              >
                {displayPrompt}
              </span>
            </Tooltip>
          ) : (
            <span className='font-semibold'>{displayPrompt}</span>
          )
        }</span>
      </div>
    );
  }

  // Handle verify specially
  if (action === 'verify') {
    const target = args.find(arg => arg.key === 'target')?.value || '';
    const property = args.find(arg => arg.key === 'property')?.value || '';
    const check = args.find(arg => arg.key === 'check')?.value || '';
    const value = args.find(arg => arg.key === 'value')?.value || '';
    const locator = args.find(arg => arg.key === 'locator')?.value || '';
    const promptValue = args.find(arg => arg.key === 'prompt')?.value || '';
    const subProperty = args.find(arg => arg.key === 'sub_property')?.value || '';
    const subPropertyValue = args.find(arg => arg.key === 'value')?.value || '';
    const expectedResult = args.find(arg => arg.key === 'expected_result')?.value;
    const failTest = args.find(arg => arg.key === 'fail_test')?.value;

    // Check if prompt should be clickable (has selectors or is a store element)
    const isClickable = (instruction?.selectors && instruction.selectors.length > 0) ||
      (instruction?.value && typeof instruction.value !== 'string' && 'element_id' in instruction.value);
    // Get element_id from root level only
    const elementIdValue = (typeof instruction?.value === 'object' && instruction.value.element_id) ? instruction.value.element_id : '';
    const promptOrLocator = elementIdValue || promptValue || locator;

    return (
      <span>
        Verify <span className='font-semibold'>{getTargetDisplayText(String(target))}</span>
        {promptOrLocator && (
          <>: {isClickable ? (
            <Tooltip title="View alternate selectors">
              <span
                className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
                style={{ textDecorationColor: '#AE00FF' }}
                onClick={() => onShowSelectors?.(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
              >
                {promptOrLocator}
              </span>
            </Tooltip>
          ) : (
            <span className='font-semibold'>{promptOrLocator}</span>
          )}
          </>
        )}
        : <span className='font-semibold'>{getPropertyDisplayText(String(property))}</span>
        {check && (
          <> <span className='font-semibold'>{check}</span></>
        )}
        {subProperty && (
          <> <span className='font-semibold'>{subProperty}</span>
            {subPropertyValue && (
              <>: <span className='font-semibold'>{subPropertyValue}</span></>
            )}
          </>
        )}
        {value && property !== 'verify_attribute' && property !== 'verify_css' && (
          <> <span className='font-semibold'>{value}</span></>
        )}
        {expectedResult === false && (
          <> <span className='font-semibold text-red-500'>(Expected to fail)</span></>
        )}
        {failTest === false && (
          <> <span className='font-semibold text-blue-500'>(Continue on failure)</span></>
        )}
      </span>
    );
  }

  // Handle switch_tab specially
  if (action === 'switch_tab') {
    const urlValue = args.find(arg => arg.key === 'url')?.value || '';
    const tabSelectionMethod = args.find(arg => arg.key === 'tabSelectionMethod')?.value || 'dropdown';
    const displayText = tabSelectionMethod === 'regex' ? 'Switch to tab matching regex' : 'Switch to tab';
    return (
      <div className="flex items-center gap-2">
        <span>{displayText} <span className='font-semibold'>{urlValue}</span></span>
      </div>
    );
  }

  // Handle key_press specially
  if (action === 'key_press') {
    const keyType = args.find(arg => arg.key === 'key_type')?.value || '';
    const value = args.find(arg => arg.key === 'value')?.value || '';

    let displayText = '';
    if (keyType === 'up') {
      displayText = `Key Up: <span class="font-semibold">${value}</span>`;
    } else if (keyType === 'down') {
      displayText = `Key Down: <span class="font-semibold">${value}</span>`;
    } else {
      displayText = `Key Press: <span class="font-semibold">${value}</span>`;
    }

    return (
      <div className="flex items-center gap-2">
        <span dangerouslySetInnerHTML={{ __html: displayText }} />
      </div>
    );
  }

  // Handle ai_assert specially
  if (action === 'ai_assert') {
    const promptValue = prompt || '';
    const expectedResult = args.find(arg => arg.key === 'expected_result')?.value;
    const failTest = args.find(arg => arg.key === 'fail_test')?.value;
    
    // Check if prompt should be clickable (has selectors or is a store element)
    const isClickable = (instruction?.selectors && instruction.selectors.length > 0) ||
      (instruction?.value && typeof instruction.value !== 'string' && 'element_id' in instruction.value);
    const elementIdValue = (typeof instruction?.value === 'object' && instruction.value.element_id) ? instruction.value.element_id : '';
    const displayPrompt = elementIdValue || promptValue;
    
    return (
      <span>
        Verify with AI {displayPrompt && (
          <>: {isClickable ? (
            <Tooltip title="View alternate selectors">
              <span
                className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
                style={{ textDecorationColor: '#AE00FF' }}
                onClick={() => onShowSelectors?.(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
              >
                {displayPrompt}
              </span>
            </Tooltip>
          ) : (
            <span className='font-semibold'>{displayPrompt}</span>
          )}
          </>
        )}
        {(expectedResult === false || expectedResult === 'false') && (
          <> <span className='font-semibold text-red-500'>(Expected to fail)</span></>
        )}
        {(failTest === false || failTest === 'false') && (
          <> <span className='font-semibold text-blue-500'>(Continue on failure)</span></>
        )}
      </span>
    );
  }

  // Replace [prompt] with the actual prompt or element_id - make it clickable if it has selectors or is a store element
  const displayPrompt = element_id || prompt;
  if (displayPrompt) {
    const isClickable = (instruction?.selectors && instruction.selectors.length > 0) ||
      (instruction?.value && typeof instruction.value !== 'string' && 'element_id' in instruction.value);
    // Handle ai_script specially
    if (action === 'ai_script') {
      const description = args.find(arg => arg.key === 'description')?.value || '';
      return (
        <div className="flex items-center gap-2">
          <span>Script (AI generated) <span className='font-semibold'>{description}</span></span>
        </div>
      );
    }

    if (isClickable) {
      // For clickable prompts, we need to return a React element
      result = result.replace('[prompt]', '');
      const promptElement = (
        <Tooltip title="View alternate selectors">
          <span
            className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
            style={{ textDecorationColor: '#AE00FF' }}
            onClick={() => onShowSelectors?.(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
          >
            {displayPrompt}
          </span>
        </Tooltip>
      );

      // Replace other placeholders with actual values
      args.forEach(arg => {
        const placeholder = `[${arg.key}]`;
        if (result.includes(placeholder)) {
          result = result.replace(placeholder, `<span class="font-semibold">${arg.value}</span>`);
        }
      });

      return (
        <>
          <span dangerouslySetInnerHTML={{ __html: result }} />
          {promptElement}
        </>
      );
    } else {
      result = result.replace('[prompt]', `<span class="font-semibold">${displayPrompt}</span>`);
    }
  }

  // Replace other placeholders with actual values
  args.forEach(arg => {
    const placeholder = `[${arg.key}]`;
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, `<span class="font-semibold">${arg.value}</span>`);
    }
  });

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

/**
 * Formats instruction value for display
 * @param params - Parameters including value, instruction, actions, and callbacks
 * @returns React node with formatted instruction value
 */
export const formatInstructionValue = (params: FormatInstructionValueParams): React.ReactNode => {
  const { value, instruction, actions, suite_id, onViewSegment, onShowSelectors } = params;

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

  return createFormattedText(actionConfig.displayStructure, {
    action,
    args,
    prompt,
    element_id,
    instruction,
    suite_id,
    onViewSegment,
    onShowSelectors
  });
};
