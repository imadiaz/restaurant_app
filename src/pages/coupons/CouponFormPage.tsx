import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import {
  Save,
  AlertCircle,
  Calendar,
  DollarSign,
  Percent,
  Tag,
  Users,
  Hash,
} from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyText from "../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import BasePageLayout from "../../components/layout/BaseLayout";
import { isSuperAdmin } from "../../data/models/user/utils/user.utils";
import { useCoupons } from "../../hooks/coupons/use.coupons";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import {
  type CreateCouponDto,
  CouponScope,
  CouponType,
} from "../../service/coupons.service";
import { useAppStore } from "../../store/app.store";
import { useAuthStore } from "../../store/auth.store";
import { useToastStore } from "../../store/toast.store";
import AnatomyTextArea from "../../components/anatomy/AnatomyTextArea";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import {
  FILES_PATHS,
  useImagesUpload,
} from "../../hooks/images/use.images.upload";
import { ImageUploadInput } from "../../components/common/ImageUploadInput";

const CouponFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { uploadFile } = useImagesUpload();

  // Stores
  const { activeRestaurant } = useAppStore();
  const { user } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  // Hooks
  const {
    createCoupon,
    updateCoupon,
    getCouponById,
    isCreating,
    isUpdating,
    isLoading: isLoadingList,
  } = useCoupons();

  // Form Setup
  const { register, handleSubmit, control, reset, setError, clearErrors, formState: { errors } } = useForm<CreateCouponDto>({
    defaultValues: {
      code: "",
      description: "",
      type: CouponType.PERCENTAGE,
      value: 0,
      scope: activeRestaurant ? CouponScope.RESTAURANT : CouponScope.GLOBAL,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      usageLimitGlobal: 1000,
      usageLimitPerUser: 1,
      isActive: true, // For update DTO
      // Dates: Default to today and next month
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split("T")[0],
    },
  });

  // Watch type to change icons/labels dynamically
  const couponType = useWatch({ control, name: "type" });
  const isAdmin = isSuperAdmin(user);

  // Load Data in Edit Mode
  const hasLoadedData = useRef(false);

  // Load Data in Edit Mode
  useEffect(() => {
    // 2️⃣ Check !hasLoadedData.current
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        try {
          const data = await getCouponById(id);
          if (data) {
            reset({
              ...data,
              startDate: data.startDate.split("T")[0],
              endDate: data.endDate.split("T")[0],
            });
            // 3️⃣ Mark as loaded so it doesn't run again
            hasLoadedData.current = true;
            setImagePreview(data.imageUrl || null);
            if (data.imageUrl || null) {
              setIsImageUploaded(true);
            }
          }
        } catch {
          goBack();
        }
      };
      loadData();
    }
  }, [isEditMode, id, getCouponById, goBack, reset]);

  const onSubmit = async (data: CreateCouponDto) => {
    // 1. Context Validation: Must have a restaurant (unless Super Admin)
    if (!activeRestaurant?.id && !isAdmin) {
      addToast(t("errors.no_active_restaurant"), "error");
      return;
    }

    // --- 🛡️ 2. LOGICAL VALIDATIONS ---

    // A. Date Validation
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Check if dates are valid objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("startDate", { message: t("validation.invalid_dates") });
      setError("endDate", { message: t("validation.invalid_dates") });
      addToast(t("validation.invalid_dates"), "error");
      return;
    }

    // Check if End Date is before Start Date
    if (end < start) {
      setError("endDate", { message: t("validation.error_date_range") });
      addToast(t("validation.error_date_range"), "error");
      return;
    }

    // B. Value Validation
    const discountValue = Number(data.value);

    if (discountValue < 0) {
      setError("value", { message: t("validation.error_negative_value") });
      addToast(t("validation.error_negative_value"), "error");
      return;
    }
    if (data.type === CouponType.PERCENTAGE && discountValue > 100) {
      setError("value", { message: t("validation.error_percentage_limit") });
      addToast(t("validation.error_percentage_limit"), "error");
      return;
    }

    if (discountValue === 0 && data.type !== CouponType.FREE_DELIVERY) {
      setError("value", { message: t("validation.error_zero_value") });
      addToast(t("validation.error_zero_value"), "warning");
      return;
    }

    if (Number(data.usageLimitGlobal) < Number(data.usageLimitPerUser)) {
      setError("usageLimitGlobal", { message: t("validation.error_global_limit") });
      addToast(t("validation.error_global_limit"), "error"); // Global limit can't be smaller than per-user limit
      return;
    }

    // --- 🚀 3. PREPARE & SEND ---
    try {
      let finalImageUrl: string | undefined = imagePreview || undefined;
      if (imageFile && imageFile.size > 0 && !isImageUploaded) {
        const uploadedUrl = await uploadFile(
          imageFile,
          FILES_PATHS.RestaurantCoupons(
            activeRestaurant?.id ?? "general-coupons",
          ),
        );
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          setImagePreview(uploadedUrl);
          setIsImageUploaded(true);
        }
      } else if (!finalImageUrl && !isEditMode) {
        finalImageUrl = undefined;
      }

      const startDate = new Date(`${data.startDate}T00:00:00`);
      const endDate = new Date(`${data.endDate}T23:59:59.999`);
      const payload: CreateCouponDto = {
        code: data.code.toUpperCase().trim(),
        description: data.description,
        type: data.type,
        value: Number(data.value),
        scope: data.scope,
        minOrderAmount: Number(data.minOrderAmount) || 0,
        maxDiscountAmount: Number(data.maxDiscountAmount) || 0,
        usageLimitGlobal: Number(data.usageLimitGlobal) || undefined,
        usageLimitPerUser: Number(data.usageLimitPerUser) || 1,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: data.isActive,
        imageUrl: finalImageUrl,
      };

      // Only add restaurantId if it's relevant (and NOT the full restaurant object)
      if (activeRestaurant) {
        payload.restaurantId = activeRestaurant.id;
        payload.scope = CouponScope.RESTAURANT;
      }

      if (isEditMode && id) {
        await updateCoupon({ id, data: payload });
      } else {
        // Auto-assign scope if Restaurant Context
        if (activeRestaurant) {
          payload.restaurantId = activeRestaurant.id;
          payload.scope = CouponScope.RESTAURANT;
        }
        await createCoupon(payload);
      }
      goBack();
    } catch {
      // The hook usually handles the error toast, but you can add specific handling here
    }
  };

  const isLoading = isCreating || isUpdating || (isEditMode && isLoadingList);

  return (
    <BasePageLayout
      title={isEditMode ? t("coupons.edit") : t("coupons.add")}
      subtitle={
        isEditMode
          ? t("coupons.edit_description")
          : t("coupons.add_description")
      }
      showNavBack={true}
      headerActions={
        <div className="flex gap-3">
          <AnatomyButton
            onClick={handleSubmit(onSubmit, () => addToast(t('forms.correct_errors'), 'error'))}
            disabled={isLoading}
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
      <div className="max-w-4xl mx-auto pb-20">
        {/* Error Banner */}
        {!activeRestaurant && !isAdmin && (
          <div className="mb-6 bg-danger-surface border border-danger/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
            <div>
              <AnatomyText.H3 className="!text-danger text-sm">
                {t("errors.error")}
              </AnatomyText.H3>
              <AnatomyText.Body className="!text-danger text-xs">
                {t("errors.no_active_restaurant_description")}
              </AnatomyText.Body>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
              <AnatomyText.H3 className="text-lg mb-4">
                {t("coupons.section_general")}
              </AnatomyText.H3>

              <AnatomyTextField
                label={t("coupons.code")}
                placeholder="e.g. SUMMER2024"
                {...register("code", {
                  required: t('forms.required'),
                  minLength: { value: 3, message: t('coupons.code_min_length') },
                })}
                error={errors.code?.message}
                icon={<Tag className="w-4 h-4 text-text-subtle" />}
              />

              <AnatomyTextArea
                label={t("coupons.description")}
                placeholder={t("coupons.description_placeholder")}
                {...register("description")}
              />
            </div>

            {/* Rules Section */}
            <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-6">
              <AnatomyText.H3 className="text-lg mb-4">
                {t("coupons.section_rules")}
              </AnatomyText.H3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type Selector */}
                <div>
                  <AnatomySelect
                    label={t("coupons.discount_type")}
                    {...register("type", { onChange: () => clearErrors("value") })}
                  >
                    <option value={CouponType.PERCENTAGE}>
                      {t("coupons.type_percentage")}
                    </option>
                    <option value={CouponType.FIXED_AMOUNT}>
                      {t("coupons.type_fixed")}
                    </option>
                    <option value={CouponType.FREE_DELIVERY}>
                      {t("coupons.type_free_shipping")}
                    </option>
                  </AnatomySelect>
                </div>

                {/* Value Input */}
                <AnatomyTextField
                  label={t("coupons.discount_value")}
                  type="number"
                  {...register("value", {
                    required: t('forms.required'),
                    onChange: () => clearErrors("value"),
                  })}
                  error={errors.value?.message}
                  icon={
                    couponType === CouponType.PERCENTAGE ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )
                  }
                  placeholder="0.00"
                  disabled={couponType === CouponType.FREE_DELIVERY}
                />

                {/* Min Order */}
                <AnatomyTextField
                  label={t("coupons.min_order")}
                  type="number"
                  {...register("minOrderAmount", {
                    min: { value: 0, message: t('validation.error_negative_value') },
                  })}
                  error={errors.minOrderAmount?.message}
                  icon={<DollarSign className="w-4 h-4" />}
                  placeholder="0.00"
                />

                {/* Max Discount (Only for Percentage) */}
                {couponType === CouponType.PERCENTAGE && (
                  <AnatomyTextField
                    label={t("coupons.max_discount")}
                    type="number"
                    {...register("maxDiscountAmount", {
                      min: { value: 0, message: t('validation.error_negative_value') },
                    })}
                    error={errors.maxDiscountAmount?.message}
                    icon={<DollarSign className="w-4 h-4" />}
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Limits & Dates */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-4">
              <AnatomyText.H3 className="text-base font-medium">
                {t("coupons.section_validity")}
              </AnatomyText.H3>

              <AnatomyTextField
                label={t("coupons.start_date")}
                type="date"
                {...register("startDate", {
                  required: t('forms.required'),
                  onChange: () => clearErrors(["startDate", "endDate"]),
                })}
                error={errors.startDate?.message}
                icon={<Calendar className="w-4 h-4 text-text-subtle" />}
              />

              <AnatomyTextField
                label={t("coupons.end_date")}
                type="date"
                {...register("endDate", {
                  required: t('forms.required'),
                  onChange: () => clearErrors("endDate"),
                })}
                error={errors.endDate?.message}
                icon={<Calendar className="w-4 h-4 text-text-subtle" />}
              />
            </div>

            {/* Limits */}
            <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-4">
              <AnatomyText.H3 className="text-base font-medium">
                {t("coupons.section_limits")}
              </AnatomyText.H3>

              <AnatomyTextField
                label={t("coupons.limit_global")}
                type="number"
                {...register("usageLimitGlobal", {
                  min: { value: 1, message: t('validation.minimum_one') },
                  onChange: () => clearErrors("usageLimitGlobal"),
                })}
                error={errors.usageLimitGlobal?.message}
                icon={<Hash className="w-4 h-4 text-text-subtle" />}
              />

              <AnatomyTextField
                label={t("coupons.limit_user")}
                type="number"
                {...register("usageLimitPerUser", {
                  min: { value: 1, message: t('validation.minimum_one') },
                  onChange: () => clearErrors("usageLimitGlobal"),
                })}
                error={errors.usageLimitPerUser?.message}
                icon={<Users className="w-4 h-4 text-text-subtle" />}
              />
            </div>
            <div className="space-y-6">
              <ImageUploadInput
                onFileSelect={(file) => {
                  setImageFile(file);
                  setIsImageUploaded(false);
                }}
                initialPreview={imagePreview}
              />
            </div>
          </div>
        </div>
      </div>
    </BasePageLayout>
  );
};

export default CouponFormPage;
