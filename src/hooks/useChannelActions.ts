
import { useState } from 'react';
import { toast } from "sonner";
import { generate as generateId } from 'shortid';
import { Channel, Message } from '@/providers/ChatProvider';
import { User } from '@/providers/AuthProvider';

export const useChannelActions = (
  user: User | null,
  channels: Channel[],
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>,
  currentChannelId: string,
  setCurrentChannelId: (id: string) => void
) => {
  const currentChannel = channels.find(channel => channel.id === currentChannelId) || null;

  const setCurrentChannel = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setCurrentChannelId(channelId);
    }
  };

  const sendMessage = (content: string) => {
    if (!user || !currentChannel) return;

    const newMessage: Message = {
      id: generateId(),
      content,
      senderId: user.id,
      senderName: user.username,
      timestamp: Date.now(),
      edited: false,
      reactions: {}
    };

    setChannels(prevChannels => 
      prevChannels.map(channel => 
        channel.id === currentChannelId
          ? { ...channel, messages: [...channel.messages, newMessage] }
          : channel
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    if (!user || !currentChannel) return;

    const message = currentChannel.messages.find(m => m.id === messageId);
    if (!message || (message.senderId !== user.id && !user.isAdmin)) {
      toast.error("You don't have permission to delete this message");
      return;
    }

    setChannels(prevChannels => 
      prevChannels.map(channel => 
        channel.id === currentChannelId
          ? { 
              ...channel, 
              messages: channel.messages.filter(m => m.id !== messageId) 
            }
          : channel
      )
    );

    toast.success("Message deleted");
  };

  const editMessage = (messageId: string, newContent: string) => {
    if (!user || !currentChannel) return;

    const message = currentChannel.messages.find(m => m.id === messageId);
    if (!message || message.senderId !== user.id) {
      toast.error("You can only edit your own messages");
      return;
    }

    setChannels(prevChannels => 
      prevChannels.map(channel => 
        channel.id === currentChannelId
          ? { 
              ...channel, 
              messages: channel.messages.map(m => 
                m.id === messageId
                  ? { ...m, content: newContent, edited: true }
                  : m
              ) 
            }
          : channel
      )
    );

    toast.success("Message edited");
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!user || !currentChannel) return;

    setChannels(prevChannels => 
      prevChannels.map(channel => 
        channel.id === currentChannelId
          ? { 
              ...channel, 
              messages: channel.messages.map(m => 
                m.id === messageId
                  ? { 
                      ...m, 
                      reactions: {
                        ...m.reactions,
                        [emoji]: [...(m.reactions[emoji] || []), user.id]
                      }
                    }
                  : m
              ) 
            }
          : channel
      )
    );
  };

  const removeReaction = (messageId: string, emoji: string) => {
    if (!user || !currentChannel) return;

    setChannels(prevChannels => 
      prevChannels.map(channel => 
        channel.id === currentChannelId
          ? { 
              ...channel, 
              messages: channel.messages.map(m => 
                m.id === messageId
                  ? { 
                      ...m, 
                      reactions: {
                        ...m.reactions,
                        [emoji]: (m.reactions[emoji] || []).filter(id => id !== user.id)
                      }
                    }
                  : m
              ) 
            }
          : channel
      )
    );
  };

  return {
    currentChannel,
    setCurrentChannel,
    sendMessage,
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction
  };
};

export default useChannelActions;
