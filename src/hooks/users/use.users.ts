import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '../use.error.handler';
import { useToastStore } from '../../store/toast.store';
import { userService, type CreateUserDto, type UpdateUserDto } from '../../service/user.service';
import { useAuthStore } from '../../store/auth.store';
import { isSuperAdmin } from '../../data/models/user/utils/user.utils';
import type { User } from '../../data/models/user/user';
import { useAppStore } from '../../store/app.store';

export const useUsers = (restaurantIdOverride?: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  const { user } = useAuthStore((state) => state);
  const { activeRestaurant } = useAppStore((state) => state);

  const effectiveRestaurantId = restaurantIdOverride || activeRestaurant?.id;

  const queryKey = ['users', effectiveRestaurantId || 'all'];

  const { 
    data: users = [], 
    isLoading, 
    isError,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log("🚀 Fetching users. Effective Restaurant Context:", effectiveRestaurantId || "NONE (Global)");

      if (effectiveRestaurantId) {
         return userService.getAllByRestaurantId(effectiveRestaurantId);
      }

      if (isSuperAdmin(user)) {
         return userService.getAll();
      }

      return []; 
    },
    enabled: true, 
  });

  const getUserById = async (id: string): Promise<User | null> => {
    const cachedUsers = queryClient.getQueryData<User[]>(queryKey);
    const foundUser = cachedUsers?.find((u) => u.id === id);

    if (foundUser) {
      return foundUser;
    }

    try {
      return await userService.getUserById(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => {
      const finalData = { ...data };
      if (activeRestaurant?.id && !finalData.restaurantId) {
          finalData.restaurantId = activeRestaurant.id;
      }
      return userService.create(finalData);
    },
    onSuccess: (data) => {
      console.log("🚀 User created:", data);
      addToast('Usuario creado correctamente', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
      userService.update(id, data),
    onSuccess: () => {
      addToast('Usuario actualizado', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    // Data
    users,
    isLoading,
    isError,

    // Actions
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    getUserById,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};