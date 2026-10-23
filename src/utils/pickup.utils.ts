export const normalizePickupCode = (code: string) => code.trim().toUpperCase();
export const isValidPickupCode = (code: string) => /^[A-HJKMNP-Z2-9]{6}$/.test(normalizePickupCode(code));

export const formatPickupSchedule = (value: string | null | undefined, locale: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short',
  }).format(date);
};
