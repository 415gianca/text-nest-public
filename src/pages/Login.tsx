
import LoginForm from '@/components/auth/LoginForm';
import Footer from '@/components/common/Footer';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-discord-dark overflow-y-auto">
      <div className="flex items-center justify-center py-8 flex-grow">
        <div className="w-full max-w-md p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">💬 Text Nest 🐣</h1>
            <p className="mt-2 text-discord-light">Sign in to start chatting</p>
          </div>
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
