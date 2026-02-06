import React, { useState } from 'react';
import { Plus, Tag, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { usePromotions } from '../../hooks/promotion/use.promotion';
import { useConfirm } from '../../hooks/use.confirm.modal';
import PromotionCard from './components/PromotionCard';
import { Routes } from '../../config/routes';


const PromotionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { confirm } = useConfirm();
  
  // Use the hook we created earlier
  const { 
    promotions, 
    isLoading, 
    deletePromotion, 
    updatePromotion 
  } = usePromotions();

  const [searchQuery, setSearchQuery] = useState("");

  // Filter by Name or Type
  const filtered = promotions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Logical Delete
  const handleDelete = async (id: string) => {
    confirm({
      title: t("confirm_modal.delete_promotion"),
      message: t("confirm_modal.delete_promotion_description"),
      variant: "danger", // Red color for delete
      confirmText: t("confirm_modal.delete"),
      onConfirm: async () => {
        await deletePromotion({ id });
      },
    });
  };

  // Handle Status Toggle (Active/Inactive)
  const handleStatusChange = async (id: string, newStatusStr: string) => {
    // Map string "active"/"inactive" back to boolean
    const isActive = newStatusStr === 'active';
    await updatePromotion({ id, data: { isActive } });
  };

  return (
    <BasePageLayout
      title={t("promotions.title")}
      subtitle={t("promotions.subtitle")}
      headerActions={
        // You can open a Modal here or Navigate to a generic "Add" page
        <AnatomyButton onClick={() => navigateTo(Routes.PromotionsAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t("promotions.add")}
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filtered.length === 0}
      renderControls={
        <div className="w-full">
          <AnatomySearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("promotions.search_placeholder")}
          />
        </div>
      }
      emptyLabel={t("promotions.empty")}
      emptyIcon={Tag}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filtered.map((promotion) => (
          <PromotionCard
            key={promotion.id}
            promotion={promotion}
            onEdit={() => navigateTo(Routes.PromotionsEdit(promotion.id))}
            onDelete={() => handleDelete(promotion.id)}
            onStatusChange={(newStatus) => handleStatusChange(promotion.id, newStatus)}
          />
        ))}
      </div>
    </BasePageLayout>
  );
};

export default PromotionsPage;