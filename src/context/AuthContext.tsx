import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, CoachingStyle } from '../types/index.js';
import { api, setApiAuthToken, getApiAuthToken } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, coachingStyle?: CoachingStyle) => Promise<User>;
  logout: () => Promise<void>;
  updateUserPreferences: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  demoUsers: Array<Pick<User, 'id' | 'name' | 'email' | 'role' | 'tier'>>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<Array<Pick<User, 'id' | 'name' | 'email' | 'role' | 'tier'>>>([]);

  const loadInitialUser = async () => {
    try {
      const token = getApiAuthToken();
      if (token) {
        const data = await api.getCurrentUser();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
          setApiAuthToken('');
        }
      } else {
        setUser(null);
      }

      // Load available demo profiles for UI informational display
      try {
        const demoRes = await api.getDemoUsers();
        if (demoRes?.users) {
          setDemoUsers(demoRes.users);
        }
      } catch {}
    } catch (err) {
      setUser(null);
      setApiAuthToken('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const { user: loggedInUser, token } = await api.login(email, password);
      setUser(loggedInUser);
      setApiAuthToken(token);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, coachingStyle?: CoachingStyle): Promise<User> => {
    setLoading(true);
    try {
      const { user: registeredUser, token } = await api.register({ name, email, password, coachingStyle });
      setUser(registeredUser);
      setApiAuthToken(token);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setApiAuthToken('');
    }
  };

  const updateUserPreferences = async (updates: Partial<User>) => {
    if (!user) return;
    const { user: updated } = await api.updateProfile(updates);
    setUser(updated);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await api.deleteAccount();
    setUser(null);
    setApiAuthToken('');
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const data = await api.getCurrentUser();
      if (data?.user) setUser(data.user);
    } catch {
      setUser(null);
      setApiAuthToken('');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserPreferences,
        deleteAccount,
        demoUsers,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
