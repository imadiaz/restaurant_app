import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../../store/app.store";
import { modifierService } from "../../service/modifiers.service";
import { useToastStore } from "../../store/toast.store";
import { useErrorHandler } from "../use.error.handler";
import type { CreateModifierGroup } from "../../service/products.service";


export const useModifiers = () => {
  const { activeRestaurant } = useAppStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const { handleError } = useErrorHandler();

  const queryKey = ['modifiers', activeRestaurant?.id || 'all'];

  // --- FETCH ---
  const { 
    data: modifiers = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!activeRestaurant?.id) return [];
      return modifierService.getAllByRestaurant(activeRestaurant.id);
    },
    enabled: !!activeRestaurant?.id,
  });

  // --- MUTATIONS ---

  // 1. Create Group (✅ Injects restaurantId automatically)
  const createGroupMutation = useMutation({
    mutationFn: (data: CreateModifierGroup) => {
      if (!activeRestaurant?.id) {
        throw new Error("No active restaurant selected. Cannot create modifier group.");
      }

      const payload = {
        ...data,
        restaurantId: activeRestaurant.id, // Automatic injection
      };

      return modifierService.createGroup(payload);
    },
    onSuccess: () => {
      addToast('Modifier Group created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // 2. Update Group
  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateModifierGroup> }) =>
      modifierService.updateGroup(id, data),
    onSuccess: () => {
      addToast('Group updated', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // 3. Delete Group
  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => modifierService.deleteGroup(id),
    onSuccess: () => {
      addToast('Group deleted', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // 4. Toggle Status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      modifierService.toggleGroupStatus(id, isActive),
    onSuccess: (_, vars) => {
      addToast(`Group ${vars.isActive ? 'activated' : 'deactivated'}`, 'info');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    modifiers,
    isLoading,
    isError,
    createGroup: createGroupMutation.mutateAsync,
    updateGroup: updateGroupMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending,
  };
};