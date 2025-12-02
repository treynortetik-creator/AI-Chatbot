export interface AppSettings {
  apiKey: string;
  defaultModel: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  streamingEnabled: boolean;
  tokenWarningThreshold: number;
  maxFileSize: number;
  autoSave: boolean;
  showTokenCount: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  defaultModel: 'anthropic/claude-3.5-sonnet',
  theme: 'auto',
  fontSize: 'medium',
  streamingEnabled: true,
  tokenWarningThreshold: 100000,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  autoSave: true,
  showTokenCount: true,
};
