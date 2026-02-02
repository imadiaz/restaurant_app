import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Layers } from "lucide-react";
import AnatomyButton from "../../components/anatomy/AnatomyButton";
import BasePageLayout from "../../components/layout/BaseLayout";
import { useModifiers } from "../../hooks/modifiers/use.modifiers";
import { useAppNavigation } from "../../hooks/navigation/use.app.navigation";
import AnatomySearchBar from "../../components/anatomy/AnatomySearchBar";
import ModifierGroupCard from "./components/ModifierCard";
import { Routes } from "../../config/routes";
import { useConfirm } from "../../hooks/use.confirm.modal";

const ModifiersPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useAppNavigation();
  const { modifiers, isLoading, deleteGroup, toggleStatus } = useModifiers();
  const { confirm } = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = modifiers.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (deleteId: string) => {
    confirm({
      title: t("confirm_modal.delete_group"),
      message: t("confirm_modal.delete_group_description"),
      variant: "danger",
      confirmText: t("confirm_modal.confirm"),
      onConfirm: async () => {
        await deleteGroup(deleteId);
      },
    });
  };

  const handleToggleStatus = async (groupId: string, isActive: boolean) => {
    confirm({
      title: t("confirm_modal.change_status_group"),
      message: t("confirm_modal.change_status_group_description"),
      variant: "danger",
      confirmText: t("confirm_modal.confirm"),
      onConfirm: async () => {
        await toggleStatus({ id: groupId, isActive: isActive });
      },
    });
  };

  return (
    <BasePageLayout
      title={t("modifiers.title")}
      subtitle={t("modifiers.subtitle")}
      isLoading={isLoading}
      headerActions={
        <AnatomyButton onClick={() => navigateTo(Routes.ModifiersAdd)}>
          <Plus className="w-5 h-5 mr-2" /> {t("products.add_modifier")}
        </AnatomyButton>
      }
      isEmpty={modifiers.length === 0 && !isLoading}
      emptyLabel={t("modifiers.empty_list")}
      emptyIcon={Layers}
      renderControls={
        <div className="w-full">
          <AnatomySearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.search")}
          />
        </div>
      }
    >
      <>
        {modifiers.length > 0 && filtered.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p>{t("common.no_results_found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filtered.map((group) => (
              <ModifierGroupCard
                key={group.id}
                group={group}
                onEdit={() => navigateTo(Routes.ModifiersEdit(group.id))}
                onDelete={() => handleDelete(group.id)}
                onStatusChange={(status) =>
                  handleToggleStatus(group.id, status)
                }
              />
            ))}
          </div>
        )}
      </>
    </BasePageLayout>
  );
};

export default ModifiersPage;
