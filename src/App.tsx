import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Assignments } from './pages/Assignments';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { Settings } from './pages/Settings';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Role-based Route Component
const RequireRole: React.FC<{ 
  children: React.ReactNode; 
  roles: string[] 
}> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasRequiredRole = roles.some(role => user.roles.includes(role));
  
  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Layout>
              <Courses />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <Layout>
              <Assignments />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/users"
        element={
          <RequireRole roles={['ADMIN']}>
            <Layout>
              <AdminUsers />
            </Layout>
          </RequireRole>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <RequireRole roles={['ADMIN', 'TEACHER']}>
            <Layout>
              <AdminAnalytics />
            </Layout>
          </RequireRole>
        }
      />

      {/* Settings route */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
