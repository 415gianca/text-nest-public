import React, { useState, useEffect } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface ChannelCreationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  type: 'group' | 'direct';
}

const ChannelCreationDialog: React.FC<ChannelCreationDialogProps> = ({ open, setOpen, type }) => {
  const { user, getAllUsers } = useAuth();
  const { createChannel } = useChat();
  const [channelName, setChannelName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<{ [key: string]: boolean }>({});
  const [availableUsers, setAvailableUsers] = useState(getAllUsers());
  const [isCreating, setIsCreating] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (user) {
      const filteredUsers = getAllUsers().filter(u => u.id !== user.id);
      setAvailableUsers(filteredUsers);
    }
  }, [user, getAllUsers]);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCreateChannel = async () => {
    if (channelName.trim()) {
      setIsCreating(true);
      try {
        const selectedParticipantIds = Object.entries(selectedParticipants)
          .filter(([_, isSelected]) => isSelected)
          .map(([id]) => id);
        
        if (selectedParticipantIds.length === 0 && type !== 'group') {
          toast.error('Please select at least one participant for direct messages');
          setIsCreating(false);
          return;
        }
        
        await createChannel(channelName, selectedParticipantIds, isPrivate);
        toast.success(`${type === 'group' ? 'Channel' : 'Direct message'} created successfully`);
        setOpen(false);
      } catch (error) {
        console.error('Error creating channel:', error);
        toast.error(`Failed to create ${type === 'group' ? 'channel' : 'direct message'}`);
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-discord-darker text-white border-discord-primary/20">
        <DialogHeader>
          <DialogTitle>{type === 'group' ? 'Create Channel' : 'Create Direct Message'}</DialogTitle>
          <DialogDescription className="text-discord-light">
            {type === 'group'
              ? 'Create a new channel for your community.'
              : 'Start a direct message with someone.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {type === 'group' ? 'Channel Name' : 'Conversation Name'}
            </Label>
            <Input
              id="name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="col-span-3 bg-discord-darkest border-none text-white"
            />
          </div>
          {type === 'group' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="private-channel"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="private-channel">Private Channel</Label>
            </div>
          )}
          <div>
            <Label>Participants</Label>
            <div className="max-h-40 overflow-y-auto p-2">
              {availableUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedParticipants[user.id] || false}
                    onCheckedChange={() => toggleParticipant(user.id)}
                  />
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Label htmlFor={`user-${user.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {user.username}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateChannel} disabled={isCreating} className="bg-discord-primary hover:bg-discord-primary/80 text-white">
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelCreationDialog;
