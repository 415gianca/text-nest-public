
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/providers/AuthProvider';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';

interface ProfileEditFormProps {
  user: User;
  onCancel: () => void;
  onProfileUpdated: (updatedUser: User) => void;
}

const ProfileEditForm = ({ user, onCancel, onProfileUpdated }: ProfileEditFormProps) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{username?: string}>({});

  // Status options
  const statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'idle', label: 'Idle' },
    { value: 'offline', label: 'Offline' },
  ];
  const [status, setStatus] = useState<'online' | 'idle' | 'offline'>(user.status || 'online');
  
  const validateForm = () => {
    const newErrors: {username?: string} = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username,
          avatar,
          status
        })
        .eq('id', user.id)
        .select('*')
        .single();
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        setIsLoading(false);
        return;
      }
      
      // Update local user state
      const updatedUser: User = {
        ...user,
        username: data.username,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        status: data.status as 'online' | 'idle' | 'offline'
      };
      
      // Update local storage if that's how you're storing the user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          localStorage.setItem('user', JSON.stringify({
            ...parsedUser,
            username: data.username,
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
            status: data.status
          }));
        } catch (error) {
          console.error("Error parsing saved user:", error);
        }
      }
      
      toast.success("Profile updated successfully");
      onProfileUpdated(updatedUser);
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while updating the profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a new random avatar based on username
  const generateAvatar = () => {
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-${Date.now()}`;
    setAvatar(newAvatar);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className={`bg-discord-darkest border-none text-white ${errors.username ? 'border-discord-danger border' : ''}`}
          />
          {errors.username && (
            <p className="text-sm text-discord-danger">{errors.username}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select 
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'online' | 'idle' | 'offline')}
            className="w-full bg-discord-darkest text-white p-2 rounded"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label>Avatar</Label>
          <div className="flex flex-col space-y-4 items-center">
            <Avatar className="h-24 w-24 border-2 border-discord-primary">
              <AvatarImage src={avatar} alt={username} />
              <AvatarFallback className="text-2xl bg-discord-primary text-white">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateAvatar}
              className="text-white"
            >
              Generate Random Avatar
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          className="bg-discord-primary hover:bg-discord-primary/80"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : 'Save Changes'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default ProfileEditForm;
