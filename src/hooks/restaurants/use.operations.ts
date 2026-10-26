import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantService, type BulkCreateRestaurantFeesDto, type UpdateRestaurantOperationalDto, type UpdateRestaurantCommissionDto } from '../../service/restaurant.service';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';
import { queryKeys } from '../../config/query.keys';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/app.store';


// ---------------------------------------------------------
// 🛠️ RESTAURANT OPERATIONS (Mutations)
// ---------------------------------------------------------
export const useRestaurantOperations = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);

  const commissionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantCommissionDto }) => restaurantService.updateCommission(id, data),
    onSuccess: (restaurant, variables) => {
      queryClient.setQueryData(queryKeys.restaurants.detail(variables.id), restaurant);
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      const active = useAppStore.getState().activeRestaurant;
      if (active?.id === restaurant.id) useAppStore.getState().setActiveRestaurant({ ...active, commissionType: restaurant.commissionType, commissionValue: restaurant.commissionValue });
      addToast(t('settings.commission_saved'), 'success');
    },
    onError: handleError,
  });


   const operationalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantOperationalDto }) =>
      restaurantService.updateOperational(id, data),
    
    onSuccess: (_, variables) => {
      addToast('Operational settings updated successfully', 'success');
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
    onError: handleError,
  });

  const setupPaymentLink = useMutation({
    mutationFn: ({ id }: { id: string }) => 
      restaurantService.setPaymentConfig(id),
    onSuccess: () => {
      addToast('Enlace de configuración de cuenta en stripe connect enviado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
    onError: handleError,
  });

  const generatePaymentLink = useMutation({
    mutationFn: ({ id }: { id: string }) => 
      restaurantService.generatePaymentLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.fees(variables.id) });
    },
    onError: handleError,
  });

  return {
    // Functions
    setupPaymentLink: setupPaymentLink.mutateAsync,
    generatePaymentLink: generatePaymentLink.mutateAsync,
    syncRestaurantFees: syncRestaurantFees.mutateAsync, 
    updateOperational: operationalMutation.mutateAsync,
    updateCommission: commissionMutation.mutateAsync,


    // Loading States
    isSettingUpPaymentLink: setupPaymentLink.isPending,
    isGeneratingPaymentLink: generatePaymentLink.isPending,
    isSyncingFees: syncRestaurantFees.isPending,
    isUpdatingOperational: operationalMutation.isPending,
    isUpdatingCommission: commissionMutation.isPending,
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
    queryKey: queryKeys.restaurants.fees(restaurantId),
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
