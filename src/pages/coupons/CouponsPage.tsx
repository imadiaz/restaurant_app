import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Ticket } from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useCoupons } from '../../hooks/coupons/use.coupons';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { useConfirm } from '../../hooks/use.confirm.modal';
import { Routes } from '../../config/routes';
import CouponCard from './components/CouponCArd';


const CouponsPage: React.FC = () => {
  const { t } = useTranslation();
  const { coupons, isLoading, deleteCoupon } = useCoupons();
  const { navigateTo } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm } = useConfirm();

  // Filter by Code or Description
  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, code: string) => {
    confirm({
      title: t("confirm_modal.delete_title"),
      message: t("confirm_modal.delete_description", { item: code }),
      variant: "danger",
      confirmText: t("common.delete"),
      onConfirm: async () => {
        await deleteCoupon(id);
      },
    });
  };

  return (
    <BasePageLayout
      title={t("coupons.title")}
      subtitle={t("coupons.subtitle")}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.CouponsAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t("coupons.add")}
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filtered.length === 0}
      renderControls={
        <div className="w-full">
          <AnatomySearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.search_code")}
          />
        </div>
      }
      emptyLabel={t("coupons.empty")}
      emptyIcon={Ticket}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filtered.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            onEdit={() => navigateTo(Routes.CouponsEdit(coupon.id))}
            onDelete={() => handleDelete(coupon.id, coupon.code)}
          />
        ))}
      </div>
    </BasePageLayout>
  );
};

export default CouponsPage;