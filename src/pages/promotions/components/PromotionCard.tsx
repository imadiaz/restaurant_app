import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Tag, Calendar, Trash2, Layers } from 'lucide-react';
import { format } from 'date-fns'; // Recommended for date formatting
import AnatomyCardActions from '../../../components/anatomy/AnatomyCardActions';
import AnatomySelect from '../../../components/anatomy/AnatomySelect';
import AnatomyTag from '../../../components/anatomy/AnatomyTag';
import AnatomyText from '../../../components/anatomy/AnatomyText';
import { PromotionType, type Promotion } from '../../../service/promotion.service';


interface PromotionCardProps {
  promotion: Promotion;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ 
  promotion, 
  onEdit, 
  onDelete,
  onStatusChange 
}) => {
  const { t } = useTranslation();

  // Helper to format the badge text
  const getBadgeContent = () => {
    switch (promotion.type) {
      case PromotionType.BOGO:
        return '2x1';
      case PromotionType.PERCENTAGE:
        return `${promotion.value}% OFF`;
      case PromotionType.FIXED_AMOUNT:
        return `-$${promotion.value}`;
      default:
        return promotion.type;
    }
  };

  // Helper for badge color
  const getBadgeVariant = () => {
    return promotion.type === PromotionType.BOGO ? 'purple' : 'success'; 
    // Assuming 'purple' or 'success' are valid variants in AnatomyTag
  };

  return (
    <div className="bg-background-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
      
  

      <div className="flex items-start gap-4 mb-4 z-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Tag className="w-6 h-6" />
        </div>
        
        <div className="min-w-0 flex-1">
          <AnatomyText.H3 className="text-base mb-1 truncate" title={promotion.name}>
            {promotion.name}
          </AnatomyText.H3>
          
          <div className="flex flex-wrap gap-2 mt-1">
            {/* Discount Badge */}
            <AnatomyTag variant={getBadgeVariant() as any} className="font-bold">
              {getBadgeContent()}
            </AnatomyTag>

            {/* Products Count Badge */}
            <AnatomyTag variant="default">
              <Layers className="w-3 h-3 mr-1" />
              {promotion.products?.length || 0}
            </AnatomyTag>

             <AnatomyTag variant={promotion.isActive ? 'success' :'error'} className="font-bold">
              {promotion.isActive ? t('common.status_active') : t('common.status_inactive')}
            </AnatomyTag>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {promotion.description || t('common.no_description')}
        </p>
        
        {/* Date Range Info */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground bg-background p-2 rounded-lg border border-border/50">
            <Calendar className="w-3.5 h-3.5" />
            <span>
                {format(new Date(promotion.startDate), 'dd MMM')} - {format(new Date(promotion.endDate), 'dd MMM yyyy')}
            </span>
        </div>
      </div>

      <div className="mt-auto space-y-4 z-10">
        <div className="pt-4 border-t border-border">
          <AnatomySelect
            label={t('menuSections.visibility_status')}
            value={promotion.isActive ? 'active' : 'inactive'} // Map boolean to string
            onChange={(e) => onStatusChange(e.target.value)}
            className="mb-0"
          >
            <option value="active">{t('common.status_active')}</option>
            <option value="inactive">{t('common.status_inactive')}</option>
          </AnatomySelect>
        </div>

        <AnatomyCardActions
          secondary={{
            label: t("common.edit"),
            icon: Edit,
            onClick: onEdit
          }}
          // If AnatomyCardActions supports a tertiary/danger action:
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

export default PromotionCard;