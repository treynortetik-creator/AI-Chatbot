export interface ContextFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  addedAt: string;
  tokenCount: number;
}

export interface ProjectSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  autoSummarize?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  customInstructions: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  contextFiles: ContextFile[];
  settings: ProjectSettings;
}
