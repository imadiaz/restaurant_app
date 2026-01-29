import React, { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import AnatomyButton from '../../components/anatomy/AnatomyButton';
import AnatomySearchBar from '../../components/anatomy/AnatomySearchBar';
import BasePageLayout from '../../components/layout/BaseLayout';
import { useAppNavigation } from '../../hooks/navigation/use.app.navigation';
import { useMenuSections } from '../../hooks/restaurants/use.menu.section';
import { Routes } from '../../config/routes';
import { useTranslation } from 'react-i18next';
import MenuSectionCard from './components/MenuSectionCard';


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

export default MenuSectionsPage;