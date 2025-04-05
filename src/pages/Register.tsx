
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-discord-dark">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">TextNest</h1>
          <p className="mt-2 text-discord-light">Create a new account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
