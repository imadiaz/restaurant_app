import { OrderStatus, PaymentMethod, PaymentStatus, type Order } from '../service/order.service';

export const canCancelBeforePreparation = (order: Pick<Order, 'status'>) =>
  order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

export const requiresOnlineRefund = (order: Pick<Order, 'paymentMethod' | 'paymentStatus'>) =>
  order.paymentMethod === PaymentMethod.CARD && order.paymentStatus === PaymentStatus.PAID;

export const shortOrderId = (id: string) => id.slice(0, 5);
