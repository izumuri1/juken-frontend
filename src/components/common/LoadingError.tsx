// src/components/common/LoadingError.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingError.scss';

interface LoadingErrorProps {
  loading?: boolean;
  error?: string | null;
  homeLink?: string;
  loadingMessage?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  loading = false,
  error = null,
  homeLink,
  loadingMessage = '読み込み中...'
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">{loadingMessage}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        {homeLink && (
          <button onClick={() => navigate(homeLink)} className="btn-primary">
            Homeへ戻る
          </button>
        )}
      </div>
    );
  }

  return null;
};