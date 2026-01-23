import React from 'react';

import AnatomyText from '../../components/anatomy/AnatomyText';

const HomePage: React.FC = () => {


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