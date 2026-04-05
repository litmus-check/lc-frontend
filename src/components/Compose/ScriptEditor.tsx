'use client'
import React from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  language?: string;
  className?: string;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  value,
  onChange,
  height = "250px",
  language = "javascript",
  className = "border border-gray-300 rounded"
}) => {
  return (
    <div className={className}>
      <MonacoEditor
        height={height}
        language={language}
        value={value != null ? String(value) : ''}
        theme="vs-light"
        options={{
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
        onChange={(value: string | undefined) => onChange(value || '')}
        beforeMount={(monaco: any) => {
          monaco.editor.defineTheme("vs-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#ffffff",
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
  );
};

export default ScriptEditor;

