
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", username, password);
      const success = await login(username, password);
      
      if (success) {
        toast.success('Login successful!');
        navigate('/chat');
      } else {
        setErrorMessage('Invalid username or password');
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password to register');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await register(username, password);
      if (success) {
        toast.success('Account created and logged in!');
        navigate('/chat');
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] bg-discord-darker border-discord-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back!</CardTitle>
        <CardDescription className="text-center text-discord-light">
          Enter your username and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
          )}
          
          <div className="text-sm text-discord-light">
            <p>Demo accounts:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>admin / admin123</li>
              <li>user1 / password</li>
              <li>user2 / password</li>
            </ul>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-discord-primary hover:bg-discord-primary/80 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </Button>
          
          <Button 
            type="button"
            onClick={handleQuickRegister}
            className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Quick Register & Login'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-discord-light">
          Don't have an account? <a onClick={() => navigate('/register')} className="underline text-discord-primary cursor-pointer">Sign up</a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
