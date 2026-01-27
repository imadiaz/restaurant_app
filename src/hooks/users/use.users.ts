import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '../use.error.handler';
import { useToastStore } from '../../store/toast.store';
import { userService } from '../../service/user.service';
import { useAuthStore } from '../../store/auth.store';
import { isSuperAdmin } from '../../data/models/user/utils/user.utils';

// Aceptamos un filtro opcional (restaurantId)
export const useUsers = (restaurantId?: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  const {user} = useAuthStore((state) => state);

  const queryKey = ['users', restaurantId || 'all'];

  // --- QUERIES ---
  const { 
    data: users = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      if (restaurantId && !isSuperAdmin(user)) {
        return userService.getAllByRestaurantId(restaurantId);
      }
      return userService.getAll();
    },
    enabled: true, 
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      addToast('Usuario creado correctamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: handleError,
  });

//   // 2. ACTUALIZAR
//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
//       userService.update(id, data),
//     onSuccess: () => {
//       addToast('Usuario actualizado', 'success');
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     },
//     onError: handleError,
//   });

  return {
    // Data
    users,
    isLoading,
    isError,

    // Actions
    createUser: createMutation.mutateAsync,
  //  updateUser: updateMutation.mutateAsync,
    
    // States
    isCreating: createMutation.isPending,
   // isUpdating: updateMutation.isPending,
  };
};