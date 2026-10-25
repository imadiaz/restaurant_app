import { useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Utensils,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "../../../data/models/products/product";
import type { MenuSection } from "../../../data/models/menu/menu.section";
import { PromotionScope } from "../../../service/promotion.service";
import { includedPromotionProducts } from "../../../utils/promotion.utils";
import AnatomyTextField from "../../../components/anatomy/AnatomyTextField";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";

interface Props {
  scope: PromotionScope;
  productIds: string[];
  sectionIds: string[];
  products: Product[];
  sections: MenuSection[];
  onScopeChange: (scope: PromotionScope) => void;
  onSelectionChange: (ids: string[]) => void;
  error?: string;
  disabled?: boolean;
  discountLabel: string;
}

export default function PromotionTargetPicker({
  scope,
  productIds,
  sectionIds,
  products,
  sections,
  onScopeChange,
  onSelectionChange,
  error,
  disabled,
  discountLabel,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const bySection = scope === PromotionScope.SECTIONS;
  const selected = bySection ? sectionIds : productIds;
  const options = (bySection ? sections : products).filter(
    (item) => item.status === "active",
  );
  const filtered = options.filter((item) =>
    item.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * 6, currentPage * 6 + 6);
  const allSelected =
    filtered.length > 0 && filtered.every((item) => selected.includes(item.id));
  const included = includedPromotionProducts(
    products,
    sections,
    scope,
    productIds,
    sectionIds,
  );
  const sectionNames = sections
    .filter((s) => sectionIds.includes(s.id))
    .map((s) => s.name)
    .join(", ");

  return (
    <section className="bg-background-card p-6 rounded-3xl shadow-sm border border-border space-y-4">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        {t("promotions.scope_title")}
      </h2>
      <fieldset className="space-y-3" disabled={disabled}>
        <legend className="text-sm font-medium mb-3">
          {t("promotions.scope_choose")}
        </legend>
        {([PromotionScope.PRODUCTS, PromotionScope.SECTIONS] as const).map(
          (mode) => {
            const Icon = mode === PromotionScope.PRODUCTS ? Utensils : Layers;
            return (
              <label
                key={mode}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${scope === mode ? "bg-primary/5 border-primary" : "bg-background border-border"}`}
              >
                <input
                  type="radio"
                  name="promotion-scope"
                  value={mode}
                  checked={scope === mode}
                  onChange={() => {
                    onScopeChange(mode);
                    setSearch("");
                    setPage(0);
                  }}
                  className="accent-primary w-4 h-4 shrink-0"
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold">
                    {t(`promotions.scope_${mode}`)}
                  </span>
                  <span className="block text-xs text-text-muted mt-1">
                    {t(`promotions.scope_${mode}_helper`)}
                  </span>
                </span>
                <Icon className="w-5 h-5 text-primary shrink-0" />
              </label>
            );
          },
        )}
      </fieldset>
      <p className="flex items-start gap-2 text-xs text-text-muted">
        <Info className="w-4 h-4 shrink-0" />
        {t("promotions.scope_exclusive")}
      </p>
      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-sm">
            {t(
              bySection
                ? "promotions.scope_section_list"
                : "promotions.section_products",
            )}
          </h3>
          <button
            type="button"
            disabled={disabled || !filtered.length}
            className="text-primary text-xs font-medium disabled:opacity-50"
            onClick={() =>
              onSelectionChange(
                allSelected
                  ? selected.filter(
                      (id) => !filtered.some((item) => item.id === id),
                    )
                  : [
                      ...new Set([
                        ...selected,
                        ...filtered.map((item) => item.id),
                      ]),
                    ],
              )
            }
          >
            {t(allSelected ? "common.deselect_all" : "common.select_all")}
          </button>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            className="text-xs text-text-muted underline"
            disabled={disabled}
            onClick={() => onSelectionChange([])}
          >
            {t("promotions.clear_targets")}
          </button>
        )}
        <p className="text-xs text-text-muted">
          {t(
            bySection
              ? "promotions.scope_dynamic_helper"
              : "promotions.scope_specific_helper",
          )}
        </p>
        <AnatomyTextField
          type="search"
          label={t(
            bySection
              ? "promotions.search_sections"
              : "promotions.search_products",
          )}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          disabled={disabled}
          size="sm"
        />
        {error && (
          <p
            id="promotion-target-error"
            role="alert"
            className="text-xs font-medium text-danger"
          >
            {error}
          </p>
        )}
        <fieldset
          className="space-y-2"
          disabled={disabled}
          aria-label={t(
            bySection
              ? "promotions.scope_section_list"
              : "promotions.section_products",
          )}
          aria-describedby={error ? "promotion-target-error" : undefined}
        >
          {visible.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${selected.includes(item.id) ? "bg-primary/5 border-primary" : "bg-background border-transparent hover:border-border"}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() =>
                  onSelectionChange(
                    selected.includes(item.id)
                      ? selected.filter((id) => id !== item.id)
                      : [...selected, item.id],
                  )
                }
                className="w-5 h-5 accent-primary shrink-0"
              />
              <span className="flex-1 min-w-0 break-words text-sm font-medium">
                {item.name}
              </span>
              <span className="text-xs text-text-muted shrink-0">
                {bySection
                  ? t("promotions.product_count", {
                      count: products.filter(
                        (p) =>
                          p.status === "active" &&
                          p.menuSections?.some((s) => s.id === item.id),
                      ).length,
                    })
                  : `$${Number((item as Product).price).toFixed(2)}`}
              </span>
            </label>
          ))}
          {!visible.length && (
            <p className="text-text-muted text-sm py-4">
              {t("promotions.no_targets_found")}
            </p>
          )}
        </fieldset>
        {pages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-text-muted">
            <span>
              {t("promotions.target_page", {
                page: currentPage + 1,
                total: pages,
              })}
            </span>
            <div className="flex gap-2">
              <AnatomyButton
                variant="secondary"
                aria-label={t("common.previous")}
                disabled={disabled || currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </AnatomyButton>
              <AnatomyButton
                variant="secondary"
                aria-label={t("common.next")}
                disabled={disabled || currentPage === pages - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </AnatomyButton>
            </div>
          </div>
        )}
      </div>
      <div className="bg-primary/5 rounded-xl p-4 space-y-2" aria-live="polite">
        <p className="font-semibold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          {t("promotions.included_count", { count: included.length })}
        </p>
        <p className="text-sm font-medium">{discountLabel}</p>
        <p className="text-xs text-text-muted break-words">
          {bySection
            ? t("promotions.scope_summary_sections", {
                names: sectionNames || "—",
              })
            : t("promotions.scope_summary_products")}
        </p>
        {included.length > 0 && (
          <details>
            <summary className="text-primary text-xs cursor-pointer">
              {t("promotions.preview_products")}
            </summary>
            <ul className="text-xs text-text-muted space-y-1 mt-2 list-disc pl-4">
              {included.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <p className="text-xs text-text-muted border-t border-border pt-4">
        {t(
          bySection
            ? "promotions.scope_tip_products"
            : "promotions.scope_tip_sections",
        )}
      </p>
    </section>
  );
}
