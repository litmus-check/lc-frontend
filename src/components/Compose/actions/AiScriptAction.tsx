'use client'
import React from 'react';
import AiScriptComponent from '../AiScriptComponent';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const AiScriptAction: React.FC<BaseActionEditorProps> = ({
  instructionArgs,
  onArgChange,
  validationErrors,
  showValidationErrors,
}) => {
  return (
    <AiScriptComponent
      mode="create"
      description={instructionArgs.description as string}
      prompt={instructionArgs.prompt as string}
      onDescriptionChange={(value) => onArgChange('description', value)}
      onPromptChange={(value) => onArgChange('prompt', value)}
      validationErrors={validationErrors}
      showValidationErrors={showValidationErrors}
    />
  );
};
