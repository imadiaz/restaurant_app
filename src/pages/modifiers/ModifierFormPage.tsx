import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Save,
  CircleDot,
  CheckSquare,
  GripVertical,
  Package,
  Trash2,
  Type,
  PackageSearch,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyCheckbox from "../../components/anatomy/AnatomyCheckBox";
import AnatomySwitcher from "../../components/anatomy/AnatomySwitcher";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useModifiers } from "../../hooks/modifiers/use.modifiers";
import { useProducts } from "../../hooks/products/use.products";
import type {
  CreateModifierOption,
  CreateModifierGroup,
} from "../../service/products.service";
import { useAppStore } from "../../store/app.store";
import { useToastStore } from "../../store/toast.store";
import ProductPickerModal from "../products/components/ProductPickerModal";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useConfirm } from "../../hooks/use.confirm.modal";
import type { ModifierOption } from "../../data/models/products/product";

const ModifierFormPage: React.FC = () => {
  const { goBack } = useAppNavigation();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { activeRestaurant } = useAppStore();
  const addToast = useToastStore((s) => s.addToast);
  const { confirm } = useConfirm();
  const {
    createGroup,
    updateGroup,
    modifiers,
    isLoading: isListLoading,
    isCreating,
    isUpdating,
  } = useModifiers();
  const { products: allProducts } = useProducts();
  const [name, setName] = useState("");
  const [minSelection, setMinSelection] = useState(0);
  const [maxSelection, setMaxSelection] = useState(1);
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<CreateModifierOption[]>([]);
  const [isSingle, setIsSingle] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  // Load Data
  useEffect(() => {
    if (isEditMode && modifiers.length > 0) {
      const group = modifiers.find((m) => m.id === id);
      if (group) {
        setName(group.name);
        setMinSelection(group.minSelected);
        setMaxSelection(group.maxSelected);
        setIsRequired(group.minSelected > 0);
        setOptions(group.options.map((value) => mapToCreateOption(value)) || []);
        setIsSingle(group.minSelected === 1 && group.maxSelected === 1);
      }
    }
  }, [id, isEditMode, modifiers]);

  const mapToCreateOption = (option: ModifierOption): CreateModifierOption => {
  return {
    id: option.id,
    name: option.name,
    price: option.price,
    maxQuantity: option.maxQuantity,
    isAvailable: option.isAvailable,
    productId: option.productId,
    imageUrl: option.linkedProduct?.imageUrl, 
  };
};

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOptions(items);
  };

  const handleToggleType = (type: string) => {
    if (type === "single") {
      setIsSingle(true);
      setMinSelection(1);
      setMaxSelection(1);
      setIsRequired(true);
    } else {
      setIsSingle(false);
      setMinSelection(0);
      setMaxSelection(Math.max(options.length || 3, 5));
      setIsRequired(false);
    }
  };

  const handleToggleRequired = (req: boolean) => {
    setIsRequired(req);
    setMinSelection(req ? 1 : 0);
  };

  // Option CRUD
  const addTextOption = () => {
    setOptions([
      ...options,
      {
        id: `temp-${Date.now()}`,
        name: "",
        price: 0,
        maxQuantity: 1,
        isAvailable: true,
      },
    ]);
  };

  const handleProductSelect = (product: any) => {
    // Check duplicates
    if (options.some((o) => o.productId === product.id)) {
      addToast(t("products.product_already_added"), "warning");
      return;
    }

    setOptions([
      ...options,
      {
        id: `temp-${Date.now()}`,
        name: product.name,
        price: product.price ?? 0,
        maxQuantity: 1,
        isAvailable: true,
        productId: product.id,
        imageUrl: product.imageUrl,
      },
    ]);
    setProductPickerOpen(false);
  };

  const updateOption = (
    idx: number,
    field: keyof CreateModifierOption,
    val: any,
  ) => {
    const newOptions = [...options];
    newOptions[idx] = { ...newOptions[idx], [field]: val };
    setOptions(newOptions);
  };

  const removeOption = (idx: number) => {
    const newOptions = [...options];
    newOptions.splice(idx, 1);
    setOptions(newOptions);
  };

  const handleSave = async () => {
    if (!name || !activeRestaurant) {
      addToast(t("modifiers.validation_error"), "error");
      return;
    }

    if (Number(minSelection) < 0) {
      addToast(t("modifiers.error_min_negative"), "error");
      return;
    }
    if (Number(maxSelection) < 1) {
      addToast(t("modifiers.error_max_invalid"), "error");
      return;
    }
    if (Number(maxSelection) < Number(minSelection)) {
      addToast(t("modifiers.error_max_low"), "error");
      return;
    }

    for (const opt of options) {
      if (!opt.name.trim()) {
        addToast(t("modifiers.error_option_name"), "error");
        return;
      }
      if (Number(opt.price) < 0) {
        addToast(
          t("modifiers.error_option_price", { name: opt.price }),
          "error",
        );
        return;
      }
      if (Number(opt.maxQuantity) < 1) {
        addToast(t("modifiers.error_option_qty", { name: opt.price }), "error");
        return;
      }
    }

    const cleanedOptions = options.map((o) => ({
      id: o.id?.startsWith("temp-") ? undefined : o.id,
      name: o.name,
      price: Number(o.price),
      maxQuantity: Number(o.maxQuantity || 1),
      isAvailable: o.isAvailable,
      productId: o.productId,
    }));

    const payload: CreateModifierGroup = {
      name,
      minSelected: Number(minSelection),
      maxSelected: Number(maxSelection),
      isRequired: isRequired,
      options: cleanedOptions,
    };

    try {
      console.log(payload);
      if (isEditMode && id) {
        await updateGroup({ id, data: payload });
      } else {
        await createGroup(payload);
      }
      goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const isLoading = isListLoading || isCreating || isUpdating;
  return (
    <BasePageLayout
      title={
        isEditMode ? t("products.edit_modifier") : t("products.add_modifier")
      }
      subtitle={t("modifiers.subtitle")}
      showNavBack
      isLoading={isLoading}
      headerActions={
        <AnatomyButton
          onClick={() => {
            confirm({
              title: t("confirm_modal.update_modifier"),
              message: t("confirm_modal.update_modifier_description"),
              variant: "warning",
              confirmText: t("confirm_modal.confirm"),
              onConfirm: async () => {
                handleSave();
              },
            });
          }}
          isLoading={isLoading}
        >
          <Save className="w-4 h-4 mr-2" /> {t("common.save")}
        </AnatomyButton>
      }
    >
      <div className="max-w-4xl mx-auto pb-20 space-y-6">
        {/* --- Card: Group Configuration --- */}
        <div className="bg-background-card p-6 rounded-3xl border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <AnatomyText.H3>{t("products.basic_info")}</AnatomyText.H3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnatomyTextField
              label={t("products.group_name")}
              placeholder="e.g. Sauces, Choice of Side"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-border/50">
              <div className="w-full sm:w-auto">
                <AnatomySwitcher
                  value={isSingle ? "single" : "multi"}
                  onChange={handleToggleType}
                  options={[
                    {
                      value: "single",
                      label: t("common.single"),
                      icon: <CircleDot className="w-3 h-3" />,
                    },
                    {
                      value: "multi",
                      label: t("common.multi"),
                      icon: <CheckSquare className="w-3 h-3" />,
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
              <div className="flex flex-row gap-4 animate-in fade-in slide-in-from-left-2">
                <AnatomyCheckbox
                  label="Required?"
                  checked={isRequired}
                  onChange={handleToggleRequired}
                />
                <div className="w-32">
                  <AnatomyTextField
                    type="number"
                    label={t("products.max_help")}
                    size="sm"
                    value={maxSelection}
                    onChange={(e) => setMaxSelection(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Card: Options List --- */}
        <div className="bg-background-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <AnatomyText.H3>{t("products.options_list")}</AnatomyText.H3>
            <AnatomyText.Small className="text-text-muted">
              {options.length} options
            </AnatomyText.Small>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="opts">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {options.map((opt, idx) => (
                    <Draggable
                      key={opt.id || idx}
                      draggableId={opt.id || String(idx)}
                      index={idx}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex gap-2 items-center bg-background-card p-2 rounded-lg border border-border shadow-sm group"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-text-muted cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Icon or Image */}
                          <div className="flex items-center justify-center w-8 h-8 shrink-0 mr-2">
                            {opt.productId ? (
                              // @ts-ignore
                              opt.imageUrl ? (
                                <img
                                  // @ts-ignore
                                  src={opt.imageUrl}
                                  alt={opt.name}
                                  className="w-8 h-8 rounded-md object-cover border border-border"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                  <Package className="w-4 h-4" />
                                </div>
                              )
                            ) : (
                              <div className="text-gray-300">
                                {isSingle ? (
                                  <CircleDot className="w-5 h-5" />
                                ) : (
                                  <CheckSquare className="w-5 h-5" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Name Input */}
                          <div className="flex-1">
                            <input
                              className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-text-main"
                              placeholder="Option Name"
                              value={opt.name}
                              onChange={(e) =>
                                updateOption(idx, "name", e.target.value)
                              }
                            />
                          </div>

                          {/* Max Qty */}
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
                                    "maxQuantity",
                                    Number(e.target.value),
                                  )
                                }
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
                                  updateOption(idx, "price", e.target.value)
                                }
                              />
                            </div>
                            <AnatomyText.Label className="text-[9px] text-text-muted text-right leading-none mt-0.5">
                              {t("products.extra_price")}
                            </AnatomyText.Label>
                          </div>

                          <button
                            onClick={() => removeOption(idx)}
                            className="text-text-muted hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={addTextOption}
              className="flex-1 py-2 border border-dashed border-primary/30 bg-primary/5 rounded-lg text-primary text-xs font-bold flex items-center justify-center hover:bg-primary/10 transition-colors"
            >
              <Type className="w-3 h-3 mr-2" /> {t("products.add_text_option")}
            </button>

            <button
              onClick={() => setProductPickerOpen(true)}
              className="flex-1 py-2 border border-dashed border-purple-500/30 bg-purple-500/5 rounded-lg text-purple-600 text-xs font-bold flex items-center justify-center hover:bg-purple-500/10 transition-colors"
            >
              <PackageSearch className="w-3 h-3 mr-2" />{" "}
              {t("products.add_product_option")}
            </button>
          </div>
        </div>
      </div>

      <ProductPickerModal
        isOpen={productPickerOpen}
        onClose={() => setProductPickerOpen(false)}
        products={allProducts}
        onSelect={handleProductSelect}
      />
    </BasePageLayout>
  );
};

export default ModifierFormPage;
