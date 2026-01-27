// src/config/errorMap.ts

export const ERROR_MESSAGES: Record<string, string> = {
  //Autentication Errors
  'AUTH_002': 'Usuario no encontrado. Verifica tus credenciales.',
  'AUTH_007': 'Contraseña incorrecta. Por favor, inténtalo de nuevo.',
  'DB_001': 'Ya existe un usuario registrado con ese correo electronico o username'
};

export const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error inesperado. Inténtalo más tarde.';