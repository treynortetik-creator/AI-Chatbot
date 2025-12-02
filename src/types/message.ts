export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  extractedText?: string;
  url?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  tokenCount?: number;
  isStreaming?: boolean;
  error?: string;
}
