import React from "react";
import { MapPin, Store, Edit, ExternalLink, User } from "lucide-react";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type {
  Restaurant,
  PriceRange,
} from "../../../data/models/restaurant/restaurant";

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
  const getPriceSymbol = (range: PriceRange) => {
    const map = {
      inexpensive: "$",
      moderate: "$$",
      expensive: "$$$",
      very_expensive: "$$$$",
    };
    return map[range] || "$$";
  };

  return (
    <div
      onClick={onViewDetail}
      className="bg-background-card rounded-3xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all group relative flex flex-col h-full cursor-pointer"
    >
      {/* 1. HERO IMAGE */}
      <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 relative">
        {restaurant.heroImageUrl ? (
          <>
            <img
              src={restaurant.heroImageUrl}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* ✅ THE OVERLAY: Black opacity layer */}
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:opacity-50" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center opacity-50">
            <Store className="w-8 h-8 text-text-muted" />
          </div>
        )}

        {/* Status Badges (Custom colors, so we keep spans but use Anatomy logic where possible) */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span
            className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md
              ${
                restaurant.status === "active"
                  ? "bg-green-100/90 text-green-700 border-green-200"
                  : "bg-red-100/90 text-red-700 border-red-200"
              }
            `}
          >
            {restaurant.status}
          </span>
          <span
            className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md
              ${
                restaurant.isOpen
                  ? "bg-blue-100/90 text-blue-700 border-blue-200"
                  : "bg-gray-100/90 text-gray-600 border-gray-200"
              }
            `}
          >
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="p-5 pt-0 flex-1 flex flex-col">
        {/* Logo Overlap */}
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

          {/* Price Tag */}
          <div className="mb-1">
            <AnatomyText.Label className="px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border">
              {getPriceSymbol(restaurant.priceRange)}
            </AnatomyText.Label>
          </div>
        </div>

        {/* Name & Address */}
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

        {/* 3. OWNER INFO */}
        {restaurant.user && (
          <div className="mb-5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-border flex items-center gap-3">
            {/* Avatar Container */}
            <div className="w-8 h-8 rounded-full bg-background-card flex items-center justify-center shadow-sm border border-border overflow-hidden shrink-0">
              {/* Check if URL exists */}
              {restaurant.user.profileImageUrl ? (
                <img
                  src={restaurant.user.profileImageUrl}
                  alt={restaurant.user.firstName}
                  className="w-full h-full object-cover" // Forces image to fill circle
                />
              ) : (
                // Fallback Icon (Centered via parent flex)
                <User className="w-4 h-4 text-text-muted" />
              )}
            </div>

            {/* Text Info */}
            <div className="min-w-0 flex flex-col">
              <AnatomyText.Label className="text-[10px] leading-none mb-0.5">
                Owner
              </AnatomyText.Label>
              <AnatomyText.Body className="text-xs font-bold !text-text-main truncate leading-tight">
                {restaurant.user.firstName} {restaurant.user.lastName}
              </AnatomyText.Body>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto"></div>

        {/* 4. ACTIONS */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <AnatomyButton
            variant="secondary"
            className="px-0 h-10 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="w-3.5 h-3.5 mr-2" /> Edit
          </AnatomyButton>

          <AnatomyButton
            className="px-0 h-10 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEnterDashboard();
            }}
          >
            Dashboard <ExternalLink className="w-3.5 h-3.5 ml-2" />
          </AnatomyButton>
        </div>
      </div>
    </div>
  );
};
