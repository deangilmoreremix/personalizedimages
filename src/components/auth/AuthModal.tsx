import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
  onSuccess
}) => {
  const [view, setView] = useState<AuthView>(initialView);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="animate-fadeIn">
          {view === 'login' && (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setView('signup')}
              onSwitchToReset={() => setView('reset')}
            />
          )}

          {view === 'signup' && (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}

          {view === 'reset' && (
            <ResetPasswordForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
