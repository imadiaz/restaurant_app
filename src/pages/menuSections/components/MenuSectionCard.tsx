import { NotebookPen, ArrowUpDown, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../../components/anatomy/AnatomySelect";
import AnatomyTag from "../../../components/anatomy/AnatomyTag";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { MenuSection } from "../../../data/models/menu/menu.section";
import AnatomyCardActions from "../../../components/anatomy/AnatomyCardActions";

interface MenuSectionCardProps {
  section: MenuSection;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}

const MenuSectionCard: React.FC<MenuSectionCardProps> = ({ 
  section, onEdit, onStatusChange 
}) => {
    const {t} = useTranslation();

  return (
    <div className="bg-background-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
       
       <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
             <NotebookPen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
             <AnatomyText.H3 className="text-base mb-1 truncate" title={section.name}>
                {section.name}
             </AnatomyText.H3>
             
             <AnatomyTag variant="default">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                {t('order.order')}: {section.sortOrder}
             </AnatomyTag>
          </div>
       </div>

       <div className="mt-auto space-y-4">
          
          <div className="pt-4 border-t border-border">
             <AnatomySelect
                label={t('menuSections.visibility_status')}
                value={section.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="mb-0" 
             >
                 <option value="active">{t('common.status_active')}</option>
                  <option value="inactive">{t('common.status_inactive')}</option>
                  <option value="suspended">{t('common.status_suspended')}</option>
             </AnatomySelect>
          </div>

    <AnatomyCardActions
       secondary={{
          label: t("common.edit"),
          icon: Edit,
          onClick: onEdit
       }}
    />
       </div>
    </div>
  );
};

export default MenuSectionCard;