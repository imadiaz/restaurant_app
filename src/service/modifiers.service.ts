import axiosClient from "./api/axiosClient";
import type { CreateModifierGroup } from "./products.service";

export const modifierService = {
  async getAllByRestaurant(restaurantId: string) {
    const res = await axiosClient.get<any, { data: CreateModifierGroup[] }>(
      `/modifiers/restaurant/${restaurantId}`
    );
    return res.data;
  },
};