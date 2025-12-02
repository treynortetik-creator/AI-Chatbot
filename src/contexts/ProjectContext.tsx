import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project, ContextFile, ProjectSettings } from '../types';
import { storageService } from '../services';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  createProject: (name: string, description?: string, customInstructions?: string) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setActiveProject: (projectId: string | null) => void;
  addContextFile: (projectId: string, file: ContextFile) => void;
  removeContextFile: (projectId: string, fileId: string) => void;
  updateProjectSettings: (projectId: string, settings: Partial<ProjectSettings>) => void;
  clearMessages: (projectId: string) => void;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setProjects([]);
      setActiveProjectState(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadProjects = () => {
    setLoading(true);
    try {
      const loadedProjects = storageService.getProjects();
      setProjects(loadedProjects);

      // Load active project
      const activeProjectId = storageService.getActiveProjectId();
      if (activeProjectId) {
        const active = loadedProjects.find(p => p.id === activeProjectId);
        setActiveProjectState(active || null);
      } else if (loadedProjects.length > 0) {
        // If no active project, set the first one as active
        setActiveProjectState(loadedProjects[0]);
        storageService.setActiveProjectId(loadedProjects[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = () => {
    loadProjects();
  };

  const createProject = (
    name: string,
    description?: string,
    customInstructions?: string
  ): Project => {
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      customInstructions: customInstructions || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      contextFiles: [],
      settings: {},
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    storageService.saveProjects(updatedProjects);

    // Set as active if it's the first project
    if (updatedProjects.length === 1) {
      setActiveProjectState(newProject);
      storageService.setActiveProjectId(newProject.id);
    }

    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );

    setProjects(updatedProjects);
    storageService.saveProjects(updatedProjects);

    // Update active project if it's the one being updated
    if (activeProject?.id === projectId) {
      const updated = updatedProjects.find(p => p.id === projectId);
      setActiveProjectState(updated || null);
    }
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    storageService.deleteProject(projectId);

    // If deleting active project, set another as active
    if (activeProject?.id === projectId) {
      const newActive = updatedProjects.length > 0 ? updatedProjects[0] : null;
      setActiveProjectState(newActive);
      storageService.setActiveProjectId(newActive?.id || null);
    }
  };

  const setActiveProject = (projectId: string | null) => {
    if (projectId === null) {
      setActiveProjectState(null);
      storageService.setActiveProjectId(null);
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProjectState(project);
      storageService.setActiveProjectId(projectId);
    }
  };

  const addContextFile = (projectId: string, file: ContextFile) => {
    storageService.addContextFile(projectId, file);
    refreshProjects();
  };

  const removeContextFile = (projectId: string, fileId: string) => {
    storageService.removeContextFile(projectId, fileId);
    refreshProjects();
  };

  const updateProjectSettings = (projectId: string, settings: Partial<ProjectSettings>) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        settings: { ...project.settings, ...settings },
      });
    }
  };

  const clearMessages = (projectId: string) => {
    // Clear all messages for the project
    storageService.saveMessages(projectId, []);

    // Update project message count
    updateProject(projectId, { messageCount: 0 });
  };

  const value: ProjectContextType = {
    projects,
    activeProject,
    loading,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    addContextFile,
    removeContextFile,
    updateProjectSettings,
    clearMessages,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
