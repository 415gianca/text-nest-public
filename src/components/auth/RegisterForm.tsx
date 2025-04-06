
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminInvite, setIsAdminInvite] = useState(false);
  const [adminInviteToken, setAdminInviteToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check for admin invite token in URL
  useEffect(() => {
    const token = searchParams.get('admin_invite');
    if (token) {
      verifyAdminInvite(token);
    }
  }, [searchParams]);
  
  // Verify admin invite token
  const verifyAdminInvite = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_admin_invite', {
        invite_token: token
      });
      
      if (error) {
        console.error("Admin invite verification error:", error);
        toast.error("Invalid or expired admin invitation");
        return;
      }
      
      if (data && data.length > 0 && data[0].is_valid) {
        setIsAdminInvite(true);
        setAdminInviteToken(token);
        setAdminEmail(data[0].email);
        setEmail(data[0].email);
        toast.success("Admin invitation verified!");
      } else {
        toast.error("Invalid or expired admin invitation");
      }
    } catch (err) {
      console.error("Failed to verify admin invite:", err);
      toast.error("Failed to verify admin invitation");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // If this is an admin invite but emails don't match
    if (isAdminInvite && adminEmail && email !== adminEmail) {
      setError(`You must use the email address "${adminEmail}" for this admin invitation`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Starting registration process for:", email);
      
      // Use Supabase directly for better error visibility
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0],
            isAdmin: isAdminInvite // Set admin status based on invitation
          }
        }
      });
      
      console.log("Supabase registration response:", data);
      
      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        setError(signUpError.message || 'Failed to create account');
        toast.error(signUpError.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }
      
      // Handle database error - check if the user was created but profile insertion failed
      if (!data?.user) {
        console.error("User creation failed - no user object returned");
        setError('Failed to create account');
        toast.error('Failed to create account');
        setIsLoading(false);
        return;
      }
      
      // If we have a confirmation URL, that means email confirmation is enabled
      if (data.user.confirmation_sent_at) {
        toast.success("Registration successful! Please check your email to confirm your account.");
        navigate('/login');
      } else {
        toast.success("Account created successfully!");
        navigate('/chat');
      }
    } catch (err: any) {
      console.error("Unexpected error during registration:", err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] bg-discord-darker border-discord-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {isAdminInvite ? 'Create Admin Account' : 'Create an account'}
        </CardTitle>
        <CardDescription className="text-center text-discord-light">
          {isAdminInvite 
            ? 'Complete your admin registration' 
            : 'Enter your email and password to register'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-discord-darkest border-none text-white"
              disabled={isAdminInvite && adminEmail !== null}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-discord-darkest border-none text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-discord-darkest border-none text-white"
              required
            />
          </div>
          
          {isAdminInvite && (
            <div className="text-discord-primary text-sm p-2 bg-discord-primary/10 rounded-md">
              You are registering as an admin user. You'll have access to admin features.
            </div>
          )}
          
          {error && (
            <div className="text-discord-danger text-sm p-2 bg-discord-danger/10 rounded-md">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-discord-primary hover:bg-discord-primary/80 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              isAdminInvite ? 'Create Admin Account' : 'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-discord-light">
          Already have an account? <a onClick={() => navigate('/login')} className="underline text-discord-primary cursor-pointer">Sign in</a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
