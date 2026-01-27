import React, { useState } from "react";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import {
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Shield,
  UserIcon,
} from "lucide-react";
import AnatomySearchBar from "../../components/anatomy/AnatomySearchBar";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import PageHeader from "../../components/common/PageHeader";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/users/use.users";
import { useAppStore } from "../../store/app.store";
import type { User } from "../../data/models/user/user";
import { useRoles } from "../../hooks/role/use.role";
import BasePageLayout from "../../components/layout/BaseLayout";
import AnatomyRolesSelect from "../../components/anatomy/AnatomyRolesSelect";

// --- USER CARD COMPONENT ---
const UserCard = ({ user, onClick }: { user: User; onClick: () => void }) => {
  // Helper for Role Colors
  // We access user.role.name safely. Adjust if your Role object uses a different key.
  const getRoleStyle = (roleName: string) => {
    const normalized = roleName?.toLowerCase() || "";
    if (normalized.includes("admin"))
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (normalized.includes("manager"))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (normalized.includes("delivery"))
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    if (normalized.includes("chef") || normalized.includes("kitchen"))
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  // Generate Avatar based on name since model doesn't have image URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`;

  return (
    <div
      onClick={onClick}
      className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center hover:shadow-md transition-all cursor-pointer group relative"
    >
      <button className="absolute top-4 right-4 text-text-muted hover:text-text-main">
        <MoreVertical className="w-5 h-5" />
      </button>

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
        {user.role?.name || "Staff"}
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
        <div className="flex text-text-muted text-sm gap-2">
          <div
            className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
          ></div>
          <span className="text-xs font-medium text-gray-400 capitalize">
            {user.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN USERS PAGE ---
const UsersPage: React.FC = () => {
  const { activeRestaurant } = useAppStore();
  const { users, isLoading: isLoadingUsers } = useUsers(activeRestaurant?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Logic
  const filteredUsers = (users || []).filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

    // Safely access nested role name
    const roleName = user.role?.name?.toLowerCase() || "";
    const matchesRole =
      roleFilter === "All" || roleName === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <BasePageLayout
      title="Users"
      subtitle="Manage team members and permissions"
      headerActions={
        <AnatomyButton onClick={() => navigate("/dashboard/users/add")}>
          <Plus className="w-5 h-5 mr-2" /> Add New User
        </AnatomyButton>
      }
      isLoading={isLoadingUsers}
      isEmpty={filteredUsers.length === 0}
      renderControls={
        <>
          <div className="w-full md:flex-1">
            <AnatomySearchBar
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <AnatomyRolesSelect
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            showAllOption={true}
            valueMode="name"
            className="!bg-background !border-border text-text-main"
          />
          </div>
        </>
      }
      emptyLabel="No users found matching your search."
      emptyIcon={UserIcon}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => handleUserClick(user)}
          />
        ))}
      </div>
    </BasePageLayout>
  );
};

export default UsersPage;
