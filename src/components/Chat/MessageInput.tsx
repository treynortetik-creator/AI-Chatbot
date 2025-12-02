import type { KeyboardEvent } from 'react';
import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, StopCircle, BookMarked } from 'lucide-react';
import type { MessageAttachment } from '../../types';
import { fileProcessor } from '../../services';
import { useSettings } from '../../contexts';
import { PromptLibrary } from '../Prompts';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (content: string, attachments: MessageAttachment[]) => void;
  disabled?: boolean;
  onStop?: () => void;
  isStreaming?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  onStop,
  isStreaming = false,
}) => {
  const { settings } = useSettings();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUsePrompt = (promptContent: string) => {
    setContent(promptContent);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
    // Focus on textarea
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!content.trim() && attachments.length === 0) return;
    if (disabled) return;

    onSend(content, attachments);
    setContent('');
    setAttachments([]);
    setError('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const attachment = await fileProcessor.processFileForAttachment(
          file,
          settings.maxFileSize
        );
        setAttachments((prev) => [...prev, attachment]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <>
      <div className="message-input">
        {attachments.length > 0 && (
          <div className="message-input__attachments">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="message-input__attachment">
                {attachment.type.startsWith('image/') && attachment.url ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="message-input__attachment-preview"
                  />
                ) : (
                  <span className="message-input__attachment-name">
                    {attachment.name}
                  </span>
                )}
                <button
                  type="button"
                  className="message-input__attachment-remove"
                  onClick={() => removeAttachment(attachment.id)}
                  aria-label="Remove attachment"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="message-input__error">{error}</div>}

        <form
          className={`message-input__form ${isDragging ? 'message-input__form--dragging' : ''}`}
          onSubmit={handleSubmit}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            type="button"
            className="message-input__attach-button"
            onClick={() => setShowPromptLibrary(true)}
            disabled={disabled}
            aria-label="Open prompt library"
            title="Prompt Library"
          >
            <BookMarked size={20} />
          </button>

          <button
            type="button"
            className="message-input__attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            aria-label="Attach file"
            title="Attach File"
          >
            <Paperclip size={20} />
          </button>

        <input
          ref={fileInputRef}
          type="file"
          className="message-input__file-input"
          onChange={handleFileInputChange}
          multiple
          accept="image/*,.txt,.md,.js,.ts,.jsx,.tsx,.json,.xml,.html,.css,.scss,.py,.java"
        />

        <textarea
          ref={textareaRef}
          className="message-input__textarea"
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={isDragging ? 'Drop files here...' : 'Type a message...'}
          disabled={disabled}
          rows={1}
        />

        {isStreaming ? (
          <button
            type="button"
            className="message-input__stop-button"
            onClick={onStop}
            aria-label="Stop streaming"
          >
            <StopCircle size={20} />
          </button>
        ) : (
          <button
            type="submit"
            className="message-input__send-button"
            disabled={disabled || (!content.trim() && attachments.length === 0)}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        )}
      </form>
    </div>

      <PromptLibrary
        isOpen={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
        onUsePrompt={handleUsePrompt}
      />
    </>
  );
};
