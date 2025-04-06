
import { useChat, Channel } from '@/providers/ChatProvider';
import ChannelItem from './ChannelItem';
import { User } from '@/providers/AuthProvider';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ChannelCreationDialog from './ChannelCreationDialog';
import DirectMessageDialog from './DirectMessageDialog';

interface ChannelListProps {
  type: 'direct' | 'group';
  currentUser: User | null;
}

const ChannelList = ({ type, currentUser }: ChannelListProps) => {
  const { channels, currentChannel, setCurrentChannel, getAllUsers } = useChat();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isDMDialogOpen, setIsDMDialogOpen] = useState(false);
  const allUsers = getAllUsers();
  
  const filteredChannels = channels.filter(channel => 
    channel.type === type && 
    (type === 'direct' ? channel.participants.includes(currentUser?.id || '') : true)
  );

  return (
    <>
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-xs font-semibold uppercase text-discord-light">
          {type === 'direct' ? 'Direct Messages' : 'Channels'}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => type === 'direct' ? setIsDMDialogOpen(true) : setIsChannelDialogOpen(true)}
          className="h-5 w-5 rounded-sm hover:bg-discord-primary/20"
          title={`Create new ${type === 'direct' ? 'direct message' : 'channel'}`}
        >
          <Plus size={14} />
        </Button>
      </div>
      
      {filteredChannels.map((channel) => {
        // For DMs, show the other user's name
        let displayName = channel.name;
        
        if (type === 'direct') {
          const otherUserId = channel.participants.find(id => id !== currentUser?.id);
          const otherUser = otherUserId && allUsers.find(u => u.id === otherUserId);
          if (otherUser) {
            displayName = otherUser.username;
          }
        }
        
        return (
          <ChannelItem 
            key={channel.id} 
            channelId={channel.id}
          />
        );
      })}
      
      <ChannelCreationDialog open={isChannelDialogOpen} setOpen={setIsChannelDialogOpen} type={type} />
      {type === 'direct' && (
        <DirectMessageDialog isOpen={isDMDialogOpen} setIsOpen={setIsDMDialogOpen} currentUser={currentUser} />
      )}
    </>
  );
};

export default ChannelList;
