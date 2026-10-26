import { useAppStore } from '../../store/app.store';
import OrdersPage from './OrdersPage';

export default function OrderHistoryPage() {
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  return <OrdersPage key={restaurantId ?? 'none'} mode="history" />;
}
