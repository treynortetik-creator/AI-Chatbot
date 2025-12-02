import type { MessageAttachment, ContextFile } from '../types';

class FileProcessor {
  /**
   * Read a file and convert to base64
   */
  async readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Read a text file
   */
  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Check if a file is an image
   */
  isImageFile(type: string): boolean {
    return type.startsWith('image/');
  }

  /**
   * Check if a file is a text file
   */
  isTextFile(type: string, name: string): boolean {
    const textTypes = [
      'text/',
      'application/json',
      'application/javascript',
      'application/typescript',
      'application/xml',
    ];

    const textExtensions = [
      '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.json',
      '.xml', '.html', '.css', '.scss', '.py', '.java',
      '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs',
      '.rb', '.php', '.sh', '.bash', '.yaml', '.yml',
      '.toml', '.ini', '.conf', '.log', '.sql',
    ];

    return (
      textTypes.some(t => type.startsWith(t)) ||
      textExtensions.some(ext => name.toLowerCase().endsWith(ext))
    );
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSize: number): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      };
    }
    return { valid: true };
  }

  /**
   * Process a file for message attachment
   */
  async processFileForAttachment(file: File, maxSize: number): Promise<MessageAttachment> {
    // Validate size
    const sizeValidation = this.validateFileSize(file, maxSize);
    if (!sizeValidation.valid) {
      throw new Error(sizeValidation.error);
    }

    const id = `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process based on file type
    if (this.isImageFile(file.type)) {
      // Image file
      const base64 = await this.readFileAsBase64(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        content: base64,
        url: `data:${file.type};base64,${base64}`,
      };
    } else if (this.isTextFile(file.type, file.name)) {
      // Text file
      const text = await this.readFileAsText(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        content: text,
        extractedText: text,
      };
    } else {
      throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload an image or text file.`);
    }
  }

  /**
   * Process a file for context file (persistent storage)
   */
  async processFileForContext(file: File, maxSize: number, tokenCount: number): Promise<ContextFile> {
    // Validate size
    const sizeValidation = this.validateFileSize(file, maxSize);
    if (!sizeValidation.valid) {
      throw new Error(sizeValidation.error);
    }

    // Only allow text files for context
    if (!this.isTextFile(file.type, file.name)) {
      throw new Error('Only text files can be added to project context');
    }

    const content = await this.readFileAsText(file);

    return {
      id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      content,
      addedAt: new Date().toISOString(),
      tokenCount,
    };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const fileProcessor = new FileProcessor();
