import { create } from 'zustand';
import { useToastStore } from './toast.store';
import OrderNotificationToast from '../components/common/OrderNotificationToast';
import React from 'react';
import type { Order } from '../service/order.service';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
connect: (restaurantId: string, onOrderUpdate?: (order: Order) => void) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
  return {
    socket: null,
    isConnected: false,

    connect: (restaurantId: string, onDataUpdate) => {
      const { socket } = get();
      if (socket?.connected) return;

      console.log("🔌 Initializing Socket Connection...");

      const storage = localStorage.getItem('auth-storage');
      let token = '';
      if (storage) {
        const parsed = JSON.parse(storage);
        token = parsed.state?.user?.token || '';
      }

      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: { token },
        transports: ['websocket'],
        autoConnect: true,
      });

      newSocket.on('connect', () => {
        console.log(`✅ Connected to WebSocket. ID: ${newSocket.id}`);
        set({ isConnected: true });
        console.log(`joining room: restaurant_${restaurantId}`);
        newSocket.emit('joinRestaurantRoom', restaurantId);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket');
        set({ isConnected: false });
      });

      newSocket.on('newOrder', (orderData: Order) => {
        console.log("🔔 New Order Received:", orderData);
        window.dispatchEvent(new Event('play-order-sound'));
        const toastId = `order-${orderData.id}-${Date.now()}`;
        
        useToastStore.getState().addCustomToast(
           React.createElement(OrderNotificationToast, {
             order: orderData,
             onClose: () => useToastStore.getState().removeToast(toastId)
           }),
           10000
        );

        if (onDataUpdate) {
           onDataUpdate(orderData);
        }
      });

      newSocket.on('orderUpdate', (orderData: Order) => {
        console.log("🔄 Order Update:", orderData);
        let message = `Order #${orderData.id.slice(0, 5)} updated to ${orderData.status}`;
        
        if (orderData.status === 'ON_WAY') {
            message = `Driver picked up Order #${orderData.id.slice(0, 5)}`;
        } else if (orderData.status === 'DELIVERED') {
            message = `✅ Order #${orderData.id.slice(0, 5)} has been Delivered!`;
        }

        useToastStore.getState().addToast(message, 'info');
        if (onDataUpdate) onDataUpdate(orderData);
      });

      set({ socket: newSocket });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
        set({ socket: null, isConnected: false });
      }
    }
  };
});