import React, { useState, Suspense, lazy } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../Common';
import './AppLayout.css';

// Lazy load the ChatContainer to defer loading heavy dependencies (syntax highlighter, etc.)
const ChatContainer = lazy(() => import('../Chat/ChatContainer').then(module => ({ default: module.ChatContainer })));

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-layout__main">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="app-layout__content">
          <Suspense fallback={<LoadingSpinner fullScreen message="Loading chat..." />}>
            <ChatContainer />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
