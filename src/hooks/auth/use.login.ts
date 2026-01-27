import { useMutation } from '@tanstack/react-query';

import { useNavigate } from 'react-router-dom'; // Asumiendo React Router
import { useAuthStore } from '../../store/auth.store';
import { useErrorHandler } from '../use.error.handler';
import { authService } from '../../service/auth.service';
import { useAppStore } from '../../store/app.store';

export const useLogin = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const {setActiveRestaurant} = useAppStore((state) => state);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      setCredentials(user);
      if(user.restaurant) {
        setActiveRestaurant(user.restaurant);
      } else {
        setActiveRestaurant(null);
      }
      navigate('/');
    },
    onError: (error) => {
      handleError(error);
    }
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};