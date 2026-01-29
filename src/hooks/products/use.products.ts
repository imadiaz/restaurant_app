import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../store/app.store';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';
import type { Product } from '../../data/models/products/product';
import { productService, type CreateProductDto } from '../../service/products.service';


export const useProducts = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { activeRestaurant } = useAppStore();
  const addToast = useToastStore((state) => state.addToast);

  const queryKey = ['products', activeRestaurant?.id || 'all'];

  const { 
    data: products = [], 
    isLoading,
    isError
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!activeRestaurant?.id) return [];
      return productService.getAllByRestaurant(activeRestaurant.id);
    },
    enabled: !!activeRestaurant?.id,
  });

  const getProductById = async (id: string): Promise<Product | null> => {
    const cachedList = queryClient.getQueryData<Product[]>(queryKey);
    const found = cachedList?.find((p) => p.id === id);

    if (found) {
      return found;
    }

    try {
      return await productService.getById(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto) => productService.create(data),
    onSuccess: () => {
      addToast('Product created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductDto> }) => 
      productService.update(id, data),
    onSuccess: () => {
      addToast('Product updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => 
      productService.toggleAvailability(id, isAvailable),
    onSuccess: (_, variables) => {
      const status = variables.isAvailable ? 'Available' : 'Sold Out';
      addToast(`Product marked as ${status}`, 'info');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  return {
    // Data
    products,
    isLoading,
    isError,

    // Actions
    getProductById,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    toggleAvailability: toggleAvailabilityMutation.mutateAsync,

    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdaingStatus: toggleAvailabilityMutation.isPaused
  };
};