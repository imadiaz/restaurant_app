import type { MenuSection } from "../data/models/menu/menu.section";
import type {
  ProductImportRow,
  ProductImportEdit,
} from "../service/product.import.service";

export type ImportRowDraft = Partial<
  Pick<
    ProductImportRow,
    | "name"
    | "description"
    | "price"
    | "menuSectionId"
    | "prepTimeMin"
    | "prepTimeMax"
  >
> & { allowDuplicate?: boolean; expectedVersion?: number };
export const normalizedImportName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
export const importDuplicateRows = (rows: ProductImportRow[]): Set<number> => {
  const sections = new Map<string, number>();
  const categories = new Map<string, number>();
  const sectionKey = (row: ProductImportRow) =>
    JSON.stringify([normalizedImportName(row.name), row.menuSectionId]);
  const categoryKey = (row: ProductImportRow) =>
    JSON.stringify([
      normalizedImportName(row.name),
      normalizedImportName(row.sourceCategory),
    ]);
  for (const row of rows) {
    if (row.status === "skipped") continue;
    const category = categoryKey(row);
    categories.set(category, (categories.get(category) ?? 0) + 1);
    if (row.menuSectionId) {
      const section = sectionKey(row);
      sections.set(section, (sections.get(section) ?? 0) + 1);
    }
  }
  return new Set(
    rows
      .filter(
        (row) =>
          row.duplicateProductId ||
          (row.status !== "skipped" &&
            (row.menuSectionId
              ? (sections.get(sectionKey(row)) ?? 0) > 1
              : (categories.get(categoryKey(row)) ?? 0) > 1)),
      )
      .map((row) => row.sourceRow),
  );
};
export const applyImportDraft = (
  row: ProductImportRow,
  draft: ImportRowDraft = {},
): ProductImportRow => {
  const next = { ...row, ...draft };
  if (
    normalizedImportName(next.name) !== normalizedImportName(row.name) ||
    next.menuSectionId !== row.menuSectionId
  )
    next.duplicateProductId = null;
  return next;
};
export const importRowIssues = (
  row: ProductImportRow,
  sections: MenuSection[],
): string[] => {
  const issues = [];
  if (!row.name.trim() || row.name.length > 100) issues.push("name_error");
  if (
    row.price === null ||
    !Number.isFinite(row.price) ||
    row.price < 0 ||
    row.price > 99999999.99 ||
    Math.abs(row.price * 100 - Math.round(row.price * 100)) > 0.00001
  )
    issues.push("price_error");
  if (
    !sections.some(
      (section) =>
        section.id === row.menuSectionId && section.status === "active",
    )
  )
    issues.push("section_error");
  if (row.description.length > 1000) issues.push("description_error");
  if (
    [row.prepTimeMin, row.prepTimeMax].some(
      (value) =>
        value !== null &&
        (!Number.isInteger(value) || value < 0 || value > 1440),
    ) ||
    (row.prepTimeMin !== null &&
      row.prepTimeMax !== null &&
      row.prepTimeMax < row.prepTimeMin)
  )
    issues.push("prep_error");
  return issues;
};
export const toImportEdit = (
  row: ProductImportRow,
  draft: ImportRowDraft = {},
): ProductImportEdit => ({
  sourceRow: row.sourceRow,
  expectedVersion: draft.expectedVersion ?? row.version,
  name: draft.name ?? row.name,
  description: draft.description ?? row.description,
  price: draft.price === undefined ? row.price : draft.price,
  menuSectionId:
    draft.menuSectionId === undefined ? row.menuSectionId : draft.menuSectionId,
  prepTimeMin:
    draft.prepTimeMin === undefined ? row.prepTimeMin : draft.prepTimeMin,
  prepTimeMax:
    draft.prepTimeMax === undefined ? row.prepTimeMax : draft.prepTimeMax,
  ...(draft.allowDuplicate === true ? { allowDuplicate: true } : {}),
});
export const hasImportDuplicate = (
  row: ProductImportRow,
  rows: ProductImportRow[],
) =>
  Boolean(row.duplicateProductId) ||
  rows.some(
    (other) =>
      other.sourceRow !== row.sourceRow &&
      other.status !== "skipped" &&
      normalizedImportName(other.name) === normalizedImportName(row.name) &&
      (row.menuSectionId
        ? other.menuSectionId === row.menuSectionId
        : normalizedImportName(other.sourceCategory) ===
          normalizedImportName(row.sourceCategory)),
  );
