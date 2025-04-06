
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';

const SidebarHeader = () => {
  const { user, logout } = useAuth();
  
  return (
    <>
      <div className="p-4 text-xl font-bold border-b border-discord-darkest flex items-center justify-between">
        <span>TextNest</span>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-discord-darkest">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <img 
              src={user?.avatar} 
              alt={user?.username} 
              className="w-8 h-8 rounded-full"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-darker ${
              user?.status === 'online' ? 'bg-discord-success' : 'bg-yellow-500'
            }`}></span>
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">{user?.username}</div>
            <div className="text-xs text-discord-light">
              {user?.isAdmin ? 'Administrator' : 'User'}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="h-8 px-2 text-discord-light hover:text-white hover:bg-discord-darkest"
          >
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default SidebarHeader;
