
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ChannelCreationDialog from './ChannelCreationDialog';
import DirectMessageDialog from './DirectMessageDialog';

// Update the component to accept a new prop
const SidebarHeader = ({ isMobileSidebar = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isDMDialogOpen, setIsDMDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="p-4 border-b border-discord-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">💬 Text Nest 🐣</h1>
        
        {isMobileSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="text-discord-light hover:text-white hover:bg-discord-primary/20"
          >
            Profile
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/chat')}
          className="text-discord-light hover:text-white hover:bg-discord-primary/20"
        >
          Chat
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout}
          className="text-discord-light hover:text-white hover:bg-discord-primary/20"
        >
          Logout
        </Button>
      </div>

      <ChannelCreationDialog open={isChannelDialogOpen} setOpen={setIsChannelDialogOpen} type="group" />
      <DirectMessageDialog isOpen={isDMDialogOpen} setIsOpen={setIsDMDialogOpen} currentUser={user} />
    </div>
  );
};

export default SidebarHeader;
