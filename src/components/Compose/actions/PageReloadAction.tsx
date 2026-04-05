'use client'
import React from 'react';
import { BaseActionEditorProps } from './shared/ActionBaseProps';

export const PageReloadAction: React.FC<BaseActionEditorProps> = () => {
  return (
    <div className="text-sm text-gray-500">
      This action has no arguments. It will reload the current page.
    </div>
  );
};
