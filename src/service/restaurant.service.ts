import type { ApiResponse } from "../data/models/api/api.types";
import type { PriceRange, Restaurant } from "../data/models/restaurant/restaurant";
import axiosClient from "./api/axiosClient";

export const CommissionType = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
} as const;

export type CommissionType =
  typeof CommissionType[keyof typeof CommissionType];

export interface CreateRestaurantDto {
  userId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  priceRange?: PriceRange;
  
  streetAddress: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  rfc?: string;
  legalName?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  publicPhone?: string;
  privatePhone?: string;
  averagePrepTimeMin?: number;
  isOpen?: boolean;
}

export interface UpdateRestaurantDto extends Partial<CreateRestaurantDto> {
  status?: string;
}

export interface UpdateRestaurantCategoriesDto {
  categoryIds: string[];
}

export interface UpdateRestaurantOperationalDto {
  deliveryFee?: number;
  isOpen?: boolean;
  averagePrepTimeMin?: number;
}

export interface AdminUpdateRestaurantDto extends UpdateRestaurantOperationalDto {
  commissionType?: CommissionType;
  commissionValue?: number;
  stripeFeePct?: number;
  stripeFeeFixed?: number;
}

export const restaurantService = {
  
  async getAll(): Promise<Restaurant[]> {
    const response = await axiosClient.get<any, ApiResponse<Restaurant[]>>('/restaurants');
    return response.data; 
  },

  async getById(id: string): Promise<Restaurant> {
    const response = await axiosClient.get<any, ApiResponse<Restaurant>>(`/restaurants/${id}`);
    return response.data;
  },

  async create(data: CreateRestaurantDto): Promise<Restaurant> {
    const response = await axiosClient.post<any, ApiResponse<Restaurant>>('/restaurants', data);
    return response.data;
  },

  async update(id: string, data: UpdateRestaurantDto): Promise<Restaurant> {
    const response = await axiosClient.patch<any, ApiResponse<Restaurant>>(`/restaurants/${id}`, data);
    return response.data;
  },


  async toggleOpenStatus(id: string, isOpen: boolean): Promise<Restaurant> {
    const response = await axiosClient.patch<any, ApiResponse<Restaurant>>(`/restaurants/${id}`, { isOpen });
    return response.data;
  },

  async updateCategories(id: string, data: UpdateRestaurantCategoriesDto): Promise<Restaurant> {
    const response = await axiosClient.patch<any, ApiResponse<Restaurant>>(
      `/restaurants/${id}/categories`, 
      data
    );
    return response.data;
  },

  async updateOperational(id: string, data: UpdateRestaurantOperationalDto): Promise<Restaurant> {
    const response = await axiosClient.patch<ApiResponse<Restaurant>>(
      `/restaurants/${id}/operational`,
      data
    );
    return response.data.data ?? response.data;
  },
  async updateAdminConfig(id: string, data: AdminUpdateRestaurantDto): Promise<Restaurant> {
    const response = await axiosClient.patch<ApiResponse<Restaurant>>(
      `/restaurants/${id}/admin-config`,
      data
    );
    return response.data.data ?? response.data;
  },

  async setPaymentConfig(id: string) {
    const response = await axiosClient.post<ApiResponse<any>>(
      `/payments/setup-restaurant/${id}`,
      {
        id: id
      }
    );
    console.log('Payment config response:', response);
    return response.data.data;
  }
};