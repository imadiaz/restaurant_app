import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, type Order } from '../service/order.service';

export const canCancelBeforePreparation = (order: Pick<Order, 'status'>) =>
  order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

export const requiresOnlineRefund = (order: Pick<Order, 'paymentMethod' | 'paymentStatus'>) =>
  order.paymentMethod === PaymentMethod.CARD && order.paymentStatus === PaymentStatus.PAID;

export const shortOrderId = (id: string) => id.slice(0, 5);

export const canCompletePickup = (order: Pick<Order, 'type' | 'status'>) =>
  order.type === OrderType.PICKUP && order.status === OrderStatus.READY;
