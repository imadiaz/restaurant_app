import { useCallback } from 'react';
import { useToastStore } from '../store/toast.store';
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from '../config/error.map';
import { AppError } from '../data/models/api/api.types';


export const useErrorHandler = () => {
  const addToast = useToastStore((state) => state.addToast);

  const handleError = useCallback((error: unknown) => {
    let message = DEFAULT_ERROR_MESSAGE;
    let type: 'error' | 'warning' = 'error';
      console.log('AppError detected:', JSON.stringify(error));
    if (error instanceof AppError) {
      if (error.errorCode && ERROR_MESSAGES[error.errorCode]) {
        message = ERROR_MESSAGES[error.errorCode];
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
  
  }, [addToast]);

  return { handleError };
};