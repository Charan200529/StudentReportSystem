import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const renderForm = () => {
    switch (authMode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignup={() => setAuthMode('signup')}
            onForgotPassword={() => setAuthMode('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={() => setAuthMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => setAuthMode('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Management System
          </h1>
          <p className="text-lg text-gray-600">
            Manage your academic journey with ease
          </p>
        </div>

        {/* Auth Forms */}
        {renderForm()}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Student Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
