import React from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  Layers,
  CircleDot,
  CheckSquare,
  Edit,
} from "lucide-react";
import AnatomySelect from "../../../components/anatomy/AnatomySelect";
import AnatomyTag from "../../../components/anatomy/AnatomyTag";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { ModifierGroup } from "../../../data/models/products/product";
import { STATUS } from "../../../config/status.config";
import AnatomyCardActions from "../../../components/anatomy/AnatomyCardActions";
interface ModifierGroupCardProps {
  group: ModifierGroup;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: boolean) => void;
}

const ModifierGroupCard: React.FC<ModifierGroupCardProps> = ({
  group,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { t } = useTranslation();
  const isSingle = group.minSelected === 1 && group.maxSelected === 1;
  const optionsCount = group.options?.length || 0;

  return (
    <div className="bg-background-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative">
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isSingle ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "bg-purple-50 text-purple-600 dark:bg-purple-900/20"}`}
        >
          {isSingle ? (
            <CircleDot className="w-6 h-6" />
          ) : (
            <Layers className="w-6 h-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
            <AnatomyText.H3
              className="text-base mb-1 truncate pr-2"
              title={group.name}
            >
              {group.name}
            </AnatomyText.H3>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <AnatomyTag
              variant={isSingle ? "primary" : "default"}
              className="text-xs"
            >
              {isSingle ? (
                <CircleDot className="w-3 h-3 mr-1" />
              ) : (
                <CheckSquare className="w-3 h-3 mr-1" />
              )}
              {isSingle ? t("common.single") : t("common.multi")}
            </AnatomyTag>

            <AnatomyTag
              variant="default"
              className="text-xs text-text-muted bg-gray-100 dark:bg-gray-800 border-transparent"
            >
              {optionsCount}{" "}
              {t("modifiers.options_label", {
                count: optionsCount,
                defaultValue: "options",
              })}
            </AnatomyTag>
          </div>
        </div>
      </div>

      {/* --- BODY / SPACER --- */}
      <div className="mt-auto space-y-4">
        <AnatomyTag
          variant={group.status == STATUS.active ? "success" : "error"}
        >
          {group.status}
        </AnatomyTag>

        <div className="pt-4 border-t border-border grid grid-cols-1 gap-3">
          <AnatomySelect
            label={t("common.status")}
            value={group.status}
            onChange={(e) => onStatusChange(e.target.value === STATUS.active)}
            className="mb-0"
          >
            <option value={STATUS.active}>{t("common.status_active")}</option>
            <option value={STATUS.inactive}>
              {t("common.status_inactive")}
            </option>
          </AnatomySelect>
          <AnatomyCardActions
            secondary={{
              label: t("common.edit"),
              icon: Edit,
              onClick: onEdit,
            }}
            primary={{
              label: t("common.delete"),
              icon: Trash2,
              onClick: onDelete,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ModifierGroupCard;
