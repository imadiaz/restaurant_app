import { useMemo, useState } from "react";
import { useRestaurants } from "../../../hooks/restaurants/use.restaurant";
import { useAppStore } from "../../../store/app.store";
import { ChefHat } from "lucide-react";
import { useTranslation } from "react-i18next";
import ManageCategoriesModal from "./ManageCategoriesModal";

interface ManageCategoriesSectionProps {
  isSidebarCollapsed: boolean;
  mobile: boolean;
}

const ManageCategoriesSection: React.FC<ManageCategoriesSectionProps> = ({
  isSidebarCollapsed,
  mobile,
}: ManageCategoriesSectionProps) => {
  const { activeRestaurant } = useAppStore((state) => state);
  const { restaurants, isLoading } = useRestaurants(activeRestaurant?.id);
  const localRestaurant = restaurants[0] ?? activeRestaurant;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const initialIds = useMemo(() => {
    return (localRestaurant?.categories ?? []).map((cat) => cat.id);
  }, [localRestaurant]);

  return (
    <div className="p-4 border-t border-border">
      {isOpen && (
        <ManageCategoriesModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          restaurantId={localRestaurant?.id ?? ""}
          initialSelectedIds={initialIds}
        />
      )}
      <button
        disabled={isLoading}
        onClick={() => setIsOpen(true)}
        className={`
            w-full flex items-center p-3 rounded-xl text-text-muted hover:text-white hover:bg-primary transition-colors
            ${isSidebarCollapsed && !mobile ? "justify-center" : ""}
          `}
      >
        <ChefHat
          className={`w-5 h-5 ${!isSidebarCollapsed || mobile ? "mr-3" : ""}`}
        />
        {(!isSidebarCollapsed || mobile) && (
          <span className="font-medium text-sm">{t('categories.title')}</span>
        )}
      </button>
    </div>
  );
};

export default ManageCategoriesSection;
