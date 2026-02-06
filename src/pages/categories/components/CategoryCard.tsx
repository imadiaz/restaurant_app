import React from 'react';
import { Edit, Tags, Trash2, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyText from '../../../components/anatomy/AnatomyText';
import AnatomyTag from '../../../components/anatomy/AnatomyTag';
import AnatomyCardActions from '../../../components/anatomy/AnatomyCardActions';
import type { Category } from '../../../service/category.service';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useTranslation();

  const renderVisual = () => {
    if (category.icon) {
      return <span className="text-2xl leading-none" role="img" aria-label={category.name}>{category.icon}</span>;
    }
    if (category.imageUrl) {
      return (
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="w-full h-full object-cover" 
        />
      );
    }
    return <Tags className="w-6 h-6" />;
  };

  return (
    <div className="bg-background-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
       
       <div className="flex items-start gap-4 mb-4">
          {/* Visual Container */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden relative">
             {renderVisual()}
          </div>

          <div className="min-w-0 flex-1">
             <AnatomyText.H3 className="text-base mb-1 truncate" title={category.name}>
                {category.name}
             </AnatomyText.H3>
             
             {/* Slug / Deep Link indicator */}
             <AnatomyTag variant="default" className="max-w-full truncate">
                <LinkIcon className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">/{category.slug}</span>
             </AnatomyTag>
          </div>
       </div>

       <div className="mt-auto pt-4 border-t border-border">
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

export default CategoryCard;