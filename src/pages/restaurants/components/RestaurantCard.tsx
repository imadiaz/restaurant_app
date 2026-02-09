import React, { useState } from "react";
import { MapPin, Store, Edit, ExternalLink, User, Settings } from "lucide-react";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type {
  Restaurant,
  PriceRange,
} from "../../../data/models/restaurant/restaurant";
import { useTranslation } from "react-i18next";
import { STATUS } from "../../../config/status.config";
import AnatomyCardActions from "../../../components/anatomy/AnatomyCardActions";
import AnatomyTag from "../../../components/anatomy/AnatomyTag";
import ManageRestaurantSettingsSection from "./ManageRestaurantSettingsSection";
import { isSuperAdmin } from "../../../data/models/user/utils/user.utils";
import ManageRestaurantSettingsModal from "./ManageRestaurantSettingsModal";
import { useAuthStore } from "../../../store/auth.store";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEnterDashboard: () => void;
  onEdit: () => void;
  onViewDetail: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onEnterDashboard,
  onEdit,
  onViewDetail,
}) => {
  const { t } = useTranslation();
  const getPriceSymbol = (range: PriceRange) => {
    const map = {
      inexpensive: "$",
      moderate: "$$",
      expensive: "$$$",
      very_expensive: "$$$$",
    };
    return map[range] || "$$";
  };
  const {user} = useAuthStore((state) => state);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const canEditSettings = isSuperAdmin(user) || restaurant.userId === user?.id;
  const isAdminMode = isSuperAdmin(user);

  return (
    <div
      className="bg-background-card rounded-3xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all group relative flex flex-col h-full cursor-pointer"
    >
      <div onClick={onViewDetail} className="h-32 w-full bg-gray-100 dark:bg-gray-800 relative">
        {restaurant.heroImageUrl ? (
          <>
            <img
              src={restaurant.heroImageUrl}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:opacity-50" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center opacity-50">
            <Store className="w-8 h-8 text-text-muted" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2">
          <AnatomyTag
            variant={`${restaurant.status == STATUS.active ? "success" : "error"}`}
          >
            {restaurant.status}
          </AnatomyTag>
          <AnatomyTag variant={`${restaurant.isOpen ? "primary" : "error"}`}>
            {restaurant.isOpen ? t("common.open") : t("common.closed")}
          </AnatomyTag>
        </div>
      </div>

      <div className="p-5 pt-0 flex-1 flex flex-col">
        <div className="flex justify-between items-end -mt-8 mb-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl rounded-full overflow-hidden bg-background-card border border-background-card shadow-sm">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover circle"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <Store className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="mb-1 mt-2">
            <AnatomyText.Label className="px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border">
              {getPriceSymbol(restaurant.priceRange)}
            </AnatomyText.Label>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <AnatomyText.H3 className="line-clamp-1" title={restaurant.name}>
            {restaurant.name}
          </AnatomyText.H3>

          <div className="flex items-start text-text-muted mt-1">
            <MapPin className="w-4 h-4 mr-1.5 mt-0.5 shrink-0" />
            <AnatomyText.Small className="line-clamp-2 leading-relaxed">
              {restaurant.streetAddress}, {restaurant.city}
            </AnatomyText.Small>
          </div>
        </div>

        {restaurant.user && (
          <div className="mb-5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background-card flex items-center justify-center shadow-sm border border-border overflow-hidden shrink-0">
              {restaurant.user.profileImageUrl ? (
                <img
                  src={restaurant.user.profileImageUrl}
                  alt={restaurant.user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-text-muted" />
              )}
            </div>

            <div className="min-w-0 flex flex-col">
              <AnatomyText.Label className="text-[10px] leading-none mb-0.5">
                {t("restaurants.owner")}
              </AnatomyText.Label>
              <AnatomyText.Body className="text-xs font-bold !text-text-main truncate leading-tight">
                {restaurant.user.firstName} {restaurant.user.lastName}
              </AnatomyText.Body>
            </div>
          </div>
        )}
        <AnatomyCardActions
          secondary={{
            label: t("common.edit"),
            icon: Edit,
            onClick: onEdit,
          }}
          primary={{
            label: t("common.details"),
            icon: ExternalLink,
            onClick: onEnterDashboard,
          }}
          tertiary={ canEditSettings ? {
              label: 'Config',
              icon: Settings,
              variant: 'ghost',
              onClick: () => setShowSettingsModal(true)
            } : undefined }
            reverse={true}
        />
      </div>
      {showSettingsModal && (
        <ManageRestaurantSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          restaurant={restaurant}
          isAdminMode={isAdminMode}
          onSuccess={() => {
             // Optional: Refresh list or show success toast
             console.log("Settings updated!");
          }}
        />
      )}
    </div>
  );
};
