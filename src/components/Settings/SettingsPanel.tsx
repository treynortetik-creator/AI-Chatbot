import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../../contexts';
import { Modal, Input, Button } from '../Common';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'google/gemini-pro', name: 'Gemini Pro' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="large">
      <div className="settings-panel">
        <div className="settings-panel__section">
          <h3 className="settings-panel__section-title">API Configuration</h3>

          <div className="settings-panel__field">
            <label className="settings-panel__label">OpenRouter API Key</label>
            <div className="settings-panel__api-key-input">
              <input
                type={showApiKey ? 'text' : 'password'}
                className="settings-panel__input"
                value={localSettings.apiKey}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, apiKey: e.target.value })
                }
                placeholder="sk-or-..."
              />
              <button
                type="button"
                className="settings-panel__toggle-button"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="settings-panel__hint">
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenRouter
              </a>
            </p>
          </div>

          <div className="settings-panel__field">
            <label className="settings-panel__label">Default Model</label>
            <select
              className="settings-panel__select"
              value={localSettings.defaultModel}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, defaultModel: e.target.value })
              }
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="settings-panel__section">
          <h3 className="settings-panel__section-title">Appearance</h3>

          <div className="settings-panel__field">
            <label className="settings-panel__label">Theme</label>
            <select
              className="settings-panel__select"
              value={localSettings.theme}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  theme: e.target.value as 'light' | 'dark' | 'auto',
                })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div className="settings-panel__field">
            <label className="settings-panel__label">Font Size</label>
            <select
              className="settings-panel__select"
              value={localSettings.fontSize}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  fontSize: e.target.value as 'small' | 'medium' | 'large',
                })
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="settings-panel__section">
          <h3 className="settings-panel__section-title">Behavior</h3>

          <div className="settings-panel__field">
            <label className="settings-panel__checkbox-label">
              <input
                type="checkbox"
                checked={localSettings.streamingEnabled}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    streamingEnabled: e.target.checked,
                  })
                }
              />
              <span>Enable streaming responses</span>
            </label>
            <p className="settings-panel__hint">
              Show responses as they are generated in real-time
            </p>
          </div>

          <div className="settings-panel__field">
            <label className="settings-panel__checkbox-label">
              <input
                type="checkbox"
                checked={localSettings.showTokenCount}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    showTokenCount: e.target.checked,
                  })
                }
              />
              <span>Show token count</span>
            </label>
            <p className="settings-panel__hint">
              Display token usage information in conversations
            </p>
          </div>

          <div className="settings-panel__field">
            <Input
              label="Token Warning Threshold"
              type="number"
              value={localSettings.tokenWarningThreshold.toString()}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  tokenWarningThreshold: parseInt(e.target.value) || 100000,
                })
              }
              fullWidth
            />
            <p className="settings-panel__hint">
              Show a warning when approaching this token limit
            </p>
          </div>
        </div>

        <div className="settings-panel__actions">
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
