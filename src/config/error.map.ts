// src/config/errorMap.ts

export const ERROR_MESSAGES: Record<string, string> = {
  'AUTH_001': 'Usuario ya registrado',
  'AUTH_002': 'Usuario no encontrado. Verifica tus credenciales.',
  'AUTH_003': 'Contraseña incorrecta',
  'AUTH_004': 'Token expirado',
  'AUTH_005': 'Usuario no encontrado. Verifica tus credenciales.',
  'AUTH_007': 'Contraseña incorrecta. Por favor, inténtalo de nuevo.',
  'AUTH_009': 'El usuario ha sido deshabilitado, contacta con tu administrador',
  'DB_001': 'Ya existe un usuario registrado con ese correo electronico o username',
  'CAT_001':'Ya existe una categoria con ese nombre',
  'CAT_002': 'Categoria no encontrada'
};

export const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error inesperado. Inténtalo más tarde.';