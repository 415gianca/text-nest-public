
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  avatar?: string;
  status: 'online' | 'idle' | 'offline';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock user database for demo purposes
const MOCK_USERS: Record<string, { username: string; password: string; isAdmin: boolean }> = {
  "1": { username: "admin", password: "admin123", isAdmin: true },
  "2": { username: "user1", password: "password", isAdmin: false },
  "3": { username: "user2", password: "password", isAdmin: false },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock login process
    const userEntry = Object.entries(MOCK_USERS).find(
      ([, user]) => user.username === username && user.password === password
    );

    if (userEntry) {
      const [id, userData] = userEntry;
      const newUser: User = {
        id,
        username: userData.username,
        isAdmin: userData.isAdmin,
        status: 'online',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Generate avatar
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success("Logged in successfully!");
      return true;
    } else {
      toast.error("Invalid username or password");
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    // Check if username exists
    const exists = Object.values(MOCK_USERS).some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      toast.error("Username already exists");
      return false;
    }

    // Generate a new ID (would be handled by a DB in production)
    const newId = String(Object.keys(MOCK_USERS).length + 1);
    
    // Add user to mock database
    MOCK_USERS[newId] = {
      username,
      password,
      isAdmin: false,
    };

    // Automatically login
    const newUser: User = {
      id: newId,
      username,
      isAdmin: false,
      status: 'online',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    toast.success("Account created successfully!");
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info("Logged out");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    login,
    register,
    logout,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-discord-primary"></div>
    </div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
