import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";

export interface Category {
  id: string;
  name: string;
  slug: string;      
  icon?: string;      
  imageUrl?: string; 
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
  imageUrl?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;


export const categoryService = {


  async getAll(): Promise<Category[]> {
    const response = await axiosClient.get<unknown, ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await axiosClient.get<unknown, ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await axiosClient.post<unknown, ApiResponse<Category>>('/categories', data);
    return response.data;
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await axiosClient.patch<unknown, ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete<unknown, ApiResponse<void>>(`/categories/${id}`);
  },
};
