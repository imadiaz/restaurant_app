import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../config/query.keys';
import { orderService, type OrderHistoryFilters } from '../../service/order.service';
import { useAppStore } from '../../store/app.store';

export const useOrderHistory = (filters: OrderHistoryFilters, enabled = true) => {
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  return useQuery({
    queryKey: queryKeys.orders.history(restaurantId, filters.search ?? '', filters.status ?? 'all', filters.page, filters.pageSize),
    queryFn: ({ signal }) => orderService.getHistory(restaurantId!, filters, signal),
    enabled: enabled && !!restaurantId,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchOnWindowFocus: 'always',
  });
};
