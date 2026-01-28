import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FolderOpen, ArrowUpDown, Save, AlertCircle } from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useMenuSections } from "../../hooks/restaurants/use.menu.section";
import type { CreateMenuSectionDto } from "../../service/menu.service";
import { useAppStore } from "../../store/app.store";
import { useToastStore } from "../../store/toast.store";


const MenuSectionFormPage: React.FC = () => {
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { activeRestaurant } = useAppStore();
  const { createSection, updateSection, getSectionById, isCreating, isUpdating } = useMenuSections();
  const addToast = useToastStore((state) => state.addToast);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        try {
          const data = await getSectionById(id);
          if (data) {
            setName(data.name);
            setSortOrder(data.sortOrder || 0);
            hasLoadedData.current = true;
          }
        } catch (error) {
           goBack();
        }
      };
      loadData();
    }
  }, [isEditMode, id, getSectionById, goBack]);

  const handleSave = async () => {
    if (!name.trim()) {
      addToast("Section name is required", "error");
      return;
    }

    if (!activeRestaurant?.id) {
       addToast("System Error: No active restaurant selected context.", "error");
       return;
    }

    try {
      if (isEditMode && id) {
        await updateSection({ 
          id, 
          data: { name, sortOrder: Number(sortOrder) } 
        });
      } else {
        const payload: CreateMenuSectionDto = {
          restaurantId: activeRestaurant.id, // Auto-inject ID
          name,
          sortOrder: Number(sortOrder)
        };
        await createSection(payload);
      }
      goBack();
    } catch (error) {
      console.error(error);
      // Hook might handle error toast, but safe to have fallback
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <BasePageLayout
      title={isEditMode ? "Edit Section" : "New Menu Section"}
      subtitle={isEditMode ? `Editing "${name}"` : "Create a category for your menu items"}
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : <><Save className="w-4 h-4 mr-2"/> Save Section</>}
          </AnatomyButton>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
          {!activeRestaurant && (
           <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                 <AnatomyText.H3 className="!text-red-700 text-sm">Context Error</AnatomyText.H3>
                 <AnatomyText.Body className="!text-red-600 text-xs">
                    You are not inside a specific restaurant dashboard. We cannot create a section without knowing which restaurant it belongs to.
                 </AnatomyText.Body>
              </div>
           </div>
        )}

        <div className="bg-background-card p-8 rounded-3xl shadow-sm border border-border space-y-8">
           

           <div className="grid grid-cols-1 gap-6">
              {/* Name Input */}
              <AnatomyTextField 
                label="Section Name" 
                placeholder="e.g. Starters, Breakfast, Drinks" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                disabled={!activeRestaurant}
              />
              
              {/* Sort Order Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <AnatomyTextField 
                   label="Sort Order" 
                   type="number"
                   value={sortOrder} 
                   onChange={e => setSortOrder(Number(e.target.value))} 
                   icon={<ArrowUpDown className="w-4 h-4 text-text-muted"/>}
                   min={0}
                   disabled={!activeRestaurant}
                 />
                 
                 {/* Helper Text Area */}
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-border">
                    <AnatomyText.Label className="mb-1 block">Pro Tip</AnatomyText.Label>
                    <AnatomyText.Small className="leading-relaxed">
                       Lower numbers appear first (e.g. 0, 1, 2). Use increments of 10 (10, 20, 30) so you can easily insert new sections in between later.
                    </AnatomyText.Small>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </BasePageLayout>
  );
};

export default MenuSectionFormPage;