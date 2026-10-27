import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, type Order, type OrderProductModifier } from '../service/order.service';

export const canCancelOrder = (order: Pick<Order, 'status'>) =>
  Object.values(OrderStatus).includes(order.status) &&
  order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;

export const requiresOnlineRefund = (order: Pick<Order, 'paymentMethod' | 'paymentStatus'>) =>
  order.paymentMethod === PaymentMethod.CARD && order.paymentStatus === PaymentStatus.PAID;

export const shortOrderId = (id: string) => id.slice(0, 6).toUpperCase();

// The API stores modifier quantities/totals per unit of the parent product.
export const orderModifierSummary = (modifier: OrderProductModifier, productQuantity: number) => ({
  quantity: (modifier.quantity ?? 1) * productQuantity,
  total: Number(modifier.totalPrice ?? Number(modifier.price) * (modifier.quantity ?? 1)) * productQuantity,
});

export const canCompletePickup = (order: Pick<Order, 'type' | 'status'>) =>
  order.type === OrderType.PICKUP && order.status === OrderStatus.READY;
