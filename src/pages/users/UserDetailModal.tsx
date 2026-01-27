import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import type { User } from '../../data/models/user/user';



interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

// const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
//   if (!isOpen || !user) return null;

//   return (
//     <div 
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative">
        
//         {/* Header Background */}
//         <div className="h-32 bg-gradient-to-r from-primary/80 to-primary w-full absolute top-0 left-0 z-0"></div>
        
//         <button 
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         {/* Profile Content */}
//         <div className="z-10 px-8 pt-16 pb-8 flex flex-col items-center text-center">
          
//           {/* Avatar */}
//           <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white mb-4">
//             <img 
//               src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
//               alt={user.firstName}
//               className="w-full h-full object-cover"
//             />
//           </div>

//           <AnatomyText.H3 className="text-xl mb-1">{user.firstName} {user.lastName}</AnatomyText.H3>
//           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 ${
//             user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
//             user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
//             'bg-gray-100 text-gray-700'
//           }`}>
//             {user.role}
//           </span>

//           {/* Details Grid */}
//           <div className="w-full space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
            
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
//                 <Mail className="w-4 h-4" />
//               </div>
//               <div className="flex-1">
//                 <AnatomyText.Label className="mb-0">Email Address</AnatomyText.Label>
//                 <p className="text-sm font-medium text-gray-800">{user.email}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
//                 <Phone className="w-4 h-4" />
//               </div>
//               <div className="flex-1">
//                 <AnatomyText.Label className="mb-0">Phone Number</AnatomyText.Label>
//                 <p className="text-sm font-medium text-gray-800">{user.phone || 'N/A'}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div className="flex-1">
//                 <AnatomyText.Label className="mb-0">Location</AnatomyText.Label>
//                 <p className="text-sm font-medium text-gray-800">{user.location || 'Remote'}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
//                 <Calendar className="w-4 h-4" />
//               </div>
//               <div className="flex-1">
//                 <AnatomyText.Label className="mb-0">Joined Date</AnatomyText.Label>
//                 <p className="text-sm font-medium text-gray-800">{user.joinDate}</p>
//               </div>
//             </div>

//           </div>

//           {/* Footer Actions */}
//           <div className="w-full mt-6 grid grid-cols-2 gap-4">
//             <AnatomyButton variant="secondary" onClick={onClose}>Close</AnatomyButton>
//             <AnatomyButton>
//               <Edit className="w-4 h-4 mr-2" /> Edit User
//             </AnatomyButton>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      
    </div>
  );
};

export default UserDetailModal;