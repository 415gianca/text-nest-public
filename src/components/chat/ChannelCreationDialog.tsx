
import { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

interface ChannelCreationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChannelCreationDialog = ({ isOpen, setIsOpen }: ChannelCreationDialogProps) => {
  const { createChannel, user } = useChat();
  const [newChannelName, setNewChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateChannel = () => {
    if (!newChannelName.trim() || !user) return;
    createChannel(newChannelName, [user.id], isPrivate);
    setNewChannelName('');
    setIsPrivate(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-discord-light hover:text-white" title="Create Channel">
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
  );
};

export default ChannelCreationDialog;
