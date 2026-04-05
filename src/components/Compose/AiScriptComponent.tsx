import React from 'react';
import { Input } from 'antd';

interface AiScriptComponentProps {
  mode: 'create' | 'edit';
  description: string;
  prompt: string;
  onDescriptionChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  validationErrors?: {
    description?: string;
    prompt?: string;
  };
  showValidationErrors?: boolean;
}

const AiScriptComponent: React.FC<AiScriptComponentProps> = ({
  mode,
  description,
  prompt,
  onDescriptionChange,
  onPromptChange,
  validationErrors = {},
  showValidationErrors = false
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Description field */}
      <Input.TextArea
        className="w-full"
        placeholder="Enter description here"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        rows={2}
        status={showValidationErrors && validationErrors.description ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.description && (
        <span className="text-red-500 text-sm">{validationErrors.description}</span>
      )}

      {/* Prompt field */}
      <Input.TextArea
        className="w-full !border-[#DD94FF]"
        placeholder="Enter your prompt here"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={1}
        status={showValidationErrors && validationErrors.prompt ? 'error' : ''}
      />
      {showValidationErrors && validationErrors.prompt && (
        <span className="text-red-500 text-sm">{validationErrors.prompt}</span>
      )}
    </div>
  );
};

export default AiScriptComponent;
