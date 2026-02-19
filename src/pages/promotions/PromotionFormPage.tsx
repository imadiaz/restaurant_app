import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  Save,
  Calendar,
  DollarSign,
  Layers,
  Percent,
} from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useProducts } from "../../hooks/products/use.products";
import { usePromotions } from "../../hooks/promotion/use.promotion";
import {
  PromotionType,
  type CreatePromotionDto,
} from "../../service/promotion.service";
import { useAppStore } from "../../store/app.store";
import { useToastStore } from "../../store/toast.store";
import AnatomyTextArea from "../../components/anatomy/AnatomyTextArea";

const PromotionsFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useAppNavigation();

  // ✅ CHANGE 1: We only need the Promotion ID from URL.
  // The Restaurant ID comes from the store.
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // ✅ CHANGE 2: Get the active restaurant from global state
  const { activeRestaurant } = useAppStore();

  const {
    createPromotion,
    updatePromotion,
    getPromotionById,
    isCreating,
    isUpdating,
    isLoading: isLoadingPromo,
  } = usePromotions();

  const { products, isLoading: isLoadingProducts } = useProducts();
  const addToast = useToastStore((state) => state.addToast);

  // --- Form States ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PromotionType>(PromotionType.PERCENTAGE);
  const [value, setValue] = useState<string>("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const hasLoadedData = useRef(false);

  // --- Load Data for Edit Mode ---
  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        try {
          const data = await getPromotionById(id);
          if (data) {
            setName(data.name);
            setDescription(data.description || "");
            setType(data.type);
            setValue(String(data.value));
            setStartDate(data.startDate.slice(0, 16));
            setEndDate(data.endDate.slice(0, 16));
            // Note: If your API returns linked products, map them here:
             setSelectedProductIds(data.products?.map((v) => v.product)?.map(p => p.id) || []);
            hasLoadedData.current = true;
          }
        } catch (error) {
          goBack();
        }
      };
      loadData();
    }
  }, [isEditMode, id, getPromotionById, goBack]);

  // --- Handlers ---

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSave = async () => {
    // Safety check for context
    if (!activeRestaurant?.id) {
      return addToast(t("common.error_no_restaurant_selected"), "error");
    }

    // Validations
    if (!name.trim())
      return addToast(t("promotions.validation_name_required"), "error");
    if (!startDate || !endDate)
      return addToast(t("promotions.validation_dates_required"), "error");
    if (new Date(startDate) >= new Date(endDate))
      return addToast(t("promotions.validation_dates_invalid"), "error");
    if (Number(value) < 0)
      return addToast(t("promotions.validation_value_negative"), "error");
    if (selectedProductIds.length === 0 && !isEditMode)
      return addToast(t("promotions.validation_products_required"), "error");

    try {
      const numericValue = parseFloat(value);

      if (isEditMode && id) {
        await updatePromotion({
          id,
          data: {
            name,
            description,
            type,
            value: numericValue,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          },
        });
      } else {
        const payload: CreatePromotionDto = {
          restaurantId: activeRestaurant.id, // ✅ CHANGE 3: Use store ID
          name,
          description,
          type,
          value: numericValue,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          productIds: selectedProductIds,
        };
        await createPromotion(payload);
      }
      goBack();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading =
    isCreating || isUpdating || isLoadingPromo || isLoadingProducts;

  return (
    <BasePageLayout
      title={
        isEditMode ? t("promotions.edit_title") : t("promotions.add_title")
      }
      subtitle={
        isEditMode
          ? `${t("common.editing")} "${name}"`
          : t("promotions.add_description")
      }
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              t("common.loading")
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> {t("common.save")}
              </>
            )}
          </AnatomyButton>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* --- LEFT COLUMN: DETAILS --- */}
        <div className="space-y-6">
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <AnatomyText.H3 className="text-lg">
              {t("promotions.section_details")}
            </AnatomyText.H3>

            <AnatomyTextField
              label={t("promotions.field_name")}
              placeholder="e.g. Summer Sale 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <AnatomyTextArea
              label={t("promotions.field_description")}
              placeholder="Details about the promo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <AnatomySelect
                label={t("promotions.field_type")}
                value={type}
                onChange={(e) => setType(e.target.value as PromotionType)}
              >
                <option value={PromotionType.PERCENTAGE}>
                  {t("promotions.type_percentage")}
                </option>
                <option value={PromotionType.FIXED_AMOUNT}>
                  {t("promotions.type_fixed")}
                </option>
                <option value={PromotionType.BOGO}>
                  {t("promotions.type_bogo")}
                </option>
              </AnatomySelect>

              {/* ... inside your JSX ... */}

              {type !== PromotionType.BOGO && (
                <AnatomyTextField
                  label={
                    type === PromotionType.PERCENTAGE
                      ? t("promotions.field_value_percentage") // "Discount Percentage"
                      : t("promotions.field_value_amount") // "Discount Amount"
                  }
                  type="number"
                  value={value}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (type === PromotionType.PERCENTAGE && val > 100) return;
                    setValue(e.target.value);
                  }}
                  icon={
                    type === PromotionType.PERCENTAGE ? (
                      <Percent className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                    )
                  }
                  placeholder={
                    type === PromotionType.PERCENTAGE ? "20" : "50.00"
                  }
                  min={0}
    
                />
              )}
            </div>
          </div>

          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
            <AnatomyText.H3 className="text-lg">
              {t("promotions.section_duration")}
            </AnatomyText.H3>
            <div className="grid grid-cols-1 md:grid-cols-1  gap-4">
              <AnatomyTextField
                label={t("promotions.field_start_date")}
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={<Calendar className="w-4 h-4 text-text-muted" />}
                required
              />
              <AnatomyTextField
                label={t("promotions.field_end_date")}
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={<Calendar className="w-4 h-4 text-text-muted" />}
                required
              />
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: PRODUCTS --- */}
        <div className="space-y-6">
          <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col h-full max-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <AnatomyText.H3 className="text-lg">
                  {t("promotions.section_products")}
                </AnatomyText.H3>
              </div>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-sm text-primary font-medium hover:underline"
              >
                {selectAll ? t("common.deselect_all") : t("common.select_all")}
              </button>
            </div>

            <AnatomyText.Small className="text-muted-foreground mb-4 block">
              {t("promotions.products_helper")}
            </AnatomyText.Small>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 border-t border-border pt-4">
              {isLoadingProducts ? (
                <div className="text-center py-10 text-muted-foreground">
                  {t("common.loading")}...
                </div>
              ) : (
                products.map((product) => (
                  <label
                    key={product.id}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all
                             ${
                               selectedProductIds.includes(product.id)
                                 ? "bg-primary/5 border-primary"
                                 : "bg-background hover:bg-gray-50 border-transparent hover:border-gray-200"
                             }
                          `}
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mr-3"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleToggleProduct(product.id)}
                      disabled={isEditMode}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ${product.price}
                      </div>
                    </div>
                  </label>
                ))
              )}
              {products.length === 0 && !isLoadingProducts && (
                <div className="text-center py-10 text-muted-foreground">
                  {t("products.empty_list")}
                </div>
              )}
            </div>

            {isEditMode && (
              <div className="mt-4 text-xs text-center text-muted-foreground bg-gray-100 p-2 rounded">
                {t("promotions.edit_products_disabled_note")}
              </div>
            )}
          </div>
        </div>
      </div>
    </BasePageLayout>
  );
};

export default PromotionsFormPage;
