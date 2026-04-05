'use client'
import React from 'react';
import Image from 'next/image';
import { Tooltip, Button, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { actions } from "@/lib/constants/actions";
import {
  getPropertyDisplayText,
  getTargetDisplayText,
} from '@/lib/verifyUtils';

export interface InstructionObj {
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
    locator_type?: string;
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

interface InstructionDisplayProps {
  instruction: InstructionObj;
  suite_id?: string;
  showMenu?: boolean;
  showStatus?: boolean;
  onEdit?: (id: string, value: InstructionObj['value']) => void;
  onDelete?: (id: string) => void;
  onViewSegment?: (segmentId: string) => void;
  onShowSelectors?: (selectors: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>, playwrightActions: string[], instructionId?: string) => void;
  menuDisabled?: boolean;
  openDropdownId?: string | null;
  onDropdownOpenChange?: (open: boolean) => void;
  className?: string;
}

const getStatusColor = (status: string) => {
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

const getStatusTooltip = (status: string) => {
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

const formatInstructionValue = (
  value: InstructionObj['value'],
  instruction?: InstructionObj,
  suite_id?: string,
  onViewSegment?: (segmentId: string) => void,
  onShowSelectors?: (selectors: Array<{
    display: string;
    script: string;
    selector: string;
    method: string;
  }>, playwrightActions: string[], instructionId?: string) => void
): React.ReactNode => {
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
  const createFormattedText = (text: string): React.ReactNode => {
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
            {onViewSegment && (
              <Tooltip title="View segment">
                <ExportOutlined
                  className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs"
                  onClick={() => onViewSegment(segmentId as string)}
                />
              </Tooltip>
            )}
          </div>
        );
      } else {
        // Display test
        return (
          <div className="flex items-center gap-2">
            <span>Reuse test <span className='font-semibold'>{testName}</span></span>
            {suite_id && (
              <Tooltip title="Go to test">
                <Link target='_blank' href={`/dashboard/suite/${suite_id}/test/${sourceTestId}`}>
                  <ExportOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs" />
                </Link>
              </Tooltip>
            )}
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
          <span>Upload file <span className='font-semibold underline cursor-pointer hover:text-[#AE00FF]' style={{ textDecorationColor: '#AE00FF' }} onClick={() => suite_id && window.open(`/dashboard/suite/${suite_id}?tab=2`, '_blank')}>{fileName}</span> in {
            displayPrompt && isClickable && onShowSelectors ? (
              <Tooltip title="View alternate selectors">
                <span
                  className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
                  style={{ textDecorationColor: '#AE00FF' }}
                  onClick={() => onShowSelectors(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
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
            <>: {isClickable && onShowSelectors ? (
              <Tooltip title="View alternate selectors">
                <span
                  className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
                  style={{ textDecorationColor: '#AE00FF' }}
                  onClick={() => onShowSelectors(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
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
            <>: {isClickable && onShowSelectors ? (
              <Tooltip title="View alternate selectors">
                <span
                  className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
                  style={{ textDecorationColor: '#AE00FF' }}
                  onClick={() => onShowSelectors(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
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
    

      if (isClickable && onShowSelectors) {
        // For clickable prompts, we need to return a React element
        result = result.replace('[prompt]', '');
        const promptElement = (
          <Tooltip title="View alternate selectors">
            <span
              className="font-semibold underline cursor-pointer hover:text-[#AE00FF]"
              style={{ textDecorationColor: '#AE00FF' }}
              onClick={() => onShowSelectors(instruction?.selectors || [], instruction?.playwright_actions || [], instruction?.id)}
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

  return createFormattedText(actionConfig.displayStructure);
};

export const InstructionDisplay: React.FC<InstructionDisplayProps> = ({
  instruction,
  suite_id,
  showMenu = false,
  showStatus = true,
  onEdit,
  onDelete,
  onViewSegment,
  onShowSelectors,
  menuDisabled = false,
  openDropdownId,
  onDropdownOpenChange,
  className = '',
}) => {
  const instr = instruction;
  const isMenuOpen = openDropdownId === instr.id;

  return (
    <div className={`text-black bg-[#F8F9FD] border border-[#DDE5FF] w-[430px] rounded-lg p-2 text-sm break-words flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-2 overflow-hidden">
          <div className="flex items-center gap-2">
            {typeof instr.value !== 'string' && actions[instr.value.action]?.displayIcon && (
              <Image
                src={actions[instr.value.action].displayIcon}
                alt={actions[instr.value.action].displayName}
                width={16}
                height={16}
                style={{ 
                  width: '16px', 
                  height: '16px',
                  filter: instr.value.action === 'ai_assert' ? 'brightness(0)' : 'none'
                }}
              />
            )}
            <div className='font-hanken'>
              {formatInstructionValue(instr.value, instr, suite_id, onViewSegment, onShowSelectors)}
            </div>
          </div>
        </div>
        {/* Status indicator - hidden on hover or when menu is open */}
        {showStatus && (
          <div className={`${getStatusColor(instr.status || '')} rounded-[50%] flex-shrink-0 ${isMenuOpen ? 'hidden' : 'group-hover:hidden'}`} data-testid="instruction-status">
            <div className={`w-[16px] h-[16px]`}>
              <Tooltip title={getStatusTooltip(instr.status || '')}>
                <div className="w-full h-full cursor-pointer" data-testid="instruction-status-indicator" />
              </Tooltip>
            </div>
          </div>
        )}
        {/* Menu button - only visible on hover */}
        {showMenu && (
          <div className={`${isMenuOpen ? 'block' : 'hidden group-hover:block'}`} data-testid="instruction-menu">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: (
                      <Tooltip placement="right" title={menuDisabled ? "Stop the run to perform this action" : "Edit instruction"}>
                        <div className="flex items-center gap-2" data-testid="instruction-edit-icon">
                          <EditOutlined className='text-[#AE00FF]' />
                          <span>Edit</span>
                        </div>
                      </Tooltip>
                    ),
                    onClick: () => onEdit && onEdit(instr.id, instr.value),
                    disabled: menuDisabled
                  },
                  {
                    key: 'delete',
                    label: (
                      <Tooltip placement="right" title={menuDisabled ? "Stop the run to perform this action" : "Delete instruction"}>
                        <div className="flex items-center gap-2" data-testid="instruction-delete-icon">
                          <DeleteOutlined className='text-[#EA3962]' />
                          <span>Delete</span>
                        </div>
                      </Tooltip>
                    ),
                    onClick: () => onDelete && onDelete(instr.id),
                    disabled: menuDisabled
                  }
                ]
              }}
              trigger={['click']}
              onOpenChange={(open) => {
                if (onDropdownOpenChange) {
                  onDropdownOpenChange(open);
                }
              }}
            >
              <Button
                type="text"
                size="small"
                className="!bg-[#4542CC] !text-white hover:!bg-[#3a37b3] !border-0 !rounded !w-[20px] !h-[20px] !flex !items-center !justify-center"
                data-testid="instruction-menu-button"
              >
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                </div>
              </Button>
            </Dropdown>
          </div>
        )}
      </div>
      {/* AI use message - displayed below instruction text */}
      {typeof instr.value === 'object' && 
       instr.value.action !== 'run_script' && 
       (instr.value.action === 'reuse_test' ||
        instr.value.action === 'ai_assert' ||
        (instr.value as any).element_id ||
        (((actions[instr.value.action]?.type === 'AI') || 
         (instr.value.action === 'verify' && (instr.value as any).locator_type === 'ai')) && 
        (instr.value as any).ai_use === 'always_ai') || 
       (!instr.playwright_actions || instr.playwright_actions.length === 0)) ? (
        <div className={`mt-2 rounded-lg p-2 text-xs font-hanken ${
          (instr.value as any).ai_use === 'always_ai' || 
          instr.value.action === 'reuse_test' || 
          instr.value.action === 'ai_assert' ||
          (instr.value as any).element_id
            ? 'bg-[#0000000D]' 
            : 'bg-[#FF00000D]'
        }`}>
          {instr.value.action === 'reuse_test' 
            ? 'Reusing a segment from another test. No script is needed.'
            : instr.value.action === 'ai_assert'
              ? 'No script will be generated for this action.'
              : (instr.value as any).element_id
                ? 'This element is reused from the store. No script is needed.'
                : (instr.value as any).ai_use === 'always_ai' 
                  ? 'Always use AI is turned on. No script will be generated.'
                  : 'Run the test to generate script for this instruction.'}
        </div>
      ) : null}
      {((instr.playwright_actions && instr.playwright_actions.length > 0) || (typeof instr.value === 'object' && instr.value.action === 'run_script')) && (typeof instr.value !== 'object' || instr.value.action !== 'reuse_test') && (
        <div className="mt-2 border-t pt-2">
          <div className={`bg-[#4542CC0D] p-2 rounded text-xs font-mono overflow-x-auto ${typeof instr.value === 'object' && instr.value.action === 'run_script' ? 'max-h-[30vh] overflow-y-auto' : ''}`}>
            {typeof instr.value === 'object' && instr.value.action === 'run_script' ? (
              // For run_script, show the script content
              <div className="text-gray-700 whitespace-pre-wrap">
                {instr.value.args.find((arg: any) => arg.key === 'script')?.value || ''}
              </div>
            ) : (
              // For all other actions, show playwright actions
              instr.playwright_actions?.map((action: string, idx: number) => (
                <div key={idx} className="text-gray-700">{action}</div>
              )) || []
            )}
          </div>
        </div>
      )}
    </div>
  );
};

