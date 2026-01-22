import React from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';


const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <AnatomyText.H1>Users</AnatomyText.H1>
        </div>
        <div className="w-48">
          <AnatomyButton>+ New User</AnatomyButton>
        </div>
      </div>
      
      {/* Placeholder Content */}
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 bg-white">
        User List Table will go here
      </div>
    </div>
  );
};

export default UsersPage;