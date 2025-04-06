
import { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import SidebarHeader from './SidebarHeader';
import ChannelList from './ChannelList';
import ChannelCreationDialog from './ChannelCreationDialog';
import DirectMessageDialog from './DirectMessageDialog';

const Sidebar = () => {
  const { currentChannel, setCurrentChannel } = useChat();
  const { user, isAdmin } = useAuth();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isDMDialogOpen, setIsDMDialogOpen] = useState(false);

  return (
    <div className="w-60 bg-discord-darker flex flex-col h-screen">
      <SidebarHeader />
      
      <div className="p-4 text-xl font-bold border-b border-discord-darkest flex items-center justify-between">
        <span>TextNest</span>
        <div className="flex space-x-1">
          <ChannelCreationDialog 
            isOpen={isChannelDialogOpen} 
            setIsOpen={setIsChannelDialogOpen} 
          />
          <DirectMessageDialog 
            isOpen={isDMDialogOpen} 
            setIsOpen={setIsDMDialogOpen}
            currentUser={user}
          />
        </div>
      </div>

      {/* Channels list with categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Direct Messages category */}
        <div className="text-discord-light uppercase text-xs font-semibold p-2 flex justify-between items-center">
          <span>Direct Messages</span>
        </div>
        <ChannelList type="direct" currentUser={user} />
          
        {/* Text Channels category */}
        <div className="text-discord-light uppercase text-xs font-semibold p-2 mt-4">
          Text Channels
        </div>
        <ChannelList type="group" currentUser={user} />
      </div>

      {/* Admin panel link */}
      {isAdmin && (
        <div className="p-3 border-t border-discord-darkest">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-discord-danger hover:text-discord-danger hover:bg-discord-darkest"
            onClick={() => setCurrentChannel('admin')}
          >
            Admin Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
