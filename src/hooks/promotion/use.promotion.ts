import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/toast.store'; // Adjust path
import { useErrorHandler } from '../use.error.handler';
import { promotionsService, type CreatePromotionDto, type Promotion, type UpdatePromotionDto } from '../../service/promotion.service';
import { useAppStore } from '../../store/app.store';



export const usePromotions = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { activeRestaurant } = useAppStore(); // ✅ Getting context from store
  const addToast = useToastStore((state) => state.addToast);

  // Dynamic key based on the store
  const queryKey = ['promotions', activeRestaurant?.id || 'all'];

  // --- 1. GET ALL (By Active Restaurant) ---
  const { 
    data: promotions = [], 
    isLoading, 
    isError,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!activeRestaurant?.id) return [];
      console.log(`🚀 Fetching promotions for active restaurant: ${activeRestaurant.id}`);
      return promotionsService.getAllByRestaurant(activeRestaurant.id);
    },
    // Only fetch if we have an active restaurant in the store
    enabled: !!activeRestaurant?.id, 
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // --- 2. GET BY ID (Cache First Strategy) ---
  const getPromotionById = async (id: string): Promise<Promotion | null> => {
    const cachedList = queryClient.getQueryData<Promotion[]>(queryKey);
    const found = cachedList?.find((p) => p.id === id);

    if (found) {
      return found;
    }

    try {
      return await promotionsService.getById(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // --- 3. CREATE ---
  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionDto) => promotionsService.create(data),
    onSuccess: () => {
      addToast('Promotion created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // --- 4. UPDATE (Edit or Pause) ---
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionDto }) => 
      promotionsService.update(id, data),
    onSuccess: () => {
      addToast('Promotion updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // --- 5. DELETE (Soft Delete) ---
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => 
      promotionsService.delete(id),
    onSuccess: () => {
      addToast('Promotion deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    // Data
    promotions,
    isLoading,
    isError,

    // Actions
    getPromotionById,
    createPromotion: createMutation.mutateAsync,
    updatePromotion: updateMutation.mutateAsync,
    deletePromotion: deleteMutation.mutateAsync,

    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};