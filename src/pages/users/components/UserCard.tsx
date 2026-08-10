import { Mail, Phone, Edit, ExternalLink } from "lucide-react";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { User } from "../../../data/models/user/user";
import { STATUS } from "../../../config/status.config";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../../config/roles";
import AnatomyCardActions from "../../../components/anatomy/AnatomyCardActions";

interface UserCardProps {
  user: User;
  onEdit: () => void;
  onViewDetails: () => void;
}

const UserCard = ({
  user,
  onEdit,
  onViewDetails,
}: UserCardProps) => {
  const { t } = useTranslation();
  const getRoleStyle = (roleName: string) => {
    const normalized = roleName?.toLowerCase() || "";
    if (normalized.includes(ROLES.SUPER_ADMIN))
      return "bg-primary/10 text-primary";
    if (normalized.includes(ROLES.ADMIN))
      return "bg-info-surface text-info";
    if (normalized.includes(ROLES.MANAGER))
      return "bg-warning-surface text-warning";
    if (normalized.includes("local_manager"))
      return "bg-danger-surface text-danger";
    return "bg-surface-muted text-text-muted";
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`;

  return (
    <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center hover:shadow-md transition-all cursor-pointer group relative">
      <div className="w-20 h-20 rounded-full mb-4 border-2 border-background-card shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-2 ring-border">
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
        ? "bg-success-surface text-success border-success/20"
        : "bg-danger-surface text-danger border-danger/20"
    }
  `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === STATUS.active ? "bg-success" : "bg-danger"}`}
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
