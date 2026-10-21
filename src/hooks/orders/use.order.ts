import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../config/query.keys';
import { orderService, type Order } from '../../service/order.service';
import { useAppStore } from '../../store/app.store';

export const useOrder = (orderId: string | undefined, orders: Order[]) => {
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  const { t } = useTranslation();

  return useQuery({
    queryKey: queryKeys.orders.detail(restaurantId, orderId),
    queryFn: async ({ signal }) => {
      const order = await orderService.getOne(orderId!, signal);
      if (order.restaurantId !== restaurantId) {
        throw new Error(t('orders.detail_load_error'));
      }
      return order;
    },
    enabled: Boolean(restaurantId && orderId),
    refetchInterval: 30_000,
    refetchOnWindowFocus: 'always',
    placeholderData: orders.find(
      (order) => order.id === orderId && order.restaurantId === restaurantId,
    ),
  });
};
