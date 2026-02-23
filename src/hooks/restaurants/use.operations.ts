import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantService, type BulkCreateRestaurantFeesDto, type UpdateRestaurantOperationalDto, } from '../../service/restaurant.service';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';


// ---------------------------------------------------------
// 🛠️ RESTAURANT OPERATIONS (Mutations)
// ---------------------------------------------------------
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

  const setupPaymentLink = useMutation({
    mutationFn: ({ id }: { id: string }) => 
      restaurantService.setPaymentConfig(id),
    onSuccess: () => {
      addToast('Enlace de configuración de cuenta en stripe connect enviado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  const generatePaymentLink = useMutation({
    mutationFn: ({ id }: { id: string }) => 
      restaurantService.generatePaymentLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  // 🆕 NEW: Mutation to Sync/Overwrite the custom fees
  const syncRestaurantFees = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BulkCreateRestaurantFeesDto }) => 
      restaurantService.syncFees(id, data),
    onSuccess: (_, variables) => {
      addToast('Tarifas actualizadas exitosamente', 'success');
      // Invalidate the specific fees query so the UI updates instantly
      queryClient.invalidateQueries({ queryKey: ['restaurantFees', variables.id] });
    },
    onError: handleError,
  });

  return {
    // Functions
    setupPaymentLink: setupPaymentLink.mutateAsync,
    generatePaymentLink: generatePaymentLink.mutateAsync,
    syncRestaurantFees: syncRestaurantFees.mutateAsync, 
    updateOperational: operationalMutation.mutateAsync,


    // Loading States
    isSettingUpPaymentLink: setupPaymentLink.isPending,
    isGeneratingPaymentLink: generatePaymentLink.isPending,
    isSyncingFees: syncRestaurantFees.isPending,
    isUpdatingOperational: operationalMutation.isPending,
  };
};

// ---------------------------------------------------------
// 📖 RESTAURANT FEES (Query)
// ---------------------------------------------------------
export const useRestaurantFees = (restaurantId?: string) => {
  const { handleError } = useErrorHandler();

  const {
    data: fees = [], // Default to empty array
    isLoading: isLoadingFees,
    isError: isErrorFees,
    refetch: refetchFees,
  } = useQuery({
    // Cache key tied specifically to this restaurant's ID
    queryKey: ['restaurantFees', restaurantId],
    queryFn: async () => {
      try {
        return await restaurantService.getFees(restaurantId!);
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // Only run the query if we actually have a restaurantId
    enabled: !!restaurantId,
  });

  return {
    fees,
    isLoadingFees,
    isErrorFees,
    refetchFees,
  };
};