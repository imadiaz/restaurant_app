import React, { useState } from 'react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import type { User } from './UserDetailModal';
import { Mail, MoreVertical, Plus, Shield } from 'lucide-react';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import UserDetailModal from './UserDetailModal';
import PageHeader from '../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';



// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Esther',
    lastName: 'Howard',
    email: 'esther.howard@example.com',
    role: 'admin',
    status: 'active',
    phone: '(205) 555-0100',
    joinDate: 'Jan 24, 2023',
    location: 'New York, USA',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '2',
    firstName: 'Floyd',
    lastName: 'Miles',
    email: 'floyd.miles@example.com',
    role: 'manager',
    status: 'active',
    phone: '(201) 555-0124',
    joinDate: 'Feb 10, 2023',
    location: 'London, UK',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '3',
    firstName: 'Ronald',
    lastName: 'Richards',
    email: 'ronald.richards@example.com',
    role: 'delivery',
    status: 'inactive',
    phone: '(302) 555-0100',
    joinDate: 'Mar 05, 2023',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '4',
    firstName: 'Dianne',
    lastName: 'Russell',
    email: 'dianne.russell@example.com',
    role: 'staff',
    status: 'active',
    phone: '(704) 555-0127',
    joinDate: 'Apr 12, 2023',
    location: 'Toronto, CA',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
  },
];

// --- USER CARD COMPONENT ---
const UserCard = ({ user, onClick }: { user: User; onClick: () => void }) => {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    staff: 'bg-gray-100 text-gray-700',
    delivery: 'bg-orange-100 text-orange-700'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all cursor-pointer group relative"
    >
      {/* Options Dot (Visual Only for now) */}
      <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-600">
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <div className="w-20 h-20 rounded-full mb-4 border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <img 
          src={user.avatarUrl} 
          alt={user.firstName} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <AnatomyText.H3 className="text-lg mb-1">{user.firstName} {user.lastName}</AnatomyText.H3>
      <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4 ${roleColors[user.role]}`}>
        {user.role}
      </span>

      {/* Quick Details */}
      <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-center text-gray-500 text-sm gap-2">
           <Mail className="w-4 h-4" />
           <span className="truncate max-w-[150px]">{user.email}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2">
           <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
           <span className="text-xs font-medium text-gray-400 capitalize">{user.status}</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN USERS PAGE ---
const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const navigate = useNavigate();
  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Logic
  const filteredUsers = MOCK_USERS.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      
    
      <PageHeader title="Users" subtitle="Manage team members and permissions" showNavBack={false} actions={
<div className="w-full md:w-auto">
          <AnatomyButton onClick={() => navigate('/dashboard/users/add')}>
            <Plus className="w-5 h-5 mr-2" />
            Add New User
          </AnatomyButton>
        </div>
      } />

      {/* CONTROLS */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:flex-1">
          <AnatomySearchBar 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 flex items-center gap-2">
           <div className="text-gray-400"><Shield className="w-5 h-5"/></div>
           <AnatomySelect 
             value={roleFilter} 
             onChange={(e) => setRoleFilter(e.target.value)}
             className="border-none bg-gray-50"
           >
             <option value="All">All Roles</option>
             <option value="Admin">Admin</option>
             <option value="Manager">Manager</option>
             <option value="Staff">Staff</option>
             <option value="Delivery">Delivery</option>
           </AnatomySelect>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1">
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} onClick={() => handleUserClick(user)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200">
            <AnatomyText.Subtitle>No users found matching criteria.</AnatomyText.Subtitle>
          </div>
        )}
      </div>

      {/* MODAL */}
      <UserDetailModal 
        isOpen={isModalOpen} 
        user={selectedUser} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
};

export default UsersPage;