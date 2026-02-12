import React from 'react';
import { Edit, Trash2, Calendar, Users, Store, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyText from '../../../components/anatomy/AnatomyText';
import AnatomyTag from '../../../components/anatomy/AnatomyTag';
import AnatomyCardActions from '../../../components/anatomy/AnatomyCardActions';
import { type Coupon, CouponType, CouponScope } from '../../../service/coupons.service';


interface CouponCardProps {
  coupon: Coupon;
  onEdit: () => void;
  onDelete: () => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ 
  coupon, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useTranslation();

  // Helper to determine status color
  const getStatusColor = () => {
    const now = new Date();
    const end = new Date(coupon.endDate);
    
    if (!coupon.isActive) return 'bg-gray-100 text-gray-500';
    if (now > end) return 'bg-red-50 text-red-600 border-red-100'; // Expired
    return 'bg-green-50 text-green-600 border-green-100'; // Active
  };

  // Helper to format discount (e.g., "20%" or "$100.00")
  const formattedValue = coupon.type === CouponType.PERCENTAGE 
    ? `${coupon.value}% OFF` 
    : `${formatCurrency(coupon.value)} OFF`;

  return (
    <div className="bg-background-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
      
      {/* Decorative dashed line for "Coupon" feel */}
      <div className="absolute top-0 right-12 w-[1px] h-full border-r border-dashed border-gray-200 dark:border-gray-700/50" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background-main border border-border z-10" />

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4 pr-4">
        <div>
          <AnatomyText.H3 className="text-xl font-mono tracking-wider text-primary mb-1">
            {coupon.code}
          </AnatomyText.H3>
          <AnatomyText.Small className="text-text-muted line-clamp-1" title={coupon.description}>
            {coupon.description || t('coupons.no_description')}
          </AnatomyText.Small>
        </div>
      </div>

      {/* INFO CHIPS */}
      <div className="space-y-3 mb-6 pr-4">
        
        {/* Value Badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-xl border font-bold text-sm ${getStatusColor()}`}>
           {formattedValue}
        </div>

        {/* Scope & Type */}
        <div className="flex flex-wrap gap-2">
            <AnatomyTag variant="primary" className="text-xs">
                {coupon.scope === CouponScope.GLOBAL ? <Globe className="w-3 h-3 mr-1"/> : <Store className="w-3 h-3 mr-1"/>}
                {t(`coupons.scope.${coupon.scope}`)}
            </AnatomyTag>
            
            {coupon.usageLimitGlobal && (
               <AnatomyTag variant="success" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {coupon.currentUsages} / {coupon.usageLimitGlobal}
               </AnatomyTag>
            )}
        </div>

        {/* Validity */}
        <div className="flex items-center text-xs text-text-muted">
           <Calendar className="w-3.5 h-3.5 mr-2" />
           <span>{new Date(coupon.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-auto pt-4 border-t border-border z-20 bg-background-card">
        <AnatomyCardActions
        
          secondary={{
            label: t("common.edit"),
            icon: Edit,
            onClick: onEdit
          }}

          primary={{
             label: t("common.delete"),
             icon: Trash2,
             onClick: onDelete,
          }}
        />
      </div>

    </div>
  );
};

export default CouponCard;

function formatCurrency(value: number) {
    throw new Error('Function not implemented.');
}
