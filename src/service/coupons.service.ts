import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";

// Enums matching your Backend
export const CouponType = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  FREE_DELIVERY: 'free_delivery',
} as const;

export type CouponType =
  typeof CouponType[keyof typeof CouponType];

export const CouponScope = {
  GLOBAL: 'global',
  RESTAURANT:'restaurant',
  REFERRAL:'referral',
} as const;

export type CouponScope =
  typeof CouponScope[keyof typeof CouponScope];

// The Coupon Entity (Frontend shape)
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  scope: CouponScope;
  restaurant?: { id: string; name: string }; // Simplified relation
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string; // ISO Date String
  endDate: string;   // ISO Date String
  usageLimitGlobal?: number;
  usageLimitPerUser: number;
  currentUsages: number;
  isActive: boolean;
  createdAt: string;
}

// DTOs
export interface CreateCouponDto {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  scope: CouponScope;
  restaurantId?: string; // Required if scope is RESTAURANT
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimitGlobal?: number;
  usageLimitPerUser?: number;
  isActive?: boolean;
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {
  isActive?: boolean;
}


export const couponService = {

  // 1. Get All Coupons (Optional: Filter by Restaurant for Admin view)
  async getAll(restaurantId?: string): Promise<Coupon[]> {
    // If restaurantId is passed, it adds ?restaurantId=... to the URL
    // Useful for Super Admins filtering a specific restaurant's coupons
    const params = restaurantId ? { restaurantId } : {};
    
    const res = await axiosClient.get<any, ApiResponse<Coupon[]>>('/coupons', { params });
    return res.data; 
  },

  // 2. Create Coupon
  async create(data: CreateCouponDto): Promise<Coupon> {
    const res = await axiosClient.post<any, ApiResponse<Coupon>>('/coupons', data);
    return res.data;
  },

  // 3. Update Coupon
  async update(id: string, data: UpdateCouponDto): Promise<Coupon> {
    const res = await axiosClient.patch<any, ApiResponse<Coupon>>(`/coupons/${id}`, data);
    return res.data;
  },

  // 4. Delete Coupon (Soft Delete)
  async delete(id: string): Promise<void> {
    await axiosClient.delete<any, ApiResponse<void>>(`/coupons/${id}`);
  },

  // 5. Validate Coupon (Optional - useful for testing directly from admin panel)
  // This mirrors the validation logic if you want to check if a code works
  async checkValidity(code: string, restaurantId: string, orderTotal: number): Promise<Coupon> {
    const res = await axiosClient.post<any, ApiResponse<Coupon>>('/coupons/validate', {
      code,
      restaurantId,
      orderTotal
    });
    return res.data;
  }
};