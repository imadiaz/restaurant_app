import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Save, Calendar, DollarSign, Percent } from "lucide-react";
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
  PromotionScope,
  type CreatePromotionDto,
} from "../../service/promotion.service";
import { useAppStore } from "../../store/app.store";
import { useToastStore } from "../../store/toast.store";
import AnatomyTextArea from "../../components/anatomy/AnatomyTextArea";
import { useMenuSections } from "../../hooks/restaurants/use.menu.section";
import PromotionTargetPicker from "./components/PromotionTargetPicker";
import {
  promotionDateInput,
  promotionTargets,
  validatePromotionForm,
} from "../../utils/promotion.utils";

const PromotionsForm: React.FC = () => {
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

  const {
    products,
    isLoading: isLoadingProducts,
    isError: productsError,
  } = useProducts();
  const {
    sections,
    isLoading: isLoadingSections,
    isError: sectionsError,
  } = useMenuSections();
  const addToast = useToastStore((state) => state.addToast);

  // --- Form States ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PromotionType>(PromotionType.PERCENTAGE);
  const [value, setValue] = useState<string>("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [scope, setScope] = useState<PromotionScope>(PromotionScope.PRODUCTS);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [detailReady, setDetailReady] = useState(!isEditMode);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const hasLoadedData = useRef(false);

  // --- Load Data for Edit Mode ---
  useEffect(() => {
    let cancelled = false;
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        try {
          const data = await getPromotionById(id);
          if (cancelled) return;
          if (data && data.restaurantId === activeRestaurant?.id) {
            setName(data.name);
            setDescription(data.description || "");
            setType(data.type);
            setValue(String(data.value));
            setStartDate(promotionDateInput(data.startDate));
            setEndDate(promotionDateInput(data.endDate));
            setScope(data.scope ?? PromotionScope.PRODUCTS);
            setSelectedSectionIds(data.menuSections?.map((s) => s.id) ?? []);
            setSelectedProductIds(
              data.products
                ?.filter((link) => link.status === "active")
                .map((link) => link.productId) ?? [],
            );
            hasLoadedData.current = true;
            setDetailReady(true);
          } else {
            goBack();
          }
        } catch {
          goBack();
        }
      };
      void loadData();
    }
    return () => {
      cancelled = true;
    };
  }, [isEditMode, id, activeRestaurant?.id, getPromotionById, goBack]);

  // --- Handlers ---

  const handleSave = async () => {
    // Safety check for context
    if (!activeRestaurant?.id) {
      return addToast(t("common.error_no_restaurant_selected"), "error");
    }

    if (
      !detailReady ||
      isCreating ||
      isUpdating ||
      productsError ||
      sectionsError
    )
      return;
    const validation = validatePromotionForm(
      {
        name,
        description,
        type,
        value,
        startDate,
        endDate,
        scope,
        productIds: selectedProductIds,
        sectionIds: selectedSectionIds,
      },
      products,
      sections,
    );
    const nextErrors = Object.fromEntries(
      Object.entries(validation).map(([key, message]) => [key, t(message)]),
    );
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      addToast(t("forms.correct_errors"), "error");
      return;
    }

    try {
      const numericValue = type === PromotionType.BOGO ? 0 : Number(value);
      const targets = promotionTargets(
        scope,
        selectedProductIds,
        selectedSectionIds,
      );

      if (isEditMode && id) {
        await updatePromotion({
          id,
          data: {
            name: name.trim(),
            description,
            type,
            value: numericValue,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            ...targets,
          },
        });
      } else {
        const payload: CreatePromotionDto = {
          restaurantId: activeRestaurant.id, // ✅ CHANGE 3: Use store ID
          name: name.trim(),
          description,
          type,
          value: numericValue,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          ...targets,
        };
        await createPromotion(payload);
      }
      goBack();
    } catch {
      return;
    }
  };

  const isLoading =
    isCreating ||
    isUpdating ||
    isLoadingPromo ||
    isLoadingProducts ||
    isLoadingSections ||
    !detailReady;

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
          <AnatomyButton
            onClick={handleSave}
            disabled={isLoading || productsError || sectionsError}
          >
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
      {(productsError || sectionsError) && (
        <p role="alert" className="text-danger mb-4">
          {t("promotions.targets_load_error")}
        </p>
      )}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
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
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((errors) => ({ ...errors, name: "" }));
              }}
              error={fieldErrors.name}
              required
              maxLength={100}
            />

            <AnatomyTextArea
              label={t("promotions.field_description")}
              placeholder="Details about the promo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
              error={fieldErrors.description}
            />

            <div className="grid grid-cols-2 gap-4">
              <AnatomySelect
                label={t("promotions.field_type")}
                value={type}
                onChange={(e) => {
                  setType(e.target.value as PromotionType);
                  setFieldErrors((errors) => ({ ...errors, value: "" }));
                }}
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
                    setFieldErrors((errors) => ({ ...errors, value: "" }));
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
                  max={type === PromotionType.PERCENTAGE ? 100 : 99999999.99}
                  step="0.01"
                  error={fieldErrors.value}
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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setFieldErrors((errors) => ({
                    ...errors,
                    startDate: "",
                    endDate: "",
                  }));
                }}
                error={fieldErrors.startDate}
                icon={<Calendar className="w-4 h-4 text-text-muted" />}
                required
              />
              <AnatomyTextField
                label={t("promotions.field_end_date")}
                type="datetime-local"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setFieldErrors((errors) => ({ ...errors, endDate: "" }));
                }}
                error={fieldErrors.endDate}
                icon={<Calendar className="w-4 h-4 text-text-muted" />}
                required
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <PromotionTargetPicker
            scope={scope}
            productIds={selectedProductIds}
            sectionIds={selectedSectionIds}
            products={products}
            sections={sections}
            disabled={isLoading}
            discountLabel={
              type === PromotionType.BOGO
                ? t("promotions.type_bogo")
                : t(
                    type === PromotionType.PERCENTAGE
                      ? "promotions.discount_percentage_summary"
                      : "promotions.discount_fixed_summary",
                    { value: value || "0" },
                  )
            }
            onScopeChange={(next) => {
              setScope(next);
              setFieldErrors((errors) => ({ ...errors, targets: "" }));
            }}
            onSelectionChange={(ids) => {
              (scope === PromotionScope.SECTIONS
                ? setSelectedSectionIds
                : setSelectedProductIds)(ids);
              setFieldErrors((errors) => ({ ...errors, targets: "" }));
            }}
            error={fieldErrors.targets}
          />
        </div>
      </div>
    </BasePageLayout>
  );
};

const PromotionsFormPage: React.FC = () => {
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  const { id } = useParams<{ id: string }>();
  return <PromotionsForm key={`${restaurantId ?? ""}:${id ?? "new"}`} />;
};

export default PromotionsFormPage;
