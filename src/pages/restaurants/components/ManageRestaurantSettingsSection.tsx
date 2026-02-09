import React, { useState } from 'react';
import { Settings, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Restaurant } from '../../../data/models/restaurant/restaurant';
import { isSuperAdmin } from '../../../data/models/user/utils/user.utils';
import { useRestaurants } from '../../../hooks/restaurants/use.restaurant';
import { useAppStore } from '../../../store/app.store';
import { useAuthStore } from '../../../store/auth.store';
import ManageRestaurantSettingsModal from './ManageRestaurantSettingsModal';


interface ManageRestaurantSettingsSectionProps {
  isSidebarCollapsed: boolean;
  mobile: boolean;
  restaurantId?: string;
}

const ManageRestaurantSettingsSection: React.FC<ManageRestaurantSettingsSectionProps> = ({
  isSidebarCollapsed,
  mobile,
  restaurantId
}) => {
  const { t } = useTranslation();
  const { activeRestaurant } = useAppStore((state) => state);
  const {user} = useAuthStore((state) => state);
  const { getRestaurantById, isLoading } = useRestaurants();
  
  const [localRestaurant, setLocalRestaurant] = useState<Restaurant | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const effectiveId = restaurantId || activeRestaurant?.id || "";
  const canAccessAdminMode = user ? isSuperAdmin(user) : false;

  const handleOpen = async () => {
    if (!effectiveId) return;
    const details = await getRestaurantById(effectiveId);
      setLocalRestaurant(details);
      setIsOpen(true);
  };

  return (
    <div className="p-4 border-t border-border">
      {isOpen && localRestaurant && (
        <ManageRestaurantSettingsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          restaurant={localRestaurant}
          isAdminMode={canAccessAdminMode}
          onSuccess={() => {
          }}
        />
      )}
      
      <button
        disabled={isLoading || !effectiveId}
        onClick={handleOpen}
        className={`
            w-full flex items-center p-3 rounded-xl transition-colors
            ${canAccessAdminMode 
              ? "text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-900/40" 
              : "text-gray-500 hover:text-white hover:bg-primary dark:hover:bg-primary"
            }
            ${isSidebarCollapsed && !mobile ? "justify-center" : ""}
          `}
      >
        {canAccessAdminMode ? (
           <ShieldCheck className={`w-5 h-5 ${!isSidebarCollapsed || mobile ? "mr-3" : ""}`} />
        ) : (
           <Settings className={`w-5 h-5 ${!isSidebarCollapsed || mobile ? "mr-3" : ""}`} />
        )}

        {(!isSidebarCollapsed || mobile) && (
          <span className="font-medium text-sm">
            {canAccessAdminMode ? t('settings.admin_config') : t('settings.title')}
          </span>
        )}
      </button>
    </div>
  );
};

export default ManageRestaurantSettingsSection;