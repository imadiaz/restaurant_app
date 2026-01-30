
import type { Product } from "../data/models/products/product";
import axiosClient from "./api/axiosClient";

export interface CreateModifierOption {
  id?: string; 
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateModifierGroup {
  id?: string;
  name: string;
  minSelected: number;
  maxSelected: number;
  isRequired: boolean;
  options: CreateModifierOption[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  restaurantId: string;
  prepTimeMin?: number,
  prepTimeMax?: number,
  menuSectionIds: string[];
  modifierGroups: CreateModifierGroup[];
}


export const productService = {
  async getAllByRestaurant(restaurantId: string) {
    const res = await axiosClient.get<Product[]>(`/products/restaurant/${restaurantId}`);
    return res.data;
  },
  async getById(id: string) {
    const res = await axiosClient.get<Product>(`/products/${id}`);
    return res.data;
  },
  async create(data: CreateProductDto) {
    const res = await axiosClient.post<Product>('/products', data);
    return res.data;
  },
  async update(id: string, data: Partial<CreateProductDto>) {
    const res = await axiosClient.patch<Product>(`/products/${id}`, data);
    return res.data;
  },
  async toggleAvailability(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch(`/products/${id}/status`, { status });
    return res.data;
  },

  async toggleAvailabilityModifierGroup(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch(`/products/modifier/${id}/status`, { status });
    return res.data;
  },

  async toggleAvailabilityModifierOption(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch(`/products/option/${id}/status`, { status });
    return res.data;
  }
};