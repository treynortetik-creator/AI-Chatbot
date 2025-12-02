import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../Common';
import './AppLayout.css';

// Lazy load the ChatContainer to defer loading heavy dependencies (syntax highlighter, etc.)
const ChatContainer = lazy(() => import('../Chat/ChatContainer').then(module => ({ default: module.ChatContainer })));

export const AppLayout: React.FC = () => {
  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  // Handle window resize to adjust sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-open sidebar on desktop, auto-close on mobile (only on resize)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`app-layout__main ${!sidebarOpen ? 'app-layout__main--sidebar-closed' : ''}`}>
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
