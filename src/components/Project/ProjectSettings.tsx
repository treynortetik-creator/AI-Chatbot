import React, { useState, useEffect } from 'react';
import type { Project, OpenRouterModel } from '../../types';
import { useProjects } from '../../contexts';
import { openRouterAPI } from '../../services';
import { Modal, Input, Button } from '../Common';
import './ProjectSettings.css';

interface ProjectSettingsProps {
  project: Project;
  onClose: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onClose }) => {
  const { updateProjectSettings } = useProjects();
  const [model, setModel] = useState(project.settings.model || '');
  const [temperature, setTemperature] = useState(
    project.settings.temperature?.toString() || '0.7'
  );
  const [maxTokens, setMaxTokens] = useState(
    project.settings.maxTokens?.toString() || '4096'
  );
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoadingModels(true);
    const result = await openRouterAPI.fetchModels();
    if (result.success && result.models) {
      setModels(result.models);
    }
    setLoadingModels(false);
  };

  const handleSave = () => {
    updateProjectSettings(project.id, {
      model: model || undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      maxTokens: maxTokens ? parseInt(maxTokens) : undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Settings - ${project.name}`}
      size="medium"
    >
      <div className="project-settings">
        <div className="project-settings__section">
          <h3 className="project-settings__section-title">Model Override</h3>
          <p className="project-settings__section-description">
            Override the default model for this project. Leave empty to use global settings.
          </p>

          <div className="project-settings__field">
            <label className="project-settings__label">Model</label>
            {loadingModels ? (
              <div className="project-settings__model-loading">
                Loading models...
              </div>
            ) : (
              <select
                className="project-settings__select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="">Use Default Model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="project-settings__section">
          <h3 className="project-settings__section-title">Generation Parameters</h3>
          <p className="project-settings__section-description">
            Customize how the AI responds in this project.
          </p>

          <div className="project-settings__field">
            <label className="project-settings__label">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              className="project-settings__slider"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
            <p className="project-settings__hint">
              Lower values make responses more focused and deterministic. Higher values make
              them more creative and varied.
            </p>
          </div>

          <div className="project-settings__field">
            <Input
              label="Max Tokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="4096"
              fullWidth
            />
            <p className="project-settings__hint">
              Maximum number of tokens to generate in the response.
            </p>
          </div>
        </div>

        <div className="project-settings__actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};
