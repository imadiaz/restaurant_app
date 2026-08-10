import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Save, Image as ImageIcon, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import AnatomyText from "../../components/anatomy/AnatomyText";
import BasePageLayout from "../../components/layout/BaseLayout";

import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useCategories } from "../../hooks/category/use.category";
import type { CreateCategoryDto } from "../../service/category.service";
import { useToastStore } from "../../store/toast.store";

const CategoryFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useAppNavigation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const {
    createCategory,
    updateCategory,
    getCategoryById,
    isCreating,
    isUpdating,
    isLoading: isLoadingData,
  } = useCategories();

  const addToast = useToastStore((state) => state.addToast);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [nameError, setNameError] = useState<string>();

  const hasLoadedData = useRef(false);

  useEffect(() => {
    if (isEditMode && id && !hasLoadedData.current) {
      const loadData = async () => {
        try {
          const data = await getCategoryById(id);
          if (data) {
            setName(data.name);
            setIcon(data.icon || "");
            setImageUrl(data.imageUrl || "");
            hasLoadedData.current = true;
          }
        } catch {
          goBack();
        }
      };
      loadData();
    }
  }, [isEditMode, id, getCategoryById, goBack]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError(t("categories.validation_name_required"));
      addToast(t("categories.validation_name_required"), "error");
      return;
    }
    setNameError(undefined);

    try {
      const cleanIcon = icon.trim() || undefined;
      const cleanImageUrl = imageUrl.trim() || undefined; 

      if (isEditMode && id) {
        await updateCategory({
          id,
          data: {
            name,
            icon: cleanIcon,
            imageUrl: cleanImageUrl,
          },
        });
      } else {
        const payload: CreateCategoryDto = {
          name,
          icon: cleanIcon,
          imageUrl: cleanImageUrl,
        };
        await createCategory(payload);
      }
      goBack();
    } catch {
      return;
    }
  };

  const isLoading = isCreating || isUpdating || isLoadingData;

  const renderPreview = () => {
    if (icon) return <span className="text-4xl">{icon}</span>;
    if (imageUrl)
      return (
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      );
    return <ImageIcon className="w-8 h-8 text-text-subtle" />;
  };

  return (
    <BasePageLayout
      title={
        isEditMode ? t("categories.edit_title") : t("categories.add_title")
      }
      subtitle={
        isEditMode
          ? `${t("common.editing")} "${name}"`
          : t("categories.add_description")
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-background-card p-8 rounded-3xl shadow-sm border border-border space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <AnatomyTextField
              label={t("categories.field_name")} 
              placeholder="e.g. Japanese, Fast Food, Breakfast"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(undefined);
              }}
              error={nameError}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="space-y-6">
                <AnatomyTextField
                  label={t("categories.field_icon")} 
                  placeholder="e.g. 🍣"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  icon={<Smile className="w-4 h-4 text-text-muted" />}
                  maxLength={4}
                />

                <AnatomyTextField
                  label={t("categories.field_image_url")}
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  icon={<ImageIcon className="w-4 h-4 text-text-muted" />}
                />
              </div>

              <div className="hidden md:flex flex-col gap-2">
                <AnatomyText.Label>{t("common.preview")}</AnatomyText.Label>
                <div className="w-32 h-32 rounded-2xl bg-surface-muted border border-border flex items-center justify-center overflow-hidden shadow-sm">
                  {renderPreview()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-info-surface p-4 rounded-xl border border-info/20">
            <AnatomyText.Label className="mb-1 block text-info">
              {t("common.pro_tips")}
            </AnatomyText.Label>
            <AnatomyText.Small className="leading-relaxed text-info">
              {t("categories.tips_description")}
            </AnatomyText.Small>
          </div>
        </div>
      </div>
    </BasePageLayout>
  );
};

export default CategoryFormPage;
