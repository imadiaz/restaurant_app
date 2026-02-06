import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Save, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnatomyButton from '../../../components/anatomy/AnatomyButton';
import AnatomyTextField from '../../../components/anatomy/AnatomyTextField';
import AnatomyText from '../../../components/anatomy/AnatomyText';
import { useCategories } from '../../../hooks/category/use.category';
import { useRestaurants } from '../../../hooks/restaurants/use.restaurant';
import type { Category } from '../../../service/category.service';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  initialSelectedIds: string[];
  onSuccess?: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  initialSelectedIds,
  onSuccess
}) => {
  const { t } = useTranslation();
  
  const { categories: allCategories, isLoading: isLoadingCats } = useCategories();
  const { updateCategories, isUpdating } = useRestaurants();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
      setSearchTerm('');
    }
  }, [isOpen, initialSelectedIds]);

  const selectedCategories = useMemo(() => {
    return allCategories.filter(c => selectedIds.includes(c.id));
  }, [allCategories, selectedIds]);

  const availableCategories = useMemo(() => {
    return allCategories
      .filter(c => !selectedIds.includes(c.id)) 
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allCategories, selectedIds, searchTerm]);

  const handleAdd = (id: string) => {
    setSelectedIds(prev => [...prev, id]);
  };

  const handleRemove = (id: string) => {
    setSelectedIds(prev => prev.filter(cId => cId !== id));
  };

  const handleSave = async () => {
    try {
      await updateCategories({ restaurantId, categoryIds: selectedIds });
      onSuccess?.();
      onClose();
    } catch (error) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <AnatomyText.H3 className="text-lg">{t('categories.manage_title')}</AnatomyText.H3>
            <AnatomyText.Small className="text-text-muted">
              {t('categories.manage_description')}
            </AnatomyText.Small>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div>
             <AnatomyText.Label className="mb-3 block text-primary">
                {t('categories.section_selected')} ({selectedIds.length})
             </AnatomyText.Label>
             
             {selectedIds.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-gray-300 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                   <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                   <AnatomyText.Small className="text-gray-400">
                      {t('categories.no_selection')}
                   </AnatomyText.Small>
                </div>
             ) : (
                <div className="flex flex-wrap gap-3">
                   {selectedCategories.map(cat => (
                      <div key={cat.id} className="animate-in fade-in zoom-in duration-200">
                         <CategoryChip 
                            category={cat} 
                            onRemove={() => handleRemove(cat.id)} 
                            isRemovable 
                         />
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div className="h-px bg-border" />
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <AnatomyText.Label>{t('categories.section_available')}</AnatomyText.Label>
             </div>
             
             <AnatomyTextField 
                placeholder={t('categories.search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400"/>}
             />

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {isLoadingCats ? (
                   <p>{t('common.loading')}</p>
                ) : availableCategories.length === 0 ? (
                   <p className="col-span-full text-center text-sm text-gray-400 py-4">
                      {searchTerm ? t('common.no_results') : t('categories.all_selected')}
                   </p>
                ) : (
                   availableCategories.map(cat => (
                      <button
                         key={cat.id}
                         onClick={() => handleAdd(cat.id)}
                         className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group text-left"
                      >
                         <span className="text-xl bg-gray-100 dark:bg-gray-800 w-8 h-8 flex items-center justify-center rounded-lg">
                            {cat.icon || "🍽️"}
                         </span>
                         <span className="text-sm font-medium text-text-primary truncate flex-1">
                            {cat.name}
                         </span>
                         <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                      </button>
                   ))
                )}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-gray-50/50 dark:bg-gray-900/20 shrink-0 flex justify-end gap-3 rounded-b-3xl">
          <AnatomyButton variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </AnatomyButton>
          <AnatomyButton onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? t('common.saving') : <><Save className="w-4 h-4 mr-2"/> {t('common.save')}</>}
          </AnatomyButton>
        </div>

      </div>
    </div>
  );
};

const CategoryChip = ({ category, onRemove, isRemovable }: { category: Category, onRemove?: () => void, isRemovable?: boolean }) => (
   <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full transition-all hover:bg-primary/20">
      <span className="text-lg leading-none">{category.icon || "🍽️"}</span>
      <span className="text-sm font-medium">{category.name}</span>
      {isRemovable && (
         <button 
            onClick={(e) => { e.stopPropagation(); onRemove?.(); }} 
            className="ml-1 p-0.5 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
         >
            <X className="w-3.5 h-3.5" />
         </button>
      )}
   </div>
);

export default ManageCategoriesModal;