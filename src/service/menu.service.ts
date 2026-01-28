import type { ApiResponse } from "../data/models/api/api.types";
import type { MenuSection } from "../data/models/menu/menu.section";
import axiosClient from "./api/axiosClient";

export interface CreateMenuSectionDto {
  restaurantId: string;
  name: string;
  sortOrder?: number;
}

export interface UpdateMenuSectionDto extends Partial<CreateMenuSectionDto> {
  status?: string;
}

export interface UpdateMenuSectionStatus {
  status?: string;
}

// --- SERVICE ---
export const menuSectionService = {

  // Get all sections for a specific restaurant
  async getAllByRestaurantId(restaurantId: string): Promise<MenuSection[]> {
    const response = await axiosClient.get<any, ApiResponse<MenuSection[]>>(`/menu-sections/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get a single section by ID
  async getById(id: string): Promise<MenuSection> {
    const response = await axiosClient.get<any, ApiResponse<MenuSection>>(`/menu-sections/${id}`);
    return response.data;
  },

  // Create a new section
  async create(data: CreateMenuSectionDto): Promise<MenuSection> {
    const response = await axiosClient.post<any, ApiResponse<MenuSection>>('/menu-sections', data);
    return response.data;
  },

  // Update a section (Name, Order, or Status)
  async update(id: string, data: UpdateMenuSectionDto): Promise<MenuSection> {
    const response = await axiosClient.patch<any, ApiResponse<MenuSection>>(`/menu-sections/${id}`, data);
    return response.data;
  },

  async toggleStatus(id: string, data: UpdateMenuSectionStatus): Promise<MenuSection> {
    const response = await axiosClient.patch<any, ApiResponse<MenuSection>>(`/menu-sections/${id}/status`, data);
    return response.data;
  },

  // Delete (Optional, good to have)
  async delete(id: string): Promise<void> {
    await axiosClient.delete<any, ApiResponse<void>>(`/menu-sections/${id}`);
  }
};