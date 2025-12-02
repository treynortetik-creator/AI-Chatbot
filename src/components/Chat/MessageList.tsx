import React, { useEffect, useRef } from 'react';
import { Message as MessageComponent } from './Message';
import type { Message as MessageType } from '../../types';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
  onRegenerate: () => void;
  onDeleteMessage: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onRegenerate, onDeleteMessage }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <div className="message-list__empty-state">
          <h3>Start a Conversation</h3>
          <p>Send a message to begin chatting with the AI</p>
        </div>
      </div>
    );
  }

  // Find the last assistant message index
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIndex = i;
      break;
    }
  }

  return (
    <div className="message-list">
      <div className="message-list__content">
        {messages.map((message, index) => (
          <MessageComponent
            key={message.id}
            message={message}
            onRegenerate={index === lastAssistantIndex ? onRegenerate : undefined}
            onDelete={() => onDeleteMessage(message.id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
