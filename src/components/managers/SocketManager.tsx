import React, { useCallback, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socket.store';
import { useAppStore } from '../../store/app.store';
import { useQueryClient } from '@tanstack/react-query';
import { OrderStatus, orderService, PaymentMethod, PaymentStatus, type Order } from '../../service/order.service';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import OrderNotificationToast from '../common/OrderNotificationToast';
import { syncOrderInCache } from '../../utils/order.cache.utils';
import { useErrorHandler } from '../../hooks/use.error.handler';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../../config/roles';

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const SocketManager: React.FC = () => {
  const { connect, disconnect } = useSocketStore();
  const { activeRestaurant } = useAppStore(); 
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const addToast = useToastStore((state) => state.addToast);
  const addCustomToast = useToastStore((state) => state.addCustomToast);
  const removeToast = useToastStore((state) => state.removeToast);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeOrderToastsRef = useRef(new Map<string, string>());

  const stopNotificationSound = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const dismissOrderNotification = useCallback((orderId: string, toastId: string) => {
    if (activeOrderToastsRef.current.get(orderId) === toastId) {
      activeOrderToastsRef.current.delete(orderId);
    }
    removeToast(toastId);

    if (activeOrderToastsRef.current.size === 0) {
      stopNotificationSound();
    }
  }, [removeToast, stopNotificationSound]);

  useEffect(() => {
    const activeOrderToasts = activeOrderToastsRef.current;

    if (activeRestaurant?.id && isAuthenticated) {
      connect(activeRestaurant.id, (updatedOrder: Order, event) => {
        syncOrderInCache(queryClient, activeRestaurant.id, updatedOrder);

        if (event === 'newOrder') {
          const toastId = `order-${updatedOrder.id}-${Date.now()}`;
          const previousToastId = activeOrderToasts.get(updatedOrder.id);
          if (previousToastId) removeToast(previousToastId);
          activeOrderToasts.set(updatedOrder.id, toastId);

          const isPaidCardOrder =
            updatedOrder.paymentMethod === PaymentMethod.CARD &&
            updatedOrder.paymentStatus === PaymentStatus.PAID;
          const canRefundCardOrder =
            user?.role.name === ROLES.SUPER_ADMIN ||
            user?.role.name === ROLES.ADMIN;
          const canCancel =
            updatedOrder.status === OrderStatus.PENDING &&
            (!isPaidCardOrder || canRefundCardOrder);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => undefined);
          }
          addCustomToast(
            React.createElement(OrderNotificationToast, {
              order: updatedOrder,
              onClose: () => dismissOrderNotification(updatedOrder.id, toastId),
              onCancel: canCancel
                ? async () => {
                    const reason = t('orders.cancel_pending.reason');
                    try {
                      const cancelledOrder = isPaidCardOrder
                        ? await orderService.refund(updatedOrder.id, {
                            requestId: crypto.randomUUID(),
                            reason,
                          })
                        : await orderService.updateStatus(updatedOrder.id, {
                            status: OrderStatus.CANCELLED,
                            note: reason,
                          });

                      syncOrderInCache(queryClient, updatedOrder.restaurantId, cancelledOrder);
                      addToast(
                        isPaidCardOrder
                          ? t('orders.cancel_pending.refund_requested')
                          : t('orders.cancel_pending.cancelled'),
                        'success',
                      );
                      dismissOrderNotification(updatedOrder.id, toastId);
                    } catch (error) {
                      handleError(error);
                      throw error;
                    }
                  }
                : undefined,
            }),
            0,
            toastId,
          );
          return;
        }

        const activeToastId = activeOrderToasts.get(updatedOrder.id);
        if (activeToastId && updatedOrder.status !== OrderStatus.PENDING) {
          dismissOrderNotification(updatedOrder.id, activeToastId);
        }

        const shortId = updatedOrder.id.slice(0, 5);
        const message = updatedOrder.status === 'ON_WAY'
          ? `Driver picked up Order #${shortId}`
          : updatedOrder.status === 'DELIVERED'
            ? `Order #${shortId} has been Delivered!`
            : `Order #${shortId} updated to ${updatedOrder.status}`;
        addToast(message, 'info');
      });
    return () => {
      disconnect();
      activeOrderToasts.forEach(removeToast);
      activeOrderToasts.clear();
      stopNotificationSound();
    };
    }
  }, [connect, disconnect, activeRestaurant?.id, isAuthenticated, user?.role.name, queryClient, addToast, addCustomToast, dismissOrderNotification, removeToast, stopNotificationSound, handleError, t]);

  return (
    <audio ref={audioRef} src={NOTIFICATION_SOUND} loop hidden />
  );
};

export default SocketManager;
