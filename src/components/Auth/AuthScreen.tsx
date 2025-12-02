import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './AuthScreen.css';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-screen">
      <div className="auth-screen__gradient"></div>
      <div className="auth-screen__content">
        <div className="auth-screen__card">
          <div className="auth-screen__header">
            <h1 className="auth-screen__title">AI Chatbot</h1>
            <p className="auth-screen__subtitle">
              {isLogin
                ? 'Sign in to continue your conversation'
                : 'Create an account to get started'}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="auth-screen__toggle">
            <span className="auth-screen__toggle-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              className="auth-screen__toggle-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
