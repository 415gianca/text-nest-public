
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useChat } from '@/providers/ChatProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, User, Settings } from 'lucide-react';

const UserSettings = () => {
  const { user } = useAuth();
  const { channels, currentChannel, setNickname } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNicknameValue] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  if (!currentChannel) return null;

  const participantIds = currentChannel.participants;
  
  const handleSetNickname = () => {
    if (nickname && selectedUser) {
      setNickname(currentChannel.id, selectedUser, nickname);
      setIsOpen(false);
      setNicknameValue('');
      setSelectedUser('');
    }
  };
  
  return (
    <div className="w-60 bg-discord-darker flex flex-col h-screen border-l border-discord-darkest">
      <div className="channel-bar">
        <span className="text-lg font-medium">Channel Details</span>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-semibold text-discord-light uppercase mb-2">
          About
        </h3>
        <div className="bg-discord-darkest p-3 rounded-md mb-4">
          <div className="text-sm text-white mb-1">#{currentChannel.name}</div>
          <div className="text-xs text-discord-light">
            {currentChannel.type === 'direct' ? 'Direct Message' : 'Group Channel'} · 
            {currentChannel.isPrivate ? ' Private' : ' Public'}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-discord-light uppercase mb-2">
          Members · {participantIds.length}
        </h3>
        <div className="space-y-2">
          {participantIds.map((userId) => {
            // Get nickname if exists
            const nickname = currentChannel.nicknames[userId];
            // For demo, we'll fake some user data
            const isAdmin = userId === "1";
            const username = userId === "1" 
              ? "admin" 
              : userId === "2" 
              ? "user1" 
              : userId === "3" 
              ? "user2" 
              : `user${userId}`;
              
            return (
              <div 
                key={userId} 
                className="flex items-center p-2 rounded-md hover:bg-discord-darkest"
              >
                <div className="relative mr-2">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                    alt={username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-darker ${
                    userId === "3" ? 'bg-yellow-500' : 'bg-discord-success'
                  }`}></span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-white font-medium">{nickname || username}</span>
                    {isAdmin && (
                      <Shield className="h-3 w-3 ml-1 text-discord-primary" />
                    )}
                  </div>
                  {nickname && (
                    <div className="text-xs text-discord-light">
                      {username}
                    </div>
                  )}
                </div>
                {user && userId !== user.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(userId);
                      setNicknameValue(nickname || '');
                      setIsOpen(true);
                    }}
                    className="h-7 w-7 text-discord-light hover:text-white rounded-full"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-discord-darker border-discord-darkest text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Set Nickname</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-sm text-discord-light">
              Set a nickname for this user in this channel.
            </div>
            <Input
              value={nickname}
              onChange={(e) => setNicknameValue(e.target.value)}
              placeholder="Nickname"
              className="bg-discord-darkest border-none"
            />
            <Button 
              onClick={handleSetNickname} 
              className="w-full bg-discord-primary hover:bg-discord-primary/90"
            >
              Save Nickname
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;
