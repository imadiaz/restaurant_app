import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSuperAdmin } from '../../data/models/user/utils/user.utils';
import { couponService, type CreateCouponDto, CouponScope, type UpdateCouponDto, type Coupon } from '../../service/coupons.service';
import { useAppStore } from '../../store/app.store';
import { useAuthStore } from '../../store/auth.store';
import { useErrorHandler } from '../use.error.handler';
import { useToastStore } from '../../store/toast.store';


export const useCoupons = (restaurantIdOverride?: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  
  const { activeRestaurant } = useAppStore((state) => state);
  const { user } = useAuthStore((state) => state);
  
  // Determine effective ID: Override > Active Restaurant
  const effectiveRestaurantId = restaurantIdOverride || activeRestaurant?.id;

  const queryKey = ['coupons', effectiveRestaurantId || 'all'];

  // --------------------------------------------------------
  // 1. FETCH COUPONS
  // --------------------------------------------------------
  const { 
    data: coupons = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log("🚀 Fetching coupons. Context:", effectiveRestaurantId || "ALL");

      // A. If we are in a Restaurant Context (Owner or Admin viewing specific restaurant)
      if (effectiveRestaurantId) {
         return couponService.getAll(effectiveRestaurantId);
      }
      
      // B. If we are Super Admin viewing global list
      if (isSuperAdmin(user)) { 
        return couponService.getAll(); 
      }

      return []; 
    },
    enabled: !!user, // Only fetch if logged in
  });

  // --------------------------------------------------------
  // 2. HELPER: GET BY ID
  // --------------------------------------------------------
  const getCouponById = async (id: string): Promise<Coupon | null> => {
    // First, try to find it in the cache to avoid a network call
    const cachedCoupons = queryClient.getQueryData<Coupon[]>(queryKey);
    const found = cachedCoupons?.find((c) => c.id === id);

    if (found) return found;

    try {
      // If not in cache, you could fetch it individually if your service supports getOne
      // For now, since coupons are usually small lists, we rely on the list cache
      // or you can add `getOne` to your service.
      return null; 
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  // --------------------------------------------------------
  // 3. CREATE MUTATION
  // --------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: CreateCouponDto) => {
      const finalData = { ...data };
      
      // Auto-inject restaurant ID if we are in a restaurant context
      // and the scope is set to 'restaurant'
      if (
        activeRestaurant?.id && 
        finalData.scope === CouponScope.RESTAURANT && 
        !finalData.restaurantId
      ) {
         finalData.restaurantId = activeRestaurant.id;
      }
      
      return couponService.create(finalData);
    },
    onSuccess: () => {
      addToast('Coupon created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // --------------------------------------------------------
  // 4. UPDATE MUTATION
  // --------------------------------------------------------
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) => 
      couponService.update(id, data),
    onSuccess: () => {
      addToast('Coupon updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  // --------------------------------------------------------
  // 5. DELETE MUTATION
  // --------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () => {
      addToast('Coupon deleted', 'info');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    // Data
    coupons,
    isLoading,
    isError,

    // Actions
    createCoupon: createMutation.mutateAsync,
    updateCoupon: updateMutation.mutateAsync,
    deleteCoupon: deleteMutation.mutateAsync,
    getCouponById,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};