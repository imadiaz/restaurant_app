import React, { useCallback, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socket.store';
import { useAppStore } from '../../store/app.store';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '../../service/order.service';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import OrderNotificationToast from '../common/OrderNotificationToast';
import { syncOrderInCache } from '../../utils/order.cache.utils';

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const SocketManager: React.FC = () => {
  const { connect, disconnect } = useSocketStore();
  const { activeRestaurant } = useAppStore(); 
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const addCustomToast = useToastStore((state) => state.addCustomToast);
  const removeToast = useToastStore((state) => state.removeToast);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeOrderToastIdsRef = useRef(new Set<string>());

  const stopNotificationSound = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const dismissOrderNotification = useCallback((toastId: string) => {
    activeOrderToastIdsRef.current.delete(toastId);
    removeToast(toastId);

    if (activeOrderToastIdsRef.current.size === 0) {
      stopNotificationSound();
    }
  }, [removeToast, stopNotificationSound]);

  useEffect(() => {
    const activeOrderToastIds = activeOrderToastIdsRef.current;

    if (activeRestaurant?.id && isAuthenticated) {
      connect(activeRestaurant.id, (updatedOrder: Order, event) => {
        syncOrderInCache(queryClient, activeRestaurant.id, updatedOrder);

        if (event === 'newOrder') {
          const toastId = `order-${updatedOrder.id}-${Date.now()}`;
          activeOrderToastIds.add(toastId);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => undefined);
          }
          addCustomToast(
            React.createElement(OrderNotificationToast, {
              order: updatedOrder,
              onClose: () => dismissOrderNotification(toastId),
            }),
            0,
            toastId,
          );
          return;
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
      activeOrderToastIds.forEach(removeToast);
      activeOrderToastIds.clear();
      stopNotificationSound();
    };
    }
  }, [connect, disconnect, activeRestaurant?.id, isAuthenticated, queryClient, addToast, addCustomToast, dismissOrderNotification, removeToast, stopNotificationSound]);

  return (
    <audio ref={audioRef} src={NOTIFICATION_SOUND} loop hidden />
  );
};

export default SocketManager;
