import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, User, LogOut, Settings, BarChart3, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Try Now', href: '/try-now' }
];

/**
 * Responsive navigation header with hamburger menu
 */
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`border-b transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className={`flex items-center space-x-2 transition-colors ${
              theme === 'dark' 
                ? 'text-gray-100 hover:text-indigo-400' 
                : 'text-gray-900 hover:text-indigo-600'
            }`}
            aria-label="ReconOne Home"
          >
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">ReconOne</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" role="navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                    : theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-2 ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-gray-100 focus:ring-offset-slate-900' 
                  : 'text-gray-600 hover:text-gray-900 focus:ring-offset-white'
              }`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-3 py-2 ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-gray-100 focus:ring-offset-slate-900' 
                      : 'text-gray-600 hover:text-gray-900 focus:ring-offset-white'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </button>

                {isUserMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${
                    theme === 'dark' 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`px-4 py-2 border-b ${
                      theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Username: {user?.username}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/feedback"
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2 ${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Feedback Stats</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`md:hidden transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-2 ${
              theme === 'dark' 
                ? 'text-gray-300 hover:text-gray-100 focus:ring-offset-slate-900' 
                : 'text-gray-600 hover:text-gray-900 focus:ring-offset-white'
            }`}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t ${
              theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
            }`}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? theme === 'dark' ? 'text-indigo-400 bg-slate-800' : 'text-indigo-600 bg-gray-100'
                      : theme === 'dark' ? 'text-gray-300 hover:bg-slate-800 hover:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <div className={`border-t pt-4 mt-4 ${
                theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
              }`}>
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2 ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-slate-800 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </button>
                
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Welcome, {user?.username}!</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/feedback"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2 ${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:bg-slate-800 hover:text-white' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Feedback Stats</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-slate-800 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-slate-800 hover:text-gray-100' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};