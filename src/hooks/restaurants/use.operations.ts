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
    
    onSuccess: (data, variables) => {
      addToast('Operational settings updated successfully', 'success');
        queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  const adminConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateRestaurantDto }) =>
      restaurantService.updateAdminConfig(id, data),
      
    onSuccess: (data, variables) => {
      addToast('Restaurant configuration updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  return {
    updateOperational: operationalMutation.mutateAsync,
    updateAdminConfig: adminConfigMutation.mutateAsync,

    isUpdatingOperational: operationalMutation.isPending,
    isUpdatingAdminConfig: adminConfigMutation.isPending,
    
    operationalError: operationalMutation.error,
    adminConfigError: adminConfigMutation.error,
  };
};