
import { useState, useRef, useEffect } from 'react';
import { useChat, Message } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, ThumbsUp, Smile, Trash2, Edit2, Save, X 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const REACTIONS = [
  { emoji: '❤️', icon: Heart },
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '😂', icon: Smile },
  { emoji: '🎉', icon: () => <span className="text-lg">🎉</span> },
  { emoji: '😍', icon: () => <span className="text-lg">😍</span> },
];

const MessageList = () => {
  const { currentChannel } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [currentChannel?.messages]);

  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-discord-dark">
        <div className="text-discord-light">Select a channel to start chatting</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-discord-dark h-full overflow-hidden">
      <div className="channel-bar flex items-center">
        <span className="text-lg font-medium">#{currentChannel.name}</span>
        {currentChannel.isPrivate && (
          <span className="ml-2 text-xs bg-discord-primary/20 text-discord-primary px-2 py-0.5 rounded">
            Private
          </span>
        )}
      </div>
      
      <ScrollArea className="flex-1 px-4 overflow-y-auto max-h-[calc(100vh-150px)]">
        <div className="py-4 space-y-2">
          {currentChannel.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-discord-light">
              <div className="text-5xl mb-4">👋</div>
              <div className="text-xl font-medium">Welcome to #{currentChannel.name}!</div>
              <div className="text-sm">This is the start of the channel.</div>
            </div>
          ) : (
            currentChannel.messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <MessageInput />
    </div>
  );
};

const MessageItem = ({ message }: { message: Message }) => {
  const { deleteMessage, editMessage, addReaction, removeReaction, currentChannel } = useChat();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isOwnMessage = user?.id === message.senderId;
  
  const nickname = currentChannel?.nicknames[message.senderId];
  const displayName = nickname || message.senderName;

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      editMessage(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const handleReaction = (emoji: string) => {
    if (!user) return;
    
    const hasReacted = message.reactions[emoji]?.includes(user.id);
    if (hasReacted) {
      removeReaction(message.id, emoji);
    } else {
      addReaction(message.id, emoji);
    }
  };

  return (
    <div className="message group">
      <div className="flex">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`}
          alt={displayName}
          className="w-10 h-10 rounded-full mr-3 mt-1"
        />
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="font-medium text-white">{displayName}</span>
            <span className="ml-2 text-xs text-discord-light">
              {format(new Date(message.timestamp), 'MMM d, h:mm a')}
            </span>
            {message.edited && (
              <span className="ml-2 text-xs text-discord-light italic">(edited)</span>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-1 flex items-center gap-2">
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-discord-darkest border-none text-white"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8 text-discord-light hover:text-white hover:bg-discord-primary/20"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="h-8 w-8 text-discord-light hover:text-white hover:bg-discord-danger/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-1 text-white whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
          
          {/* Reactions */}
          {!isEditing && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(message.reactions).map(([emoji, userIds]) => {
                if (userIds.length === 0) return null;
                const hasReacted = userIds.includes(user?.id || '');
                
                return (
                  <TooltipProvider key={emoji}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`flex items-center space-x-1 text-sm px-2 py-0.5 rounded ${
                            hasReacted
                              ? 'bg-discord-primary/30 text-white'
                              : 'bg-discord-darker hover:bg-discord-darkest text-discord-light'
                          }`}
                          onClick={() => handleReaction(emoji)}
                        >
                          <span>{emoji}</span>
                          <span>{userIds.length}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          {userIds.map((id) => id).join(', ')}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Message actions */}
        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-discord-light hover:text-white hover:bg-discord-primary/20 rounded-full"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-discord-darker border-discord-darkest">
                <div className="flex space-x-2">
                  {REACTIONS.map((reaction) => (
                    <Button
                      key={reaction.emoji}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReaction(reaction.emoji)}
                      className="h-8 w-8 text-discord-light hover:text-white"
                    >
                      {reaction.emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {isOwnMessage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 text-discord-light hover:text-white hover:bg-discord-primary/20 rounded-full"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMessage(message.id)}
                  className="h-8 w-8 text-discord-light hover:text-discord-danger hover:bg-discord-danger/20 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-discord-dark border-t border-discord-darker mt-auto">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <Button 
          type="submit"
          className="bg-discord-primary hover:bg-discord-primary/90"
          disabled={!message.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default MessageList;
