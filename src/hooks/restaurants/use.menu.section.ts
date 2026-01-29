import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/toast.store';
import { useAppStore } from '../../store/app.store';
import type { MenuSection } from '../../data/models/menu/menu.section';
import { useErrorHandler } from '../use.error.handler';
import { menuSectionService, type UpdateMenuSectionDto, type UpdateMenuSectionStatus } from '../../service/menu.service';


export const useMenuSections = (restaurantIdInput?: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  
  const { activeRestaurant } = useAppStore((state) => state);
  const effectiveRestaurantId = restaurantIdInput || activeRestaurant?.id;

  const queryKey = ['menu-sections', effectiveRestaurantId || 'all'];

  const { 
    data: sections = [], 
    isLoading, 
    isError,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      console.log("🚀 Fetching sections for restaurant:", effectiveRestaurantId);
      if (effectiveRestaurantId) {
        return menuSectionService.getAllByRestaurantId(effectiveRestaurantId);
      }
      return Promise.resolve([]);
    },
    enabled: !!effectiveRestaurantId, 
  });

  const getSectionById = async (id: string): Promise<MenuSection | null> => {
    const cachedSections = queryClient.getQueryData<MenuSection[]>(queryKey);
    const foundSection = cachedSections?.find((s) => s.id === id);

    if (foundSection) {
      return foundSection;
    }

    try {
      return await menuSectionService.getById(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const createMutation = useMutation({
    mutationFn: menuSectionService.create,
    onSuccess: () => {
      addToast('Section created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuSectionDto }) => 
      menuSectionService.update(id, data),
    onSuccess: () => {
      addToast('Section updated', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const deleteMutation = useMutation({
    mutationFn: menuSectionService.delete,
    onSuccess: () => {
      addToast('Section deleted', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuSectionStatus }) => 
      menuSectionService.toggleStatus(id, data),
    onSuccess: () => {
      addToast('Section updated', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    // Data
    sections,
    isLoading,
    isError,

    // Actions
    createSection: createMutation.mutateAsync,
    updateSection: updateMutation.mutateAsync,
    deleteSection: deleteMutation.mutateAsync,
    getSectionById,
    updateStatus:updateStatus.mutateAsync,
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggleStatus: updateStatus.isPending
  };
};