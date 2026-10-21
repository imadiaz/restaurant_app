import { create } from "zustand";
import type { Order } from "../service/order.service";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./auth.store";
import { isAccessTokenExpired } from "../config/auth.config";
import queryClient from "../config/query.client.config";
import { queryKeys } from "../config/query.keys";

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
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  const clearRetry = () => {
    clearTimeout(retryTimer);
    retryTimer = undefined;
  };
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
          auth: (callback) => {
            void (async () => {
              try {
                if (isAccessTokenExpired()) {
                  const { refreshTokens } = await import('../service/api/axiosClient');
                  await refreshTokens();
                }
                callback({ token: useAuthStore.getState().accessToken });
              } catch {
                callback({ token: null });
              }
            })();
          },
          transports: ["websocket"],
          autoConnect: true,
        },
      );

      newSocket.on("connect", () => {
        clearRetry();
        newSocket.timeout(10_000).emit(
          "joinRestaurantRoom",
          restaurantId,
          (error: Error | null, response?: { joined?: boolean }) => {
            if (get().socket !== newSocket || !newSocket.connected) return;
            const joined = !error && response?.joined === true;
            set({ isConnected: joined });
            if (joined) {
              void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
            } else {
              newSocket.disconnect();
              scheduleRetry();
            }
          },
        );
      });

      const scheduleRetry = () => {
        clearRetry();
        retryTimer = setTimeout(() => {
          if (get().socket === newSocket && useAuthStore.getState().isAuthenticated) {
            newSocket.connect();
          }
        }, 5_000);
      };

      newSocket.on("disconnect", (reason) => {
        set({ isConnected: false });
        if (reason === 'io server disconnect') scheduleRetry();
      });

      newSocket.on("connect_error", () => {
        set({ isConnected: false });
        // Transport failures reconnect automatically; middleware rejections
        // require an explicit retry with the latest access token.
        if (!newSocket.active) scheduleRetry();
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
      clearRetry();
      const { socket } = get();
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        set({ socket: null, isConnected: false });
      }
    },
  };
});
