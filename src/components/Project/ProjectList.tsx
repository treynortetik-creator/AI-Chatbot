import React, { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { useProjects } from '../../contexts';
import { ProjectItem } from './ProjectItem';
import { ProjectForm } from './ProjectForm';
import { Button } from '../Common';
import './ProjectList.css';

export const ProjectList: React.FC = () => {
  const { projects, activeProject, setActiveProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="project-list">
      <div className="project-list__header">
        <h2 className="project-list__title">Projects</h2>
        <button
          className="project-list__add-button"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new project"
        >
          <Plus size={18} />
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="project-list__empty">
          <FolderOpen size={32} />
          <p>No projects yet</p>
          <Button
            variant="ghost"
            size="small"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="project-list__items">
          {projects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              isActive={activeProject?.id === project.id}
              onClick={() => setActiveProject(project.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <ProjectForm
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
