import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth, User } from './AuthProvider';
import { generate as generateId } from 'shortid';

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
  setCurrentChannel: (channelId: string) => void;
  sendMessage: (content: string) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  createChannel: (name: string, participants: string[], isPrivate: boolean) => void;
  setNickname: (channelId: string, userId: string, nickname: string) => void;
  createDirectMessage: (recipientId: string) => void;
  getAllUsers: () => User[];
}

const DEMO_USERS: Record<string, User> = {
  "1": { 
    id: "1", 
    username: "admin", 
    isAdmin: true, 
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  "2": { 
    id: "2", 
    username: "user1", 
    isAdmin: false, 
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
  },
  "3": { 
    id: "3", 
    username: "user2", 
    isAdmin: false, 
    status: 'idle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2'
  },
};

const INITIAL_CHANNELS: Channel[] = [
  {
    id: "general",
    name: "General",
    type: "group",
    participants: ["1", "2", "3"],
    isPrivate: false,
    creatorId: "1",
    nicknames: {},
    messages: [
      {
        id: "1",
        content: "Welcome to the chat app!",
        senderId: "1",
        senderName: "admin",
        timestamp: Date.now() - 3600000,
        edited: false,
        reactions: {
          "❤️": ["2", "3"],
          "👍": ["2"]
        }
      },
      {
        id: "2",
        content: "Thanks for creating this!",
        senderId: "2",
        senderName: "user1",
        timestamp: Date.now() - 1800000,
        edited: false,
        reactions: {
          "👍": ["1"]
        }
      }
    ]
  },
  {
    id: "random",
    name: "Random",
    type: "group",
    participants: ["1", "2", "3"],
    isPrivate: false,
    creatorId: "1",
    nicknames: {},
    messages: [
      {
        id: "3",
        content: "This is a channel for random discussions",
        senderId: "1",
        senderName: "admin",
        timestamp: Date.now() - 7200000,
        edited: false,
        reactions: {}
      }
    ]
  }
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannelId, setCurrentChannelId] = useState<string>("general");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedChannels = localStorage.getItem('chatChannels');
      if (savedChannels) {
        setChannels(JSON.parse(savedChannels));
        console.log("Loaded saved channels from localStorage");
      } else {
        setChannels(INITIAL_CHANNELS);
        console.log("No saved channels found, using initial channels");
      }
    } catch (error) {
      console.error("Error loading channels from localStorage:", error);
      setChannels(INITIAL_CHANNELS);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && channels.length > 0) {
      try {
        localStorage.setItem('chatChannels', JSON.stringify(channels));
        console.log("Saved channels to localStorage");
      } catch (error) {
        console.error("Error saving channels to localStorage:", error);
        toast.error("Failed to save chat data");
      }
    }
  }, [channels, isInitialized]);

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

  const createChannel = (name: string, participantIds: string[], isPrivate: boolean) => {
    if (!user) return;

    const existingChannel = channels.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingChannel) {
      toast.error("A channel with this name already exists");
      return;
    }

    if (!participantIds.includes(user.id)) {
      participantIds.push(user.id);
    }

    const newChannel: Channel = {
      id: generateId(),
      name,
      type: participantIds.length === 2 ? 'direct' : 'group',
      participants: participantIds,
      isPrivate,
      creatorId: user.id,
      nicknames: {},
      messages: []
    };

    setChannels(prevChannels => [...prevChannels, newChannel]);
    setCurrentChannelId(newChannel.id);
    toast.success(`Channel "${name}" created`);
  };

  const setNickname = (channelId: string, userId: string, nickname: string) => {
    if (!user) return;

    setChannels(prevChannels => 
      prevChannels.map(channel => 
        channel.id === channelId
          ? { 
              ...channel, 
              nicknames: {
                ...channel.nicknames,
                [userId]: nickname
              }
            }
          : channel
      )
    );

    toast.success(`Nickname set to "${nickname}"`);
  };

  const createDirectMessage = (recipientId: string) => {
    if (!user) return;
    
    const existingChannel = channels.find(
      channel => 
        channel.type === 'direct' && 
        channel.participants.includes(user.id) && 
        channel.participants.includes(recipientId) &&
        channel.participants.length === 2
    );
    
    if (existingChannel) {
      setCurrentChannelId(existingChannel.id);
      return;
    }

    const recipient = DEMO_USERS[recipientId];
    if (!recipient) {
      toast.error("User not found");
      return;
    }

    const channelName = `${user.username}-${recipient.username}`;
    const dmChannel: Channel = {
      id: generateId(),
      name: channelName,
      type: 'direct',
      participants: [user.id, recipientId],
      isPrivate: true,
      creatorId: user.id,
      nicknames: {},
      messages: []
    };

    setChannels(prevChannels => [...prevChannels, dmChannel]);
    setCurrentChannelId(dmChannel.id);
    toast.success(`Started conversation with ${recipient.username}`);
  };

  const getAllUsers = (): User[] => {
    return Object.values(DEMO_USERS);
  };

  const value = {
    channels,
    currentChannel,
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
