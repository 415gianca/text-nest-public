
import { useChat, Channel } from '@/providers/ChatProvider';
import ChannelItem from './ChannelItem';
import { User } from '@/providers/AuthProvider';

interface ChannelListProps {
  type: 'direct' | 'group';
  currentUser: User | null;
}

const ChannelList = ({ type, currentUser }: ChannelListProps) => {
  const { channels, currentChannel, setCurrentChannel, getAllUsers } = useChat();
  const allUsers = getAllUsers();
  
  const filteredChannels = channels.filter(channel => 
    channel.type === type && 
    (type === 'direct' ? channel.participants.includes(currentUser?.id || '') : true)
  );

  return (
    <>
      {filteredChannels.map((channel) => {
        // For DMs, show the other user's name
        let displayName = channel.name;
        
        if (type === 'direct') {
          const otherUserId = channel.participants.find(id => id !== currentUser?.id);
          const otherUser = otherUserId && allUsers.find(u => u.id === otherUserId);
          if (otherUser) {
            displayName = otherUser.username;
          }
        }
        
        return (
          <ChannelItem 
            key={channel.id} 
            channelId={channel.id}
          />
        );
      })}
    </>
  );
};

export default ChannelList;
