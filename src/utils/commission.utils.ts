import {
  CommissionType,
  type UpdateRestaurantCommissionDto,
} from "../service/restaurant.service";

export function commissionValidation(
  type: CommissionType,
  raw: string,
): string | undefined {
  if (!Object.values(CommissionType).includes(type))
    return "settings.commission_invalid_type";
  if (!raw.trim()) return "forms.required";
  const value = Number(raw);
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 99999999.99 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
  )
    return "settings.commission_invalid_value";
  if (type === CommissionType.PERCENTAGE && value > 100)
    return "settings.commission_invalid_percentage";
}

export function commissionPayload(
  type: CommissionType,
  raw: string,
): UpdateRestaurantCommissionDto {
  const error = commissionValidation(type, raw);
  if (error) throw new Error(error);
  return { commissionType: type, commissionValue: Number(raw) };
}

export function commissionAmount(
  type: CommissionType,
  value: number,
  subtotal: number,
): number {
  return (
    Math.round(
      (type === CommissionType.PERCENTAGE ? (subtotal * value) / 100 : value) *
        100,
    ) / 100
  );
}

export function formatCommission(
  type: CommissionType | undefined,
  value: string | number | undefined,
  language: string,
): string {
  if (
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value)) ||
    !type
  )
    return "—";
  return type === CommissionType.PERCENTAGE
    ? `${new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(Number(value))}%`
    : new Intl.NumberFormat(language, {
        style: "currency",
        currency: "MXN",
      }).format(Number(value));
}
