import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '@/src/services/auth.service.ts';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  login: (data: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ecrt_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ecrt_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [organization, setOrganization] = useState<Organization | null>(() => {
    const savedOrg = localStorage.getItem('ecrt_org');
    return savedOrg ? JSON.parse(savedOrg) : null;
  });

  const login = (data: any) => {
    const { access_token, user, organization } = data;
    setToken(access_token);
    setUser(user);
    setOrganization(organization || null);
    
    localStorage.setItem('ecrt_token', access_token);
    localStorage.setItem('ecrt_user', JSON.stringify(user));
    if (organization) {
      localStorage.setItem('ecrt_org', JSON.stringify(organization));
    } else {
      localStorage.removeItem('ecrt_org');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('ecrt_token');
    localStorage.removeItem('ecrt_user');
    localStorage.removeItem('ecrt_org');
  };

  return (
    <AuthContext.Provider value={{ user, organization, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
