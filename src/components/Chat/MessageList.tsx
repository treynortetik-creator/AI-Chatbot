import React, { useEffect, useRef } from 'react';
import { Message as MessageComponent } from './Message';
import type { Message as MessageType } from '../../types';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
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

  return (
    <div className="message-list">
      <div className="message-list__content">
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
