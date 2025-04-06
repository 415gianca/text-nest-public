
import React, { useState } from 'react';
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
import { toast } from "sonner";

interface ChannelSettingsProps {
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChannelSettings: React.FC<ChannelSettingsProps> = ({ channelId, isOpen, onClose }) => {
  const { channels, user, setNickname } = useChat();
  const { user: currentUser } = useAuth();
  const channel = channels.find(c => c.id === channelId);
  const [nicknames, setNicknames] = useState<Record<string, string>>(
    channel?.nicknames || {}
  );
  const [isUpdating, setIsUpdating] = useState(false);

  if (!channel || !currentUser) {
    return null;
  }

  const isCreator = channel.creatorId === currentUser.id;
  const canManageChannel = isCreator || currentUser.isAdmin;

  const handleNicknameChange = (userId: string, value: string) => {
    setNicknames(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // Update nicknames
      const promises = Object.entries(nicknames).map(async ([userId, nickname]) => {
        if (nickname !== (channel.nicknames[userId] || '')) {
          await setNickname(channelId, userId, nickname);
        }
      });
      
      await Promise.all(promises);
      toast.success("Channel settings updated");
      onClose();
    } catch (error) {
      console.error("Error updating channel settings:", error);
      toast.error("Failed to update channel settings");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-discord-darker text-white border-discord-primary/20">
        <DialogHeader>
          <DialogTitle>Channel Settings: {channel.name}</DialogTitle>
          <DialogDescription className="text-discord-light">
            Customize this channel's settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {canManageChannel && (
            <div>
              <h3 className="text-sm font-medium mb-2">Nicknames</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {channel.participants.map(userId => {
                  const userNickname = nicknames[userId] || '';
                  return (
                    <div key={userId} className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor={`nickname-${userId}`} className="text-xs">
                        User ID:
                      </Label>
                      <Input
                        id={`nickname-${userId}`}
                        value={userNickname}
                        onChange={(e) => handleNicknameChange(userId, e.target.value)}
                        placeholder="Set nickname"
                        className="col-span-3 bg-discord-darkest border-none text-white text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-discord-primary hover:bg-discord-primary/80 text-white"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelSettings;
