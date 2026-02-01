import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orderService, OrderStatus, type AssignDriverDto, type Order, type UpdateOrderStatusDto } from '../../service/order.service';
import { useAppStore } from '../../store/app.store';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';


export const useOrders = (statusFilter?: typeof OrderStatus[keyof typeof OrderStatus]) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  const { activeRestaurant } = useAppStore((state) => state);

  const queryKey = ['orders', activeRestaurant?.id, statusFilter || 'all'];

  const { 
    data: orders = [], 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!activeRestaurant?.id) return [];
      return orderService.getByRestaurant(activeRestaurant.id, statusFilter);
    },
    enabled: !!activeRestaurant?.id,
    refetchInterval: 30000, 
    staleTime: 10000,
  });

  const getOrderById = async (id: string): Promise<Order | null> => {
    const cachedOrder = orders.find(o => o.id === id);
    if (cachedOrder) {
      return cachedOrder;
    }

    try {
      return await orderService.getOne(id);
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, status, timeInMinutes, note }: { id: string } & UpdateOrderStatusDto) => 
      orderService.updateStatus(id, { status, timeInMinutes, note }),
    onSuccess: (data) => {
      addToast(`${t('orders.status_updated')}: ${data.status}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: handleError
  });

  const assignDriver = useMutation({
    mutationFn: (data: AssignDriverDto) => 
      orderService.assignDriver(data),
    onSuccess: () => {
      addToast(t('orders.driver_assigned') || 'Driver assigned', 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: handleError
  });

  return {
    // Data
    orders,
    isLoading,
    isError,
    
    // Actions
    refetch,
    getOrderById,
    updateStatus: updateStatus.mutateAsync,
    assignDriver: assignDriver.mutateAsync,

    // Loading States
    isUpdating: updateStatus.isPending,
    isAssigning: assignDriver.isPending
  };
};