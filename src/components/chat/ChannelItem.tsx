
import React from 'react';
import { Button } from "@/components/ui/button";
import { useChat } from '@/providers/ChatProvider';
import { useState } from 'react';
import { Settings } from 'lucide-react';
import ChannelSettings from './ChannelSettings';

interface ChannelItemProps {
  channelId: string;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channelId }) => {
  const { currentChannel, setCurrentChannel, channels } = useChat();
  const channel = channels.find(c => c.id === channelId);
  const isActive = currentChannel?.id === channelId;
  const [showSettings, setShowSettings] = useState(false);

  if (!channel) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        className={`w-full rounded-none justify-start pl-4 pr-2 hover:bg-discord-primary/10 ${
          isActive ? 'bg-discord-primary/20' : ''
        }`}
        onClick={() => setCurrentChannel(channel.id)}
      >
        <div className="flex items-center justify-between w-full px-2 group">
          <span className={`truncate ${isActive ? 'text-white' : 'text-discord-light'}`}>
            {channel.name}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(true);
            }}
            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-discord-light hover:text-white hover:bg-discord-primary/20"
          >
            <Settings size={14} />
          </Button>
        </div>
      </Button>
      {showSettings && (
        <ChannelSettings 
          channelId={channel.id}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default ChannelItem;
