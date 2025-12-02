import React, { useState } from 'react';
import type { Project } from '../../types';
import { useProjects } from '../../contexts';
import { Modal, Input, Button } from '../Common';
import './ProjectForm.css';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const { createProject, updateProject } = useProjects();
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [customInstructions, setCustomInstructions] = useState(
    project?.customInstructions || ''
  );
  const [error, setError] = useState('');

  const isEdit = !!project;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (isEdit) {
      updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        customInstructions: customInstructions.trim(),
      });
    } else {
      createProject(name.trim(), description.trim() || undefined, customInstructions.trim());
    }

    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Create Project'}
      size="medium"
    >
      <form className="project-form" onSubmit={handleSubmit}>
        {error && <div className="project-form__error">{error}</div>}

        <Input
          label="Project Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Project"
          fullWidth
          required
          autoFocus
        />

        <Input
          label="Description (Optional)"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your project"
          fullWidth
        />

        <div className="project-form__field">
          <label className="project-form__label">
            Custom Instructions (Optional)
          </label>
          <textarea
            className="project-form__textarea"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add any custom instructions or system prompts for the AI..."
            rows={6}
          />
          <p className="project-form__hint">
            These instructions will be included in every conversation in this project
          </p>
        </div>

        <div className="project-form__actions">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
