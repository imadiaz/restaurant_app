import { User, Lock } from 'lucide-react';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import { useState, useTransition } from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { useLogin } from '../../hooks/auth/use.login';
import AnatomyTextFieldPassword from '../../components/anatomy/AnatomyTextFieldPassword';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';


const LoginPage: React.FC = () => {
  const { login, isLoading } = useLogin(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(username);
    console.log(password);

    login({ username, password });
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-between items-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full flex justify-center pt-10">
          <div className="h-12 w-12 rounded-full border-2  flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className=" w-8 h-8">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <AnatomyText.H1>
              {t('login.login')}
            </AnatomyText.H1>

            <LanguageSwitcher />
            
            <AnatomyText.Subtitle className="max-w-xs mx-auto">
              {t('login.login_description')}
            </AnatomyText.Subtitle>
          </div>

          <form className="w-full space-y-5 mt-6" onSubmit={handleLogin}>
            
            <AnatomyTextField 
              label={t('forms.username')} 
              placeholder={t('forms.username_placeholder')} 
              icon={<User />}
              required 
              onChange={(e) => setUsername(e.target.value.trim())}
            />

            <AnatomyTextFieldPassword 
              label={t('forms.password')}
              type="password"
              placeholder={t('forms.password_placeholder')} 
              icon={<Lock />}
              required
              onChange={(e) => setPassword(e.target.value.trim())}
            />

            <div className="w-full flex justify-start">
              <AnatomyText.Link>
                {t('forms.forgot_password')} 
              </AnatomyText.Link>
            </div>

            <AnatomyButton 
              type="submit" 
              variant="primary" 
              className="mt-4"
              isLoading={isLoading}
              fullWidth={true}
            >
              {t('login.login')} 
            </AnatomyButton>

          </form>
        </div>

        {/* Footer */}
        <div className="pb-4 pt-8">
          <AnatomyText.Link  className="text-gray-500 font-normal hover:text-gray-700 hover:no-underline">
            {t('common.need_help')} 
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