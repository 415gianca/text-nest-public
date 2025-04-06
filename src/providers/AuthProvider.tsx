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
    const getUser = async () => {
      console.log("AuthProvider: Checking for existing session");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("AuthProvider: Found existing session", session.user.id);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            throw error;
          }
          
          if (profile) {
            console.log("AuthProvider: Loaded profile", profile);
            const userData: User = {
              id: profile.id,
              username: profile.username,
              isAdmin: profile.is_admin,
              status: profile.status as 'online' | 'idle' | 'offline' || 'online',
              avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log("AuthProvider: No profile found for user", session.user.id);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          localStorage.removeItem('user');
        }
      } else {
        console.log("AuthProvider: No session found, checking localStorage");
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log("AuthProvider: Loaded user from localStorage", parsedUser);
          } catch (error) {
            console.error("Error parsing saved user:", error);
            localStorage.removeItem('user');
          }
        } else {
          console.log("AuthProvider: No user found in localStorage");
        }
      }
      
      setLoading(false);
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed", event, session?.user?.id);
        
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
            console.log("AuthProvider: Loaded profile after sign in", profile);
            const userData: User = {
              id: profile.id,
              username: profile.username,
              isAdmin: profile.is_admin,
              status: profile.status as 'online' | 'idle' | 'offline' || 'online',
              avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log("AuthProvider: No profile found after sign in for user", session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthProvider: User signed out");
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
      console.log("AuthProvider: Attempting login for", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
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
      console.log("AuthProvider: Attempting registration for", email);
      const username = email.split('@')[0];
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        toast.error(error.message);
        return false;
      }
      
      console.log("Registration response:", data);
      
      if (data?.user?.identities && data.user.identities.length === 0) {
        console.error("User may already exist but is not confirmed");
        toast.error("This email may already be registered. Please check your email for confirmation or try logging in.");
        return false;
      }
      
      if (data?.user?.confirmation_sent_at) {
        toast.success("Please check your email to confirm your account!");
      } else {
        toast.success("Account created successfully!");
      }
      
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "An unexpected error occurred");
      return false;
    }
  };

  const logout = async () => {
    console.log("AuthProvider: Attempting logout");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      toast.error(error.message);
      return;
    }
    
    setUser(null);
    localStorage.removeItem('user');
    toast.info("Logged out");
    console.log("AuthProvider: Logged out successfully");
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
