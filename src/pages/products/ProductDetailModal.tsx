import {
  Tag,
  X,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  AlertCircle,
  ExternalLink,

} from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyTag from "../../components/anatomy/AnatomyTag";
import AnatomyText from "../../components/anatomy/AnatomyText";
import type { Product } from "../../data/models/products/product";
import { STATUS } from "../../config/status.config";
import AnatomyCardActions from "../../components/anatomy/AnatomyCardActions";
import { useState } from "react";
import AnatomySwitcher from "../../components/anatomy/AnatomySwitcher";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (id: string) => void;
  onToggleOptionStatus?: (
    optionId: string,
    newStatus: "active" | "inactive",
  ) => Promise<void>;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onToggleOptionStatus,
}) => {
  const { t } = useTranslation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const handleStatusChange = async (optionId: string, newValue: string) => {
    if (!onToggleOptionStatus) return;
    setTogglingId(optionId);
    try {
      await onToggleOptionStatus(optionId, newValue as "active" | "inactive");
    } catch (error) {
      console.error("Failed to toggle status", error);
    } finally {
      setTogglingId(null);
    }
  };

  const availabilityOptions = [
    {
      value: STATUS.active,
      label: t("products.available"),
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    {
      value: STATUS.inactive,
      label: t("products.sold_out"),
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-48 sm:h-64 shrink-0 bg-gray-100 dark:bg-gray-800">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.menuSections?.map((value) => (
                    <AnatomyTag
                      key={value.id}
                      className="bg-primary/90 text-white border-none backdrop-blur-md"
                    >
                      {value.name}
                    </AnatomyTag>
                  ))}
                </div>
                <AnatomyText.H3 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                  {product.name}
                </AnatomyText.H3>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${
                  product.isAvailable
                    ? "bg-green-500/20 border-green-400/30 text-green-100"
                    : "bg-red-500/20 border-red-400/30 text-red-100"
                }`}
              >
                {product.isAvailable ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="font-medium text-sm">
                  {product.isAvailable
                    ? t("products.available")
                    : t("products.sold_out")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <AnatomyText.Label>{t("common.description")}</AnatomyText.Label>
              <AnatomyText.Body className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description || (
                  <span className="italic text-gray-400">
                    {t("common.empty_description")}
                  </span>
                )}
              </AnatomyText.Body>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-text-muted text-sm font-medium">
                  <DollarSign className="w-4 h-4 mr-2" /> {t("products.price")}
                </div>
                <span className="text-lg font-bold text-text-main">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="w-full h-px bg-border/60" />

              <div className="flex items-center justify-between">
                <div className="flex items-center text-text-muted text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2" />{" "}
                  {t("products.prep_min_time")}
                </div>
                <span className="text-text-main font-medium">
                  {product.prepTimeMin ? `${product.prepTimeMin} min` : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-text-muted text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2" />{" "}
                  {t("products.prep_max_time")}
                </div>
                <span className="text-text-main font-medium">
                  {product.prepTimeMax ? `${product.prepTimeMax} min` : "--"}
                </span>
              </div>
            </div>
          </div>

          {product.modifierGroups && product.modifierGroups.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <AlertCircle className="w-5 h-5 text-primary" />
                <AnatomyText.H3 className="mb-0">
                  {t("products.modifiers")}
                </AnatomyText.H3>
              </div>

              <div className="grid gap-6">
                {product.modifierGroups.map((group) => {
                  const isGroupActive = group.status === STATUS.active;

                  return (
                    <div
                      key={group.id}
                      className={`bg-background-card border border-border rounded-2xl overflow-hidden ${!isGroupActive ? "opacity-75 grayscale-[0.5]" : ""}`}
                    >
                      <div className="bg-gray-100/80 dark:bg-gray-800 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <AnatomyText.H3 className="mb-0">
                              {group.name}
                            </AnatomyText.H3>
                            {!isGroupActive && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">
                                {t("common.inactive")}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-text-muted flex gap-2 mt-1">
                            <AnatomyTag
                              variant={group.isRequired ? "warning" : "default"}
                              className="h-5 text-[10px]"
                            >
                              {group.isRequired
                                ? t("products.required")
                                : t("products.optional")}
                            </AnatomyTag>
                            <span className="self-center">
                              Min: {group.minSelected} / Max:{" "}
                              {group.maxSelected}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-border/60">
                        {group.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="p-3 pl-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-gray-400">
                                {opt?.linkedProduct?.imageUrl ? (
                                  <img
                                    src={opt?.linkedProduct?.imageUrl}
                                    alt={opt.name}
                                    className="w-8 h-8 rounded-md object-cover border border-border"
                                  />
                                ) : (
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                                      opt.isAvailable
                                        ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]"
                                        : "bg-red-300"
                                    }`}
                                  />
                                )}
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-medium transition-colors ${
                                    !opt.isAvailable
                                      ? "text-gray-400"
                                      : "text-text-main"
                                  }`}
                                >
                                  {opt.name}
                                </div>
                                {opt.price > 0 && (
                                  <div className="text-xs text-text-muted">
                                    +{formatPrice(opt.price)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 w-full sm:w-auto min-w-[180px]">
                              <AnatomySwitcher
                                options={availabilityOptions}
                                value={
                                  opt.isAvailable
                                    ? STATUS.active
                                    : STATUS.inactive
                                }
                                onChange={(newValue) =>
                                  handleStatusChange(opt.id, newValue)
                                }
                                isLoading={togglingId === opt.id}
                                disabled={
                                  togglingId !== null && togglingId !== opt.id
                                }
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <AnatomyCardActions
          secondary={{
            label: t("common.close"),
            onClick: onClose,
          }}
          primary={{
            label: t("common.edit"),
            icon: ExternalLink,
            onClick: () => onEdit(product.id),
          }}
          className="p-4 bg-white dark:bg-gray-900 border-t border-border"
        />
      </div>
    </div>
  );
};

export default ProductDetailModal;
