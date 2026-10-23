import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RegisterData } from '../types/auth.ts';
import {
  getStoredSession,
  loginWithEmail,
  registerUser,
  loginDemoUser,
  loginWithGoogleAuth,
  updateUserProfile,
  updateUserPassword,
  logoutUser
} from '../services/authService.ts';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (data: RegisterData) => Promise<UserProfile>;
  loginDemo: (role: 'donor' | 'recipient') => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => { throw new Error('Not initialized'); },
  register: async () => { throw new Error('Not initialized'); },
  loginDemo: async () => { throw new Error('Not initialized'); },
  loginWithGoogle: async () => { throw new Error('Not initialized'); },
  logout: async () => {},
  updateProfile: async () => { throw new Error('Not initialized'); },
  changePassword: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on app boot
  useEffect(() => {
    try {
      const existing = getStoredSession();
      if (existing) {
        setUser(existing);
      }
    } catch (e) {
      console.error('Session restore error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await loginWithEmail(email, pass);
    setUser(profile);
    return profile;
  };

  const register = async (data: RegisterData): Promise<UserProfile> => {
    const profile = await registerUser(data);
    setUser(profile);
    return profile;
  };

  const loginDemo = async (role: 'donor' | 'recipient'): Promise<UserProfile> => {
    const profile = await loginDemoUser(role);
    setUser(profile);
    return profile;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const profile = await loginWithGoogleAuth();
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('User not logged in');
    const updated = await updateUserProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) throw new Error('User not logged in');
    await updateUserPassword(user.email, oldPass, newPass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginDemo,
        loginWithGoogle,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
