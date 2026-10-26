import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useSocketStore } from "../../store/socket.store";
import { useAppStore } from "../../store/app.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  OrderStatus,
  orderService,
  PaymentMethod,
  PaymentStatus,
  type Order,
} from "../../service/order.service";
import { useAuthStore } from "../../store/auth.store";
import { useToastStore } from "../../store/toast.store";
import OrderNotificationToast from "../common/OrderNotificationToast";
import { syncOrderInCache } from "../../utils/order.cache.utils";
import { shortOrderId } from "../../utils/order.actions";
import { useErrorHandler } from "../../hooks/use.error.handler";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../config/roles";
import { queryKeys } from "../../config/query.keys";
import { createPendingOrderAlerts } from "../../utils/pending.order.alerts";

const NOTIFICATION_SOUND = "/audio/new-order-alarm.mp3";

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
  const pendingAudioResumeRef = useRef<(() => void) | null>(null);
  const alerts = useMemo(
    () => createPendingOrderAlerts(activeRestaurant?.id, user?.id),
    [activeRestaurant?.id, user?.id],
  );
  // Global recovery also runs when the user is outside the orders screen.
  const { data: recoveredOrders } = useQuery({
    queryKey: queryKeys.orders.list(activeRestaurant?.id),
    queryFn: ({ signal }) =>
      orderService.getByRestaurant(activeRestaurant!.id, undefined, signal),
    enabled: Boolean(activeRestaurant?.id && isAuthenticated),
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: "always",
  });

  const clearPendingAudioResume = useCallback(() => {
    const resume = pendingAudioResumeRef.current;
    if (!resume) return;

    window.removeEventListener("pointerdown", resume, true);
    window.removeEventListener("keydown", resume, true);
    pendingAudioResumeRef.current = null;
  }, []);

  const playNotificationSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    clearPendingAudioResume();
    audio.currentTime = 0;
    audio.play().catch(() => {
      const resumeAfterUserGesture = () => {
        clearPendingAudioResume();
        if (activeOrderToastsRef.current.size === 0) return;
        audio.play().catch(() => undefined);
      };

      pendingAudioResumeRef.current = resumeAfterUserGesture;
      window.addEventListener("pointerdown", resumeAfterUserGesture, true);
      window.addEventListener("keydown", resumeAfterUserGesture, true);
    });
  }, [clearPendingAudioResume]);

  const stopNotificationSound = useCallback(() => {
    clearPendingAudioResume();
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [clearPendingAudioResume]);

  const dismissOrderNotification = useCallback(
    (orderId: string, toastId: string) => {
      if (activeOrderToastsRef.current.get(orderId) === toastId) {
        activeOrderToastsRef.current.delete(orderId);
      }
      removeToast(toastId);

      if (activeOrderToastsRef.current.size === 0) {
        stopNotificationSound();
      }
    },
    [removeToast, stopNotificationSound],
  );

  const announceOrder = useCallback(
    (updatedOrder: Order) => {
      if (!alerts.claim(updatedOrder)) return;
      const activeOrderToasts = activeOrderToastsRef.current;
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

      playNotificationSound();
      addCustomToast(
        React.createElement(OrderNotificationToast, {
          order: updatedOrder,
          onClose: () => dismissOrderNotification(updatedOrder.id, toastId),
          onCancel: canCancel
            ? async () => {
                const reason = t("orders.cancel_pending.reason");
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

                  syncOrderInCache(
                    queryClient,
                    updatedOrder.restaurantId,
                    cancelledOrder,
                  );
                  addToast(
                    isPaidCardOrder
                      ? t("orders.cancel_pending.refund_requested")
                      : t("orders.cancel_pending.cancelled"),
                    "success",
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
    },
    [
      alerts,
      user?.role.name,
      playNotificationSound,
      addCustomToast,
      dismissOrderNotification,
      t,
      queryClient,
      addToast,
      handleError,
      removeToast,
    ],
  );

  useEffect(() => {
    const activeOrderToasts = activeOrderToastsRef.current;
    return () => {
      activeOrderToasts.forEach(removeToast);
      activeOrderToasts.clear();
      alerts.reset();
      stopNotificationSound();
    };
  }, [alerts, removeToast, stopNotificationSound]);

  useEffect(() => {
    const activeOrderToasts = activeOrderToastsRef.current;
    if (activeRestaurant?.id && isAuthenticated) {
      connect(activeRestaurant.id, (updatedOrder: Order, event) => {
        if (updatedOrder.restaurantId !== activeRestaurant.id) return;
        syncOrderInCache(queryClient, activeRestaurant.id, updatedOrder);
        if (event === "newOrder") {
          announceOrder(updatedOrder);
          return;
        }
        alerts.rememberResolved(updatedOrder);

        const activeToastId = activeOrderToasts.get(updatedOrder.id);
        if (activeToastId && updatedOrder.status !== OrderStatus.PENDING) {
          dismissOrderNotification(updatedOrder.id, activeToastId);
        }

        const shortId = shortOrderId(updatedOrder.id);
        const message =
          updatedOrder.status === "ON_WAY"
            ? `Driver picked up Order #${shortId}`
            : updatedOrder.status === "DELIVERED"
              ? `Order #${shortId} has been Delivered!`
              : `Order #${shortId} updated to ${updatedOrder.status}`;
        addToast(message, "info");
      });
      return () => {
        disconnect();
      };
    }
  }, [
    connect,
    disconnect,
    activeRestaurant?.id,
    isAuthenticated,
    alerts,
    queryClient,
    addToast,
    dismissOrderNotification,
    removeToast,
    stopNotificationSound,
    announceOrder,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !activeRestaurant?.id) return;
    for (const order of recoveredOrders ?? []) {
      if (order.restaurantId !== activeRestaurant.id) continue;
      announceOrder(order);
      if (order.status !== OrderStatus.PENDING) {
        const toastId = activeOrderToastsRef.current.get(order.id);
        if (toastId) dismissOrderNotification(order.id, toastId);
      }
    }
  }, [
    recoveredOrders,
    isAuthenticated,
    activeRestaurant?.id,
    announceOrder,
    dismissOrderNotification,
  ]);

  return (
    <audio ref={audioRef} src={NOTIFICATION_SOUND} loop preload="auto" hidden />
  );
};

export default SocketManager;
