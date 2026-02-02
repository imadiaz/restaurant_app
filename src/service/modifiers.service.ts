import type { ApiResponse } from "../data/models/api/api.types";
import type { ModifierGroup } from "../data/models/products/product";
import axiosClient from "./api/axiosClient";
import type { CreateModifierGroup, CreateModifierOption } from "./products.service";

export const modifierService = {
  async getAllByRestaurant(restaurantId: string) {
    const res = await axiosClient.get<any, ApiResponse<ModifierGroup[]>>(
      `/modifiers/restaurant/${restaurantId}`
    );
    return res.data;
  },

  async createGroup(data: CreateModifierGroup) {
    const res = await axiosClient.post<any, ApiResponse<ModifierGroup>>(
      '/modifiers/group',
      data
    );
    return res.data;
  },

  async updateGroup(id: string, data: Partial<CreateModifierGroup>) {
    const res = await axiosClient.patch<any, ApiResponse<ModifierGroup>>(
      `/modifiers/group/${id}`,
      data
    );
    return res.data;
  },

  async toggleGroupStatus(id: string, isActive: boolean) {
    const status = isActive ? 'active' : 'inactive';
    const res = await axiosClient.patch<any, ApiResponse<ModifierGroup>>(
      `/modifiers/group/${id}/status`,
      { status }
    );
    return res.data;
  },

  async toggleOptionStatus(id: string, isAvailable: boolean) {
    const status = isAvailable ? 'active' : 'inactive';
    const res = await axiosClient.patch<any, ApiResponse<CreateModifierOption>>(
      `/modifiers/option/${id}/status`,
      { status }
    );
    return res.data;
  },

  async deleteGroup(id: string) {
    await axiosClient.delete(`/modifiers/group/${id}`);
  },
};