// src/components/layout/Layout.jsx
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AIChatbot from './AIChatbot';

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* ✅ Only ONE Navbar - here in Layout */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <main className="relative min-h-screen">
        {children}
      </main>

      {/* ✅ Chatbot appears on all pages */}
      <AIChatbot />
    </div>
  );
}