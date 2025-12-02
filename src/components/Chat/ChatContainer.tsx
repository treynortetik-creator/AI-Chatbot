import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Message as MessageType, MessageAttachment } from '../../types';
import { useProjects, useSettings } from '../../contexts';
import { storageService, openRouterAPI, tokenCounter } from '../../services';
import './ChatContainer.css';

export const ChatContainer: React.FC = () => {
  const { activeProject, updateProject } = useProjects();
  const { settings } = useSettings();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortStream, setAbortStream] = useState<(() => void) | null>(null);

  // Load messages when active project changes
  useEffect(() => {
    if (activeProject) {
      const loadedMessages = storageService.getMessages(activeProject.id);
      setMessages(loadedMessages);
    } else {
      setMessages([]);
    }
  }, [activeProject]);

  const handleSendMessage = async (content: string, attachments: MessageAttachment[]) => {
    if (!activeProject || !content.trim()) return;

    // Create user message
    const userMessage: MessageType = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      tokenCount: tokenCounter.countMessageTokens({
        id: '',
        role: 'user',
        content: content.trim(),
        timestamp: '',
        attachments: attachments.length > 0 ? attachments : undefined,
      }),
    };

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    storageService.saveMessages(activeProject.id, updatedMessages);

    // Create assistant message placeholder
    const assistantMessage: MessageType = {
      id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    const messagesWithAssistant = [...updatedMessages, assistantMessage];
    setMessages(messagesWithAssistant);
    setIsStreaming(true);

    // Prepare messages for API (don't include the streaming placeholder)
    const apiMessages = updatedMessages;

    if (settings.streamingEnabled) {
      // Streaming response
      let streamedContent = '';

      const abort = await openRouterAPI.streamMessage(
        apiMessages,
        settings,
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: streamedContent,
            };
            return updated;
          });
        },
        () => {
          // On complete
          setIsStreaming(false);
          setAbortStream(null);

          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false,
              tokenCount: tokenCounter.countTokens(streamedContent),
            };

            // Save to storage
            storageService.saveMessages(activeProject.id, updated);

            // Update project message count
            updateProject(activeProject.id, { messageCount: updated.length });

            return updated;
          });
        },
        (error) => {
          // On error
          setIsStreaming(false);
          setAbortStream(null);

          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false,
              error,
            };

            storageService.saveMessages(activeProject.id, updated);
            return updated;
          });
        },
        activeProject.contextFiles,
        activeProject.customInstructions,
        activeProject.settings
      );

      setAbortStream(() => abort);
    } else {
      // Non-streaming response
      const result = await openRouterAPI.sendMessage(
        apiMessages,
        settings,
        activeProject.contextFiles,
        activeProject.customInstructions,
        activeProject.settings
      );

      setIsStreaming(false);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (result.success && result.content) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: result.content,
            isStreaming: false,
            tokenCount: tokenCounter.countTokens(result.content),
          };
        } else {
          updated[lastIndex] = {
            ...updated[lastIndex],
            isStreaming: false,
            error: result.error || 'Failed to get response',
          };
        }

        storageService.saveMessages(activeProject.id, updated);
        updateProject(activeProject.id, { messageCount: updated.length });

        return updated;
      });
    }
  };

  const handleStopStreaming = () => {
    if (abortStream) {
      abortStream();
      setIsStreaming(false);
      setAbortStream(null);
    }
  };

  const handleRegenerate = () => {
    if (!activeProject || isStreaming) return;

    // Find the last user message and last assistant message
    let lastUserMessage: MessageType | null = null;
    let lastAssistantIndex = -1;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && lastAssistantIndex === -1) {
        lastAssistantIndex = i;
      }
      if (messages[i].role === 'user' && !lastUserMessage) {
        lastUserMessage = messages[i];
      }
      if (lastAssistantIndex !== -1 && lastUserMessage) break;
    }

    if (!lastUserMessage || lastAssistantIndex === -1) return;

    // Remove the last assistant message
    const updatedMessages = messages.slice(0, lastAssistantIndex);
    setMessages(updatedMessages);
    storageService.saveMessages(activeProject.id, updatedMessages);

    // Re-send the last user message by regenerating response
    regenerateResponse(updatedMessages);
  };

  const regenerateResponse = async (currentMessages: MessageType[]) => {
    if (!activeProject) return;

    // Create assistant message placeholder
    const assistantMessage: MessageType = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    const messagesWithAssistant = [...currentMessages, assistantMessage];
    setMessages(messagesWithAssistant);
    setIsStreaming(true);

    if (settings.streamingEnabled) {
      // Streaming response
      let streamedContent = '';

      const abort = await openRouterAPI.streamMessage(
        currentMessages,
        settings,
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: streamedContent,
            };
            return updated;
          });
        },
        () => {
          // On complete
          setIsStreaming(false);
          setAbortStream(null);

          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false,
              tokenCount: tokenCounter.countTokens(streamedContent),
            };

            storageService.saveMessages(activeProject.id, updated);
            updateProject(activeProject.id, { messageCount: updated.length });

            return updated;
          });
        },
        (error) => {
          // On error
          setIsStreaming(false);
          setAbortStream(null);

          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false,
              error,
            };

            storageService.saveMessages(activeProject.id, updated);
            return updated;
          });
        },
        activeProject.contextFiles,
        activeProject.customInstructions,
        activeProject.settings
      );

      setAbortStream(() => abort);
    } else {
      // Non-streaming response
      const result = await openRouterAPI.sendMessage(
        currentMessages,
        settings,
        activeProject.contextFiles,
        activeProject.customInstructions,
        activeProject.settings
      );

      setIsStreaming(false);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (result.success && result.content) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: result.content,
            isStreaming: false,
            tokenCount: tokenCounter.countTokens(result.content),
          };
        } else {
          updated[lastIndex] = {
            ...updated[lastIndex],
            isStreaming: false,
            error: result.error || 'Failed to get response',
          };
        }

        storageService.saveMessages(activeProject.id, updated);
        updateProject(activeProject.id, { messageCount: updated.length });

        return updated;
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeProject || isStreaming) return;

    if (confirm('Are you sure you want to delete this message?')) {
      const updatedMessages = messages.filter(m => m.id !== messageId);
      setMessages(updatedMessages);
      storageService.saveMessages(activeProject.id, updatedMessages);
      updateProject(activeProject.id, { messageCount: updatedMessages.length });
    }
  };

  if (!activeProject) {
    return (
      <div className="chat-container chat-container--empty">
        <div className="chat-container__empty-state">
          <h2>No Project Selected</h2>
          <p>Create or select a project to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <MessageList
        messages={messages}
        onRegenerate={handleRegenerate}
        onDeleteMessage={handleDeleteMessage}
      />
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        onStop={handleStopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
};
