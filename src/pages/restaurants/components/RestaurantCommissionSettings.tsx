import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Percent, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyButton from "../../../components/anatomy/AnatomyButton";
import AnatomySelect from "../../../components/anatomy/AnatomySelect";
import AnatomyTextField from "../../../components/anatomy/AnatomyTextField";
import { queryKeys } from "../../../config/query.keys";
import type { Restaurant } from "../../../data/models/restaurant/restaurant";
import { useRestaurantOperations } from "../../../hooks/restaurants/use.operations";
import {
  CommissionType,
  restaurantService,
} from "../../../service/restaurant.service";
import {
  commissionAmount,
  commissionPayload,
  commissionValidation,
} from "../../../utils/commission.utils";

function CommissionForm({
  restaurant,
  onSuccess,
}: {
  restaurant: Restaurant;
  onSuccess?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState<CommissionType>(
    restaurant.commissionType ?? CommissionType.PERCENTAGE,
  );
  const [value, setValue] = useState(String(restaurant.commissionValue ?? ""));
  const [error, setError] = useState<string>();
  const { updateCommission, isUpdatingCommission } = useRestaurantOperations();
  const validation = commissionValidation(type, value);
  const money = (amount: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  const save = async () => {
    if (isUpdatingCommission) return;
    if (validation) {
      setError(validation);
      return;
    }
    try {
      const updated = await updateCommission({
        id: restaurant.id,
        data: commissionPayload(type, value),
      });
      setType(updated.commissionType ?? type);
      setValue(String(updated.commissionValue ?? value));
      setError(undefined);
      onSuccess?.();
    } catch {
      /* Keep the draft; the shared error handler reports the failure. */
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">{t("settings.commission_help")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnatomySelect
          label={t("settings.commission_type")}
          value={type}
          disabled={isUpdatingCommission}
          onChange={(event) => {
            setType(event.target.value as CommissionType);
            setError(undefined);
          }}
        >
          <option value={CommissionType.PERCENTAGE}>
            {t("settings.comm_percentage")}
          </option>
          <option value={CommissionType.FIXED_AMOUNT}>
            {t("settings.comm_fixed")}
          </option>
        </AnatomySelect>
        <AnatomyTextField
          label={t(
            type === CommissionType.PERCENTAGE
              ? "settings.commission_percentage_label"
              : "settings.commission_fixed_label",
          )}
          type="number"
          min={0}
          max={type === CommissionType.PERCENTAGE ? 100 : 99999999.99}
          step="0.01"
          required
          value={value}
          disabled={isUpdatingCommission}
          onChange={(event) => {
            setValue(event.target.value);
            setError(undefined);
          }}
          error={error ? t(error) : undefined}
          icon={
            type === CommissionType.PERCENTAGE ? (
              <Percent className="w-4 h-4" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )
          }
        />
      </div>
      <p className="text-xs text-text-muted">
        {t(
          type === CommissionType.PERCENTAGE
            ? "settings.commission_percentage_help"
            : "settings.commission_fixed_help",
        )}
      </p>
      <p aria-live="polite" className="text-sm font-medium">
        {validation
          ? t("settings.commission_preview_invalid")
          : t("settings.commission_example", {
              subtotal: money(200),
              commission: money(commissionAmount(type, Number(value), 200)),
            })}
      </p>
      <p className="text-xs text-text-muted">
        {t("settings.commission_future_orders")}
      </p>
      <AnatomyButton
        type="button"
        onClick={() => void save()}
        isLoading={isUpdatingCommission}
      >
        <Save className="w-4 h-4 mr-2" />
        {t("settings.save_commission")}
      </AnatomyButton>
    </div>
  );
}

/** Mount only for superadmins. Load authoritative settings rather than a stale card/store snapshot. */
export default function RestaurantCommissionSettings({
  restaurantId,
  onSuccess,
}: {
  restaurantId: string;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const { data, isPending, isError, isFetchedAfterMount, refetch } = useQuery({
    queryKey: queryKeys.restaurants.detail(restaurantId),
    queryFn: () => restaurantService.getById(restaurantId),
    staleTime: 0,
    refetchOnMount: "always",
  });
  if (isPending || !isFetchedAfterMount)
    return (
      <p role="status" className="text-sm text-text-muted">
        {t("common.loading")}
      </p>
    );
  if (isError || !data)
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-danger">
          {t("settings.commission_load_error")}
        </p>
        <AnatomyButton
          type="button"
          variant="secondary"
          onClick={() => void refetch()}
        >
          {t("settings.commission_retry")}
        </AnatomyButton>
      </div>
    );
  return (
    <CommissionForm
      key={restaurantId}
      restaurant={data}
      onSuccess={onSuccess}
    />
  );
}
