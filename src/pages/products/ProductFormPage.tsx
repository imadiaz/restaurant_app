import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Save,
  Plus,
  GripVertical,
  Trash2,
  CircleDot,
  CheckSquare,
  Clock,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextArea from "../../components/anatomy/AnatomyTextArea";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import { ImageUploadInput } from "../../components/common/ImageUploadInput";
import BasePageLayout from "../../components/layout/BaseLayout";
import { FILES_PATHS, useImagesUpload } from "../../hooks/images/use.images.upload";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useProducts } from "../../hooks/products/use.products";
import { useMenuSections } from "../../hooks/restaurants/use.menu.section";
import { useAppStore } from "../../store/app.store";
import AnatomyCheckbox from "../../components/anatomy/AnatomyCheckBox";
import AnatomySwitcher from "../../components/anatomy/AnatomySwitcher";
import type {
   CreateModifierGroup,
  CreateModifierOption,
  CreateProductDto,
} from "../../service/products.service";
import { useToastStore } from "../../store/toast.store";
import AnatomyMultiSelect from "../../components/anatomy/AnatomyMultiSelect";


const ProductFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { activeRestaurant } = useAppStore();
  const addToast = useToastStore((s) => s.addToast);

  // Hooks
  const {
    createProduct,
    updateProduct,
    getProductById,
    isLoading,
    isCreating,
    isUpdating
  } = useProducts();
  const { sections } = useMenuSections();
  const { uploadFile, isUploading } = useImagesUpload();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [prepMin, setPrepMin] = useState<number>(10);
  const [prepMax, setPrepMax] = useState<number>(15);
  const [menuSectionIds, setMenuSectionIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modifierGroups, setModifierGroups] = useState<CreateModifierGroup[]>([]);
  const [isImageUploaded, setIsImageUploaded] = useState<Boolean>(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (isEditMode && id && !hasLoaded.current) {
      const load = async () => {
        const data = await getProductById(id);
        if (data) {
          setName(data.name);
          setDescription(data.description ?? "");
          setPrice(data.price.toString());
          setPrepMin(data.prepTimeMin ?? 0);
          setPrepMax(data.prepTimeMax ?? 0);

          setImagePreview(data.imageUrl || null);
          if (data.imageUrl) {
            setIsImageUploaded(true);
          }
          
          if (data.menuSections && data.menuSections.length > 0) {
            setMenuSectionIds(data.menuSections.map((e) => e.id));
          }

          setModifierGroups(data.modifierGroups as any[] || []);
          hasLoaded.current = true;
        }
      };
      load();
    }
  }, [id, isEditMode, getProductById]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "GROUP") {
      const newGroups = Array.from(modifierGroups);
      const [moved] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, moved);
      setModifierGroups(newGroups);
    } else if (type === "OPTION") {
      const sourceGroupIdx = modifierGroups.findIndex((g) => g.id === source.droppableId);
      const destGroupIdx = modifierGroups.findIndex((g) => g.id === destination.droppableId);
      if (sourceGroupIdx === -1 || destGroupIdx === -1) return;

      const newGroups = [...modifierGroups];
      const sourceGroup = newGroups[sourceGroupIdx];
      const destGroup = newGroups[destGroupIdx];
      const [movedOption] = sourceGroup.options.splice(source.index, 1);
      destGroup.options.splice(destination.index, 0, movedOption);
      setModifierGroups(newGroups);
    }
  };

  const addGroup = () => {
    const newGroup: CreateModifierGroup = {
      id: `new-group-${Date.now()}`,
      name: "",
      minSelected: 1,
      maxSelected: 1,
      isRequired: true,
      options: [],
    };
    setModifierGroups([...modifierGroups, newGroup]);
  };

  const removeGroup = (idx: number) => {
    const newGroups = [...modifierGroups];
    newGroups.splice(idx, 1);
    setModifierGroups(newGroups);
  };

  const updateGroup = (idx: number, field: keyof CreateModifierGroup, val: any) => {
    const newGroups = [...modifierGroups];
    newGroups[idx] = { ...newGroups[idx], [field]: val };
    setModifierGroups(newGroups);
  };

  const toggleGroupType = (idx: number, type: string) => {
    const newGroups = [...modifierGroups];
    const group = newGroups[idx];
    if (type === "single") {
      group.minSelected = 1;
      group.maxSelected = 1;
      group.isRequired = true;
    } else {
      group.minSelected = 0;
      group.maxSelected = Math.max(group.options.length || 3, 5);
      group.isRequired = false;
    }
    setModifierGroups(newGroups);
  };

  const toggleMultiRequired = (idx: number, isRequired: boolean) => {
    const newGroups = [...modifierGroups];
    newGroups[idx].isRequired = isRequired;
    newGroups[idx].minSelected = isRequired ? 1 : 0;
    setModifierGroups(newGroups);
  };

  const addOption = (groupIdx: number) => {
    const newGroups = [...modifierGroups];
    newGroups[groupIdx].options.push({
      id: `new-opt-${Date.now()}`,
      name: "",
      price: 0,
      isAvailable: true,
    });
    setModifierGroups(newGroups);
  };

  const updateOption = (groupIdx: number, optIdx: number, field: keyof CreateModifierOption, val: any) => {
    const newGroups = [...modifierGroups];
    newGroups[groupIdx].options[optIdx] = {
      ...newGroups[groupIdx].options[optIdx],
      [field]: val,
    };
    setModifierGroups(newGroups);
  };

  const removeOption = (groupIdx: number, optIdx: number) => {
    const newGroups = [...modifierGroups];
    newGroups[groupIdx].options.splice(optIdx, 1);
    setModifierGroups(newGroups);
  };

  const handleSave = async () => {
    if (!name || !price || menuSectionIds.length === 0 || (!imageFile && !imagePreview)) {
      addToast(t("Name, Price, Category and Image are required"), "error");
      return;
    }
    if (!activeRestaurant) return;

    let finalUrl = imagePreview || "";
    if (imageFile && !isImageUploaded) {
      const url = await uploadFile(imageFile,FILES_PATHS.Products(activeRestaurant.id));
      if (url) {
        finalUrl = url;
        setImagePreview(url);
        setIsImageUploaded(true);
      }
    }

    const cleanedModifiers = modifierGroups.map((g) => ({
      ...g,
      id: g.id?.startsWith("new-") ? undefined : g.id,
      minSelected: Number(g.minSelected),
      maxSelected: Number(g.maxSelected),
      options: g.options.map((o: any) => ({
        ...o,
        id: o.id?.startsWith("new-") ? undefined : o.id,
        price: Number(o.price),
      })),
    }));

    const payload: CreateProductDto = {
      restaurantId: activeRestaurant.id,
      name,
      description,
      price: Number(price),
      imageUrl: finalUrl,
      prepTimeMin: prepMin,
      prepTimeMax: prepMax,
      menuSectionIds: menuSectionIds, 
      modifierGroups: cleanedModifiers,
    };

    try {
        console.log("Payload", payload);
      if (isEditMode && id) {
        await updateProduct({ id, data: payload });
      } else {
        await createProduct(payload);
      }
     goBack();
    } catch (e) {
      console.log(e);
    }
  };

  const categoryOptions = sections.map(s => ({ value: s.id, label: s.name }));
  const isButtonLoading = isUploading || isLoading || isCreating || isUpdating;

  return (
    <BasePageLayout
      title={isEditMode ? t("products.title_edit") : t("products.title_add")}
      subtitle={t("products.subtitle_add")}
      showNavBack
      isLoading={isLoading}
      headerActions={
        <div className="flex gap-2">
          <AnatomyButton
            onClick={handleSave}
            disabled={isButtonLoading}
            isLoading={isButtonLoading}
          >
            {isButtonLoading ? t("common.loading") : <><Save className="w-4 h-4 mr-2" /> {t("common.save")}</>}
          </AnatomyButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-card p-6 rounded-3xl border border-border space-y-6 shadow-sm">
            <AnatomyText.H3>{t("products.basic_info")}</AnatomyText.H3>

            <AnatomyTextField
              label={t("products.dish_name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Imperial Teppanyaki"
            />
            <AnatomyTextArea
              label={t("products.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <AnatomyMultiSelect
                label={t("products.category")}
                options={categoryOptions}
                value={menuSectionIds}
                onChange={setMenuSectionIds}
                placeholder={t("products.select_categories")}
              />

              <AnatomyTextField
                label={t("products.base_price")}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnatomyTextField
                label={t("products.prep_min_time")}
                type="number"
                value={prepMin}
                onChange={(e) => setPrepMin(Number(e.target.value))}
                placeholder="e.g. 15"
                icon={<Clock className="w-4 h-4 text-text-muted" />}
              />
              <AnatomyTextField
                label={t("products.prep_max_time")}
                type="number"
                value={prepMax}
                onChange={(e) => setPrepMax(Number(e.target.value))}
                placeholder="e.g. 20"
                icon={<Clock className="w-4 h-4 text-text-muted" />} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <AnatomyText.H3>{t("products.modifiers")}</AnatomyText.H3>
              <AnatomyButton
                variant="ghost"
                onClick={addGroup}
                className="text-primary"
              >
                <Plus className="w-4 h-4 mr-2" /> {t("products.add_group")}
              </AnatomyButton>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="groups-root" type="GROUP">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {modifierGroups.map((group, idx) => {
                      const isSingle = group.minSelected === 1 && group.maxSelected === 1;

                      return (
                        <Draggable
                          key={group.id || `g-${idx}`}
                          draggableId={group.id || `g-${idx}`}
                          index={idx}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-background-card p-5 rounded-2xl border border-border relative group"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="absolute left-4 top-6 text-text-muted cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              <div className="pl-8 pr-8 grid grid-cols-1 gap-4 mb-4">
                                <AnatomyTextField
                                  label={t("products.group_name")}
                                  placeholder="e.g. Sauces, Choice of Size"
                                  value={group.name}
                                  onChange={(e) => updateGroup(idx, "name", e.target.value)}
                                />

                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl">
                                  <div className="w-full sm:w-auto">
                                    <AnatomySwitcher
                                      value={isSingle ? "single" : "multi"}
                                      onChange={(val) => toggleGroupType(idx, val)}
                                      options={[
                                        { value: "single", label: t('common.single'), icon: <CircleDot className="w-3 h-3" /> },
                                        { value: "multi", label: t('common.multi'), icon: <CheckSquare className="w-3 h-3" /> },
                                      ]}
                                    />
                                  </div>

                                   <AnatomyText.Small className="text-text-muted italic px-2">
                                     {isSingle ? t('products.single_opt_help') : t('products.multi_opt_help')}
                                    </AnatomyText.Small>
                                </div>

                                {!isSingle && (
                                    <div className="flex flex-row vertical-align gap-4 animate-in fade-in slide-in-from-left-2 w-full sm:w-auto mb-8">
                                      <AnatomyCheckbox
                                        label="Required?"
                                        checked={group.isRequired}
                                        onChange={(val) => toggleMultiRequired(idx, val)}
                                      />
                                      <AnatomyTextField
                                          type="number"
                                          label={t('products.max_help')}
                                          size="sm"
                                          value={group.maxSelected}
                                          onChange={(e) => updateGroup(idx, "maxSelected", Number(e.target.value))}
                                        />
                                      
                                    </div>
                                  )}
                              </div>

                              <button
                                onClick={() => removeGroup(idx)}
                                className="absolute right-4 top-6 text-text-muted hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>

                              <Droppable droppableId={group.id || `g-${idx}`} type="OPTION">
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-2 ml-8 border border-border/50"
                                  >
                                    <AnatomyText.Label className="mb-2 block text-xs">
                                      {t("products.options_list")}
                                    </AnatomyText.Label>
                                    {group.options.map((opt: any, optIdx: number) => (
                                      <Draggable
                                        key={opt.id || `o-${idx}-${optIdx}`}
                                        draggableId={opt.id || `o-${idx}-${optIdx}`}
                                        index={optIdx}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex gap-2 items-center bg-background-card p-2 rounded-lg border border-border shadow-sm focus:outline-none focus:ring-0 outline-none ring-0"
                                          >
                                            <div
                                              {...provided.dragHandleProps}
                                              className="cursor-grab active:cursor-grabbing text-text-muted"
                                            >
                                              <GripVertical className="w-4 h-4" />
                                            </div>

                                            <div className="text-gray-300">
                                              {isSingle ? <CircleDot className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                                            </div>

                                            <div className="flex-1">
                                              <input
                                                placeholder="Option Name"
                                                className="w-full bg-transparent text-sm border-none focus:ring-0 focus:outline-none outline-none p-0 text-text-main placeholder-text-muted"
                                                value={opt.name}
                                                onChange={(e) => updateOption(idx, optIdx, "name", e.target.value)}
                                              />
                                            </div>

                                            <div className="w-28 border-l border-border pl-3 flex flex-col justify-center">
                                              <div className="flex items-center gap-1">
                                                <span className="text-text-muted text-sm font-medium">$</span>
                                                <input
                                                  title="price"
                                                  type="number"
                                                  placeholder="0.00"
                                                  className="w-full bg-transparent text-sm text-right border-none focus:ring-0 focus:outline-none outline-none p-0 text-text-main"
                                                  value={opt.price}
                                                  onChange={(e) => updateOption(idx, optIdx, "price", e.target.value)}
                                                />
                                              </div>
                                              <AnatomyText.Label className="text-[10px] text-text-muted text-right leading-none mt-0.5">
                                                {t('products.extra_price')}
                                              </AnatomyText.Label>
                                            </div>

                                            <button
                                              onClick={() => removeOption(idx, optIdx)}
                                              className="text-text-muted hover:text-red-500 p-1"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    <button
                                      onClick={() => addOption(idx)}
                                      className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-primary text-xs font-bold flex items-center justify-center mt-2 hover:bg-primary/5 transition-colors"
                                    >
                                      <Plus className="w-3 h-3 mr-1" /> {t("products.add_option")}
                                    </button>
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div className="space-y-6">
          <ImageUploadInput
            initialPreview={imagePreview}
            onFileSelect={(f) => {
              setImageFile(f);
              setIsImageUploaded(false);
            }}
          />
        </div>
      </div>
    </BasePageLayout>
  );
};

export default ProductFormPage;