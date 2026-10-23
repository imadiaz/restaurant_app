import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Save,
  Upload,
  X,
} from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../components/anatomy/AnatomySelect";
import AnatomyTextField from "../../components/anatomy/AnatomyTextField";
import AnatomyTextArea from "../../components/anatomy/AnatomyTextArea";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useAppStore } from "../../store/app.store";
import { useToastStore } from "../../store/toast.store";
import { useProductImports } from "../../hooks/products/use.product.imports";
import { useMenuSections } from "../../hooks/restaurants/use.menu.section";
import { useConfirm } from "../../hooks/use.confirm.modal";
import { useDialogAccessibility } from "../../hooks/use.dialog.accessibility";
import type { ProductImportRow } from "../../service/product.import.service";
import {
  applyImportDraft,
  importDuplicateRows,
  importRowIssues,
  normalizedImportName,
  toImportEdit,
  type ImportRowDraft,
} from "../../utils/product.import.utils";

const PAGE_SIZE = 25;
const fieldClass =
  "min-h-11 w-full rounded-control border border-border bg-input px-3 py-2 text-sm text-text-main focus:ring-2 focus:ring-primary disabled:opacity-60";
type UpdateField = <K extends keyof ImportRowDraft>(
  row: number,
  field: K,
  value: ImportRowDraft[K],
) => void;

function RowEditor({
  row,
  locked,
  onClose,
  onChange,
  onSave,
  busy,
  issues,
}: {
  row: ProductImportRow;
  locked: boolean;
  onClose: () => void;
  onChange: UpdateField;
  onSave: () => void;
  busy: boolean;
  issues: string[];
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  useDialogAccessibility(true, ref, onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.currentTarget === event.target && !busy) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-row-title"
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-background-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="import-row-title"
              className="text-xl font-bold text-text-main"
            >
              {row.name || t("product_import.unnamed")}
            </h2>
            <p className="text-sm text-text-muted">
              {t("product_import.source_row", { row: row.sourceRow })} ·{" "}
              {row.sourceCategory}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onClose}
            disabled={busy}
            className="rounded-control p-2 text-text-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <fieldset disabled={locked || busy} className="space-y-4">
          <AnatomyTextArea
            label={t("common.description")}
            rows={5}
            maxLength={1000}
            value={row.description}
            onChange={(event) =>
              onChange(row.sourceRow, "description", event.target.value)
            }
            error={
              issues.includes("description_error")
                ? t("product_import.description_error")
                : undefined
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnatomyTextField
              label={t("product_import.prep_min")}
              type="number"
              min="0"
              max="1440"
              step="1"
              value={row.prepTimeMin ?? ""}
              onChange={(event) =>
                onChange(
                  row.sourceRow,
                  "prepTimeMin",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
            <AnatomyTextField
              label={t("product_import.prep_max")}
              type="number"
              min="0"
              max="1440"
              step="1"
              value={row.prepTimeMax ?? ""}
              onChange={(event) =>
                onChange(
                  row.sourceRow,
                  "prepTimeMax",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
          </div>
        </fieldset>
        {issues.length > 0 && (
          <div role="alert" className="mt-4 space-y-1 text-sm text-danger">
            {issues.map((issue) => (
              <p key={issue}>{t(`product_import.${issue}`)}</p>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-text-muted">
          {t("product_import.optional_fields")}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AnatomyButton variant="secondary" onClick={onClose} disabled={busy}>
            {t("common.close")}
          </AnatomyButton>
          {!locked && (
            <AnatomyButton
              onClick={onSave}
              disabled={issues.length > 0}
              isLoading={busy}
            >
              {t("product_import.save_next")}
            </AnatomyButton>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductImportWorkspace({
  restaurantId,
  importId,
}: {
  restaurantId: string;
  importId?: string;
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const { confirm } = useConfirm();
  const addToast = useToastStore((state) => state.addToast);
  const { list, detail, upload, update, commit } = useProductImports(
    restaurantId,
    importId,
  );
  const {
    sections,
    isLoading: sectionsLoading,
    isError: sectionsError,
    createSection,
    isCreating,
  } = useMenuSections(restaurantId);
  const [drafts, setDrafts] = useState<Record<number, ImportRowDraft>>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [savingRow, setSavingRow] = useState<number | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const session = detail.data;
  const busy =
    upload.isPending ||
    update.isPending ||
    commit.isPending ||
    savingDraft ||
    isCreating;
  const activeSections = useMemo(
    () => sections.filter((section) => section.status === "active"),
    [sections],
  );
  const rows = useMemo(
    () =>
      session?.rows.map((row) =>
        applyImportDraft(row, drafts[row.sourceRow]),
      ) ?? [],
    [session, drafts],
  );
  const categories = [...new Set(rows.map((row) => row.sourceCategory))];
  const duplicateRows = useMemo(() => importDuplicateRows(rows), [rows]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visibleRows = rows.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  const editedCount = Object.keys(drafts).length;
  const selectedRow = rows.find((row) => row.sourceRow === selected);
  const closeEditor = useCallback(() => {
    if (!inFlight.current) setSelected(null);
  }, []);
  const clearDrafts = (sourceRows: number[]) =>
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([key]) => !sourceRows.includes(Number(key)),
        ),
      ),
    );

  useEffect(() => {
    if (!editedCount) return;
    const preventLoss = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [editedCount]);

  const changeField: UpdateField = (sourceRow, field, value) => {
    setDrafts((current) => ({
      ...current,
      [sourceRow]: {
        expectedVersion: session?.rows.find(
          (row) => row.sourceRow === sourceRow,
        )?.version,
        ...current[sourceRow],
        [field]: value,
      },
    }));
    setErrors((current) => ({ ...current, [sourceRow]: "" }));
  };
  const mapCategory = (category: string, sectionId: string) => {
    setDrafts((current) => {
      const next = { ...current };
      for (const row of rows)
        if (row.sourceCategory === category && row.status !== "saved")
          next[row.sourceRow] = {
            expectedVersion: row.version,
            ...next[row.sourceRow],
            menuSectionId: sectionId || null,
          };
      return next;
    });
  };
  const rowState = (row: ProductImportRow) =>
    row.status === "saved"
      ? "saved"
      : row.status === "skipped"
        ? "skipped"
        : importRowIssues(row, activeSections).length
          ? "review"
          : duplicateRows.has(row.sourceRow) &&
              !drafts[row.sourceRow]?.allowDuplicate
            ? "duplicate"
            : "ready";
  const stateClass = (state: string) =>
    state === "saved"
      ? "bg-success-surface text-success"
      : state === "review"
        ? "bg-danger-surface text-danger"
        : state === "duplicate"
          ? "bg-warning/10 text-warning"
          : "bg-surface-muted text-text-muted";

  const selectImport = (id: string) => {
    if (id === importId) return;
    const navigate = () => setSearchParams({ importId: id });
    if (editedCount)
      confirm({
        title: t("product_import.unsaved_title"),
        message: t("product_import.unsaved_message"),
        variant: "warning",
        onConfirm: navigate,
      });
    else navigate();
  };
  const readFile = async (file: File) => {
    if (inFlight.current) return;
    if (!/\.xlsx$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
      addToast(t("product_import.file_error"), "error");
      return;
    }
    inFlight.current = true;
    try {
      const draft = await upload.mutateAsync(file);
      setDrafts({});
      setPage(0);
      setSelected(null);
      setSearchParams({ importId: draft.id });
    } catch {
      /* Shared mutation reports the error. */
    } finally {
      inFlight.current = false;
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const saveDraft = async () => {
    if (!session || inFlight.current) return;
    inFlight.current = true;
    setSavingDraft(true);
    try {
      const edits = session.rows
        .filter((row) => drafts[row.sourceRow] && row.status !== "saved")
        .map((row) => toImportEdit(row, drafts[row.sourceRow]));
      // Stay below the API JSON body limit even for long descriptions.
      for (let index = 0; index < edits.length; index += 25) {
        const chunk = edits.slice(index, index + 25);
        await update.mutateAsync(chunk);
        clearDrafts(chunk.map((row) => row.sourceRow));
      }
      addToast(t("product_import.draft_saved"), "success");
    } catch {
      /* Successful chunks stay saved; remaining edits remain visible. */
    } finally {
      inFlight.current = false;
      setSavingDraft(false);
    }
  };
  const saveRow = async (sourceRow: number, next = false) => {
    if (!session || inFlight.current) return;
    const baseline = session.rows.find((row) => row.sourceRow === sourceRow);
    const row = rows.find((row) => row.sourceRow === sourceRow);
    if (!baseline || !row || rowState(row) !== "ready") return;
    inFlight.current = true;
    setSavingRow(sourceRow);
    try {
      const result = await commit.mutateAsync(
        toImportEdit(baseline, drafts[sourceRow]),
      );
      clearDrafts([sourceRow]);
      setErrors((current) => ({ ...current, [sourceRow]: "" }));
      addToast(
        t("product_import.product_saved", { name: row.name }),
        "success",
      );
      if (next) {
        const index = result.rows.findIndex(
          (item) => item.sourceRow === sourceRow,
        );
        const following = result.rows
          .slice(index + 1)
          .find((item) => item.status === "pending");
        setSelected(following?.sourceRow ?? null);
        if (following)
          setPage(Math.floor(result.rows.indexOf(following) / PAGE_SIZE));
      }
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [sourceRow]:
          error instanceof Error
            ? error.message
            : t("product_import.save_error"),
      }));
    } finally {
      inFlight.current = false;
      setSavingRow(null);
    }
  };
  const toggleSkip = async (sourceRow: number) => {
    if (!session || inFlight.current) return;
    const row = session.rows.find((row) => row.sourceRow === sourceRow);
    if (!row) return;
    inFlight.current = true;
    setSavingRow(sourceRow);
    try {
      const result = await update.mutateAsync([
        {
          sourceRow,
          expectedVersion: row.version,
          status: row.status === "skipped" ? "pending" : "skipped",
        },
      ]);
      const version = result.rows.find(
        (item) => item.sourceRow === sourceRow,
      )?.version;
      setDrafts((current) =>
        current[sourceRow]
          ? {
              ...current,
              [sourceRow]: { ...current[sourceRow], expectedVersion: version },
            }
          : current,
      );
    } catch {
      /* Shared mutation reports the error. */
    } finally {
      inFlight.current = false;
      setSavingRow(null);
    }
  };
  const createCategory = (category: string) =>
    confirm({
      title: t("product_import.create_section"),
      message: t("product_import.create_section_message", { name: category }),
      onConfirm: async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        try {
          const section = await createSection({ restaurantId, name: category });
          mapCategory(category, section.id);
        } finally {
          inFlight.current = false;
        }
      },
    });

  return (
    <BasePageLayout
      title={t("product_import.title")}
      subtitle={t("product_import.subtitle")}
      showNavBack
      headerActions={
        session && (
          <AnatomyButton
            variant="secondary"
            disabled={!editedCount || busy}
            isLoading={savingDraft}
            onClick={() => void saveDraft()}
          >
            <Save className="mr-2 h-4 w-4" />
            {t("product_import.save_draft")}
          </AnatomyButton>
        )
      }
    >
      <section className="rounded-card border border-border bg-background-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-text-main">
                {t("product_import.upload_title")}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {t("product_import.file_help")}
              </p>
            </div>
          </div>
          <label
            className={`inline-flex min-h-11 items-center gap-2 rounded-control border border-primary px-4 py-2 font-bold text-primary ${busy ? "opacity-50" : "cursor-pointer"}`}
          >
            <Upload className="h-4 w-4" />
            {upload.isPending
              ? t("common.loading")
              : t("product_import.choose_file")}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={busy}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                if (editedCount)
                  confirm({
                    title: t("product_import.unsaved_title"),
                    message: t("product_import.unsaved_message"),
                    variant: "warning",
                    onConfirm: () => readFile(file),
                  });
                else void readFile(file);
              }}
            />
          </label>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          {t("product_import.headers_help")}
        </p>
        {list.data && list.data.length > 0 && (
          <div className="mt-4">
            <AnatomySelect
              label={t("product_import.resume")}
              value={importId ?? ""}
              disabled={busy}
              onChange={(event) => {
                if (event.target.value) selectImport(event.target.value);
              }}
            >
              <option value="">{t("product_import.select_import")}</option>
              {list.data.map((draft) => (
                <option key={draft.id} value={draft.id}>
                  {draft.fileName} · {draft.savedCount}/{draft.rowCount}{" "}
                  {t("product_import.saved")}
                </option>
              ))}
            </AnatomySelect>
          </div>
        )}
        {list.isError && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {t("product_import.resume_error")}{" "}
            <button
              type="button"
              className="underline"
              onClick={() => void list.refetch()}
            >
              {t("product_import.retry")}
            </button>
          </p>
        )}
      </section>
      {detail.isLoading && (
        <p role="status" className="text-text-muted">
          {t("common.loading_data")}
        </p>
      )}
      {detail.isError && (
        <div
          role="alert"
          className="rounded-card border border-danger p-4 text-danger"
        >
          {t("product_import.load_error")}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => void detail.refetch()}
          >
            {t("product_import.retry")}
          </button>
        </div>
      )}
      {session && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-text-main">{session.fileName}</h2>
              <p className="text-sm text-text-muted">
                {t("product_import.sheet", { name: session.sheetName })} ·{" "}
                {t("product_import.total_rows", { count: rows.length })}
              </p>
            </div>
            <p className="text-sm text-text-muted" aria-live="polite">
              {t("product_import.progress", {
                saved: rows.filter((row) => row.status === "saved").length,
                ready: rows.filter((row) => rowState(row) === "ready").length,
                review: rows.filter(
                  (row) =>
                    rowState(row) === "review" || rowState(row) === "duplicate",
                ).length,
              })}
            </p>
          </div>
          {sectionsError && (
            <p role="alert" className="text-danger">
              {t("product_import.sections_error")}
            </p>
          )}
          <details
            className="rounded-card border border-border bg-background-card p-5"
            open={activeSections.length === 0 || undefined}
          >
            <summary className="cursor-pointer font-bold text-text-main">
              {t("product_import.map_categories")} ({categories.length})
            </summary>
            <p className="my-3 text-sm text-text-muted">
              {t("product_import.map_help")}
            </p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {categories.map((category) => {
                const candidates = rows.filter(
                  (row) =>
                    row.sourceCategory === category && row.status !== "saved",
                );
                const ids = [
                  ...new Set(candidates.map((row) => row.menuSectionId)),
                ];
                const canCreate =
                  category &&
                  category.length <= 100 &&
                  !activeSections.some(
                    (section) =>
                      normalizedImportName(section.name) ===
                      normalizedImportName(category),
                  );
                return (
                  <div
                    key={category}
                    className="flex flex-wrap items-end gap-2 border-t border-border pt-3"
                  >
                    <div className="min-w-48 flex-1">
                      <AnatomySelect
                        label={category || t("product_import.no_category")}
                        value={ids.length === 1 ? (ids[0] ?? "") : ""}
                        disabled={
                          busy ||
                          sectionsLoading ||
                          sectionsError ||
                          !candidates.length
                        }
                        onChange={(event) =>
                          mapCategory(category, event.target.value)
                        }
                      >
                        <option value="">
                          {ids.length > 1
                            ? t("product_import.mixed_sections")
                            : t("product_import.choose_section")}
                        </option>
                        {activeSections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </AnatomySelect>
                    </div>
                    {canCreate && (
                      <AnatomyButton
                        variant="ghost"
                        disabled={busy || !candidates.length}
                        onClick={() => createCategory(category)}
                      >
                        {t("product_import.create_section")}
                      </AnatomyButton>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
          {editedCount > 0 && (
            <p role="status" className="text-sm text-warning">
              {t("product_import.unsaved_count", { count: editedCount })}
            </p>
          )}
          <div className="overflow-hidden rounded-card border border-border bg-background-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-surface-muted text-xs uppercase text-text-muted">
                  <tr>
                    <th className="p-4">{t("product_import.source")}</th>
                    <th className="min-w-56 p-4">{t("product_import.name")}</th>
                    <th className="w-36 p-4">{t("product_import.price")}</th>
                    <th className="min-w-52 p-4">
                      {t("product_import.section")}
                    </th>
                    <th className="min-w-36 p-4">{t("common.status")}</th>
                    <th className="p-4">{t("product_import.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const state = rowState(row),
                      locked = row.status !== "pending";
                    const issues = importRowIssues(row, activeSections);
                    const duplicate = duplicateRows.has(row.sourceRow);
                    return (
                      <tr
                        key={row.sourceRow}
                        className="border-t border-border align-top"
                      >
                        <td className="p-4 text-xs text-text-muted">
                          {t("product_import.source_row", {
                            row: row.sourceRow,
                          })}
                          <p className="mt-1 max-w-32 break-words">
                            {row.sourceCategory}
                          </p>
                        </td>
                        <td className="p-3">
                          <input
                            className={fieldClass}
                            aria-label={t("product_import.name_row", {
                              row: row.sourceRow,
                            })}
                            maxLength={100}
                            disabled={locked || busy}
                            value={row.name}
                            onChange={(event) =>
                              changeField(
                                row.sourceRow,
                                "name",
                                event.target.value,
                              )
                            }
                            aria-invalid={issues.includes("name_error")}
                          />
                          <button
                            type="button"
                            className="mt-2 text-xs font-bold text-primary underline"
                            onClick={() => setSelected(row.sourceRow)}
                          >
                            {t("product_import.description_preparation")}
                          </button>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className={fieldClass}
                            aria-label={t("product_import.price_row", {
                              row: row.sourceRow,
                            })}
                            min="0"
                            max="99999999.99"
                            step="0.01"
                            disabled={locked || busy}
                            value={row.price ?? ""}
                            onChange={(event) =>
                              changeField(
                                row.sourceRow,
                                "price",
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                              )
                            }
                            aria-invalid={issues.includes("price_error")}
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className={fieldClass}
                            aria-label={t("product_import.section_row", {
                              row: row.sourceRow,
                            })}
                            disabled={
                              locked || busy || sectionsLoading || sectionsError
                            }
                            value={row.menuSectionId ?? ""}
                            onChange={(event) =>
                              changeField(
                                row.sourceRow,
                                "menuSectionId",
                                event.target.value || null,
                              )
                            }
                            aria-invalid={issues.includes("section_error")}
                          >
                            <option value="">
                              {t("product_import.choose_section")}
                            </option>
                            {activeSections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${stateClass(state)}`}
                          >
                            {state === "saved" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {t(`product_import.${state}`)}
                          </span>
                          {!locked && (
                            <div className="mt-2 space-y-1 text-xs text-danger">
                              {issues.map((issue) => (
                                <p key={issue}>
                                  {t(`product_import.${issue}`)}
                                </p>
                              ))}
                            </div>
                          )}
                          {!locked && duplicate && (
                            <label className="mt-2 flex items-start gap-2 text-xs text-text-muted">
                              <input
                                type="checkbox"
                                checked={
                                  drafts[row.sourceRow]?.allowDuplicate ?? false
                                }
                                disabled={busy}
                                onChange={(event) =>
                                  changeField(
                                    row.sourceRow,
                                    "allowDuplicate",
                                    event.target.checked,
                                  )
                                }
                              />
                              <span>
                                {t("product_import.duplicate_consent")}
                              </span>
                            </label>
                          )}
                          {errors[row.sourceRow] && (
                            <p
                              role="alert"
                              className="mt-2 text-xs text-danger"
                            >
                              {errors[row.sourceRow]}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-2">
                            <AnatomyButton
                              className="px-3"
                              disabled={
                                busy ||
                                state !== "ready" ||
                                sectionsLoading ||
                                sectionsError
                              }
                              isLoading={
                                savingRow === row.sourceRow && commit.isPending
                              }
                              onClick={() => void saveRow(row.sourceRow)}
                            >
                              {state === "saved"
                                ? t("product_import.saved")
                                : t("common.save")}
                            </AnatomyButton>
                            {row.status !== "saved" && (
                              <AnatomyButton
                                variant="ghost"
                                className="px-3"
                                disabled={busy}
                                onClick={() => void toggleSkip(row.sourceRow)}
                              >
                                {t(
                                  row.status === "skipped"
                                    ? "product_import.restore"
                                    : "product_import.skip",
                                )}
                              </AnatomyButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-text-muted">
              <p>
                {t("product_import.page_summary", {
                  from: currentPage * PAGE_SIZE + 1,
                  to: Math.min((currentPage + 1) * PAGE_SIZE, rows.length),
                  total: rows.length,
                })}
              </p>
              <div className="flex items-center gap-3">
                <AnatomyButton
                  variant="secondary"
                  aria-label={t("product_import.previous")}
                  disabled={currentPage === 0 || busy}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </AnatomyButton>
                <span>
                  {currentPage + 1} / {pages}
                </span>
                <AnatomyButton
                  variant="secondary"
                  aria-label={t("product_import.next")}
                  disabled={currentPage + 1 === pages || busy}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </AnatomyButton>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {t("product_import.safety_note")}
          </p>
        </div>
      )}
      {selectedRow && (
        <RowEditor
          key={selectedRow.sourceRow}
          row={selectedRow}
          locked={selectedRow.status !== "pending"}
          onClose={closeEditor}
          onChange={changeField}
          onSave={() => void saveRow(selectedRow.sourceRow, true)}
          busy={busy}
          issues={importRowIssues(selectedRow, activeSections).concat(
            duplicateRows.has(selectedRow.sourceRow) &&
              !drafts[selectedRow.sourceRow]?.allowDuplicate
              ? ["duplicate_error"]
              : [],
          )}
        />
      )}
    </BasePageLayout>
  );
}

export default function ProductImportPage() {
  const { t } = useTranslation();
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  const [params] = useSearchParams();
  const importId = params.get("importId") || undefined;
  if (!restaurantId)
    return (
      <BasePageLayout title={t("product_import.title")}>
        <p className="text-text-muted">
          {t("product_import.select_restaurant")}
        </p>
      </BasePageLayout>
    );
  return (
    <ProductImportWorkspace
      key={`${restaurantId}:${importId ?? "new"}`}
      restaurantId={restaurantId}
      importId={importId}
    />
  );
}
