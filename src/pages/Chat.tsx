
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { ChatProvider, useChat } from '@/providers/ChatProvider';
import Sidebar from '@/components/chat/Sidebar';
import MessageList from '@/components/chat/MessageList';
import UserSettings from '@/components/chat/UserSettings';
import AdminPanel from '@/components/admin/AdminPanel';

const ChatContainer = () => {
  const { currentChannel } = useChat();
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      {currentChannel && currentChannel.id === 'admin' ? (
        <AdminPanel />
      ) : (
        <>
          <MessageList />
          <UserSettings />
        </>
      )}
    </div>
  );
};

const Chat = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <ChatProvider>
      <ChatContainer />
    </ChatProvider>
  );
};

export default Chat;
