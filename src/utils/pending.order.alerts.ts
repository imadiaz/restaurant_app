import { OrderStatus, type Order } from "../service/order.service";

// One tracker per signed-in user/restaurant session. Socket and HTTP recovery
// share it, so a dismissed or already announced order never rings again.
export const createPendingOrderAlerts = (
  restaurantId?: string,
  userId?: string,
) => {
  // Including the user keeps alert deduplication isolated across account changes.
  const session = { restaurantId, userId };
  const seen = new Set<string>();
  return {
    reset() {
      seen.clear();
    },
    claim(order: Pick<Order, "id" | "restaurantId" | "status">) {
      if (
        !session.restaurantId ||
        order.restaurantId !== session.restaurantId ||
        seen.has(order.id)
      )
        return false;
      seen.add(order.id);
      return order.status === OrderStatus.PENDING;
    },
    rememberResolved(order: Pick<Order, "id" | "restaurantId" | "status">) {
      if (
        order.restaurantId === restaurantId &&
        order.status !== OrderStatus.PENDING
      )
        seen.add(order.id);
    },
  };
};
