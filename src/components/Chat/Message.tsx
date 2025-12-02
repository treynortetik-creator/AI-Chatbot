import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, AlertCircle, FileText } from 'lucide-react';
import type { Message as MessageType, MessageAttachment } from '../../types';
import { TypingIndicator } from './TypingIndicator';
import { format } from 'date-fns';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isDark = document.documentElement.classList.contains('dark-mode');

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
          <span className="message__role">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </span>
          <span className="message__timestamp">
            {format(new Date(message.timestamp), 'h:mm a')}
          </span>
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
                    <SyntaxHighlighter
                      style={isDark ? vscDarkPlus : vs}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
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
