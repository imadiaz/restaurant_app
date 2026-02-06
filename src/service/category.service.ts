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

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
}


export const categoryService = {


  async getAll(): Promise<Category[]> {
    const response = await axiosClient.get<any, ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await axiosClient.get<any, ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await axiosClient.post<any, ApiResponse<Category>>('/categories', data);
    return response.data;
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await axiosClient.patch<any, ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete<any, ApiResponse<any>>(`/categories/${id}`);
  },
};