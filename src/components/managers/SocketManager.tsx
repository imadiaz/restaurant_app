import React, { useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socket.store';
import { useAppStore } from '../../store/app.store';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '../../service/order.service';
import { useAuthStore } from '../../store/auth.store';


const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const SocketManager: React.FC = () => {
  const { connect, disconnect } = useSocketStore();
  const { activeRestaurant } = useAppStore(); 
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    
if (activeRestaurant?.id && isAuthenticated) {
      connect(activeRestaurant.id, (updatedOrder: Order) => {
        console.log("⚡ Socket Update: Modifying cache directly for order", updatedOrder.id);
        const queryKey = ['orders', activeRestaurant.id, 'all'];
        queryClient.setQueryData<Order[]>(queryKey, (oldOrders) => {
          if (!oldOrders) return [updatedOrder];
          const exists = oldOrders.find(o => o.id === updatedOrder.id);
          if (exists) {
            return oldOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          } else {
            return [updatedOrder, ...oldOrders];
          }
        });
      });
    return () => {
      disconnect();
    };
  }
  }, [connect, disconnect, activeRestaurant?.id, isAuthenticated, queryClient]);

  useEffect(() => {
    const handlePlaySound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn("Audio play blocked:", e));
      }
    };

    window.addEventListener('play-order-sound', handlePlaySound);
    return () => window.removeEventListener('play-order-sound', handlePlaySound);
  }, []);

  return (
    <audio ref={audioRef} src={NOTIFICATION_SOUND} hidden />
  );
};

export default SocketManager;