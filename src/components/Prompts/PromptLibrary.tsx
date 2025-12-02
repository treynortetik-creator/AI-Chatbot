import React, { useState, useEffect } from 'react';
import { Plus, BookMarked, Trash2, Edit2, Check, X } from 'lucide-react';
import { storageService } from '../../services';
import type { SavedPrompt } from '../../types';
import { Modal, Button, Input } from '../Common';
import './PromptLibrary.css';

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt: (content: string) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose, onUsePrompt }) => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  const loadPrompts = () => {
    const savedPrompts = storageService.getSavedPrompts();
    // Sort by usage count (most used first) then by creation date
    savedPrompts.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setPrompts(savedPrompts);
  };

  const handleCreate = () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) return;

    storageService.addSavedPrompt(newPromptName.trim(), newPromptContent.trim());
    setNewPromptName('');
    setNewPromptContent('');
    setIsCreating(false);
    loadPrompts();
  };

  const handleUpdate = (promptId: string, name: string, content: string) => {
    if (!name.trim() || !content.trim()) return;

    storageService.updateSavedPrompt(promptId, { name: name.trim(), content: content.trim() });
    setEditingId(null);
    loadPrompts();
  };

  const handleDelete = (promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      storageService.deleteSavedPrompt(promptId);
      loadPrompts();
    }
  };

  const handleUse = (prompt: SavedPrompt) => {
    storageService.incrementPromptUsage(prompt.id);
    onUsePrompt(prompt.content);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prompt Library" size="large">
      <div className="prompt-library">
        <div className="prompt-library__header">
          <p className="prompt-library__description">
            Save and reuse your favorite prompts
          </p>
          <Button
            variant="primary"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus size={16} />
            New Prompt
          </Button>
        </div>

        {isCreating && (
          <div className="prompt-library__form">
            <Input
              label="Prompt Name"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              placeholder="e.g., Code Review Request"
              fullWidth
            />
            <div className="prompt-library__form-field">
              <label className="prompt-library__label">Prompt Content</label>
              <textarea
                className="prompt-library__textarea"
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                placeholder="Enter your prompt text..."
                rows={4}
              />
            </div>
            <div className="prompt-library__form-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewPromptName('');
                  setNewPromptContent('');
                }}
              >
                <X size={16} />
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!newPromptName.trim() || !newPromptContent.trim()}
              >
                <Check size={16} />
                Save
              </Button>
            </div>
          </div>
        )}

        <div className="prompt-library__list">
          {prompts.length === 0 ? (
            <div className="prompt-library__empty">
              <BookMarked size={48} />
              <h3>No saved prompts</h3>
              <p>Create your first prompt to get started</p>
            </div>
          ) : (
            prompts.map((prompt) => (
              <PromptItem
                key={prompt.id}
                prompt={prompt}
                isEditing={editingId === prompt.id}
                onEdit={() => setEditingId(prompt.id)}
                onCancelEdit={() => setEditingId(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onUse={handleUse}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

interface PromptItemProps {
  prompt: SavedPrompt;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (promptId: string, name: string, content: string) => void;
  onDelete: (promptId: string) => void;
  onUse: (prompt: SavedPrompt) => void;
}

const PromptItem: React.FC<PromptItemProps> = ({
  prompt,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onUse,
}) => {
  const [editName, setEditName] = useState(prompt.name);
  const [editContent, setEditContent] = useState(prompt.content);

  if (isEditing) {
    return (
      <div className="prompt-item prompt-item--editing">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          fullWidth
        />
        <textarea
          className="prompt-library__textarea"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
        />
        <div className="prompt-item__actions">
          <button
            className="prompt-item__action-btn prompt-item__action-btn--secondary"
            onClick={onCancelEdit}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            className="prompt-item__action-btn prompt-item__action-btn--primary"
            onClick={() => onUpdate(prompt.id, editName, editContent)}
            disabled={!editName.trim() || !editContent.trim()}
          >
            <Check size={16} />
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-item">
      <div className="prompt-item__header">
        <h4 className="prompt-item__name">{prompt.name}</h4>
        <div className="prompt-item__meta">
          {prompt.usageCount > 0 && (
            <span className="prompt-item__usage">Used {prompt.usageCount}x</span>
          )}
        </div>
      </div>
      <p className="prompt-item__content">{prompt.content}</p>
      <div className="prompt-item__actions">
        <button
          className="prompt-item__action-btn"
          onClick={() => onUse(prompt)}
          title="Use this prompt"
        >
          Use Prompt
        </button>
        <button
          className="prompt-item__action-btn prompt-item__action-btn--icon"
          onClick={onEdit}
          title="Edit prompt"
        >
          <Edit2 size={16} />
        </button>
        <button
          className="prompt-item__action-btn prompt-item__action-btn--icon prompt-item__action-btn--danger"
          onClick={() => onDelete(prompt.id)}
          title="Delete prompt"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
