
import type { ApiResponse } from "../data/models/api/api.types";
import type { Product } from "../data/models/products/product";
import axiosClient from "./api/axiosClient";

export interface CreateModifierOption {
  id?: string; 
  name: string;
  price: number;
  isAvailable?: boolean; 
  maxQuantity?: number;
  productId?: string;
  imageUrl?: string;
}

export interface CreateModifierGroup {
  id?: string;
  name: string;
  minSelection: number; 
  maxSelection: number; 
  isRequired: boolean; 
  options: CreateModifierOption[];
}

export interface CreateProductDto {
  name: string;
  description?: string; 
  price: number;
  imageUrl?: string; 
  restaurantId: string;
  prepTimeMin?: number;
  prepTimeMax?: number;
  menuSectionIds: string[];
  modifierGroups: CreateModifierGroup[];
}

export const productService = {
  async getAllByRestaurant(restaurantId: string) {
    const res = await axiosClient.get<any, ApiResponse<Product[]>>(`/products/restaurant/${restaurantId}`);
    return res.data;
  },
  async getById(id: string) {
    const res = await axiosClient.get<any, ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },
  async create(data: CreateProductDto) {
    const res = await axiosClient.post<any, ApiResponse<Product>>('/products', data);
    return res.data;
  },
  async update(id: string, data: Partial<CreateProductDto>) {
    const res = await axiosClient.patch<any, ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },
  async toggleAvailability(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch<any, ApiResponse<any>>(`/products/${id}/status`, { status });
    return res.data;
  },

  async toggleAvailabilityModifierGroup(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch<any,ApiResponse<any>>(`/modifiers/group/${id}/status`, { status });
    return res.data;
  },

  async toggleAvailabilityModifierOption(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch<any, ApiResponse<any>>(`/modifiers/option/${id}/status`, { status });
    return res.data;
  }
};