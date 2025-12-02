import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatContainer } from '../Chat';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-layout__main">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="app-layout__content">
          <ChatContainer />
        </main>
      </div>
    </div>
  );
};
