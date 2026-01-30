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
import AnatomySwitcher from "../../components/anatomy/AnatomySwitcher";
import AnatomyTag from "../../components/anatomy/AnatomyTag";
import AnatomyText from "../../components/anatomy/AnatomyText";
import type { Product } from "../../data/models/products/product";
import { STATUS } from "../../config/status.config";
import AnatomyCardActions from "../../components/anatomy/AnatomyCardActions";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (id: string) => void;
  onToggleProductStatus: (id: string, isAvailable: boolean) => void;
  onToggleGroupStatus: (
    productId: string,
    groupId: string,
    isAvailable: boolean,
  ) => void;
  onToggleOptionStatus: (
    productId: string,
    groupId: string,
    optionId: string,
    isAvailable: boolean,
  ) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onToggleProductStatus,
  onToggleGroupStatus,
  onToggleOptionStatus,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !product) return null;
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Tag className="w-12 h-12 opacity-20" />
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
              <div>
                {product.menuSections &&
                  product.menuSections
                    .map((value) => value.name)
                    .map((label) => (
                      <AnatomyTag key={label} className="bg-primary text-white border-transparent mb-2 mr-2">
                        {label}
                      </AnatomyTag>
                    ))}
                <AnatomyText.H3 className="text-2xl sm:text-3xl font-bold text-white leading-tight shadow-sm">
                  {product.name}
                </AnatomyText.H3>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <AnatomySwitcher
                  value={product.isAvailable ? "true" : "false"}
                  onChange={(val) =>
                    onToggleProductStatus(product.id, val === "true")
                  }
                  options={[
                    {
                      value: "true",
                      label: t("products.available"),
                      icon: <CheckCircle className="w-3 h-3" />,
                    },
                    {
                      value: "false",
                      label: t("products.sold_out"),
                      icon: <XCircle className="w-3 h-3" />,
                    },
                  ]}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <AnatomyText.Label>{t("common.description")}</AnatomyText.Label>
              <AnatomyText.Body className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description || t("common.empty_description")}
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

              <div className="w-full h-px bg-border" />

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
                {product.modifierGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-background-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gray-100/80 dark:bg-gray-800 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <AnatomyText.H3 className="mb-0">
                          {group.name}
                        </AnatomyText.H3>
                        <div className="text-xs text-text-muted flex gap-2 mt-1">
                          <AnatomyTag
                            variant={group.isRequired ? "warning" : "default"}
                          >
                            {group.isRequired
                              ? t("products.required")
                              : t("products.optional")}
                          </AnatomyTag>
                          <span className="self-center">
                            Min: {group.minSelected} / Max: {group.maxSelected}
                          </span>
                        </div>
                      </div>

                      <div className="origin-right">
                        <AnatomySwitcher
                          value={
                            group.status === STATUS.active
                              ? STATUS.active
                              : STATUS.inactive
                          }
                          onChange={(val) =>
                            onToggleGroupStatus(
                              product.id,
                              group.id!,
                              val === STATUS.active,
                            )
                          }
                          options={[
                            {
                              value: STATUS.active,
                              label: t("products.available"),
                              icon: <CheckCircle className="w-3 h-3" />,
                            },
                            {
                              value: STATUS.inactive,
                              label: t("common.inactive"),
                              icon: <XCircle className="w-3 h-3" />,
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {group.status == STATUS.active && <div className="divide-y divide-border">
                      {group.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-3 pl-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${opt.isAvailable ? "bg-green-500" : "bg-red-300"}`}
                            />
                            <div>
                              <div
                                className={`text-sm font-medium ${!opt.isAvailable ? "text-gray-400 line-through" : "text-text-main"}`}
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

                          <div className="scale-95 origin-right">
                            <AnatomySwitcher
                              value={
                                opt.status === STATUS.active
                                  ? STATUS.active
                                  : STATUS.inactive
                              }
                              onChange={(val) =>
                                onToggleOptionStatus(
                                  product.id,
                                  group.id!,
                                  opt.id!,
                                  val === STATUS.active,
                                )
                              }
                              options={[
                                {
                                  value: STATUS.active,
                                  label: t("products.available"),
                                  icon: <CheckCircle className="w-3 h-3" />,
                                },
                                {
                                  value: STATUS.inactive,
                                  label: t("products.sold_out"),
                                  icon: <XCircle className="w-3 h-3" />,
                                },
                              ]}
                            />
                          </div>
                        </div>
                      ))}
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
          className="p-4"
        />
      </div>
    </div>
  );
};

export default ProductDetailModal;
