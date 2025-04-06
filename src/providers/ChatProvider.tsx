
import React, { createContext, useContext } from 'react';
import { useAuth, User } from './AuthProvider';
import useSupabaseChat from '@/hooks/useSupabaseChat';
import useChannelActions from '@/hooks/useChannelActions';
import useChannelManagement from '@/hooks/useChannelManagement';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  edited: boolean;
  reactions: {
    [key: string]: string[]; // emoji: userId[]
  };
  senderAvatar?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[]; // user ids
  messages: Message[];
  isPrivate: boolean;
  creatorId: string;
  nicknames: Record<string, string>; // userId -> nickname
}

interface ChatContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  user: User | null;
  setCurrentChannel: (channelId: string) => void;
  sendMessage: (content: string) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  createChannel: (name: string, participants: string[], isPrivate: boolean) => Promise<Channel | undefined>;
  setNickname: (channelId: string, userId: string, nickname: string) => void;
  createDirectMessage: (recipientId: string) => Promise<Channel | undefined>;
  getAllUsers: () => User[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getAllUsers: getAuthUsers } = useAuth();
  
  // Define getAllUsers function first before using it
  const getAllUsers = () => {
    return getAuthUsers();
  };
  
  const {
    channels,
    setChannels,
    currentChannelId,
    setCurrentChannelId,
  } = useSupabaseChat(user);
  
  const {
    currentChannel,
    setCurrentChannel,
    sendMessage,
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction
  } = useChannelActions(user, channels, setChannels, currentChannelId, setCurrentChannelId);
  
  const {
    createChannel,
    setNickname,
    createDirectMessage
  } = useChannelManagement(user, channels, setChannels, setCurrentChannelId, getAllUsers);

  const value = {
    channels,
    currentChannel,
    user,
    setCurrentChannel,
    sendMessage,
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction,
    createChannel,
    setNickname,
    createDirectMessage,
    getAllUsers
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
