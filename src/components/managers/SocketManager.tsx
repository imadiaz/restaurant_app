import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (activeRestaurant?.id && isAuthenticated) {
      connect(activeRestaurant.id, (updatedOrder: Order, event) => {
        syncOrderInCache(queryClient, activeRestaurant.id, updatedOrder);

        if (event === 'newOrder') {
          const toastId = `order-${updatedOrder.id}-${Date.now()}`;
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => undefined);
          }
          addCustomToast(
            React.createElement(OrderNotificationToast, {
              order: updatedOrder,
              onClose: () => removeToast(toastId),
            }),
            10000,
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
    };
    }
  }, [connect, disconnect, activeRestaurant?.id, isAuthenticated, queryClient, addToast, addCustomToast, removeToast]);

  return (
    <audio ref={audioRef} src={NOTIFICATION_SOUND} hidden />
  );
};

export default SocketManager;
