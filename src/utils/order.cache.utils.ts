import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../config/query.keys";
import type { Order } from "../service/order.service";

export const syncOrderInCache = (
  queryClient: QueryClient,
  restaurantId: string,
  updatedOrder: Order,
) => {
  const cachedQueries = queryClient.getQueriesData<Order[]>({
    queryKey: queryKeys.orders.all,
  });

  cachedQueries.forEach(([queryKey, orders]) => {
    const [, cachedRestaurantId, status = "all"] = queryKey;
    if (cachedRestaurantId !== restaurantId || !orders) return;

    const belongsToList = status === "all" || status === updatedOrder.status;
    const nextOrders = belongsToList
      ? orders.some((order) => order.id === updatedOrder.id)
        ? orders.map((order) => order.id === updatedOrder.id ? updatedOrder : order)
        : [updatedOrder, ...orders]
      : orders.filter((order) => order.id !== updatedOrder.id);

    queryClient.setQueryData(queryKey, nextOrders);
  });
};
