import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Main layout component that includes navigation and footer
 */
export const MainLayout = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};