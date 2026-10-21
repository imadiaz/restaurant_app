export const MIN_PREPARATION_MINUTES = 5;
export const MAX_PREPARATION_MINUTES = 240;

export const isValidPreparationTime = (value: number) =>
  Number.isInteger(value) &&
  value >= MIN_PREPARATION_MINUTES && value <= MAX_PREPARATION_MINUTES;

export const initialPreparationTime = (value?: number) =>
  Number.isFinite(value)
    ? Math.min(MAX_PREPARATION_MINUTES, Math.max(MIN_PREPARATION_MINUTES, Math.round(value!)))
    : 20;
