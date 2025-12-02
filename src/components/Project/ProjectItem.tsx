import React, { useState } from 'react';
import { Folder, MoreVertical, Edit, Trash2, Settings } from 'lucide-react';
import type { Project } from '../../types';
import { useProjects } from '../../contexts';
import { ProjectForm } from './ProjectForm';
import { ProjectSettings } from './ProjectSettings';
import './ProjectItem.css';

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  isActive,
  onClick,
}) => {
  const { deleteProject } = useProjects();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  return (
    <>
      <div
        className={`project-item ${isActive ? 'project-item--active' : ''}`}
        onClick={onClick}
      >
        <div className="project-item__icon">
          <Folder size={16} />
        </div>

        <div className="project-item__content">
          <div className="project-item__name">{project.name}</div>
          {project.messageCount > 0 && (
            <div className="project-item__count">{project.messageCount} messages</div>
          )}
        </div>

        <div className="project-item__menu-wrapper">
          <button
            className="project-item__menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Project menu"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <>
              <div
                className="project-item__menu-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="project-item__menu">
                <button
                  className="project-item__menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  className="project-item__menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsModal(true);
                    setShowMenu(false);
                  }}
                >
                  <Settings size={14} />
                  Settings
                </button>
                <button
                  className="project-item__menu-item project-item__menu-item--danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showEditModal && (
        <ProjectForm
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showSettingsModal && (
        <ProjectSettings
          project={project}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  );
};
