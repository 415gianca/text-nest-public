
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { generate as generateId } from 'shortid';
import { User } from '@/providers/AuthProvider';
import { Channel, Message } from '@/providers/ChatProvider';

// Helper function to validate status
const validateStatus = (status: string | null): "online" | "idle" | "offline" => {
  if (status === "idle" || status === "offline") {
    return status;
  }
  return "online"; // Default to online for any other value
};

export const useSupabaseChat = (user: User | null) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannelId, setCurrentChannelId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load channels from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchChannels = async () => {
      // TODO: Replace this with actual Supabase implementation
      // For now, we'll load from localStorage as a fallback
      try {
        const savedChannels = localStorage.getItem('chatChannels');
        if (savedChannels) {
          setChannels(JSON.parse(savedChannels));
          console.log("Loaded saved channels from localStorage");
        } else {
          setChannels([]);
          console.log("No saved channels found, initializing empty channels");
        }
      } catch (error) {
        console.error("Error loading channels from localStorage:", error);
        setChannels([]);
      }
      
      setIsInitialized(true);
      
      // Set a default channel if available
      if (channels.length > 0) {
        setCurrentChannelId(channels[0].id);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const typedUsers: User[] = data.map(profile => ({
            id: profile.id,
            username: profile.username,
            avatar: profile.avatar,
            status: validateStatus(profile.status),
            isAdmin: profile.is_admin || false
          }));
          
          setAllUsers(typedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      }
    };
    
    fetchChannels();
    fetchUsers();
  }, [user]);

  // Save channels to localStorage as a fallback
  useEffect(() => {
    if (isInitialized && channels.length > 0) {
      try {
        localStorage.setItem('chatChannels', JSON.stringify(channels));
        console.log("Saved channels to localStorage");
      } catch (error) {
        console.error("Error saving channels to localStorage:", error);
        toast.error("Failed to save chat data");
      }
    }
  }, [channels, isInitialized]);

  const getAllUsers = () => {
    return allUsers;
  };

  return {
    channels,
    setChannels,
    currentChannelId,
    setCurrentChannelId,
    getAllUsers
  };
};

export default useSupabaseChat;
