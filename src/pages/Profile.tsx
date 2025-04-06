
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { User } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Check if viewing own profile or another user's profile
  const isOwnProfile = currentUser?.id === profileUser?.id || (!userId && currentUser);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // If no userId provided, show current user's profile
        const targetId = userId || currentUser?.id;
        
        if (!targetId) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load user profile");
          navigate('/chat');
          return;
        }
        
        if (data) {
          const userData: User = {
            id: data.id,
            username: data.username,
            isAdmin: data.is_admin,
            status: (data.status as 'online' | 'idle' | 'offline') || 'online',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
          };
          setProfileUser(userData);
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("An error occurred while loading the profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, currentUser, isAuthenticated, navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-discord-dark p-6">
        <Card className="w-full max-w-2xl mx-auto mt-8 bg-discord-darker border-discord-primary/20">
          <CardHeader className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-discord-dark">
        <Card className="w-full max-w-md bg-discord-darker border-discord-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-white">User Not Found</CardTitle>
            <CardDescription>The requested user profile could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/chat')} className="bg-discord-primary hover:bg-discord-primary/80">
              Return to Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discord-dark p-6">
      <Card className="w-full max-w-2xl mx-auto mt-8 bg-discord-darker border-discord-primary/20 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {isEditing ? 'Edit Profile' : (isOwnProfile ? 'Your Profile' : `${profileUser.username}'s Profile`)}
          </CardTitle>
          <CardDescription className="text-discord-light">
            {isEditing ? 'Make changes to your profile information' : 'View profile information'}
          </CardDescription>
        </CardHeader>
        
        {isEditing ? (
          <ProfileEditForm 
            user={profileUser} 
            onCancel={handleEditToggle} 
            onProfileUpdated={(updatedUser) => {
              setProfileUser(updatedUser);
              setIsEditing(false);
            }}
          />
        ) : (
          <>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-discord-primary">
                  <AvatarImage src={profileUser.avatar} alt={profileUser.username} />
                  <AvatarFallback className="text-2xl bg-discord-primary text-white">
                    {profileUser.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-white">{profileUser.username}</h3>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileUser.status === 'online' ? 'bg-green-100 text-green-800' :
                      profileUser.status === 'idle' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profileUser.status.charAt(0).toUpperCase() + profileUser.status.slice(1)}
                    </span>
                    
                    {profileUser.isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-discord-primary text-white">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => navigate('/chat')} variant="outline">
                Back to Chat
              </Button>
              
              {isOwnProfile && (
                <Button 
                  onClick={handleEditToggle}
                  className="bg-discord-primary hover:bg-discord-primary/80"
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
