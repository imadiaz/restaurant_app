
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
  linkedProduct?: Product | null;
}

export interface CreateModifierGroup {
  id?: string;
  name: string;
  minSelected: number; 
  maxSelected: number; 
  isRequired: boolean; 
  options: CreateModifierOption[];
}

export type CreateProductModifierGroupDto =
  | { id: string }
  | (Omit<CreateModifierGroup, "id"> & { id?: never });

export interface CreateProductDto {
  name: string;
  description?: string; 
  price: number;
  imageUrl?: string; 
  restaurantId: string;
  prepTimeMin?: number;
  prepTimeMax?: number;
  menuSectionIds: string[];
  modifierGroups: CreateProductModifierGroupDto[];
}

export const productService = {
  async getAllByRestaurant(restaurantId: string) {
    const res = await axiosClient.get<unknown, ApiResponse<Product[]>>(`/products/restaurant/${restaurantId}`);
    return res.data;
  },
  async getById(id: string) {
    const res = await axiosClient.get<unknown, ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },
  async create(data: CreateProductDto) {
    const res = await axiosClient.post<unknown, ApiResponse<Product>>('/products', data);
    return res.data;
  },
  async update(id: string, data: Partial<CreateProductDto>) {
    const res = await axiosClient.patch<unknown, ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },
  async toggleAvailability(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch<unknown, ApiResponse<Product>>(`/products/${id}/status`, { status });
    return res.data;
  },
};
