import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastStore } from '../store/toast.store';
import { DEFAULT_ERROR_KEY, ERROR_MESSAGE_KEYS } from '../config/error.map';
import { AppError } from '../data/models/api/api.types';


export const useErrorHandler = () => {
  const addToast = useToastStore((state) => state.addToast);
  const { t } = useTranslation();

  const handleError = useCallback((error: unknown) => {
    let message = t(DEFAULT_ERROR_KEY);
    let type: 'error' | 'warning' = 'error';
    if (error instanceof AppError) {
      if (error.errorCode && ERROR_MESSAGE_KEYS[error.errorCode]) {
        message = t(ERROR_MESSAGE_KEYS[error.errorCode]);
      } 
      else if (error.message) {
        message = error.message;
      }
      if (error.statusCode === 400) {
         type = 'warning';
      }
    } 
    else if (error instanceof Error) {
      message = error.message;
    }

    addToast(message, type, 4000); 
  
  }, [addToast, t]);

  return { handleError };
};
