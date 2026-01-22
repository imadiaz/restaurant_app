import React from 'react';

import { useNavigate } from 'react-router-dom';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you would clear the token here
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div className="p-10">
      <AnatomyText.H1>Welcome to the Dashboard</AnatomyText.H1>
      <AnatomyText.Subtitle className="mt-2">
        You have successfully logged in.
      </AnatomyText.Subtitle>
      
    </div>
  );
};

export default HomePage;