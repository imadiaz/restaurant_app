import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";


export interface StripeAccountStatus {
    isActive: boolean;
    pendingRequirements: boolean;
    details?: StripeAccountStatusDetails
}

interface StripeAccountStatusDetails {
    transfers?: string | null;
    payments?: string | null;
}

export const paymentService = {

  async getAccountStatus(restaurantId: string) {
    const res = await axiosClient.get<unknown, ApiResponse<StripeAccountStatus>>(`/payments/status/${restaurantId}`);
    return res.data;
  },

  async createAccountLink(restaurantId: string) {
    const res = await axiosClient.post<unknown, ApiResponse<{ url: string }>>(
      `/payments/setup-restaurant/${restaurantId}`
    );
    return res.data;
  },
};
