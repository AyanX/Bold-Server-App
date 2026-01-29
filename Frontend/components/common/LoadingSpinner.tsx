import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, message, size = 'md', color = '#e5002b' }) => {
  const dims = size === 'sm' ? 'h-4 w-4 border-b-2' : size === 'lg' ? 'h-16 w-16 border-b-4' : 'h-12 w-12 border-b-2';
  return (
    <div className={`flex ${fullScreen ? 'items-center justify-center h-screen' : 'items-center justify-center'}`}>
      <div className={`animate-spin rounded-full ${dims}`} style={{ borderBottomColor: color }}></div>
      {message && <div className="ml-3 text-sm text-gray-600">{message}</div>}
    </div>
  );
};

export default LoadingSpinner;
