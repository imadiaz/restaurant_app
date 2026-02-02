import { useMutation } from '@tanstack/react-query';

import { useNavigate } from 'react-router-dom'; // Asumiendo React Router
import { useAuthStore } from '../../store/auth.store';
import { useErrorHandler } from '../use.error.handler';
import { authService } from '../../service/auth.service';
import { useAppStore } from '../../store/app.store';
import { isSuperAdmin } from '../../data/models/user/utils/user.utils';
import { useToastStore } from '../../store/toast.store';

export const useLogin = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const {setActiveRestaurant} = useAppStore((state) => state);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();
  const {addToast} = useToastStore();

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const {user} = data;
      const isAdmin = isSuperAdmin(user);
      const hasRestaurant = !!user.restaurant;
      if (!isAdmin && !hasRestaurant) {
          addToast('Tu usuario no tiene un restaurante asignado. Contacta a tu administrador.', 'error');
        return; 
      }
        setCredentials(user, data.access_token, data.refresh_token); 
      if (hasRestaurant) {
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