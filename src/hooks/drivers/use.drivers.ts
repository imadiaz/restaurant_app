import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService, type CreateDriverDto, type Driver} from '../../service/drivers.service';
import { useAppStore } from '../../store/app.store';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';
import { isSuperAdmin } from '../../data/models/user/utils/user.utils';
import { useAuthStore } from '../../store/auth.store';


export const useDrivers = (restaurantIdOverride?: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  
  const { activeRestaurant } = useAppStore((state) => state);
  const { user } = useAuthStore((state) => state);
  const effectiveRestaurantId = restaurantIdOverride || activeRestaurant?.id;

  const queryKey = ['drivers', effectiveRestaurantId || 'all'];

  const { 
    data: drivers = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log("🚀 Fetching drivers. Effective Context:", effectiveRestaurantId || "NONE");

      if (effectiveRestaurantId) {
         return driverService.getAllByRestaurantId(effectiveRestaurantId);
      }
       if (isSuperAdmin(user)) { return driverService.getAll(); }

      return []; 
    },
    enabled: true,
  });

  const getDriverById = async (id: string): Promise<Driver| null> => {
    const cachedDrivers = queryClient.getQueryData<Driver[]>(queryKey);
    const foundDriver = cachedDrivers?.find((d) => d.id === id);

    if (foundDriver) {
      return foundDriver;
    }
    try {
      return await driverService.getDriverById(id); 
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateDriverDto) => {
      const finalData = { ...data };
        if (activeRestaurant?.id && !finalData.restaurantId) {
          finalData.restaurantId = activeRestaurant.id;
      }
      
      return driverService.create(finalData);
    },
    onSuccess: (data) => {
      console.log("🚀 Driver created:", data);
      addToast('Driver created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDriverDto> }) => driverService.update(id, data),
    onSuccess: () => {
      addToast('Driver updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({id, status}: {id: string, status: string}) => driverService.updateStatus({id, status}),
    onSuccess: () => {
      addToast('Driver status updated', 'info');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    // Data
    drivers,
    isLoading,
    isError,

    // Actions
    createDriver: createMutation.mutateAsync,
    updateDriver: updateMutation.mutateAsync,
    updateDriverStatus: updateStatusMutation.mutateAsync,
    getDriverById,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};