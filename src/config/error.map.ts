// src/config/errorMap.ts

export const ERROR_MESSAGE_KEYS: Record<string, string> = {
  AUTH_001: 'api_errors.auth.user_registered',
  AUTH_002: 'api_errors.auth.user_not_found',
  AUTH_003: 'api_errors.auth.invalid_password',
  AUTH_004: 'api_errors.auth.expired_token',
  AUTH_005: 'api_errors.auth.user_not_found',
  AUTH_007: 'api_errors.auth.invalid_password',
  AUTH_009: 'api_errors.auth.user_disabled',
  AUTH_010: 'api_errors.rate_limited',
  DB_001: 'api_errors.database.duplicate_user',
  CAT_001: 'api_errors.categories.duplicate',
  CAT_002: 'api_errors.categories.not_found',
  CLIENT_NETWORK: 'api_errors.network',
  CLIENT_UNEXPECTED: 'api_errors.default',
};

export const DEFAULT_ERROR_KEY = 'api_errors.default';
