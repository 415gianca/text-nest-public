import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

// Update the component to accept a new prop
const SidebarHeader = ({ isMobileSidebar = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 border-b border-discord-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">TextNest</h1>
        
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
          onClick={() => logout()}
          className="text-discord-light hover:text-white hover:bg-discord-primary/20"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
