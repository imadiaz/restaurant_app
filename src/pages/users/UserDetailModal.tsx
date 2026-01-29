import React from 'react';
import {  Mail, Phone, Edit, AtSign, ShieldCheck, Store } from 'lucide-react';
import AnatomyText from '../../components/anatomy/AnatomyText';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import type { User } from '../../data/models/user/user';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { Routes } from '../../config/routes';
import { useTranslation } from 'react-i18next';



interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const {t} = useTranslation();
  const {navigateTo} = useAppNavigation();
  if (!isOpen || !user) return null;

  const avatarFallback = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="bg-background rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative">

        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary w-full absolute top-0 left-0 z-0" />

        <div className="z-10 px-8 pt-16 pb-8 flex flex-col items-center text-center">

          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white mb-4">
            <img
              src={user.profileImageUrl || avatarFallback}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <AnatomyText.H3 className="text-xl mb-1">
            {user.firstName} {user.lastName}
          </AnatomyText.H3>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 bg-gray-100 text-gray-700">
            {user.role.name.replace("_", " ")}
          </span>

          <div className="w-full space-y-4 text-left bg-background-card p-6 rounded-2xl">

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
                <AtSign className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <AnatomyText.Label className="mb-0">{t('forms.username')}</AnatomyText.Label>
                <p className="text-sm font-medium">
                  @{user.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <AnatomyText.Label className="mb-0">{t('users.email')}</AnatomyText.Label>
                <p className="text-sm font-medium">
                  {user.email || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <AnatomyText.Label className="mb-0">{t('users.phone_number')}</AnatomyText.Label>
                <p className="text-sm font-medium">
                  {user.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <AnatomyText.Label className="mb-0">{t('common.status')}</AnatomyText.Label>
                <p className="text-sm font-medium">
                  {user.status}
                </p>
              </div>
            </div>

            {user.restaurant && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-gray-400 border border-gray-200">
                  <Store className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <AnatomyText.Label className="mb-0">{t('restaurants.restaurant')}</AnatomyText.Label>
                  <p className="text-sm font-medium">
                    {user.restaurant.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full mt-6 grid grid-cols-2 gap-4">
            <AnatomyButton variant="secondary" onClick={onClose}>
              {t('common.close')}
            </AnatomyButton>
            <AnatomyButton onClick={() => navigateTo(Routes.UserEdit(user.id))}>
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </AnatomyButton>
          </div>

        </div>
      </div>
    </div>
  );
};


export default UserDetailModal;