
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/providers/AuthProvider';

export const useAuthFunctions = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);

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
    
    localStorage.removeItem('user');
    toast.info("Logged out");
    console.log("AuthProvider: Logged out successfully");
  };

  const getAllUsers = () => {
    return allUsers;
  };

  return {
    login,
    register,
    logout,
    getAllUsers,
    setAllUsers
  };
};
