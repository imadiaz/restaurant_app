import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, 
  Camera,
  Shield,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Lock
} from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import { useToastStore } from '../../store/toast.store';


const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  // --- FORM STATE ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Staff');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = () => {
    // Basic Validation
    if (!firstName || !email || !password) {
      addToast("Please fill in required fields", 'error');
      return;
    }

    // Mock Save Logic
    console.log({ firstName, lastName, email, role, location, password });
    addToast(`${firstName} added to the team!`, 'success');
    navigate('/dashboard/users');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <AnatomyText.H1>Add New User</AnatomyText.H1>
            <AnatomyText.Subtitle>Onboard a new team member</AnatomyText.Subtitle>
          </div>
        </div>
        <div className="flex gap-3">
          <AnatomyButton variant="secondary" onClick={() => navigate(-1)}>Cancel</AnatomyButton>
          <AnatomyButton onClick={handleSave}>Create Account</AnatomyButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: USER DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Personal Information */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <AnatomyText.H3 className="mb-0">Personal Information</AnatomyText.H3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnatomyTextField 
                label="First Name"
                placeholder="e.g. Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <AnatomyTextField 
                label="Last Name"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              
              <div className="md:col-span-2">
                 <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <AnatomyText.Label className="mb-0">Email Address</AnatomyText.Label>
                 </div>
                 <AnatomyTextField 
                   type="email"
                   placeholder="jane.doe@restaurant.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>

              <div className="md:col-span-2">
                 <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <AnatomyText.Label className="mb-0">Phone Number</AnatomyText.Label>
                 </div>
                 <AnatomyTextField 
                   placeholder="(555) 000-0000"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                 />
              </div>
            </div>
          </div>

          {/* 2. Role & Security */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <AnatomyText.H3 className="mb-0">Role & Security</AnatomyText.H3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <AnatomySelect 
                     label="Assign Role"
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                   >
                     <option value="Staff">Staff</option>
                     <option value="Manager">Manager</option>
                     <option value="Delivery">Delivery Driver</option>
                     <option value="Admin">Administrator</option>
                   </AnatomySelect>
                   <AnatomyText.Small className="text-xs text-gray-400 mt-2 block">
                     * Admins have full access to settings and finance.
                   </AnatomyText.Small>
                </div>

                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <AnatomyText.Label className="mb-0">Temporary Password</AnatomyText.Label>
                   </div>
                   <AnatomyTextField 
                     type="password"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                </div>

                <div className="md:col-span-2">
                   <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <AnatomyText.Label className="mb-0">Location / Branch</AnatomyText.Label>
                   </div>
                   <AnatomyTextField 
                     placeholder="e.g. New York Main Branch"
                     value={location}
                     onChange={(e) => setLocation(e.target.value)}
                   />
                </div>
             </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: AVATAR --- */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <AnatomyText.H3 className="mb-6">Profile Picture</AnatomyText.H3>
             
             <div className="relative group mb-6">
               <div className="w-40 h-40 rounded-full border-4 border-gray-50 shadow-inner overflow-hidden relative">
                 {avatarPreview ? (
                   <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                     <UserIcon className="w-16 h-16" />
                   </div>
                 )}
                 
                 {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                   <Camera className="w-8 h-8 text-white" />
                 </div>
               </div>
               
               <input 
                 type="file" 
                 accept="image/*"
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                 onChange={handleImageChange}
               />
             </div>

             <AnatomyText.Body className="text-gray-500 text-sm px-4">
               Upload a professional photo. 
               <br/>Allowed formats: JPG, PNG.
             </AnatomyText.Body>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AddUserPage;