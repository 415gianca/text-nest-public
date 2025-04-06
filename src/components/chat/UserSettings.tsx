
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UserSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  return (
    <div className="bg-discord-darker border-t border-discord-primary/20 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="bg-discord-primary text-white">
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-white">{user.username}</p>
          <p className="text-xs text-discord-light">
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/profile')}
          className="text-white hover:bg-discord-primary/20"
          title="View Profile"
        >
          <User size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => logout()}
          className="text-white hover:bg-discord-primary/20"
          title="Logout"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </div>
  );
};

export default UserSettings;
