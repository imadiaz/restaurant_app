import { User, Lock } from 'lucide-react';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import { useState } from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error("Login flow failed", err);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between items-center bg-white p-8 lg:p-16 overflow-y-auto">
        
        {/* Logo */}
        <div className="w-full flex justify-center pt-10">
          <div className="h-12 w-12 rounded-full border-2  flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className=" w-8 h-8">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

        {/* Text Area */}
        <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            {/* Using AnatomyText */}
            <AnatomyText.H1>
              Login form
            </AnatomyText.H1>
            
            <AnatomyText.Subtitle className="max-w-xs mx-auto">
              Lorem Ipsum has been the industry's standard dummy text ever since.
            </AnatomyText.Subtitle>
          </div>

          <form className="w-full space-y-5 mt-6" onSubmit={handleLogin}>
            
            <AnatomyTextField 
              label="Username" 
              placeholder="Enter username" 
              icon={User}
              required 
              onChange={(e) => setEmail(e.target.value)}
            />

            <AnatomyTextField 
              label="Password" 
              type="password"
              placeholder="Enter password" 
              icon={Lock}
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="w-full flex justify-start">
              <AnatomyText.Link href="#">
                Forgot password?
              </AnatomyText.Link>
            </div>

            <AnatomyButton 
              type="submit" 
              variant="primary" 
              className="mt-4"
              isLoading={isLoading}
            >
              Login
            </AnatomyButton>

          </form>
        </div>

        {/* Footer */}
        <div className="pb-4 pt-8">
          <AnatomyText.Link href="#" className="text-gray-500 font-normal hover:text-gray-700 hover:no-underline">
            {/* Overriding the default Link color slightly for the footer style */}
            Need help? Contact support
          </AnatomyText.Link>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
          alt="Grilled Chicken Meal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5"></div>
      </div>
    </div>
  );
};

export default LoginPage;