import type { Product } from "../data/models/products/product";
import type { MenuSection } from "../data/models/menu/menu.section";
import {
  PromotionScope,
  PromotionType,
  type PromotionTargets,
} from "../service/promotion.service";

export function promotionTargets(
  scope: PromotionScope,
  productIds: string[],
  sectionIds: string[],
): PromotionTargets {
  return scope === PromotionScope.SECTIONS
    ? { scope, sectionIds: [...new Set(sectionIds)] }
    : { scope, productIds: [...new Set(productIds)] };
}

export function includedPromotionProducts(
  products: Product[],
  sections: MenuSection[],
  scope: PromotionScope,
  productIds: string[],
  sectionIds: string[],
) {
  const activeSections = new Set(
    sections
      .filter((s) => s.status === "active" && sectionIds.includes(s.id))
      .map((s) => s.id),
  );
  return [
    ...new Map(
      products
        .filter(
          (p) =>
            p.status === "active" &&
            (scope === PromotionScope.PRODUCTS
              ? productIds.includes(p.id)
              : p.menuSections?.some((s) => activeSections.has(s.id))),
        )
        .map((p) => [p.id, p]),
    ).values(),
  ];
}

export function promotionDateInput(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface PromotionFormValues {
  name: string;
  description: string;
  type: PromotionType;
  value: string;
  startDate: string;
  endDate: string;
  scope: PromotionScope;
  productIds: string[];
  sectionIds: string[];
}

/** Return translation keys so validation can be exercised without rendering UI. */
export function validatePromotionForm(
  form: PromotionFormValues,
  products: Product[],
  sections: MenuSection[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "promotions.validation_name_required";
  else if (form.name.trim().length > 100)
    errors.name = "promotions.validation_name_length";
  if (form.description.length > 255)
    errors.description = "promotions.validation_description_length";
  const start = new Date(form.startDate).getTime(),
    end = new Date(form.endDate).getTime();
  if (!Number.isFinite(start)) errors.startDate = "forms.required";
  if (!Number.isFinite(end)) errors.endDate = "forms.required";
  if (Number.isFinite(start) && Number.isFinite(end) && start >= end)
    errors.endDate = "promotions.validation_dates_invalid";
  const value = Number(form.value);
  if (
    form.type !== PromotionType.BOGO &&
    (!form.value.trim() ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 99999999.99 ||
      Math.abs(value * 100 - Math.round(value * 100)) > 0.000001 ||
      (form.type === PromotionType.PERCENTAGE && value > 100))
  )
    errors.value = "promotions.validation_value_invalid";
  const ids =
    form.scope === PromotionScope.SECTIONS ? form.sectionIds : form.productIds;
  const available = new Set(
    (form.scope === PromotionScope.SECTIONS ? sections : products)
      .filter((p) => p.status === "active")
      .map((p) => p.id),
  );
  if (!ids.length)
    errors.targets =
      form.scope === PromotionScope.SECTIONS
        ? "promotions.validation_sections_required"
        : "promotions.validation_products_required";
  else if (ids.some((id) => !available.has(id)))
    errors.targets = "promotions.validation_targets_unavailable";
  else if (ids.length > 1000)
    errors.targets = "promotions.validation_target_limit";
  return errors;
}
