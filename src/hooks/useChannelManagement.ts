
import { toast } from "sonner";
import { generate as generateId } from 'shortid';
import { Channel } from '@/providers/ChatProvider';
import { User } from '@/providers/AuthProvider';

export const useChannelManagement = (
  user: User | null,
  channels: Channel[],
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>,
  setCurrentChannelId: (id: string) => void,
  getAllUsers: () => User[]
) => {
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

    const allUsers = getAllUsers();
    const recipient = allUsers.find(u => u.id === recipientId);
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

  return {
    createChannel,
    setNickname,
    createDirectMessage
  };
};

export default useChannelManagement;
