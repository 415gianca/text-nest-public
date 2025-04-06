
import { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import SidebarHeader from './SidebarHeader';
import ChannelList from './ChannelList';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Sidebar = () => {
  const { user } = useAuth();
  const { channels, currentChannel, setCurrentChannel } = useChat();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  if (!user) return null;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <SidebarHeader isMobileSidebar={isMobile} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-4">
          <ChannelList type="direct" currentUser={user} />
        </div>
        <div className="px-2 py-4">
          <ChannelList type="group" currentUser={user} />
        </div>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-10 bg-discord-primary text-white hover:bg-discord-primary/80"
          asChild
        >
          <SheetTrigger>
            <Menu size={20} />
          </SheetTrigger>
        </Button>
        
        <Sheet>
          <SheetContent side="left" className="p-0 bg-discord-dark w-64 border-r border-discord-primary/20">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }
  
  return (
    <div className={`relative flex transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-12' : 'w-64'
    } bg-discord-dark border-r border-discord-primary/20`}>
      
      <div className={`flex flex-col w-full ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed && sidebarContent}
        
        {isCollapsed && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <Button 
              variant="ghost"

              size="icon"
              className="text-discord-light hover:bg-discord-primary/20 hover:text-white"
              onClick={() => setCurrentChannel('admin')}
            >
              A
            </Button>
            
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                size="icon"
                className={`w-8 h-8 rounded-full ${
                  currentChannel?.id === channel.id 
                    ? 'bg-discord-primary text-white' 
                    : 'text-discord-light hover:bg-discord-primary/20 hover:text-white'
                }`}
                onClick={() => setCurrentChannel(channel.id)}
              >
                {channel.name.substring(0, 1).toUpperCase()}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 rounded-full bg-discord-dark border border-discord-primary/20 text-discord-light hover:text-white z-10"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>
    </div>
  );
};

export default Sidebar;
