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
  Lock,
  AtSign
} from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyTextField from '../../components/anatomy/AnatomyTextField';
import { useToastStore } from '../../store/toast.store';
import type { CreateUserDto } from '../../service/user.service';
import BasePageLayout from '../../components/layout/BaseLayout';
import AnatomyTextFieldPassword from '../../components/anatomy/AnatomyTextFieldPassword';
import AnatomyRolesSelect from '../../components/anatomy/AnatomyRolesSelect';



const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  // --- FORM STATE ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(4); // Default to 4 (Client/Staff)
  
  // Image handling
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !password || !phone) {
      addToast("Please fill in required fields (Name, Phone, Password)", 'error');
      return;
    }

    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!passwordRegex.test(password)) {
      addToast("Password must contain Uppercase, Lowercase, Number, and Symbol", 'error');
      return;
    }

    if (phone.length < 10) {
      addToast("Phone number must be at least 10 digits", 'error');
      return;
    }

    const finalImageUrl = avatarPreview || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;

    const payload: CreateUserDto = {
      firstName,
      lastName,
      username: username || undefined,
      email: email || undefined,
      phone,
      password,
      roleId: Number(roleId),
      profileImageUrl: finalImageUrl,
    };

    console.log("🚀 Sending DTO to Backend:", payload);
    

  };

  return (

    <BasePageLayout
      title="Add New User"
      subtitle="Create account credentials"
      showNavBack={true}
      headerActions={
         <div className="flex gap-3">
          <AnatomyButton variant="secondary" onClick={() => navigate(-1)}>Cancel</AnatomyButton>
          <AnatomyButton onClick={handleSave}>Create Account</AnatomyButton>
        </div>
      }
      isLoading={false}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: USER DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Personal Information */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5 text-text-muted" />
              <AnatomyText.H3 className="mb-0">Personal Information</AnatomyText.H3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnatomyTextField 
                label="First Name"
                placeholder="e.g. Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <AnatomyTextField 
                label="Last Name"
                placeholder="e.g. Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              
              <AnatomyTextField 
                label="Username (Optional)"
                placeholder="e.g. juan.perez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<AtSign className="w-4 h-4 text-text-muted" />}
              />

              <AnatomyTextField 
                label="Phone Number"
                placeholder="+52 55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4 text-text-muted" />}
                required
                maxLength={15}
              />

              <div className="md:col-span-2">
                 <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <AnatomyText.Label className="mb-0">Email Address (Optional)</AnatomyText.Label>
                 </div>
                 <AnatomyTextField 
                   type="email"
                   placeholder="juan@email.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
            </div>
          </div>

          {/* 2. Role & Security */}
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-text-muted" />
                <AnatomyText.H3 className="mb-0">Role & Security</AnatomyText.H3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ROLE SELECTOR MAPPED TO IDs */}
                <div>
                   <AnatomyRolesSelect
                    label="Assign Role"
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))} // Cast ID to number
                    showAllOption={false} // <--- Hide "All Roles"
                    valueMode="id"        // <--- Values will be 1, 2, 3...
                    required
                  />
                  <AnatomyText.Small className="text-xs text-text-muted mt-2 block">
                    * Determines permission levels.
                  </AnatomyText.Small>
                </div>

                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-text-muted" />
                      <AnatomyText.Label className="mb-0">Password</AnatomyText.Label>
                   </div>
                   <AnatomyTextFieldPassword 
                     type="password"
                     placeholder="Pass1234!"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                   />
                   <AnatomyText.Small className="text-xs text-text-muted mt-1 block">
                     Must contain Upper, Lower, Number & Symbol.
                   </AnatomyText.Small>
                </div>
             </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: AVATAR --- */}
        <div className="space-y-6">
          
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center sticky top-6">
             <AnatomyText.H3 className="mb-6">Profile Picture</AnatomyText.H3>
             
             <div className="relative group mb-6">
               <div className="w-40 h-40 rounded-full border-4 border-background shadow-inner overflow-hidden relative">
                 {avatarPreview ? (
                   <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted">
                     <UserIcon className="w-16 h-16" />
                   </div>
                 )}
                 
                 {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
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

             <AnatomyText.Body className="text-text-muted text-sm px-4">
               Upload a professional photo. 
               <br/>Required for profile identification.
             </AnatomyText.Body>
          </div>

        </div>

      </div>
      </BasePageLayout>
  );
};

export default AddUserPage;