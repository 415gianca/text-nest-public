
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, UserX, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('username');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setUsers(data.filter(user => !user.is_admin));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center bg-discord-dark">
        <div className="text-discord-danger">You don't have permission to access this page</div>
      </div>
    );
  }

  const handleBanUser = (userId: string, username: string) => {
    setBannedUsers((prev) => [...prev, userId]);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    toast.success(`User ${username} has been banned`);
  };

  const handlePromoteToAdmin = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_admin: true } : user
        )
      );
      toast.success(`User ${username} has been promoted to admin`);
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-discord-dark">
      <div className="channel-bar flex items-center">
        <ShieldAlert className="mr-2 h-5 w-5" />
        <span className="text-lg font-medium">Admin Dashboard</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-discord-darker rounded-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-discord-darkest border-none text-white"
            />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-primary mx-auto"></div>
              <p className="mt-2 text-discord-light">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-discord-darkest">
              <table className="w-full text-left">
                <thead className="bg-discord-darkest">
                  <tr>
                    <th className="p-3 text-discord-light font-medium">Username</th>
                    <th className="p-3 text-discord-light font-medium">Status</th>
                    <th className="p-3 text-discord-light font-medium">Role</th>
                    <th className="p-3 text-discord-light font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-discord-darkest">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="bg-discord-darker hover:bg-discord-dark">
                        <td className="p-3 text-white">{user.username}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            user.status === 'online' 
                              ? 'bg-discord-success/20 text-discord-success' 
                              : user.status === 'idle'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Offline'}
                          </span>
                        </td>
                        <td className="p-3 text-discord-light">
                          {user.is_admin ? 'Admin' : 'User'}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            {!user.is_admin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePromoteToAdmin(user.id, user.username)}
                                className="h-8 px-2 text-discord-primary border-discord-primary hover:bg-discord-primary/20"
                              >
                                <ShieldAlert className="h-4 w-4 mr-1" />
                                Promote
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanUser(user.id, user.username)}
                              className="h-8 px-2 text-discord-danger border-discord-danger hover:bg-discord-danger/20"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-discord-light">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-discord-darker rounded-md p-4">
          <h2 className="text-xl font-semibold mb-4">Banned Users</h2>
          {bannedUsers.length > 0 ? (
            <div className="space-y-2">
              {bannedUsers.map((userId) => {
                const user = users.find((u) => u.id === userId);
                return (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-3 bg-discord-darkest rounded-md"
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-discord-danger" />
                      <span className="text-discord-light">{user?.username || userId}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (user) {
                          setUsers((prev) => [...prev, user]);
                          setBannedUsers((prev) => prev.filter((id) => id !== userId));
                          toast.success(`User ${user.username} has been unbanned`);
                        }
                      }}
                      className="h-8 px-2 text-discord-primary hover:bg-discord-primary/20"
                    >
                      Unban
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-discord-light py-4">
              No banned users
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
