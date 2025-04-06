
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    
    setIsLoading(true);
    const success = await register(email, password);
    setIsLoading(false);
    
    if (success) {
      navigate('/chat');
    }
  };

  return (
    <Card className="w-[350px] bg-discord-darker border-discord-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center text-discord-light">
          Enter your email and password to register
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
              'Create Account'
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
