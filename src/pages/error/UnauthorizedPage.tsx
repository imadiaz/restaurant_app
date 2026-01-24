import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomyText from '../../components/anatomy/AnatomyText';
import { type UserRole, ROLE_CONFIG } from '../../config/roles';
import { useAuthStore } from '../../store/auth.store';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
const { user, logout } = useAuthStore(); // Get Logout function
  

const handleGoHome = () => {
    // Dynamically send them to their safe "Home" based on their role
    if (user) {
      const userRole = user.role as UserRole;
      const targetRoute = ROLE_CONFIG[userRole]?.defaultRoute || '/';
      navigate(targetRoute, { replace: true });
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout(); // Clear the bad session
    navigate('/login'); // Now GuestGuard will let them stay on /login
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
        <ShieldAlert className="w-12 h-12 text-red-600" />
      </div>
      
      <AnatomyText.H1 className="mb-2">Access Denied</AnatomyText.H1>
      <AnatomyText.Body className="text-gray-500 max-w-md mb-8">
        You do not have permission to view this page. If you believe this is an error, please contact your administrator.
      </AnatomyText.Body>

      <div className="flex gap-4">
        {/* ADD THIS BUTTON */}
        <AnatomyButton onClick={handleLogout} variant="secondary">
          Log Out
        </AnatomyButton>
        
        <AnatomyButton onClick={handleGoHome}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </AnatomyButton>
      </div>
    </div>
  );
};

export default UnauthorizedPage;