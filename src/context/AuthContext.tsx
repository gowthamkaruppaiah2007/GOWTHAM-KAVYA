import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  avatar: string;
  color: string;
}

export const PROFILES: UserProfile[] = [
  {
    id: '9626652426',
    phone: '9626652426',
    name: 'Gowtham k',
    avatar: 'GK',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: '7845760300',
    phone: '7845760300',
    name: 'Kavya',
    avatar: 'K',
    color: 'from-pink-500 to-purple-600',
  },
];

interface AuthContextType {
  user: UserProfile | null;
  partner: UserProfile | null;
  login: (idOrPhone: string, pass: string) => { success: boolean; message: string };
  quickLogin: (profileId: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CREDENTIALS: Record<string, { pass: string; profile: UserProfile }> = {
  '9626652426': { pass: 'kavya', profile: PROFILES[0] },
  '7845760300': { pass: 'gowtham', profile: PROFILES[1] },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kg_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kg_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kg_active_user');
    }
  }, [user]);

  const partner = user
    ? PROFILES.find((p) => p.id !== user.id) || null
    : null;

  const login = (idOrPhone: string, pass: string) => {
    const cleanId = idOrPhone.trim();
    const cleanPass = pass.trim();

    const matchedKey = Object.keys(CREDENTIALS).find(
      (k) => k === cleanId || k === cleanId.replace(/\D/g, '')
    );

    if (!matchedKey) {
      return { success: false, message: 'Invalid Profile ID or Phone Number' };
    }

    const cred = CREDENTIALS[matchedKey];

    if (cred.pass !== cleanPass) {
      return { success: false, message: 'Incorrect Password' };
    }

    setUser(cred.profile);
    setLoginModalOpen(false);
    return { success: true, message: `Welcome back, ${cred.profile.name}!` };
  };

  const quickLogin = (profileId: string) => {
    const target = PROFILES.find((p) => p.id === profileId);
    if (target) {
      setUser(target);
      setLoginModalOpen(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        login,
        quickLogin,
        logout,
        isLoginModalOpen,
        setLoginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
