import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";


export interface StripeAccountStatus {
    isActive: boolean;
    pendingRequirements: false;
    details: StripeAccountStatusDetails
}

interface StripeAccountStatusDetails {
    transfers: boolean;
    payments: boolean;
}

export const paymentService = {

  async getAccountStatus(restaurantId: string) {
    const res = await axiosClient.get<any, ApiResponse<StripeAccountStatus>>(`/payments/status/${restaurantId}`);
    return res.data;
  },

  async createAccountLink(restaurantId: string) {
    const res = await axiosClient.post<any, ApiResponse<{ url: string }>>(
      `/payments/setup-restaurant/${restaurantId}`
    );
    return res.data;
  },
};