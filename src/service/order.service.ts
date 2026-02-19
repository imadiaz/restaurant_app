import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  ON_WAY: 'ON_WAY',
  DELIVERED: 'DELIVERED',
  COURIER_ARRIVING: 'COURIER_ARRIVING',
  CANCELLED: 'CANCELLED'
} as const;

export const OrderType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP'
} as const;

export const PaymentMethod = {
  CASH: 'CASH',
  CARD: 'CARD'
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const;

// --- SNAPSHOT INTERFACES ---
export interface DeliveryAddressSnapshot {
  alias?: string;
  streetAddress: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  details?: string;
  lat: number;
  lng: number;
}

export interface PaymentSnapshot {
  id?: string | null;
  type?: string | null;
  brand?: string | null;
  last4?: string | null;
  expirationMonth?: string | number;
  expirationYear?: string | number;  
  country?: string | null;  
}

export interface CustomerSnapshot {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
}

export interface DriverSnapshot {
  id: string;
  email: string | null;
  fullName: string;
  phone: string;
  photoUrl: string;
}

export interface StatusHistoryEntry {
  status: typeof OrderStatus[keyof typeof OrderStatus];
  timestamp: string;
  localTime: string;
  comment?: string;
  changedBy: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface OrderProductModifier {
  id: string;
  name: string;
  groupName: string;
  price: number;
}

export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  comment?: string;
  modifiers: OrderProductModifier[];
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // State
  status: typeof OrderStatus[keyof typeof OrderStatus];
  type: typeof OrderType[keyof typeof OrderType];
  
  // Security
  pickupCode?: string;
  deliveryCode?: string;

  // Payment
  paymentMethod: typeof PaymentMethod[keyof typeof PaymentMethod];
  paymentStatus: typeof PaymentStatus[keyof typeof PaymentStatus];
  transactionId?: string;
  changeFor?: number;
  
  // Financials
  subtotal: number;
  deliveryFee: number;
  tip: number;
  totalAmount: number;
  platformFee: number;
  restaurantEarnings: number;

  // Snapshots
  deliveryAddress?: DeliveryAddressSnapshot;
  customerSnapshot?: CustomerSnapshot;
  driverSnapshot?: DriverSnapshot | null;
  statusHistory?: StatusHistoryEntry[];
  paymentSnapshot?: PaymentSnapshot;
  discount?: number | null;
  couponCode?: string | null;

  // Notes
  restaurantNote?: string;
  deliveryNote?: string;
  driverCompletionNote?: string;

  // Relations
  clientId: string;
  restaurantId: string;
  driverId?: string;
  products: OrderProduct[];
  
  estimatedCompletionTime?: string;
}

// --- DTOs (Only for Updates) ---

export interface UpdateOrderStatusDto {
  status: typeof OrderStatus[keyof typeof OrderStatus];
  timeInMinutes?: number;
  note?: string;
}

export interface AssignDriverDto {
  orderId: string;
  driverId: string;
  status: typeof OrderStatus[keyof typeof OrderStatus];
}

// --- SERVICE IMPLEMENTATION ---
export const orderService = {
  
  // 1. Get List by Restaurant
  async getByRestaurant(restaurantId: string, status?: typeof OrderStatus[keyof typeof OrderStatus]): Promise<Order[]> {
    const params = status ? { status } : {};
    const res = await axiosClient.get<any, ApiResponse<Order[]>>(`/orders/restaurant/${restaurantId}`, { params });
    return res.data;
  },

  // 2. Get Details
  async getOne(id: string): Promise<Order> {
    const res = await axiosClient.get<any, ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },

  // 3. Update Status (Restaurant Flow)
  async updateStatus(id: string, data: UpdateOrderStatusDto): Promise<Order> {
    const res = await axiosClient.patch<any, ApiResponse<Order>>(`/orders/${id}/status`, data);
    return res.data;
  },

  // 4. Assign Driver
  async assignDriver(data: AssignDriverDto): Promise<Order> {
    const res = await axiosClient.patch<any, ApiResponse<Order>>(`/orders/${data.orderId}/assign-driver`, { 
      driverId: data.driverId,
      status: data.status 
    });
    return res.data;
  },

  // 5. Get Driver Location
  async getTracking(id: string): Promise<{ lat: number; lng: number }> {
    const res = await axiosClient.get<any, ApiResponse<{ lat: number; lng: number }>>(`/orders/${id}/tracking`);
    return res.data;
  }
};