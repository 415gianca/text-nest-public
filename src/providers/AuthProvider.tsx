
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via Supabase
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Get the user profile from Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          if (profile) {
            const userData: User = {
              id: profile.id,
              username: profile.username,
              isAdmin: profile.is_admin,
              status: profile.status as 'online' | 'idle' | 'offline' || 'online',
              avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          localStorage.removeItem('user');
        }
      } else {
        // Fallback to localStorage for demo purposes
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error("Error parsing saved user:", error);
            localStorage.removeItem('user');
          }
        }
      }
      
      setLoading(false);
    };
    
    getUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile after sign in:", error);
            return;
          }
          
          if (profile) {
            const userData: User = {
              id: profile.id,
              username: profile.username,
              isAdmin: profile.is_admin,
              status: profile.status as 'online' | 'idle' | 'offline' || 'online',
              avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success("Logged in successfully!");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An unexpected error occurred");
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      // Extract username from email (before the @ symbol)
      const username = email.split('@')[0];
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success("Account created successfully!");
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "An unexpected error occurred");
      return false;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
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
