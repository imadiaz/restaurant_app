import React, { useState } from "react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import {
  Plus,
  UserIcon,
} from "lucide-react";
import AnatomySearchBar from "../../components/anatomy/AnatomySearchBar";
import { useUsers } from "../../hooks/users/use.users";
import type { User } from "../../data/models/user/user";
import BasePageLayout from "../../components/layout/BaseLayout";
import AnatomyRolesSelect from "../../components/anatomy/AnatomyRolesSelect";
import UserDetailModal from "./UserDetailModal";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { Routes } from "../../config/routes";
import UserCard from "./components/UserCard";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/auth.store";
import { isRestaurantAdmin, isSuperAdmin } from "../../data/models/user/utils/user.utils";
import { ROLES } from "../../config/roles";

const UsersPage: React.FC = () => {
  const {t} = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const { users, isLoading: isLoadingUsers } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const { navigateTo } = useAppNavigation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredUsers = (users || []).filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

    const roleName = user.role?.name?.toLowerCase() || "";
    const matchesRole =
      roleFilter === "All" || roleName === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const canCreateUsers =
    isSuperAdmin(currentUser) || isRestaurantAdmin(currentUser);
  const canEditUser = (target: User) =>
    isSuperAdmin(currentUser)
      ? target.role.name === ROLES.ADMIN || target.role.name === ROLES.MANAGER
      : isRestaurantAdmin(currentUser) && target.role.name === ROLES.MANAGER;

  return (
    <BasePageLayout
      title={t('users.user')}
      subtitle={t('users.description')}
      headerActions={canCreateUsers ? (
        <AnatomyButton onClick={() => navigateTo(Routes.UserAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t('users.add')}
        </AnatomyButton>
      ) : undefined}
      isLoading={isLoadingUsers}
      isEmpty={filteredUsers.length === 0}
      renderControls={
        <>
          <div className="w-full md:flex-1">
            <AnatomySearchBar
              placeholder={t('common.search')}
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
          />
          </div>
        </>
      }
      emptyLabel={t('users.empty')}
      emptyIcon={UserIcon}
    >
      <>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={canEditUser(user) ? () => navigateTo(Routes.UserEdit(user.id)) : undefined}
            onViewDetails={() => handleUserClick(user)}
          />
        ))}
      </div>


      <UserDetailModal
        isOpen={isModalOpen} 
        user={selectedUser} 
        onClose={() => setIsModalOpen(false)} 
        canEdit={selectedUser ? canEditUser(selectedUser) : false}
      />
      </>

    </BasePageLayout>
  );
};

export default UsersPage;
