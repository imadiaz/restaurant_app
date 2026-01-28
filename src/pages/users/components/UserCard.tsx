import { MoreVertical, Mail, Phone, Edit, ExternalLink } from "lucide-react";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { User } from "../../../data/models/user/user";
import AnatomyTag from "../../../components/anatomy/AnatomyTag";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";
import { Routes } from "../../../config/routes";
import { useAppNavigation } from "../../../hooks/navigation/use.app.navigation";

// --- USER CARD COMPONENT ---
const UserCard = ({ user, onClick }: { user: User; onClick: () => void }) => {
  const {navigateTo} = useAppNavigation();
  const getRoleStyle = (roleName: string) => {
    const normalized = roleName?.toLowerCase() || "";
    if (normalized.includes("super_admin"))
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (normalized.includes("restaurant_admin"))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (normalized.includes("manager"))
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    if (normalized.includes("local_manager"))
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  // Generate Avatar based on name since model doesn't have image URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`;

  return (
    <div
      className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center hover:shadow-md transition-all cursor-pointer group relative"
    >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full mb-4 border-2 border-background-card shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-2 ring-gray-100 dark:ring-gray-700">
        <img
          src={user.profileImageUrl || avatarUrl}
          alt={user.firstName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name */}
      <AnatomyText.H3 className="text-lg mb-1">
        {user.firstName} {user.lastName}
      </AnatomyText.H3>

      {/* Username / Handle */}
      <AnatomyText.Small className="text-xs mb-3 text-text-muted">
        @{user.username}
      </AnatomyText.Small>

      {/* Role Badge */}
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 ${getRoleStyle(user.role?.name || "Staff")}`}
      >
        {user.role?.name.replace("_", " ") || "Staff"}
      </span>

      {/* Contact Details */}
      <div className="w-full border-t border-border pt-4 flex flex-col gap-3">
        {/* Email */}
        <div className="flex  text-text-muted text-sm gap-2">
          <Mail className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {user.email || "No email provided"}
          </span>
        </div>

        {/* Phone */}
        <div className="flex text-text-muted text-sm gap-2">
          <Phone className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {user.phone || "No phone"}
          </span>
        </div>
        {/* Status Tag */}
<div className="flex justify-center mt-1">
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border
    ${user.status === 'active' 
      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}
  `}>
    {/* Optional: Little dot inside the tag for extra flair */}
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
    {user.status}
  </span>
</div>


           <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <AnatomyButton
            variant="secondary" 
            fullWidth
            onClick={() => navigateTo(Routes.UserEdit(user.id))}
                        className="px-0 h-10 text-xs"
          >
             <Edit className="w-4 h-4 mr-2" /> Edit
          </AnatomyButton>

          <AnatomyButton
            className="px-0 h-10 text-xs"
            onClick={onClick}
          >
            Detalles <ExternalLink className="w-3.5 h-3.5 ml-2" />
          </AnatomyButton>
        </div>
      </div>
    </div>
  );
};

export default UserCard;