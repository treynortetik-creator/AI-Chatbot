import type { Message, ContextFile } from '../types';

type Tiktoken = any;

class TokenCounter {
  private encoder: Tiktoken | null = null;
  private encoderPromise: Promise<Tiktoken> | null = null;

  /**
   * Initialize the tokenizer lazily
   */
  private async getEncoder(): Promise<Tiktoken> {
    if (this.encoder) {
      return this.encoder;
    }

    // If already loading, wait for it
    if (this.encoderPromise) {
      return this.encoderPromise;
    }

    // Lazy load tiktoken only when needed
    this.encoderPromise = import('js-tiktoken').then((module) => {
      this.encoder = module.encodingForModel('gpt-4');
      return this.encoder!;
    });

    return this.encoderPromise;
  }

  /**
   * Count tokens in a string (fallback to approximation if tiktoken not loaded)
   */
  countTokens(text: string): number {
    if (!text) return 0;

    // Fallback: approximate 4 characters per token
    // This is fast and doesn't require loading tiktoken
    return Math.ceil(text.length / 4);
  }

  /**
   * Count tokens accurately (async, loads tiktoken if needed)
   */
  async countTokensAccurate(text: string): Promise<number> {
    if (!text) return 0;

    try {
      const encoder = await this.getEncoder();
      const tokens = encoder.encode(text);
      return tokens.length;
    } catch (error) {
      console.error('Error counting tokens:', error);
      // Fallback to approximation
      return this.countTokens(text);
    }
  }

  /**
   * Count tokens in a message
   */
  countMessageTokens(message: Message): number {
    let total = 0;

    // Count content tokens
    total += this.countTokens(message.content);

    // Count attachment tokens
    if (message.attachments) {
      message.attachments.forEach(attachment => {
        if (attachment.extractedText) {
          total += this.countTokens(attachment.extractedText);
        } else if (attachment.type.startsWith('text/')) {
          total += this.countTokens(attachment.content);
        }
        // Note: Images are counted differently by the API, but we'll use a fixed estimate
        else if (attachment.type.startsWith('image/')) {
          total += 85; // Approximate tokens for an image (varies by size)
        }
      });
    }

    // Add overhead for message formatting (~4 tokens per message)
    total += 4;

    return total;
  }

  /**
   * Count tokens in an array of messages
   */
  countMessagesTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => total + this.countMessageTokens(msg), 0);
  }

  /**
   * Count tokens in a context file
   */
  countFileTokens(file: ContextFile): number {
    return this.countTokens(file.content);
  }

  /**
   * Count tokens in multiple context files
   */
  countContextFilesTokens(files: ContextFile[]): number {
    return files.reduce((total, file) => total + file.tokenCount, 0);
  }

  /**
   * Count total conversation tokens (messages + context files + system prompt)
   */
  countConversationTokens(
    messages: Message[],
    contextFiles: ContextFile[],
    systemPrompt?: string
  ): number {
    let total = 0;

    // System prompt
    if (systemPrompt) {
      total += this.countTokens(systemPrompt);
    }

    // Context files
    total += this.countContextFilesTokens(contextFiles);

    // Messages
    total += this.countMessagesTokens(messages);

    // Add overhead for conversation formatting (~3 tokens)
    total += 3;

    return total;
  }

  /**
   * Format token count for display
   */
  formatTokenCount(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }

  /**
   * Check if token count is approaching a warning threshold
   */
  isApproachingLimit(tokens: number, threshold: number): boolean {
    return tokens >= threshold * 0.8;
  }

  /**
   * Free the encoder resources
   */
  dispose(): void {
    this.encoder = null;
    this.encoderPromise = null;
  }
}

export const tokenCounter = new TokenCounter();
