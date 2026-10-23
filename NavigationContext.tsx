import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationState {
  returnUrl?: string;
  claimDonationId?: string;
  prefillMessage?: string;
  [key: string]: any;
}

interface NavigationContextType {
  currentPath: string;
  locationState: LocationState | null;
  navigate: (path: string, options?: { state?: LocationState; replace?: boolean }) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPath: '/',
  locationState: null,
  navigate: () => {}
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Default to / (Claim Food page)
    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  });

  const [locationState, setLocationState] = useState<LocationState | null>(() => {
    return window.history.state?.appState || null;
  });

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setCurrentPath(window.location.pathname || '/');
      setLocationState(event.state?.appState || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, options?: { state?: LocationState; replace?: boolean }) => {
    const targetPath = path.startsWith('/') ? path : `/${path}`;
    const stateObj = { appState: options?.state || null };

    if (options?.replace) {
      window.history.replaceState(stateObj, '', targetPath);
    } else {
      window.history.pushState(stateObj, '', targetPath);
    }

    setCurrentPath(targetPath);
    setLocationState(options?.state || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ currentPath, locationState, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
