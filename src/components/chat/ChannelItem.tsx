
import { Channel } from '@/providers/ChatProvider';
import { Hash, Lock, Users } from 'lucide-react';

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}

const ChannelItem = ({ channel, isActive, onClick }: ChannelItemProps) => {
  return (
    <div 
      className={`flex items-center px-2 py-1 rounded cursor-pointer ${
        isActive 
          ? 'bg-discord-primary/30 text-white' 
          : 'text-discord-light hover:bg-discord-darkest hover:text-white'
      }`}
      onClick={onClick}
    >
      {channel.isPrivate ? (
        <Lock className="h-4 w-4 mr-2" />
      ) : channel.type === 'direct' ? (
        <Users className="h-4 w-4 mr-2" />
      ) : (
        <Hash className="h-4 w-4 mr-2" />
      )}
      <span className="truncate">{channel.name}</span>
    </div>
  );
};

export default ChannelItem;
