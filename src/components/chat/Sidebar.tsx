
import { useState } from 'react';
import { useChat, Channel } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Hash, Lock, Users } from 'lucide-react';

const Sidebar = () => {
  const { channels, currentChannel, setCurrentChannel, createChannel } = useChat();
  const { user, logout, isAdmin } = useAuth();
  const [newChannelName, setNewChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    createChannel(newChannelName, [user!.id], isPrivate);
    setNewChannelName('');
    setIsPrivate(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="w-60 bg-discord-darker flex flex-col h-screen">
      <div className="p-4 text-xl font-bold border-b border-discord-darkest flex items-center justify-between">
        <span>TextNest</span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-discord-light hover:text-white">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-discord-darker border-discord-darkest text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Create Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Channel name"
                className="bg-discord-darkest border-none"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private-channel"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(!isPrivate)}
                  className="form-checkbox h-4 w-4 text-discord-primary"
                />
                <label htmlFor="private-channel" className="text-sm text-discord-light">
                  Private Channel
                </label>
              </div>
              <Button 
                onClick={handleCreateChannel} 
                className="w-full bg-discord-primary hover:bg-discord-primary/90"
              >
                Create Channel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-discord-light uppercase text-xs font-semibold p-2">
          Text Channels
        </div>
        {channels.map((channel) => (
          <ChannelItem 
            key={channel.id} 
            channel={channel} 
            isActive={currentChannel?.id === channel.id}
            onClick={() => setCurrentChannel(channel.id)}
          />
        ))}
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

export default Sidebar;
