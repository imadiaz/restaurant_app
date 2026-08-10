const STRONG_PASSWORD_PATTERN = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isBlank = (value: string | null | undefined): boolean => !value?.trim();

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

export const isStrongPassword = (value: string): boolean =>
  value.length >= 8 && STRONG_PASSWORD_PATTERN.test(value);

export const hasMinimumDigits = (value: string, minimum: number): boolean =>
  value.replace(/\D/g, '').length >= minimum;
