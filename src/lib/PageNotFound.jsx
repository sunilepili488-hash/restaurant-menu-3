import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-display text-6xl font-bold text-primary">404</p>
        <h1 className="font-display text-2xl font-semibold">Page Not Found</h1>
        <p className="text-muted-foreground text-sm">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
