import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  size?: 'small' | 'medium';
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ size = 'medium' }) => {
  return (
    <div className={`typing-indicator typing-indicator--${size}`}>
      <div className="typing-indicator__dot"></div>
      <div className="typing-indicator__dot"></div>
      <div className="typing-indicator__dot"></div>
    </div>
  );
};
