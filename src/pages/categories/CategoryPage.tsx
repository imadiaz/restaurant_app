import React, { useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomySearchBar from "../../components/anatomy/AnatomySearchBar";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { Routes } from "../../config/routes";
import { useTranslation } from "react-i18next";
import CategoryCard from "./components/CategoryCard";
import { useConfirm } from "../../hooks/use.confirm.modal";
import { useCategories } from "../../hooks/category/use.category";

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories, isLoading, deleteCategory } = useCategories(); 
  const { navigateTo } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm } = useConfirm();

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (categoryId: string) => {
    confirm({
      title: t("categories.delete_category"),
      message: t("categories.delete_category_description"),
      variant: "danger",
      confirmText: t("common.delete"),
      onConfirm: async () => {
        await deleteCategory({id: categoryId});
      },
    });
  };

  return (
    <BasePageLayout
      title={t("categories.title")}
      subtitle={t("categories.description")}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.CategoriesAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t("categories.add")}
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filtered.length === 0}
      renderControls={
        <div className="w-full">
          <AnatomySearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("categories.search_placeholder")} 
          />
        </div>
      }
      emptyLabel={t("categories.empty")}
      emptyIcon={LayoutGrid}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filtered.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => navigateTo(Routes.CategoriesEdit(category.id))}
            onDelete={() => handleDelete(category.id)}
          />
        ))}
      </div>
    </BasePageLayout>
  );
};

export default CategoriesPage;