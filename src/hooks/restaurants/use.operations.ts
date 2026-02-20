import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateRestaurantOperationalDto, restaurantService, type AdminUpdateRestaurantDto } from '../../service/restaurant.service';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';


export const useRestaurantOperations = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);

  const operationalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantOperationalDto }) =>
      restaurantService.updateOperational(id, data),
    
    onSuccess: (_, variables) => {
      addToast('Operational settings updated successfully', 'success');
        queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  const adminConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateRestaurantDto }) =>
      restaurantService.updateAdminConfig(id, data),
      
    onSuccess: (_, variables) => {
      addToast('Restaurant configuration updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

   const setupPaymentLink = useMutation({
      mutationFn: ({ id }: { id: string; }) => 
        restaurantService.setPaymentConfig(id),
      onSuccess: (_) => {
        addToast('Enlace de configuración de cuenta en strip connect enviado exitosamente', 'success');
        queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      },
      onError: handleError,
    });
  

  return {
    updateOperational: operationalMutation.mutateAsync,
    updateAdminConfig: adminConfigMutation.mutateAsync,
    setupPaymentLink: setupPaymentLink.mutateAsync,

    isUpdatingOperational: operationalMutation.isPending,
    isUpdatingAdminConfig: adminConfigMutation.isPending,
    isSettingUpPaymentLink: setupPaymentLink.isPending,
    
    operationalError: operationalMutation.error,
    adminConfigError: adminConfigMutation.error,
  };
};