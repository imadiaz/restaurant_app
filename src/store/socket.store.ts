import { create } from "zustand";
import type { Order } from "../service/order.service";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./auth.store";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: (
    restaurantId: string,
    onOrderEvent?: (order: Order, event: "newOrder" | "orderUpdate") => void,
  ) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
  return {
    socket: null,
    isConnected: false,

    connect: (restaurantId: string, onOrderEvent) => {
      const { socket } = get();
      if (socket) return;

      const userToken = useAuthStore.getState().accessToken;

      if (!userToken) return;

      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:3000",
        {
          auth: (callback) => callback({
            token: useAuthStore.getState().accessToken,
          }),
          transports: ["websocket"],
          autoConnect: true,
        },
      );

      newSocket.on("connect", () => {
        set({ isConnected: true });
        newSocket.emit("joinRestaurantRoom", restaurantId);
      });

      newSocket.on("disconnect", () => {
        set({ isConnected: false });
      });

      newSocket.on("newOrder", (orderData: Order) => {
        onOrderEvent?.(orderData, "newOrder");
      });

      newSocket.on("orderUpdate", (orderData: Order) => {
        onOrderEvent?.(orderData, "orderUpdate");
      });

      set({ socket: newSocket });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        set({ socket: null, isConnected: false });
      }
    },
  };
});
