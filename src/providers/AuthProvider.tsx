
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';

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
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { login, register, logout, getAllUsers, setAllUsers } = useAuthFunctions();

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

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) {
          console.error("Error fetching users:", error);
          return;
        }
        
        if (data) {
          const users: User[] = data.map(profile => ({
            id: profile.id,
            username: profile.username,
            isAdmin: profile.is_admin,
            status: profile.status as 'online' | 'idle' | 'offline' || 'online',
            avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
          }));
          setAllUsers(users);
        }
      } catch (error) {
        console.error("Error in fetchAllUsers:", error);
      }
    };
    
    fetchAllUsers();
    
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAllUsers();
      })
      .subscribe();
      
    return () => {
      profilesSubscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    login,
    register,
    logout,
    getAllUsers,
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
