import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '../use.error.handler';
import { useToastStore } from '../../store/toast.store';
import { restaurantService, type CreateRestaurantDto, type UpdateRestaurantDto } from '../../service/restaurant.service';
import type { Restaurant } from '../../data/models/restaurant/restaurant';


export const useRestaurants = (restaurantId?: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);

  const queryKey = ['restaurants', restaurantId || 'all'];

  const { 
    data: restaurants = [],
    isLoading, 
    isError,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log("🚀 Fetching restaurantId:", restaurantId);
      if (restaurantId) {
        const restaurant = await restaurantService.getById(restaurantId);
        return [restaurant];
      }
      return restaurantService.getAll();
    },
    enabled: true, 
  });

  const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
    const cachedRestaurants = queryClient.getQueryData<any[]>(['restaurants', 'all']);
    const foundRestaurant = cachedRestaurants?.find((u) => u.id === id);

    if (foundRestaurant) {
      return foundRestaurant;
    }

    try {
      return await restaurantService.getById(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // 3. MUTATIONS
  const createMutation = useMutation({
    mutationFn: (data: CreateRestaurantDto) => restaurantService.create(data),
    onSuccess: () => {
      addToast('Restaurante creado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantDto }) => 
      restaurantService.update(id, data),
    onSuccess: (data) => {
      addToast('Restaurante actualizado', 'success');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  const toggleOpenMutation = useMutation({
    mutationFn: ({ id, isOpen }: { id: string; isOpen: boolean }) => 
      restaurantService.toggleOpenStatus(id, isOpen),
    onSuccess: (data) => {
      const status = data.isOpen ? 'Abierto' : 'Cerrado';
      addToast(`Restaurante ahora está ${status}`, 'info');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: handleError,
  });

  return {
    restaurants, // Now this variable exists
    isLoading,
    isError,

    // ACTIONS (Async)
    createRestaurant: createMutation.mutateAsync,
    updateRestaurant: updateMutation.mutateAsync,
    toggleOpen: toggleOpenMutation.mutateAsync,
    getRestaurantById: getRestaurantById,

    // LOADING STATES
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};