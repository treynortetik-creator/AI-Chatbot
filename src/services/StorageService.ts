import type { Project, Message, AppSettings, ContextFile, SavedPrompt } from '../types';
import { DEFAULT_SETTINGS } from '../types';

class StorageService {
  private userId: string | null = null;

  /**
   * Set the current user ID for scoped storage
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Generate a storage key scoped to the current user
   */
  private getKey(dataType: string): string {
    if (!this.userId) {
      throw new Error('No user ID set. Cannot access user-scoped storage.');
    }
    return `chatbot_${this.userId}_${dataType}`;
  }

  /**
   * Get data from localStorage
   */
  private getData<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Save data to localStorage
   */
  private saveData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  // ==================== Projects ====================

  /**
   * Get all projects for the current user
   */
  getProjects(): Project[] {
    return this.getData<Project[]>(this.getKey('projects'), []);
  }

  /**
   * Save projects for the current user
   */
  saveProjects(projects: Project[]): void {
    this.saveData(this.getKey('projects'), projects);
  }

  /**
   * Get a single project by ID
   */
  getProject(projectId: string): Project | undefined {
    const projects = this.getProjects();
    return projects.find(p => p.id === projectId);
  }

  /**
   * Update a single project
   */
  updateProject(projectId: string, updates: Partial<Project>): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveProjects(projects);
    }
  }

  /**
   * Delete a project
   */
  deleteProject(projectId: string): void {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveProjects(filtered);
    // Also delete associated messages
    this.deleteMessages(projectId);
  }

  // ==================== Messages ====================

  /**
   * Get messages for a specific project
   */
  getMessages(projectId: string): Message[] {
    return this.getData<Message[]>(this.getKey(`messages_${projectId}`), []);
  }

  /**
   * Save messages for a specific project
   */
  saveMessages(projectId: string, messages: Message[]): void {
    this.saveData(this.getKey(`messages_${projectId}`), messages);
  }

  /**
   * Delete messages for a specific project
   */
  deleteMessages(projectId: string): void {
    const key = this.getKey(`messages_${projectId}`);
    localStorage.removeItem(key);
  }

  /**
   * Add a message to a project
   */
  addMessage(projectId: string, message: Message): void {
    const messages = this.getMessages(projectId);
    messages.push(message);
    this.saveMessages(projectId, messages);
  }

  /**
   * Update a message in a project
   */
  updateMessage(projectId: string, messageId: string, updates: Partial<Message>): void {
    const messages = this.getMessages(projectId);
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updates };
      this.saveMessages(projectId, messages);
    }
  }

  // ==================== Settings ====================

  /**
   * Get user settings
   */
  getSettings(): AppSettings {
    try {
      return this.getData<AppSettings>(this.getKey('settings'), DEFAULT_SETTINGS);
    } catch (error) {
      // Return default settings if userId is not set or other error occurs
      console.warn('Could not load user settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save user settings
   */
  saveSettings(settings: AppSettings): void {
    try {
      this.saveData(this.getKey('settings'), settings);
    } catch (error) {
      console.warn('Could not save user settings:', error);
    }
  }

  /**
   * Update specific settings
   */
  updateSettings(updates: Partial<AppSettings>): void {
    const settings = this.getSettings();
    this.saveSettings({ ...settings, ...updates });
  }

  // ==================== Context Files ====================

  /**
   * Get context files for a project
   */
  getContextFiles(projectId: string): ContextFile[] {
    const project = this.getProject(projectId);
    return project?.contextFiles || [];
  }

  /**
   * Save context files for a project
   */
  saveContextFiles(projectId: string, contextFiles: ContextFile[]): void {
    this.updateProject(projectId, { contextFiles });
  }

  /**
   * Add a context file to a project
   */
  addContextFile(projectId: string, file: ContextFile): void {
    const project = this.getProject(projectId);
    if (project) {
      const contextFiles = [...project.contextFiles, file];
      this.updateProject(projectId, { contextFiles });
    }
  }

  /**
   * Remove a context file from a project
   */
  removeContextFile(projectId: string, fileId: string): void {
    const project = this.getProject(projectId);
    if (project) {
      const contextFiles = project.contextFiles.filter(f => f.id !== fileId);
      this.updateProject(projectId, { contextFiles });
    }
  }

  // ==================== Saved Prompts ====================

  /**
   * Get all saved prompts for the current user
   */
  getSavedPrompts(): SavedPrompt[] {
    return this.getData<SavedPrompt[]>(this.getKey('prompts'), []);
  }

  /**
   * Save prompts for the current user
   */
  saveSavedPrompts(prompts: SavedPrompt[]): void {
    this.saveData(this.getKey('prompts'), prompts);
  }

  /**
   * Add a new saved prompt
   */
  addSavedPrompt(name: string, content: string): SavedPrompt {
    const prompt: SavedPrompt = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      content,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    const prompts = this.getSavedPrompts();
    prompts.push(prompt);
    this.saveSavedPrompts(prompts);
    return prompt;
  }

  /**
   * Update a saved prompt
   */
  updateSavedPrompt(promptId: string, updates: Partial<SavedPrompt>): void {
    const prompts = this.getSavedPrompts();
    const index = prompts.findIndex(p => p.id === promptId);
    if (index !== -1) {
      prompts[index] = { ...prompts[index], ...updates };
      this.saveSavedPrompts(prompts);
    }
  }

  /**
   * Delete a saved prompt
   */
  deleteSavedPrompt(promptId: string): void {
    const prompts = this.getSavedPrompts();
    const filtered = prompts.filter(p => p.id !== promptId);
    this.saveSavedPrompts(filtered);
  }

  /**
   * Increment usage count for a prompt
   */
  incrementPromptUsage(promptId: string): void {
    const prompts = this.getSavedPrompts();
    const index = prompts.findIndex(p => p.id === promptId);
    if (index !== -1) {
      prompts[index].usageCount++;
      this.saveSavedPrompts(prompts);
    }
  }

  // ==================== Utility ====================

  /**
   * Clear all data for the current user
   */
  clearUserData(): void {
    if (!this.userId) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`chatbot_${this.userId}_`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get the active project ID
   */
  getActiveProjectId(): string | null {
    return this.getData<string | null>(this.getKey('activeProjectId'), null);
  }

  /**
   * Set the active project ID
   */
  setActiveProjectId(projectId: string | null): void {
    this.saveData(this.getKey('activeProjectId'), projectId);
  }
}

export const storageService = new StorageService();
