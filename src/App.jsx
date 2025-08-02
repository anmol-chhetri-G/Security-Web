import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { Feedback } from './pages/Feedback';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import UserLookup from './pages/UserLookup.jsx';
import IpInfo from './pages/IpInfo.jsx';
import DomainInfo from './pages/DomainInfo.jsx';
import FileScanner from './pages/FileScanner.jsx';
import AdminFeedback from './pages/AdminFeedback.jsx';

/**
 * Main App component with routing and providers
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Main Layout Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="try-now" element={<Navigate to="/signup" replace />} />
              </Route>

              {/* Auth Layout Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
              </Route>

              {/* Direct auth routes (for backward compatibility) */}
              <Route path="/login" element={<AuthLayout />}>
                <Route index element={<Login />} />
              </Route>
              <Route path="/signup" element={<AuthLayout />}>
                <Route index element={<Signup />} />
              </Route>

              {/* Tool Routes */}
              <Route path="/user-lookup" element={<UserLookup />} />
              <Route path="/ip-info" element={<IpInfo />} />
              <Route path="/domain-info" element={<DomainInfo />} />
              <Route path="/file-scanner" element={<FileScanner />} />
              
              {/* Admin Routes */}
              <Route path="/admin/feedback" element={<AdminFeedback />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;