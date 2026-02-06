import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '../use.error.handler'; // Adjust path if needed
import { useToastStore } from '../../store/toast.store'; // Adjust path if needed
import { categoryService, type Category, type UpdateCategoryDto } from '../../service/category.service';

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);

  const queryKey = ['categories'];

  const { 
    data: categories = [], 
    isLoading, 
    isError,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      console.log("🚀 Fetching all global categories");
      return categoryService.getAll();
    },
    staleTime: 1000 * 60 * 5, 
  });

  const getCategoryById = async (id: string): Promise<Category | null> => {
    const cachedCategories = queryClient.getQueryData<Category[]>(queryKey);
    const foundCategory = cachedCategories?.find((c) => c.id === id);

    if (foundCategory) {
      return foundCategory;
    }

    try {
      return await categoryService.getById(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      addToast('Category created successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => 
      categoryService.update(id, data),
    onSuccess: () => {
      addToast('Category updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });


  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => 
      categoryService.delete(id),
    onSuccess: () => {
      addToast('Category deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: handleError,
  });


  return {
    // Data
    categories,
    isLoading,
    isError,

    // Actions
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    getCategoryById,
    deleteCategory: deleteMutation.mutateAsync,

    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};