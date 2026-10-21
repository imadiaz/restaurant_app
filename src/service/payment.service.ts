import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";

export interface StripeAccountStatus {
  isActive: boolean;
  pendingRequirements: boolean;
  details?: StripeAccountStatusDetails;
}

interface StripeAccountStatusDetails {
  transfers?: string | null;
  payments?: string | null;
}

export interface DebtPaymentConfirmation {
  restaurantId: string;
  verified: boolean;
  pending: boolean;
  amountPaid?: number;
}

export const paymentService = {
  async confirmDebtSession(
    restaurantId: string,
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<DebtPaymentConfirmation> {
    const res = await axiosClient.post<
      unknown,
      ApiResponse<DebtPaymentConfirmation>
    >(
      `/payments/restaurant/${encodeURIComponent(restaurantId)}/platform-debt-session/${encodeURIComponent(sessionId)}/confirm`,
      undefined,
      { signal },
    );
    return res.data;
  },

  async getAccountStatus(restaurantId: string) {
    const res = await axiosClient.get<
      unknown,
      ApiResponse<StripeAccountStatus>
    >(`/payments/status/${restaurantId}`);
    return res.data;
  },

  async createAccountLink(restaurantId: string) {
    const res = await axiosClient.post<unknown, ApiResponse<{ url: string }>>(
      `/payments/setup-restaurant/${restaurantId}`,
    );
    return res.data;
  },
};
