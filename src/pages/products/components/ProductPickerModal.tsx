import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Search, Package } from "lucide-react";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import AnatomyTextField from "../../../components/anatomy/AnatomyTextField";
import type { Product } from "../../../data/models/products/product";


interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (product: Product) => void;
}

const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background-card w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <AnatomyText.H3 className="mb-0 text-lg">
            {t("products.select_product")}
          </AnatomyText.H3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <AnatomyTextField
            placeholder={t("common.search")}
            icon={<Search className="w-4 h-4 text-text-muted" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-text-muted">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                  {product.name}
                </div>
                <div className="text-xs text-text-muted">
                  ${Number(product.price).toFixed(2)}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              {t("common.no_results")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPickerModal;