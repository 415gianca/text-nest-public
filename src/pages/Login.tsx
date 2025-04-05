
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-discord-dark">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">TextNest</h1>
          <p className="mt-2 text-discord-light">Sign in to start chatting</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
