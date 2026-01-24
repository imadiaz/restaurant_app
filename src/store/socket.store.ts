import { create } from 'zustand';
import { useToastStore } from './toast.store';
import OrderNotificationToast from '../components/common/OrderNotificationToast';
import React from 'react';

interface SocketState {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

// --- MOCK DATA GENERATOR ---
// Generates a random order to simulate incoming WebSocket data
const generateMockOrder = () => {
  const id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const items = [
    { name: 'Cheese Burger', qty: 1, price: 12.00, modifiers: [{ name: 'Extra Cheese', price: 1 }] },
    { name: 'Fries', qty: 1, price: 5.00 }
  ];
  
  return {
    id: `#${id}`,
    customer: { 
      name: ['Alex Johnson', 'Sam Smith', 'Jordan Lee'][Math.floor(Math.random() * 3)], 
      phone: '555-0199', 
      email: 'customer@example.com' 
    },
    status: 'new' as const,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    address: '123 Fake St, New York, NY',
    paymentMethod: 'Credit Card',
    orderNote: Math.random() > 0.7 ? 'Please ring doorbell' : undefined,
    subtotal: 17.00,
    tax: 1.36,
    deliveryFee: 2.00,
    total: 20.36,
    items: items
  };
};

export const useSocketStore = create<SocketState>((set) => {
  let socket: WebSocket | null = null;
  let mockInterval: any = null;

  return {
    isConnected: false,

    connect: () => {
      // Prevent multiple connections
      if (mockInterval) return;

      console.log("🔌 Socket Connecting (Mock Mode)...");
      set({ isConnected: true });

      // --- MOCK SIMULATION ---
      // Simulates receiving a "NEW_ORDER" event every 30 seconds
      mockInterval = setInterval(() => {
        const newOrder = generateMockOrder();
        
        // 1. Add to Order Store (Global State)
        //useOrderStore.getState().addOrder(newOrder);

        // 2. Play Sound
        // We dispatch a custom event that SocketManager.tsx listens for
        window.dispatchEvent(new Event('play-order-sound'));

        // 3. Trigger Custom Notification
        // We generate a unique ID so we can close this specific toast programmatically
        const toastId = `order-${newOrder.id}-${Date.now()}`;
        
        useToastStore.getState().addCustomToast(
          React.createElement(OrderNotificationToast, {
            order: newOrder,
            onClose: () => useToastStore.getState().removeToast(toastId)
          }),
         12000000
        );

      }, 12000000);
    },

    disconnect: () => {
      if (socket) {
        socket.close();
        socket = null;
      }
      if (mockInterval) {
        clearInterval(mockInterval);
        mockInterval = null;
      }
      set({ isConnected: false });
      console.log("🔌 Socket Disconnected");
    }
  };
});