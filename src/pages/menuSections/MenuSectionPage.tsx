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


const MenuSectionsPage: React.FC = () => {
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
      title="Menu Sections"
      subtitle="Organize your menu categories (e.g. Starters, Drinks)"
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.MenuSectionsAdd)}>
          <Plus className="w-5 h-5 mr-2" /> Add Section
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filtered.length === 0}
      renderControls={
         <div className="w-full">
            <AnatomySearchBar 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search sections by name..." 
            />
         </div>
      }
      emptyLabel="No sections found. Create one to get started."
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
  return (
    <div className="bg-background-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
       
       {/* HEADER: Icon & Name */}
       <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
             <NotebookPen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
             <AnatomyText.H3 className="text-base mb-1 truncate" title={section.name}>
                {section.name}
             </AnatomyText.H3>
             
             {/* Use AnatomyTag for Order info */}
             <AnatomyTag variant="default">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                Order: {section.sortOrder}
             </AnatomyTag>
          </div>
       </div>

       {/* BODY: Quick Status Select */}
       <div className="mt-auto space-y-4">
          
          <div className="pt-4 border-t border-border">
             {/* Using AnatomySelect for Quick Action */}
             {/* We wrap it to give it a smaller label feel inside the card */}
             <AnatomySelect
                label="Visibility Status"
                value={section.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="mb-0" 
             >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="suspended">Suspendida</option>
             </AnatomySelect>
          </div>

          {/* Actions */}
          <AnatomyButton 
            variant="secondary" 
            fullWidth
            onClick={onEdit} 
            className="text-xs"
          >
             <Edit className="w-4 h-4 mr-2" /> Edit
          </AnatomyButton>
       </div>
    </div>
  );
};

export default MenuSectionsPage;