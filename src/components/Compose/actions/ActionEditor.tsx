/**
 * ActionEditor Component
 * 
 * Purpose: Unified component for both CREATING and EDITING test instructions in the Compose page.
 * 
 * Key Features:
 * - When no action is selected:
 *   - Add mode (isEditMode=false): Shows a borderless plus icon button to add a new action
 *   - Edit mode (isEditMode=true): Shows a button with "Select an action" text
 * - When an action is selected: Shows a dropdown with the selected action and renders the appropriate action editor
 * - Handles all action types (AI actions, navigation, verification, etc.)
 * - Includes AI use selector for AI-based actions
 * 
 * Usage: 
 * - Add mode: Used in the "Add Instruction" section of Compose.tsx
 * - Edit mode: Used when editing existing instructions in Compose.tsx
 */
'use client'
import React from 'react';
import { Button, Dropdown, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { actions } from '@/lib/constants/actions';
import { AiClickAction } from './AiClickAction';
import { AiHoverAction } from './AiHoverAction';
import { AiSelectAction } from './AiSelectAction';
import { AiInputAction } from './AiInputAction';
import { AiFileUploadAction } from './AiFileUploadAction';
import { AiAssertAction } from './AiAssertAction';
import { GoBackAction } from './GoBackAction';
import { GoToUrlAction } from './GoToUrlAction';
import { VerifyAction } from './VerifyAction';
import { WaitTimeAction } from './WaitTimeAction';
import { OpenTabAction } from './OpenTabAction';
import { SwitchTabAction } from './SwitchTabAction';
import { RunScriptAction } from './RunScriptAction';
import { AiScriptAction } from './AiScriptAction';
import { ReuseTestAction } from './ReuseTestAction';
import { ScrollAction } from './ScrollAction';
import { SetStateVariableAction } from './SetStateVariableAction';
import { KeyPressAction } from './KeyPressAction';
import { PageReloadAction } from './PageReloadAction';
import { ApiInterceptAction } from './ApiInterceptAction';
import { ApiMockAction } from './ApiMockAction';
import { RemoveApiHandlersAction } from './RemoveApiHandlersAction';

interface ActionEditorProps {
  selectedAction: string;
  onActionSelect: (action: string) => void;
  instructionArgs: Record<string, string>;
  onArgChange: (key: string, value: string) => void;
  validationErrors: Record<string, string>;
  showValidationErrors: boolean;
  elementType: 'existing' | 'new';
  onElementTypeChange: (type: 'existing' | 'new') => void;
  elements: Array<{ element_id: string; element_description?: string; store_name?: string }>;
  aiUse?: 'generate_script' | 'always_ai';
  onAiUseChange?: (use: 'generate_script' | 'always_ai') => void;
  selectedTestId?: string;
  selectedSegmentId?: string;
  onTestIdChange?: (testId: string) => void;
  onSegmentIdChange?: (segmentId: string) => void;
  availableTests?: Array<{ id: string; name: string }>;
  availableSegments?: Array<{ segment_id: string; segment_name: string }>;
  testSearchQuery?: string;
  onTestSearch?: (query: string) => void;
  suiteTestsLoading?: boolean;
  segmentsLoading?: boolean;
  selectedFileId?: string;
  onFileIdChange?: (fileId: string) => void;
  availableFiles?: Array<{ file_id: string; file_name: string }>;
  filesLoading?: boolean;
  availableLiveUrls?: Array<{ title: string; url: string; live_url: string }>;
  liveUrlsLoading?: boolean;
  onLiveUrlsFetch?: () => void;
  supportedUrlPatterns?: React.ReactNode;
  /** When true, component behaves in edit mode (shows "Select an action" when empty, includes test IDs) */
  isEditMode?: boolean;
}

export const ActionEditor: React.FC<ActionEditorProps> = ({
  selectedAction,
  onActionSelect,
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
  elementType,
  onElementTypeChange,
  elements,
  aiUse,
  onAiUseChange,
  selectedTestId,
  selectedSegmentId,
  onTestIdChange,
  onSegmentIdChange,
  availableTests = [],
  availableSegments = [],
  testSearchQuery,
  onTestSearch,
  suiteTestsLoading,
  segmentsLoading,
  selectedFileId,
  onFileIdChange,
  availableFiles = [],
  filesLoading,
  availableLiveUrls = [],
  liveUrlsLoading,
  onLiveUrlsFetch,
  supportedUrlPatterns,
  isEditMode = false,
}) => {
  // Get the configuration for the selected action (if any)
  const actionConfig = selectedAction ? actions[selectedAction] : null;

  // Build dropdown menu items from all available actions (used in both modes)
  const dropdownMenuItems = Object.entries(actions).map(([key, value]) => ({
    key,
    label: (
      <div className="flex items-center gap-2">
        <Image 
          src={value.displayIcon} 
          alt={value.displayName} 
          width={16} 
          height={16} 
          style={{ 
            width: '16px', 
            height: '16px',
            filter: key === 'ai_assert' ? 'brightness(0)' : 'none'
          }} 
        />
        <span>{value.displayName}</span>
      </div>
    ),
    onClick: () => onActionSelect(key)
  }));

  // Custom dropdown render with purple border and gradient fade
  const dropdownRender = (menu: React.ReactNode): React.ReactNode => (
    <div style={{ maxHeight: 250, overflowY: "auto", border: '2px solid #DD94FF', borderRadius: '5px', backgroundColor: '#FFFFFF' }}>
      {menu}
      {/* Gradient overlay at bottom to indicate scrollable content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))",
          pointerEvents: "none",
        }}
      />
    </div>
  );

  // When no action is selected, show different UI based on mode
  if (!selectedAction) {
    return (
      <Dropdown
        menu={{ items: dropdownMenuItems }}
        dropdownRender={dropdownRender}
        trigger={['click']}
        {...(isEditMode && { 'data-testid': 'edit-instruction-dropdown' })}
      >
        {isEditMode ? (
          // Edit mode: Show button with "Select an action" text
          <Button 
            className="font-hanken flex items-center justify-between" 
            data-testid="edit-instruction-button"
          >
            <span className="flex-1 text-center">
              <span>Select an action</span>
            </span>
            <DownOutlined />
          </Button>
        ) : (
          // Add mode: Show borderless button with purple plus icon
          <Button 
            type="text" 
            className="font-hanken w-full flex items-center justify-between !border-none !shadow-none hover:!bg-transparent"
          >
            <span className="flex-1 text-center">
              <div className="flex items-center justify-center">
                <div className="bg-[#AE00FF] rounded-lg w-[28px] h-[28px] flex items-center justify-center">
                  <Image src="/assets/plus-icon.svg" width={14} height={14} alt="plus" />
                </div>
              </div>
            </span>
          </Button>
        )}
      </Dropdown>
    );
  }

  // Validate action config exists
  if (!actionConfig) return null;

  /**
   * Renders the appropriate action editor component based on the selected action type.
   * Each action type has its own specialized component for collecting action-specific arguments.
   */
  const renderActionEditor = () => {
    switch (selectedAction) {
      case 'ai_click':
        return (
          <AiClickAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            elementType={elementType}
            onElementTypeChange={onElementTypeChange}
            elements={elements}
          />
        );

      case 'ai_hover':
        return (
          <AiHoverAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            elementType={elementType}
            onElementTypeChange={onElementTypeChange}
            elements={elements}
          />
        );

      case 'ai_select':
        return (
          <AiSelectAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            elementType={elementType}
            onElementTypeChange={onElementTypeChange}
            elements={elements}
          />
        );

      case 'ai_input':
        return (
          <AiInputAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            elementType={elementType}
            onElementTypeChange={onElementTypeChange}
            elements={elements}
          />
        );

      case 'ai_file_upload':
        return (
          <AiFileUploadAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            selectedFileId={selectedFileId || ''}
            onFileIdChange={onFileIdChange || (() => {})}
            availableFiles={availableFiles}
            filesLoading={filesLoading ?? false}
            elementType={elementType}
            onElementTypeChange={onElementTypeChange}
            elements={elements}
          />
        );

      case 'ai_assert':
        return (
          <AiAssertAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'go_back':
        return (
          <GoBackAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'go_to_url':
        return (
          <GoToUrlAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'verify':
        return (
          <VerifyAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            onVerifyArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            elementType={elementType}
            onElementTypeChange={onElementTypeChange}
            elements={elements}
          />
        );

      case 'wait_time':
        return (
          <WaitTimeAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'open_tab':
        return (
          <OpenTabAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'switch_tab':
        return (
          <SwitchTabAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            availableLiveUrls={availableLiveUrls}
            liveUrlsLoading={liveUrlsLoading ?? false}
            onLiveUrlsFetch={onLiveUrlsFetch || (() => {})}
            supportedUrlPatterns={supportedUrlPatterns}
          />
        );

      case 'run_script':
        return (
          <RunScriptAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'ai_script':
        return (
          <AiScriptAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'reuse_test':
        return (
          <ReuseTestAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
            selectedTestId={selectedTestId || ''}
            selectedSegmentId={selectedSegmentId || ''}
            onTestIdChange={onTestIdChange || (() => {})}
            onSegmentIdChange={onSegmentIdChange || (() => {})}
            availableTests={availableTests}
            availableSegments={availableSegments}
            testSearchQuery={testSearchQuery || ''}
            onTestSearch={onTestSearch || (() => {})}
            suiteTestsLoading={suiteTestsLoading ?? false}
            segmentsLoading={segmentsLoading ?? false}
          />
        );

      case 'scroll':
        return (
          <ScrollAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'set_state_variable':
        return (
          <SetStateVariableAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'key_press':
        return (
          <KeyPressAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'page_reload':
        return (
          <PageReloadAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'api_intercept':
        return (
          <ApiInterceptAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'api_mock':
        return (
          <ApiMockAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      case 'remove_api_handlers':
        return (
          <RemoveApiHandlersAction
            instructionArgs={instructionArgs}
            onArgChange={onArgChange}
            validationErrors={validationErrors}
            showValidationErrors={showValidationErrors}
          />
        );

      default:
        return null;
    }
  };

  // Main render: Action is selected, show dropdown with selected action and action editor
  return (
    <div className="flex flex-col gap-2">
      {/* Dropdown to change the selected action */}
      <Dropdown
        menu={{ items: dropdownMenuItems }}
        dropdownRender={dropdownRender}
        trigger={['click']}
        {...(isEditMode && { 'data-testid': 'edit-instruction-dropdown' })}
      >
        {/* Button showing the currently selected action with icon and name */}
        <Button 
          className="font-hanken flex items-center justify-between"
          {...(isEditMode && { 'data-testid': 'edit-instruction-button' })}
        >
          <span className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Image 
                src={actionConfig.displayIcon} 
                alt={actionConfig.displayName} 
                width={16} 
                height={16} 
                style={{ 
                  width: '16px', 
                  height: '16px',
                  filter: selectedAction === 'ai_assert' ? 'brightness(0)' : 'none'
                }} 
              />
              <span>{actionConfig.displayName}</span>
            </div>
          </span>
          <DownOutlined />
        </Button>
      </Dropdown>

      {/* Render the action-specific editor component */}
      {renderActionEditor()}

      {/* AI Use selector - shown for AI actions or verify actions with AI locator */}
      {((actionConfig.type === 'AI' && selectedAction !== 'ai_assert') || (selectedAction === 'verify' && instructionArgs.locator_type === 'ai')) && onAiUseChange && (
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium">Use AI to</span>
          <Select
            style={{ width: 220 }}
            value={aiUse}
            onChange={onAiUseChange}
            options={[
              { value: 'generate_script', label: 'Generate script only' },
              { value: 'always_ai', label: 'Execute step every time' },
            ]}
          />
        </div>
      )}
    </div>
  );
};
