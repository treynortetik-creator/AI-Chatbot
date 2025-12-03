import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, AlertCircle, FileText, Copy, Check, RotateCcw, Trash2 } from 'lucide-react';
import type { Message as MessageType, MessageAttachment } from '../../types';
import { TypingIndicator } from './TypingIndicator';
import { CodeBlock } from './CodeBlock';
import { format } from 'date-fns';
import './Message.css';

interface MessageProps {
  message: MessageType;
  onRegenerate?: () => void;
  onDelete?: () => void;
}

export const Message: React.FC<MessageProps> = ({ message, onRegenerate, onDelete }) => {
  const isDark = document.documentElement.classList.contains('dark-mode');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    if (!attachment) return null;

    if (attachment.type.startsWith('image/')) {
      return (
        <div key={attachment.id} className="message__attachment message__attachment--image">
          <img src={attachment.url} alt={attachment.name} />
        </div>
      );
    } else {
      return (
        <div key={attachment.id} className="message__attachment message__attachment--file">
          <FileText size={16} />
          <span>{attachment.name}</span>
        </div>
      );
    }
  };

  return (
    <div className={`message message--${message.role}`}>
      <div className="message__avatar">
        {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
      </div>

      <div className="message__content-wrapper">
        <div className="message__header">
          <div className="message__header-left">
            <span className="message__role">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </span>
            <span className="message__timestamp">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
          </div>
          {!message.isStreaming && (
            <div className="message__actions">
              {message.role === 'assistant' && onRegenerate && (
                <button
                  className="message__action-button"
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                  title="Regenerate response"
                >
                  <RotateCcw size={14} />
                  <span>Regenerate</span>
                </button>
              )}
              {message.role === 'assistant' && message.content && (
                <button
                  className="message__action-button"
                  onClick={handleCopy}
                  aria-label="Copy message"
                  title="Copy message"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
              {onDelete && (
                <button
                  className="message__action-button message__action-button--danger"
                  onClick={onDelete}
                  aria-label="Delete message"
                  title="Delete message"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="message__attachments">
            {message.attachments.map((attachment) => renderAttachment(attachment))}
          </div>
        )}

        <div className="message__content">
          {message.error ? (
            <div className="message__error">
              <AlertCircle size={16} />
              <span>{message.error}</span>
            </div>
          ) : message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      code={String(children).replace(/\n$/, '')}
                      isDark={isDark}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {message.isStreaming && message.content && (
          <div className="message__streaming-indicator">
            <TypingIndicator size="small" />
          </div>
        )}
      </div>
    </div>
  );
};
