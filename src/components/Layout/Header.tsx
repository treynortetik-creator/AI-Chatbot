import React, { useState } from 'react';
import { Menu, Settings as SettingsIcon, FileText, MessageSquare } from 'lucide-react';
import { useProjects } from '../../contexts';
import { SettingsPanel } from '../Settings';
import { ContextFiles } from '../Files';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { activeProject } = useProjects();
  const [showSettings, setShowSettings] = useState(false);
  const [showContextFiles, setShowContextFiles] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header__left">
          <button
            className="header__menu-button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {activeProject ? (
            <div className="header__project-info">
              <MessageSquare size={18} />
              <h1 className="header__project-name">{activeProject.name}</h1>
              {activeProject.description && (
                <span className="header__project-description">
                  {activeProject.description}
                </span>
              )}
            </div>
          ) : (
            <h1 className="header__title">AI Chatbot</h1>
          )}
        </div>

        <div className="header__actions">
          {activeProject && (
            <button
              className="header__action-button"
              onClick={() => setShowContextFiles(true)}
              aria-label="Context files"
              title="Context Files"
            >
              <FileText size={20} />
              {activeProject.contextFiles.length > 0 && (
                <span className="header__badge">{activeProject.contextFiles.length}</span>
              )}
            </button>
          )}

          <button
            className="header__action-button"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {activeProject && (
        <ContextFiles
          isOpen={showContextFiles}
          onClose={() => setShowContextFiles(false)}
        />
      )}
    </>
  );
};
