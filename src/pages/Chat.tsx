
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { ChatProvider, useChat } from '@/providers/ChatProvider';
import Sidebar from '@/components/chat/Sidebar';
import MessageList from '@/components/chat/MessageList';
import UserSettings from '@/components/chat/UserSettings';
import AdminPanel from '@/components/admin/AdminPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import Footer from '@/components/common/Footer';

const ChatContainer = () => {
  const { currentChannel } = useChat();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          {currentChannel && currentChannel.id === 'admin' ? (
            <AdminPanel />
          ) : (
            <>
              <MessageList />
              {!isMobile && <UserSettings />}
            </>
          )}
        </div>
      </div>
      <Footer />
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
