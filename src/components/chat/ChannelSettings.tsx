
import { useState, useEffect } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { X, User, UserPlus, Shield, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChannelSettingsProps {
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChannelSettings = ({ channelId, isOpen, onClose }: ChannelSettingsProps) => {
  const { channels, user: currentUser, getAllUsers } = useChat();
  const { isAdmin } = useAuth();
  const [channel, setChannel] = useState(channels.find(c => c.id === channelId));
  const [channelName, setChannelName] = useState(channel?.name || '');
  const [isPrivate, setIsPrivate] = useState(channel?.isPrivate || false);
  const [participants, setParticipants] = useState<{id: string, username: string, avatar?: string, nickname?: string}[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch channel participants and all users
  useEffect(() => {
    if (isOpen && channelId) {
      const loadChannel = async () => {
        try {
          // Get channel details from Supabase
          const { data: channelData, error: channelError } = await supabase
            .from('channels')
            .select('*')
            .eq('id', channelId)
            .single();
            
          if (channelError) throw channelError;
          
          if (channelData) {
            setChannelName(channelData.name);
            setIsPrivate(channelData.is_private);
          }
          
          // Get participants from Supabase
          const { data: participantsData, error: participantsError } = await supabase
            .from('channel_participants')
            .select(`
              user_id,
              nickname,
              profiles:user_id (id, username, avatar)
            `)
            .eq('channel_id', channelId);
            
          if (participantsError) throw participantsError;
          
          if (participantsData) {
            const formattedParticipants = participantsData.map((p: any) => ({
              id: p.profiles.id,
              username: p.profiles.username,
              avatar: p.profiles.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.profiles.username}`,
              nickname: p.nickname
            }));
            
            setParticipants(formattedParticipants);
          }
          
          // Get all users for adding participants
          setAllUsers(getAllUsers());
          
        } catch (error) {
          console.error('Error loading channel settings:', error);
          toast.error('Failed to load channel settings');
        }
      };
      
      loadChannel();
    }
  }, [isOpen, channelId, getAllUsers]);
  
  const isChannelCreator = channel?.creatorId === currentUser?.id;
  const canEditSettings = isChannelCreator || isAdmin;
  
  const handleSaveChanges = async () => {
    if (!canEditSettings) {
      toast.error('You do not have permission to edit this channel');
      return;
    }
    
    if (!channelName.trim()) {
      toast.error('Channel name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update channel in Supabase
      const { error } = await supabase
        .from('channels')
        .update({
          name: channelName,
          is_private: isPrivate
        })
        .eq('id', channelId);
        
      if (error) throw error;
      
      toast.success('Channel settings updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating channel:', error);
      toast.error('Failed to update channel settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddParticipant = async () => {
    if (!selectedUser || participants.some(p => p.id === selectedUser)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add participant to the channel in Supabase
      const { error } = await supabase
        .from('channel_participants')
        .insert({
          channel_id: channelId,
          user_id: selectedUser
        });
        
      if (error) throw error;
      
      // Add the new user to the participants list
      const newUser = allUsers.find(u => u.id === selectedUser);
      if (newUser) {
        setParticipants([...participants, {
          id: newUser.id,
          username: newUser.username,
          avatar: newUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`
        }]);
      }
      
      setSelectedUser('');
      toast.success('Participant added successfully');
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveParticipant = async (userId: string) => {
    // Don't allow removing the channel creator
    if (userId === channel?.creatorId) {
      toast.error('Cannot remove the channel creator');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove participant from the channel in Supabase
      const { error } = await supabase
        .from('channel_participants')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Remove the user from the participants list
      setParticipants(participants.filter(p => p.id !== userId));
      toast.success('Participant removed successfully');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetNickname = async (userId: string, nickname: string) => {
    if (!nickname.trim()) {
      // If nickname is empty, revert to the original
      const participant = participants.find(p => p.id === userId);
      if (participant) {
        document.getElementById(`nickname-${userId}`)?.setAttribute('value', participant.nickname || '');
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update nickname in Supabase
      const { error } = await supabase
        .from('channel_participants')
        .update({ nickname })
        .eq('channel_id', channelId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update the nickname in the participants list
      setParticipants(participants.map(p => 
        p.id === userId ? { ...p, nickname } : p
      ));
      toast.success('Nickname updated');
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast.error('Failed to update nickname');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-discord-darker text-white border-discord-primary/20">
        <DialogHeader>
          <DialogTitle>Channel Settings</DialogTitle>
          <DialogDescription className="text-discord-light">
            {canEditSettings 
              ? 'Manage your channel settings and participants.'
              : 'View channel information and participants.'}
          </DialogDescription>
        </DialogHeader>
        
        {channel && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  disabled={!canEditSettings}
                  className="bg-discord-darkest border-none text-white"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is-private">Private Channel</Label>
                <Switch
                  id="is-private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  disabled={!canEditSettings}
                />
              </div>
              
              <div className="pt-4 border-t border-discord-primary/20">
                <h4 className="text-sm font-medium mb-3">Participants</h4>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between bg-discord-darkest p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={participant.avatar} alt={participant.username} />
                          <AvatarFallback>{participant.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{participant.username}</span>
                        
                        {participant.id === channel.creatorId && (
                          <Shield size={16} className="text-discord-primary" title="Channel Creator" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {canEditSettings && (
                          <Input
                            id={`nickname-${participant.id}`}
                            placeholder="Nickname"
                            defaultValue={participant.nickname || ''}
                            onBlur={(e) => handleSetNickname(participant.id, e.target.value)}
                            className="max-w-[120px] h-7 bg-discord-dark border-none text-white text-xs"
                          />
                        )}
                        
                        {(canEditSettings && participant.id !== channel.creatorId) && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveParticipant(participant.id)}
                            disabled={isLoading}
                            className="h-6 w-6 text-discord-danger hover:bg-discord-danger/20"
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {canEditSettings && channel.type !== 'direct' && (
                  <div className="mt-4 flex items-center space-x-2">
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="flex-1 bg-discord-darkest border-none text-white h-9 rounded"
                      disabled={isLoading}
                    >
                      <option value="">Select a user to add</option>
                      {allUsers
                        .filter(u => !participants.some(p => p.id === u.id))
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                    </select>
                    
                    <Button
                      onClick={handleAddParticipant}
                      disabled={isLoading || !selectedUser}
                      className="bg-discord-primary hover:bg-discord-primary/80"
                    >
                      <UserPlus size={16} className="mr-1" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              
              {canEditSettings && (
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isLoading}
                  className="bg-discord-primary hover:bg-discord-primary/80"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChannelSettings;
