import React, { useState, useRef } from 'react';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';
import { useProjects, useSettings } from '../../contexts';
import { fileProcessor, tokenCounter } from '../../services';
import { Modal, Button } from '../Common';
import './ContextFiles.css';

interface ContextFilesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContextFiles: React.FC<ContextFilesProps> = ({ isOpen, onClose }) => {
  const { activeProject, addContextFile, removeContextFile, refreshProjects } = useProjects();
  const { settings } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeProject) return null;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Read file content
        const content = await fileProcessor.readFileAsText(file);

        // Count tokens
        const tokenCount = tokenCounter.countTokens(content);

        // Create context file
        const contextFile = await fileProcessor.processFileForContext(
          file,
          settings.maxFileSize,
          tokenCount
        );

        // Add to project
        addContextFile(activeProject.id, contextFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file');
      }
    }

    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Refresh projects to update context files
    refreshProjects();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleRemoveFile = (fileId: string) => {
    removeContextFile(activeProject.id, fileId);
    refreshProjects();
  };

  const totalTokens = activeProject.contextFiles.reduce(
    (sum, file) => sum + file.tokenCount,
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Context Files - ${activeProject.name}`}
      size="medium"
    >
      <div className="context-files">
        <div className="context-files__header">
          <p className="context-files__description">
            Add files to this project's context. These files will be included in every
            conversation.
          </p>

          {totalTokens > 0 && (
            <div className="context-files__token-info">
              <span className="context-files__token-label">Total Tokens:</span>
              <span className="context-files__token-count">
                {tokenCounter.formatTokenCount(totalTokens)}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="context-files__error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="context-files__upload">
          <input
            ref={fileInputRef}
            type="file"
            className="context-files__file-input"
            onChange={handleFileInputChange}
            multiple
            accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.xml,.html,.css,.scss,.py,.java,.c,.cpp,.h,.hpp,.cs,.go,.rs,.rb,.php,.sh,.bash,.yaml,.yml"
          />

          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            loading={uploading}
            fullWidth
          >
            <Upload size={18} />
            Upload Files
          </Button>
        </div>

        {activeProject.contextFiles.length > 0 ? (
          <div className="context-files__list">
            {activeProject.contextFiles.map((file) => (
              <div key={file.id} className="context-files__item">
                <div className="context-files__item-icon">
                  <FileText size={18} />
                </div>

                <div className="context-files__item-info">
                  <div className="context-files__item-name">{file.name}</div>
                  <div className="context-files__item-meta">
                    {fileProcessor.formatFileSize(file.size)} •{' '}
                    {tokenCounter.formatTokenCount(file.tokenCount)} tokens
                  </div>
                </div>

                <button
                  className="context-files__item-remove"
                  onClick={() => handleRemoveFile(file.id)}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="context-files__empty">
            <FileText size={32} />
            <p>No context files added yet</p>
            <p className="context-files__empty-hint">
              Upload text files to include them in every conversation
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
