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
  Lock,
  Package,
  PackageSearch,
  Type,
  BookSearch,
  Pencil,
  Copy,
  X,
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
import {
  FILES_PATHS,
  useImagesUpload,
} from "../../hooks/images/use.images.upload";
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
import { useModifiers } from "../../hooks/modifiers/use.modifiers";
import ProductPickerModal from "./components/ProductPickerModal";
import type { Product } from "../../data/models/products/product";
import { Routes } from "../../config/routes";


const ProductFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { activeRestaurant } = useAppStore();
  const addToast = useToastStore((s) => s.addToast);

  // --- Hooks ---
  const {
    createProduct,
    updateProduct,
    getProductById,
    isLoading,
    isCreating,
    isUpdating,
    products: allProducts,
  } = useProducts();

  const { sections } = useMenuSections();
  const { uploadFile, isUploading } = useImagesUpload();
  const { modifiers: availableModifiers } = useModifiers();
const {navigateTo} = useAppNavigation();
  // --- Local State ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [prepMin, setPrepMin] = useState<number>(10);
  const [prepMax, setPrepMax] = useState<number>(15);
  const [menuSectionIds, setMenuSectionIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUploaded, setIsImageUploaded] = useState<Boolean>(false);
  const [requirePrepTime, setRequirePrepTime] = useState<boolean>(true);
  // Modifiers State
  const [modifierGroups, setModifierGroups] = useState<CreateModifierGroup[]>(
    [],
  );
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>("");

  // Product Picker State
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

  // UX State for "Detach Warning"
  // We store the index of the group currently showing the warning banner
  const [detachWarningIdx, setDetachWarningIdx] = useState<number | null>(null);

  const hasLoaded = useRef(false);

  // --- Load Data on Edit ---
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

          setModifierGroups((data.modifierGroups as any[]) || []);
          hasLoaded.current = true;
        }
      };
      load();
    }
  }, [id, isEditMode, getProductById]);

  // --- Helper: Check if Group is Linked ---
  const isGroupLinked = (group: CreateModifierGroup): boolean => {
    if (!group.id) return false;
    return !group.id.toString().startsWith("new-");
  };

  // --- Drag and Drop ---
  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "GROUP") {
      const newGroups = Array.from(modifierGroups);
      const [moved] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, moved);
      setModifierGroups(newGroups);
    } else if (type === "OPTION") {
      const sourceGroupIdx = modifierGroups.findIndex(
        (g) => g.id === source.droppableId,
      );
      const destGroupIdx = modifierGroups.findIndex(
        (g) => g.id === destination.droppableId,
      );

      if (sourceGroupIdx === -1 || destGroupIdx === -1) return;

      // Prevent dragging if source or dest is linked
      if (
        isGroupLinked(modifierGroups[sourceGroupIdx]) ||
        isGroupLinked(modifierGroups[destGroupIdx])
      ) {
        addToast(t("products.cannot_edit_linked_options"), "warning");
        return;
      }

      const newGroups = [...modifierGroups];
      const sourceGroup = {
        ...newGroups[sourceGroupIdx],
        options: [...newGroups[sourceGroupIdx].options],
      };
      const destGroup = {
        ...newGroups[destGroupIdx],
        options: [...newGroups[destGroupIdx].options],
      };

      const [movedOption] = sourceGroup.options.splice(source.index, 1);
      destGroup.options.splice(destination.index, 0, movedOption);

      newGroups[sourceGroupIdx] = sourceGroup;
      newGroups[destGroupIdx] = destGroup;
      setModifierGroups(newGroups);
    }
  };

  // --- Actions ---
  const addNewGroup = () => {
    setModifierGroups([
      ...modifierGroups,
      {
        id: `new-group-${Date.now()}`,
        name: "",
        minSelected: 0,
        maxSelected: 1,
        isRequired: false,
        options: [],
      } as any,
    ]);
  };

  const addGroupFromLibrary = () => {
    if (!selectedLibraryId) return;
    const found = availableModifiers.find(
      (m: any) => m.id === selectedLibraryId,
    );
    if (found) {
      setModifierGroups([...modifierGroups, found]);
      setSelectedLibraryId("");
      addToast(t("products.group_linked"), "success");
    }
  };

  const removeGroup = (idx: number) => {
    const newGroups = [...modifierGroups];
    newGroups.splice(idx, 1);
    setModifierGroups(newGroups);
    if (detachWarningIdx === idx) setDetachWarningIdx(null);
  };

  // --- DETACH LOGIC ---
  const confirmDetachGroup = (idx: number) => {
    const newGroups = [...modifierGroups];
    // 1. Generate new temp ID
    const newId = `new-group-${Date.now()}`;

    const originalGroup = newGroups[idx];
    
    newGroups[idx] = { 
      ...originalGroup, 
      id: newId,
      name: `${originalGroup.name} (Copy)`,
      options: originalGroup.options.map(opt => ({
          ...opt,
          id: `new-opt-${Date.now()}-${Math.random()}`,
      }))
  };

    setModifierGroups(newGroups);
    setDetachWarningIdx(null); // Close warning
    addToast(t("products.group_detached_success"), "success");
  };

  const cancelDetach = () => {
    setDetachWarningIdx(null);
  };

  // --- Group Updates ---
  const updateGroup = (
    idx: number,
    field: keyof CreateModifierGroup,
    val: any,
  ) => {
    if (isGroupLinked(modifierGroups[idx])) return;
    const newGroups = [...modifierGroups];
    newGroups[idx] = { ...newGroups[idx], [field]: val };
    setModifierGroups(newGroups);
  };

  const toggleGroupType = (idx: number, type: string) => {
    if (isGroupLinked(modifierGroups[idx])) return;
    const newGroups = [...modifierGroups];
    const group = { ...newGroups[idx] };
    if (type === "single") {
      group.minSelected = 1;
      group.maxSelected = 1;
      group.isRequired = true;
    } else {
      group.minSelected = 0;
      group.maxSelected = Math.max(group.options.length || 3, 5);
      group.isRequired = false;
    }
    newGroups[idx] = group;
    setModifierGroups(newGroups);
  };

  const toggleMultiRequired = (idx: number, isRequired: boolean) => {
    if (isGroupLinked(modifierGroups[idx])) return;
    const newGroups = [...modifierGroups];
    const group = { ...newGroups[idx] };
    group.isRequired = isRequired;
    group.minSelected = isRequired ? 1 : 0;
    newGroups[idx] = group;
    setModifierGroups(newGroups);
  };

  // --- Option Actions ---

  const addTextOption = (groupIdx: number) => {
    if (isGroupLinked(modifierGroups[groupIdx])) return;
    const newGroups = [...modifierGroups];
    const group = { ...newGroups[groupIdx] };
    group.options = [
      ...group.options,
      {
        id: `new-opt-${Date.now()}`,
        name: "",
        price: 0,
        maxQuantity: 1,
        isAvailable: true,
        productId: undefined, 
      },
    ];
    newGroups[groupIdx] = group;
    setModifierGroups(newGroups);
  };

  const openProductPicker = (groupIdx: number) => {
    if (isGroupLinked(modifierGroups[groupIdx])) return;
    setActiveGroupIndex(groupIdx);
    setProductPickerOpen(true);
  };

  const handleProductSelect = (product: Product) => {
    if (activeGroupIndex === null) return;

    const newGroups = [...modifierGroups];
    const group = { ...newGroups[activeGroupIndex] };

    const alreadyExists = group.options.some(
      (opt) => opt.productId === product.id,
    );

    if (alreadyExists) {
      addToast(t("products.product_already_added"), "warning");
      return;
    }

    group.options = [
      ...group.options,
      {
        id: `new-opt-${Date.now()}`,
        name: product.name,
        price: product.price ?? 0,
        maxQuantity: 1,
        isAvailable: true,
        productId: product.id,
        imageUrl: product.imageUrl,
      },
    ];

    newGroups[activeGroupIndex] = group;
    setModifierGroups(newGroups);
    setProductPickerOpen(false);
    setActiveGroupIndex(null);
  };

  const updateOption = (
    groupIdx: number,
    optIdx: number,
    field: keyof CreateModifierOption,
    val: any,
  ) => {
    if (isGroupLinked(modifierGroups[groupIdx])) return;
    const newGroups = [...modifierGroups];
    const group = { ...newGroups[groupIdx] };
    const newOptions = [...group.options];
    newOptions[optIdx] = { ...newOptions[optIdx], [field]: val };
    group.options = newOptions;
    newGroups[groupIdx] = group;
    setModifierGroups(newGroups);
  };

  const removeOption = (groupIdx: number, optIdx: number) => {
    if (isGroupLinked(modifierGroups[groupIdx])) return;
    const newGroups = [...modifierGroups];
    const group = { ...newGroups[groupIdx] };
    const newOptions = [...group.options];
    newOptions.splice(optIdx, 1);
    group.options = newOptions;
    newGroups[groupIdx] = group;
    setModifierGroups(newGroups);
  };

  const handleSave = async () => {
    if (!name || !price || menuSectionIds.length === 0) {
      addToast(t("Name, Price, Category are required"), "error");
      return;
    }
    if (!activeRestaurant) return;

    let finalUrl = imagePreview || "";
    if (imageFile && !isImageUploaded) {
      const url = await uploadFile(
        imageFile,
        FILES_PATHS.Products(activeRestaurant.id),
      );
      if (url) {
        finalUrl = url;
        setIsImageUploaded(true);
      }
    }

    const cleanedModifiers = modifierGroups.map((g) => {
      if (isGroupLinked(g)) {
        return { id: g.id };
      }
      return {
        id: undefined,
        minSelected: Number(g.minSelected || 0),
        maxSelected: Number(g.maxSelected || 1),
        name: g.name,
        isRequired: g.isRequired,
        options: g.options.map((o: any) => ({
          id: o.id?.startsWith("new-") ? undefined : o.id,
          name: o.name,
          price: Number(o.price),
          maxQuantity: Number(o.maxQuantity || 1),
          isAvailable: o.isAvailable,
          productId: o.productId,
        })),
      };
    });

    const payload: CreateProductDto = {
      restaurantId: activeRestaurant.id,
      name,
      description,
      price: Number(price),
      imageUrl: finalUrl,
      prepTimeMin: prepMin,
      prepTimeMax: prepMax,
      menuSectionIds: menuSectionIds,
      modifierGroups: cleanedModifiers as any,
    };

    console.log(payload);
    try {
      if (isEditMode && id) {
        await updateProduct({ id, data: payload });
      } else {
        await createProduct(payload);
      }
      goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const categoryOptions = sections.map((s) => ({ value: s.id, label: s.name }));
  const isButtonLoading = isUploading || isLoading || isCreating || isUpdating;

  return (
    <BasePageLayout
      title={isEditMode ? t("products.title_edit") : t("products.title_add")}
      subtitle={t("products.subtitle_add")}
      showNavBack
      isLoading={isLoading}
      headerActions={
        <AnatomyButton
          onClick={handleSave}
          disabled={isButtonLoading}
          isLoading={isButtonLoading}
        >
          {isButtonLoading ? (
            t("common.loading")
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> {t("common.save")}
            </>
          )}
        </AnatomyButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Info */}
          <div className="bg-background-card p-6 rounded-3xl border border-border space-y-6 shadow-sm">
            <AnatomyText.H3>{t("products.basic_info")}</AnatomyText.H3>
            <AnatomyTextField
              label={t("products.dish_name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AnatomyTextArea
              label={t("products.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnatomyMultiSelect
                label={t("products.category")}
                options={categoryOptions}
                value={menuSectionIds}
                onChange={setMenuSectionIds}
              />
              <AnatomyTextField
                label={t("products.base_price")}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <AnatomyCheckbox label="Require preparation time?" checked={requirePrepTime} onChange={(value) => {
                setRequirePrepTime(value);
                setPrepMin(value ? 10 : 0);
                setPrepMax(value ? 15: 0)
              }} />
            </div>
            {requirePrepTime && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnatomyTextField
                label={t("products.prep_min_time")}
                type="number"
                value={prepMin}
                onChange={(e) => setPrepMin(Number(e.target.value))}
              />
              <AnatomyTextField
                label={t("products.prep_max_time")}
                type="number"
                value={prepMax}
                onChange={(e) => setPrepMax(Number(e.target.value))}
              />
            </div>}
          </div>

          {/* 2. Modifiers Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
                <AnatomyText.H3>{t("products.modifiers")}</AnatomyText.H3>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              
              <div className="flex gap-2">
                {availableModifiers.length > 0 && (
                  <div className="flex gap-2">
                    <div className="w-56">
                      <AnatomySelect
                        value={selectedLibraryId}
                        onChange={(e) => setSelectedLibraryId(e.target.value)}
                        className="w-full"
                      >
                        <option value="">
                          {t("products.select_from_library")}
                        </option>
                        {availableModifiers.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </AnatomySelect>
                    </div>
                    <AnatomyButton
                      variant="primary"
                      onClick={addGroupFromLibrary}
                      disabled={!selectedLibraryId}
                      
                    >
                      <BookSearch className="w-4 h-4" /> {t('products.add_modifier')}
                    </AnatomyButton>
                  </div>
                )}
                <AnatomyButton
                  variant="ghost"
                  onClick={addNewGroup}
                  className="text-primary"
                >
                  <Plus className="w-4 h-4 mr-2" /> {t("products.add_group")}
                </AnatomyButton>
              </div>
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
                      const isLinked = isGroupLinked(group);
                      const isSingle =
                        group.minSelected === 1 && group.maxSelected === 1;
                      const showWarning = detachWarningIdx === idx;

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
                              className={`bg-background-card p-5 rounded-2xl border ${isLinked ? "border-primary/40 bg-primary/5" : "border-border"} relative group transition-all`}
                            >
                                {isLinked && (
                                    <>
                                        <div className="absolute top-0 right-32 bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-b-md flex items-center gap-1 z-10">
                                            <Lock className="w-3 h-3" /> {t("products.linked_group")}
                                        </div>
                                        
                                        <button 
                                            onClick={() => setDetachWarningIdx(idx)}
                                            className="absolute top-2 right-2  text-primary hover:text-primary-dark p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all z-20 border border-primary/20"
                                            title={t("products.edit_detach_group")}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                {showWarning && (
                                    <div className="absolute inset-0 z-30 bg-background-card/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 border-2 border-amber-400">
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 text-amber-600">
                                            <Copy className="w-6 h-6" />
                                        </div>
                                        <AnatomyText.H3 className="mb-2">{t("products.detach_title")}</AnatomyText.H3>
                                        <p className="text-sm text-text-muted mb-6 max-w-md">
                                            {t("products.detach_description")}
                                        </p>

                                          <AnatomyButton className="mb-4 mt-4 hover" variant="secondary" onClick={() => navigateTo(Routes.Modifiers)}>
                                                {t('modifiers.update_main_modifier')}
                                            </AnatomyButton>
                                        <div className="flex gap-3">
                                            <AnatomyButton variant="ghost" onClick={cancelDetach}>
                                                {t("common.cancel")}
                                            </AnatomyButton>
                                            <AnatomyButton variant="primary" onClick={() => confirmDetachGroup(idx)}>
                                                {t("products.confirm_detach")}
                                            </AnatomyButton>
                                        </div>
                                        <button onClick={cancelDetach} className="absolute top-4 right-4 text-text-muted hover:text-text-main">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}


                              <div
                                {...provided.dragHandleProps}
                                className="absolute left-4 top-6 text-text-muted cursor-grab active:cursor-grabbing hover:text-text-main"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              <div
                                className={`pl-8 pr-8 grid grid-cols-1 gap-4 mb-4 ${isLinked ? "opacity-70 pointer-events-none" : ""}`}
                              >
                                <AnatomyTextField
                                  label={t("products.group_name")}
                                  value={group.name}
                                  onChange={(e) =>
                                    updateGroup(idx, "name", e.target.value)
                                  }
                                  disabled={isLinked}
                                />
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl">
                                  <div className="w-full sm:w-auto">
                                    <AnatomySwitcher
                                      value={isSingle ? "single" : "multi"}
                                      onChange={(val) =>
                                        toggleGroupType(idx, val)
                                      }
                                      disabled={isLinked}
                                      options={[
                                        {
                                          value: "single",
                                          label: t("common.single"),
                                          icon: (
                                            <CircleDot className="w-3 h-3" />
                                          ),
                                        },
                                        {
                                          value: "multi",
                                          label: t("common.multi"),
                                          icon: (
                                            <CheckSquare className="w-3 h-3" />
                                          ),
                                        },
                                      ]}
                                    />
                                  </div>
                                  <AnatomyText.Small className="text-text-muted italic px-2">
                                    {isSingle
                                      ? t("products.single_opt_help")
                                      : t("products.multi_opt_help")}
                                  </AnatomyText.Small>
                                </div>
                                {!isSingle && (
                                  <div className="flex flex-row gap-4 mb-2">
                                    <AnatomyCheckbox
                                      label="Required?"
                                      checked={group.isRequired}
                                      onChange={(val) =>
                                        toggleMultiRequired(idx, val)
                                      }
                                      disabled={isLinked}
                                    />
                                    <AnatomyTextField
                                      type="number"
                                      label={t("products.max_help")}
                                      size="sm"
                                      value={group.maxSelected}
                                      onChange={(e) =>
                                        updateGroup(
                                          idx,
                                          "maxSelected",
                                          Number(e.target.value),
                                        )
                                      }
                                      disabled={isLinked}
                                    />
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => removeGroup(idx)}
                                className="absolute top-12 right-2  text-primary hover:text-primary-dark p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all z-20 border border-primary/20"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>

                              {/* Options List */}
                              <Droppable
                                droppableId={group.id || `g-${idx}`}
                                type="OPTION"
                                isDropDisabled={isLinked}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-2 ml-8 border border-border/50 ${isLinked ? 'opacity-70 pointer-events-none' : ''}`}
                                  >
                                    <AnatomyText.Label className="mb-2 block text-xs">
                                      {t("products.options_list")}
                                    </AnatomyText.Label>

                                    {group.options.map(
                                      (opt: any, optIdx: number) => (
                                        <Draggable
                                          key={opt.id || `o-${idx}-${optIdx}`}
                                          draggableId={
                                            opt.id || `o-${idx}-${optIdx}`
                                          }
                                          index={optIdx}
                                          isDragDisabled={isLinked}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`flex gap-2 items-center bg-background-card p-2 rounded-lg border shadow-sm ${isLinked ? "border-transparent opacity-70" : "border-border"}`}
                                            >
                                              <div
                                                {...provided.dragHandleProps}
                                                className={`text-text-muted ${isLinked ? "cursor-not-allowed opacity-50" : "cursor-grab"}`}
                                              >
                                                <GripVertical className="w-4 h-4" />
                                              </div>

                                              {/* Icon Indicator: Product vs Text */}
                                              <div className="text-gray-400">
                                                {opt.productId ? (
                                                  opt.imageUrl || opt?.linkedProduct?.imageUrl ? (
                                                    <img
                                                      src={opt.imageUrl || opt?.linkedProduct?.imageUrl}
                                                      alt={opt.name}
                                                      className="w-8 h-8 rounded-md object-cover border border-border"
                                                    />
                                                  ) : (
                                                    <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                                      <Package className="w-4 h-4" />
                                                    </div>
                                                  )
                                                ) : isSingle ? (
                                                  <CircleDot className="w-4 h-4" />
                                                ) : (
                                                  <CheckSquare className="w-4 h-4" />
                                                )}
                                              </div>

                                              <div className="flex-1">
                                                <input
                                                  placeholder="Option Name"
                                                  className="w-full bg-transparent text-sm border-none focus:ring-0 outline-none p-0 text-text-main"
                                                  value={opt.name}
                                                  onChange={(e) =>
                                                    updateOption(
                                                      idx,
                                                      optIdx,
                                                      "name",
                                                      e.target.value,
                                                    )
                                                  }
                                                  disabled={isLinked}
                                                />
                                              </div>

                                              {/* Max Quantity */}
                                              <div className="w-16 border-l border-border pl-2 flex flex-col justify-center">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-text-muted text-[10px] font-bold">
                                                    x
                                                  </span>
                                                  <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full bg-transparent text-sm font-medium border-none focus:ring-0 outline-none p-0 text-text-main"
                                                    value={opt.maxQuantity || 1}
                                                    onChange={(e) =>
                                                      updateOption(
                                                        idx,
                                                        optIdx,
                                                        "maxQuantity",
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    disabled={isLinked}
                                                  />
                                                </div>
                                                <AnatomyText.Label className="text-[9px] text-text-muted leading-none mt-0.5">
                                                  {t("products.max_quantity")}
                                                </AnatomyText.Label>
                                              </div>

                                              {/* Price */}
                                              <div className="w-24 border-l border-border pl-2 flex flex-col justify-center">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-text-muted text-sm font-medium">
                                                    $
                                                  </span>
                                                  <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full bg-transparent text-sm text-right border-none focus:ring-0 outline-none p-0 text-text-main"
                                                    value={opt.price}
                                                    onChange={(e) =>
                                                      updateOption(
                                                        idx,
                                                        optIdx,
                                                        "price",
                                                        e.target.value,
                                                      )
                                                    }
                                                    disabled={isLinked}
                                                  />
                                                </div>
                                                <AnatomyText.Label className="text-[9px] text-text-muted text-right leading-none mt-0.5">
                                                  {t("products.extra_price")}
                                                </AnatomyText.Label>
                                              </div>

                                              {!isLinked && (
                                                <button
                                                  onClick={() =>
                                                    removeOption(idx, optIdx)
                                                  }
                                                  className="text-text-muted hover:text-red-500 p-1"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </Draggable>
                                      ),
                                    )}
                                    {provided.placeholder}

                                    {/* Action Buttons */}
                                    {!isLinked && (
                                      <div className="flex gap-2 pt-2">
                                        <button
                                          onClick={() => addTextOption(idx)}
                                          className="flex-1 py-2 border border-dashed border-primary/30 bg-primary/5 rounded-lg text-primary text-xs font-bold flex items-center justify-center hover:bg-primary/10 transition-colors"
                                        >
                                          <Type className="w-3 h-3 mr-2" />{" "}
                                          {t("products.add_text_option")}
                                        </button>

                                        <button
                                          onClick={() => openProductPicker(idx)}
                                          className="flex-1 py-2 border border-dashed border-purple-500/30 bg-purple-500/5 rounded-lg text-purple-600 text-xs font-bold flex items-center justify-center hover:bg-purple-500/10 transition-colors"
                                        >
                                          <PackageSearch className="w-3 h-3 mr-2" />{" "}
                                          {t("products.add_product_option")}
                                        </button>
                                      </div>
                                    )}
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

        {/* RIGHT COLUMN */}
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

      {/* Product Modal */}
      <ProductPickerModal
        isOpen={productPickerOpen}
        onClose={() => setProductPickerOpen(false)}
        products={allProducts}
        onSelect={handleProductSelect}
      />
    </BasePageLayout>
  );
};

export default ProductFormPage;