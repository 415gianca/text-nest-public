
import { useChat } from '@/providers/ChatProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { User } from '@/providers/AuthProvider';

interface DirectMessageDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: User | null;
}

const DirectMessageDialog = ({ isOpen, setIsOpen, currentUser }: DirectMessageDialogProps) => {
  const { createDirectMessage, getAllUsers } = useChat();
  const allUsers = getAllUsers();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-discord-light hover:text-white" title="New Direct Message">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-discord-darker border-discord-darkest text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="text-sm text-discord-light mb-2">
            Select a user to message:
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {allUsers
              .filter(u => u.id !== currentUser?.id)
              .map(u => (
                <div 
                  key={u.id} 
                  className="flex items-center p-2 rounded hover:bg-discord-darkest cursor-pointer"
                  onClick={() => {
                    createDirectMessage(u.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="relative mr-2">
                    <img 
                      src={u.avatar} 
                      alt={u.username} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-darker ${
                      u.status === 'online' ? 'bg-discord-success' : 'bg-yellow-500'
                    }`}></span>
                  </div>
                  <span className="text-white">{u.username}</span>
                </div>
              ))
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectMessageDialog;
