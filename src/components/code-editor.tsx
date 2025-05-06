"use client";

import React from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Skeleton } from "@/components/ui/skeleton";


interface CodeEditorProps {
  language: 'java' | 'cpp';
  value: string;
  onChange: OnChange;
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  // Ensure editorTheme updates when resolvedTheme changes
  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  // Map our language keys to Monaco's language identifiers
  const monacoLanguage = language === 'cpp' ? 'cpp' : 'java';

  return (
     // Use bg-card to ensure it matches the theme's card background
    <div className="h-full w-full rounded-md border-0 overflow-hidden bg-card">
       <Editor
        height="100%"
        language={monacoLanguage}
        theme={editorTheme}
        value={value}
        onChange={onChange}
        loading={<Skeleton className="h-full w-full bg-muted" />} // Use muted bg for skeleton
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true, // Ensures editor resizes correctly
          wordWrap: 'on', // Enable word wrapping
           // Explicitly set background to transparent to inherit from parent div
          background: 'transparent',
        }}
      />
    </div>
  );
}
