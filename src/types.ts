export interface Block {
  id: string;
  text: string;
  type: 'p' | 'h1' | 'h2';
  isGenerating?: boolean;
  proactiveSuggestion?: {
    id: string;
    text: string;
    actionable?: boolean;
  };
}

export interface SettingItem {
  id: string;
  name: string;
  desc: string;
}

export type AppState = 'login' | 'editor';
export type CompletionScope = string;

export interface AIFocusOption {
  id: string;
  label: string;
  prompt: string;
}

export type NodeType = 'project' | 'folder' | 'file';

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  prompts?: string[];
  options?: { label: string; prompt: string }[];
}
