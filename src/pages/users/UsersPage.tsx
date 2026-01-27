import React, { useState } from "react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import {
  Plus,
  UserIcon,
} from "lucide-react";
import AnatomySearchBar from "../../components/anatomy/AnatomySearchBar";
import { useUsers } from "../../hooks/users/use.users";
import { useAppStore } from "../../store/app.store";
import type { User } from "../../data/models/user/user";
import BasePageLayout from "../../components/layout/BaseLayout";
import AnatomyRolesSelect from "../../components/anatomy/AnatomyRolesSelect";
import UserDetailModal from "./UserDetailModal";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { Routes } from "../../config/routes";
import UserCard from "./components/UserCard";

const UsersPage: React.FC = () => {
  const { activeRestaurant } = useAppStore();
  const { users, isLoading: isLoadingUsers } = useUsers(activeRestaurant?.id);

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

  return (
    <BasePageLayout
      title="Users"
      subtitle="Manage team members and permissions"
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.UserAdd)}>
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
      <>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => handleUserClick(user)}
          />
        ))}
      </div>


      <UserDetailModal
        isOpen={isModalOpen} 
        user={selectedUser} 
        onClose={() => setIsModalOpen(false)} 
      />
      </>

    </BasePageLayout>
  );
};

export default UsersPage;
