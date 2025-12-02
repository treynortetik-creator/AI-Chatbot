import React from 'react';
import { AuthProvider, ProjectProvider, SettingsProvider, useAuth } from './contexts';
import { AuthScreen } from './components/Auth';
import { AppLayout } from './components/Layout';
import { LoadingSpinner } from './components/Common';
import './styles/global.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return isAuthenticated ? <AppLayout /> : <AuthScreen />;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
