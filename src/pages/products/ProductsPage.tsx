import AnatomyButton from "../../components/anatomy/AnatomyButton";
import { useMemo, useState } from "react";
import AnatomySearchBar from "../../components/anatomy/AnatomySearchBar";
import { Plus, Utensils } from "lucide-react";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import { useTranslation } from "react-i18next";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import { useMenuSections } from "../../hooks/restaurants/use.menu.section";
import { useProducts } from "../../hooks/products/use.products";
import ProductCard from "./components/ProductCard";
import { Routes } from "../../config/routes";
import ProductDetailModal from "./ProductDetailModal";
import { useConfirm } from "../../hooks/use.confirm.modal";
import { useModifiers } from "../../hooks/modifiers/use.modifiers";

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { products, isLoading, toggleAvailability } = useProducts();
  const {toggleOptionStatusMutation} = useModifiers();
  const { sections } = useMenuSections();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const isModalOpen = Boolean(selectedProductId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null,
  );
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        (p && p.menuSections.map((e) => e.id).includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);
  const { confirm } = useConfirm();

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  const handleToggleVisibility = async (value: boolean, id: string) => {
    setUpdatingProductId(id);
    try {
      await toggleAvailability({ id, isAvailable: value });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleToggleOptionVisibility = async (optionId: string, status: string) => {
    await toggleOptionStatusMutation({id: optionId, status});
  }

  return (
    <BasePageLayout
      title={t("products.products")}
      subtitle={t("products.descriptions")}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.ProudctAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t("products.add")}
        </AnatomyButton>
      }
      isLoading={isLoading}
      isEmpty={filteredProducts.length === 0 && !isLoading}
      renderControls={
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <AnatomySearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search")}
            />
          </div>
          <div className="w-full md:w-64">
            <AnatomySelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t("products.all_categories")}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </AnatomySelect>
          </div>
        </div>
      }
      emptyLabel={t("products.empty")}
      emptyIcon={Utensils}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => navigateTo(Routes.ProudctEdit(product.id))}
            onToggleAvailability={(value: boolean) => {
              confirm({
                title: t("confirm_modal.update_status"),
                message: t("confirm_modal.update_status_description"),
                variant: "warning",
                confirmText: t("confirm_modal.confirm"),
                onConfirm: async () => {
                  handleToggleVisibility(value, product.id);
                },
              });
            }}
            onViewDetails={() => setSelectedProductId(product.id)}
            isLoading={updatingProductId === product.id}
          />
        ))}

        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={() => setSelectedProductId(null)}
          product={selectedProduct}
          onEdit={() =>
            navigateTo(Routes.ProudctEdit(selectedProduct?.id ?? ""))
          }
          onToggleOptionStatus={async (optionId, status) => {
            setSelectedProductId(null);
            confirm({
                title: t("confirm_modal.update_status"),
                message: t("confirm_modal.update_status_description"),
                variant: "warning",
                confirmText: t("confirm_modal.confirm"),
                onConfirm: async () => {
                  handleToggleOptionVisibility(optionId, status);
                },
              });
          }}
        />
      </div>
    </BasePageLayout>
  );
};

export default ProductsPage;
