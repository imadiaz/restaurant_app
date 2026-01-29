import React, { useState } from 'react';
import { Plus, FolderOpen, Edit, ArrowUpDown, NotebookPen } from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import AnatomySelect from '../../components/anatomy/AnatomySelect';
import AnatomyTag from '../../components/anatomy/AnatomyTag';
import AnatomyText from '../../components/anatomy/AnatomyText';
import BasePageLayout from '../../components/layout/BaseLayout';
import type { MenuSection } from '../../data/models/menu/menu.section';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { useMenuSections } from '../../hooks/restaurants/use.menu.section';
import { Routes } from '../../config/routes';
import { useTranslation } from 'react-i18next';


const MenuSectionsPage: React.FC = () => {
  const {t} = useTranslation();
  const { sections, isLoading, updateStatus } = useMenuSections();
  const { navigateTo } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sections.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (sectionId: string, newStatus: string) => {
    await updateStatus({id: sectionId, data: { status: newStatus }});
  }

  return (
    <BasePageLayout
      title={t('menuSections.menuSections')}
      subtitle={t('menuSections.description')}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.MenuSectionsAdd)}>
          <Plus className="w-5 h-5 mr-2" />  {t('menuSections.add')}
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filtered.length === 0}
      renderControls={
         <div className="w-full">
            <AnatomySearchBar 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder={t('common.search')} 
            />
         </div>
      }
      emptyLabel={t('menuSections.empty')} 
      emptyIcon={FolderOpen}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filtered.map((section) => (
          <MenuSectionCard 
            key={section.id} 
            section={section} 
            onEdit={() => navigateTo(Routes.MenuSectionsEdit(section.id))}
            onStatusChange={(newStatus) => handleUpdateStatus(section.id, newStatus)}
          />
        ))}
      </div>
    </BasePageLayout>
  );
};

// --- SUB-COMPONENT: CARD ---
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

          <AnatomyButton 
            variant="secondary" 
            fullWidth
            onClick={onEdit} 
            className="text-xs"
          >
             <Edit className="w-4 h-4 mr-2" /> {t('common.edit')}
          </AnatomyButton>
       </div>
    </div>
  );
};

export default MenuSectionsPage;