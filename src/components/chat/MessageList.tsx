import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const MessageList = () => {
  const { currentChannel, sendMessage: sendChatMessage } = useChat();
  const { user, isAdmin } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [channelParticipants, setChannelParticipants] = useState<{ [userId: string]: { nickname: string } }>({});
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChannel) {
      const participants: { [userId: string]: { nickname: string } } = {};
      currentChannel.participants.forEach(participantId => {
        const nickname = currentChannel.nicknames[participantId] || '';
        participants[participantId] = { nickname };
      });
      setChannelParticipants(participants);
    }
  }, [currentChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChannel?.messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && currentChannel) {
      sendChatMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-discord-dark overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-discord-darker border-b border-discord-primary/20">
        <div className="flex-1">
          <h2 className="text-white font-semibold truncate">
            {currentChannel?.name || 'Select a channel'}
          </h2>
        </div>
        
        {/* Only show channel info button on mobile if we're not in admin panel */}
        {isMobile && currentChannel && currentChannel.id !== 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-discord-light hover:text-white hover:bg-discord-primary/20"
            onClick={() => {
              // Logic to show channel info
              // If you have a function to show channel settings, call it here
            }}
          >
            <Info size={18} />
          </Button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentChannel ? (
          currentChannel.messages.map((message) => (
            <div key={message.id} className="mb-2">
              <div className="flex items-center mb-1">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`} />
                  <AvatarFallback>{message.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <span 
                    className="font-semibold text-white mr-2 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${message.senderId}`)}
                  >
                    {channelParticipants[message.senderId]?.nickname || message.senderName}
                  </span>
                  <span className="text-xs text-discord-light">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-discord-light ml-10">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-discord-light">
            Select a channel to start chatting
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-discord-darker border-t border-discord-primary/20">
        <div className="flex items-end">
          <div className="flex-1">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentChannel ? "Type a message..." : "Select a channel to start chatting..."}
              disabled={!currentChannel || isAdmin}
              className={`min-h-10 max-h-40 bg-discord-darkest border-none text-white resize-none ${
                isMobile ? 'text-sm p-2' : ''
              }`}
            />
          </div>
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !currentChannel || isAdmin}
            className={`ml-2 bg-discord-primary hover:bg-discord-primary/80 ${
              isMobile ? 'p-2 h-8 w-8' : ''
            }`}
          >
            <Send size={isMobile ? 16 : 20} />
            {!isMobile && <span className="ml-1">Send</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
