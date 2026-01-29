import { Mail, Phone, Edit, ExternalLink } from "lucide-react";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { User } from "../../../data/models/user/user";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";
import { STATUS } from "../../../config/status.config";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../../config/roles";
import AnatomyCardActions from "../../../components/anatomy/AnatomyCardActions";

const UserCard = ({
  user,
  onEdit,
  onViewDetails,
}: {
  user: User;
  onEdit: () => void;
  onViewDetails: () => void;
}) => {
  const { t } = useTranslation();
  const getRoleStyle = (roleName: string) => {
    const normalized = roleName?.toLowerCase() || "";
    if (normalized.includes(ROLES.SUPER_ADMIN))
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (normalized.includes(ROLES.ADMIN))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (normalized.includes(ROLES.MANAGER))
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    if (normalized.includes("local_manager"))
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`;

  return (
    <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center hover:shadow-md transition-all cursor-pointer group relative">
      <div className="w-20 h-20 rounded-full mb-4 border-2 border-background-card shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-2 ring-gray-100 dark:ring-gray-700">
        <img
          src={user.profileImageUrl || avatarUrl}
          alt={user.firstName}
          className="w-full h-full object-cover"
        />
      </div>

      <AnatomyText.H3 className="text-lg mb-1">
        {user.firstName} {user.lastName}
      </AnatomyText.H3>

      <AnatomyText.Small className="text-xs mb-3 text-text-muted">
        @{user.username}
      </AnatomyText.Small>

      <span
        className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 ${getRoleStyle(user.role?.name || "Staff")}`}
      >
        {user.role?.name.replace("_", " ") || "Staff"}
      </span>

      <div className="w-full border-t border-border pt-4 flex flex-col gap-3">
        <div className="flex  text-text-muted text-sm gap-2">
          <Mail className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {user.email || "No email provided"}
          </span>
        </div>

        <div className="flex text-text-muted text-sm gap-2">
          <Phone className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {user.phone || "No phone"}
          </span>
        </div>
        <div className="flex justify-center mt-1">
          <span
            className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border
    ${
      user.status === "active"
        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
    }
  `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === STATUS.active ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            {user.status}
          </span>
        </div>

        <AnatomyCardActions
          secondary={{
            label: t("common.edit"),
            icon: Edit,
            onClick: onEdit,
          }}
          primary={{
            label: t("common.details"),
            icon: ExternalLink,
            onClick: onViewDetails,
          }}
        />
      </div>
    </div>
  );
};

export default UserCard;
