import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orderService, OrderStatus, RefundStatus, type AssignDriverDto, type Order, type UpdateOrderStatusDto } from '../../service/order.service';
import { useAppStore } from '../../store/app.store';
import { useToastStore } from '../../store/toast.store';
import { useErrorHandler } from '../use.error.handler';
import { queryKeys } from '../../config/query.keys';
import { useSocketStore } from '../../store/socket.store';
import { syncOrderInCache } from '../../utils/order.cache.utils';
import { canCancelBeforePreparation, requiresOnlineRefund } from '../../utils/order.actions';


export const useOrders = (statusFilter?: typeof OrderStatus[keyof typeof OrderStatus]) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  const { activeRestaurant } = useAppStore((state) => state);
  const isSocketConnected = useSocketStore((state) => state.isConnected);

  const queryKey = queryKeys.orders.list(activeRestaurant?.id, statusFilter || 'all');

  const { 
    data: orders = [], 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!activeRestaurant?.id) return [];
      return orderService.getByRestaurant(activeRestaurant.id, statusFilter, signal);
    },
    enabled: !!activeRestaurant?.id,
    refetchInterval: (query) => {
      const currentOrders = (query.state.data ?? []) as Order[];
      const hasPendingRefund = currentOrders.some(
        (order) => order.refund?.status === RefundStatus.PENDING,
      );
      if (hasPendingRefund) return 10000;
      // Reconcile missed socket events even while the transport is connected.
      return 30000;
    },
    refetchOnWindowFocus: 'always',
    staleTime: isSocketConnected ? 60000 : 10000,
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
      if (activeRestaurant?.id) {
        syncOrderInCache(queryClient, activeRestaurant.id, data);
      }
    },
    onError: handleError
  });

  const assignDriver = useMutation({
    mutationFn: (data: AssignDriverDto) => 
      orderService.assignDriver(data),
    onSuccess: (data) => {
      addToast(t('orders.driver_assigned') || 'Driver assigned', 'success');
      if (activeRestaurant?.id) {
        syncOrderInCache(queryClient, activeRestaurant.id, data);
      }
    },
    onError: handleError
  });

  const refundOrder = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.refund(id, {
        requestId: crypto.randomUUID(),
        reason,
      }),
    onSuccess: (data) => {
      addToast(t('orders.refund.updated'), 'success');
      if (activeRestaurant?.id) {
        syncOrderInCache(queryClient, activeRestaurant.id, data);
      }
    },
    onError: handleError,
  });

  const cancelOrder = useMutation({
    mutationFn: async (id: string) => {
      const order = await orderService.getOne(id);
      if (!canCancelBeforePreparation(order)) {
        throw new Error(t('orders.cancel_pending.unavailable'));
      }
      const reason = t('orders.cancel_pending.reason');
      return requiresOnlineRefund(order)
        ? orderService.refund(id, { requestId: crypto.randomUUID(), reason })
        : orderService.updateStatus(id, { status: OrderStatus.CANCELLED, note: reason });
    },
    onSuccess: (order) => {
      syncOrderInCache(queryClient, order.restaurantId, order);
      addToast(t(order.refund?.status === RefundStatus.PENDING
        ? 'orders.cancel_pending.refund_pending'
        : 'orders.cancel_pending.cancelled'), 'success');
    },
    onError: handleError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });

  const completePickup = useMutation({
    mutationFn: ({ id, verificationCode }: { id: string; verificationCode: string }) =>
      orderService.completePickup(id, verificationCode),
    onSuccess: (order) => {
      syncOrderInCache(queryClient, order.restaurantId, order);
      addToast(t('orders.pickup.delivered'), 'success');
    },
    onError: handleError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
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
    refundOrder: refundOrder.mutateAsync,
    cancelOrder: cancelOrder.mutateAsync,
    completePickup: completePickup.mutateAsync,
    isCompletingPickup: completePickup.isPending,

    // Loading States
    isUpdating: updateStatus.isPending,
    isAssigning: assignDriver.isPending,
    isRefunding: refundOrder.isPending,
    isCancelling: cancelOrder.isPending,
  };
};
