import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { currentPath, navigate } = useNavigation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(fallbackPath, {
        state: { returnUrl: currentPath },
        replace: true
      });
    }
  }, [loading, isAuthenticated, currentPath, fallbackPath, navigate]);

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
