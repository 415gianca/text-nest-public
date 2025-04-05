
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, User, Users } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-discord-dark overflow-y-auto">
      {/* Hero section */}
      <div className="relative">
        <div className="bg-gradient-to-b from-discord-primary/20 to-discord-dark pt-16 pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                TextNest
              </h1>
              <p className="text-xl md:text-2xl text-discord-light max-w-2xl mx-auto mb-8">
                A simple messaging platform for friends, family, and communities
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/register')}
                  className="text-lg px-8 py-6 bg-discord-primary hover:bg-discord-primary/90"
                >
                  Sign Up
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="text-lg px-8 py-6 text-white border-white hover:bg-white/10"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<MessageSquare className="h-12 w-12 text-discord-primary" />}
            title="Simple Messaging"
            description="Send text messages, edit or delete them anytime, and react with emojis."
          />
          <FeatureCard 
            icon={<Users className="h-12 w-12 text-discord-primary" />}
            title="Group Chats"
            description="Create group chats with friends and family, set nicknames, and stay connected."
          />
          <FeatureCard 
            icon={<Shield className="h-12 w-12 text-discord-primary" />}
            title="Admin Controls"
            description="Administrators can manage users and ensure a safe environment for everyone."
          />
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-discord-darker py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start chatting?
          </h2>
          <p className="text-xl text-discord-light max-w-2xl mx-auto mb-8">
            Create an account now and join the conversation
          </p>
          <Button 
            onClick={() => navigate('/register')}
            className="text-lg px-8 py-6 bg-discord-primary hover:bg-discord-primary/90"
          >
            Get Started
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-discord-darkest py-8">
        <div className="container mx-auto px-4 text-center text-discord-light">
          <p>© 2023 TextNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-discord-darker p-6 rounded-lg text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-discord-light">{description}</p>
    </div>
  );
};

export default Index;
