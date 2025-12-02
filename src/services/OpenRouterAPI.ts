import type { Message, AppSettings, ContextFile } from '../types';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

class OpenRouterAPI {
  private readonly BASE_URL = 'https://openrouter.ai/api/v1';

  /**
   * Convert messages and context files to OpenRouter format
   */
  private formatMessages(
    messages: Message[],
    contextFiles: ContextFile[],
    customInstructions?: string
  ): OpenRouterMessage[] {
    const formattedMessages: OpenRouterMessage[] = [];

    // Add system message with custom instructions and context files
    if (customInstructions || contextFiles.length > 0) {
      let systemContent = '';

      if (customInstructions) {
        systemContent += customInstructions;
      }

      if (contextFiles.length > 0) {
        if (systemContent) systemContent += '\n\n';
        systemContent += '=== Context Files ===\n\n';

        contextFiles.forEach(file => {
          systemContent += `--- ${file.name} ---\n`;
          systemContent += `${file.content}\n\n`;
        });
      }

      formattedMessages.push({
        role: 'system',
        content: systemContent,
      });
    }

    // Add conversation messages
    messages.forEach(msg => {
      if (msg.role === 'system') {
        // Skip system messages as we already added them above
        return;
      }

      // Handle messages with attachments
      if (msg.attachments && msg.attachments.length > 0) {
        const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

        // Add text content
        if (msg.content) {
          contentParts.push({
            type: 'text',
            text: msg.content,
          });
        }

        // Add attachments
        msg.attachments.forEach(attachment => {
          if (attachment.type.startsWith('image/')) {
            // Image attachment
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: attachment.url || `data:${attachment.type};base64,${attachment.content}`,
              },
            });
          } else {
            // Text file attachment
            contentParts.push({
              type: 'text',
              text: `--- File: ${attachment.name} ---\n${attachment.extractedText || attachment.content}`,
            });
          }
        });

        formattedMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: contentParts,
        });
      } else {
        // Simple text message
        formattedMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    });

    return formattedMessages;
  }

  /**
   * Send a chat message and get a response (non-streaming)
   */
  async sendMessage(
    messages: Message[],
    settings: AppSettings,
    contextFiles: ContextFile[] = [],
    customInstructions?: string,
    projectSettings?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    if (!settings.apiKey) {
      return { success: false, error: 'API key not configured. Please add your OpenRouter API key in settings.' };
    }

    try {
      const formattedMessages = this.formatMessages(messages, contextFiles, customInstructions);

      const requestBody: OpenRouterRequest = {
        model: projectSettings?.model || settings.defaultModel,
        messages: formattedMessages,
        temperature: projectSettings?.temperature || 0.7,
        max_tokens: projectSettings?.maxTokens || 4096,
        stream: false,
      };

      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chatbot',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API error: ${response.status} ${response.statusText}`;
        return { success: false, error: errorMessage };
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        return { success: false, error: 'No response from API' };
      }

      return {
        success: true,
        content: data.choices[0].message.content,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send a chat message with streaming response (SSE)
   */
  async streamMessage(
    messages: Message[],
    settings: AppSettings,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    contextFiles: ContextFile[] = [],
    customInstructions?: string,
    projectSettings?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<() => void> {
    if (!settings.apiKey) {
      onError('API key not configured. Please add your OpenRouter API key in settings.');
      return () => {};
    }

    const formattedMessages = this.formatMessages(messages, contextFiles, customInstructions);

    const requestBody: OpenRouterRequest = {
      model: projectSettings?.model || settings.defaultModel,
      messages: formattedMessages,
      temperature: projectSettings?.temperature || 0.7,
      max_tokens: projectSettings?.maxTokens || 4096,
      stream: true,
    };

    let aborted = false;

    try {
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chatbot',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API error: ${response.status} ${response.statusText}`;
        onError(errorMessage);
        return () => {};
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        onError('Failed to get response stream');
        return () => {};
      }

      // Process the stream
      const processStream = async () => {
        try {
          while (!aborted) {
            const { done, value } = await reader.read();

            if (done) {
              onComplete();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (aborted) break;

              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

              if (trimmedLine.startsWith('data: ')) {
                try {
                  const jsonStr = trimmedLine.slice(6);
                  const data = JSON.parse(jsonStr);

                  if (data.choices && data.choices[0]?.delta?.content) {
                    onChunk(data.choices[0].delta.content);
                  }
                } catch (e) {
                  // Ignore JSON parse errors for partial chunks
                  console.warn('Failed to parse SSE chunk:', e);
                }
              }
            }
          }
        } catch (error) {
          if (!aborted) {
            console.error('Stream processing error:', error);
            onError(error instanceof Error ? error.message : 'Stream processing error');
          }
        } finally {
          reader.releaseLock();
        }
      };

      processStream();

      // Return abort function
      return () => {
        aborted = true;
        reader.cancel().catch(() => {});
      };
    } catch (error) {
      console.error('Error starting stream:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
      return () => {};
    }
  }

  /**
   * Fetch available models from OpenRouter
   */
  async fetchModels(): Promise<{ success: boolean; models?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chatbot',
        },
      });

      if (!response.ok) {
        return { success: false, error: `Failed to fetch models: ${response.statusText}` };
      }

      const data = await response.json();
      return { success: true, models: data.data || [] };
    } catch (error) {
      console.error('Error fetching models:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch models',
      };
    }
  }
}

export const openRouterAPI = new OpenRouterAPI();
