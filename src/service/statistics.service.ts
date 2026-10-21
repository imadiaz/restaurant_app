import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";

export interface StatisticsFilterDto {
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  paymentMethod?: "CASH" | "CARD_TERMINAL";
}

export interface DashboardSummary {
  receivedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  cancelledOrdersFromReceived: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  inProgressOrders: number;
  incompletePaymentOrders: number;
  totalRevenue: number;
  averageTicket: number;
  platformCommissions: number;
  cashRevenue: number;
  terminalRevenue: number;
  cashOrders: number;
  terminalOrders: number;
  cashCancelledOrders: number;
  terminalCancelledOrders: number;
}

export interface DashboardStatistics {
  summary: DashboardSummary;
  chart: (ChartDataPoint & {
    averageTicket: number;
    cancelledOrders: number;
  })[];
  topProducts: TopProduct[];
}

export interface KpiSummary {
  totalOrders: number;
  totalEarnings: number;
}

export interface ChartDataPoint {
  date: string;
  ordersCount: number;
  dailyEarnings: number;
}

export interface TopProduct {
  productId: string | null;
  productName: string;
  totalSold: number;
  revenueGenerated: number;
}

export interface PlatformDebt {
  debtAmount: number;
}

export interface FinancialSummary {
  totalCardRevenue: number;
  totalCashRevenue: number;
  cashOrdersCount: number;
  totalPlatformCommissions: number;
  totalPlatformSubsidies: number;
  totalDebtSettled: number;
  totalRefunded: number;
  netPlatformProfit: number;
}

export const statisticsService = {
  async getDashboard(
    filters: StatisticsFilterDto,
    signal?: AbortSignal,
  ): Promise<DashboardStatistics> {
    const response = await axiosClient.get<
      unknown,
      ApiResponse<DashboardStatistics>
    >("/statistics/dashboard", { params: filters, signal });
    return response.data;
  },

  async getKpiSummary(filters?: StatisticsFilterDto): Promise<KpiSummary> {
    const response = await axiosClient.get<unknown, ApiResponse<KpiSummary>>(
      "/statistics/summary",
      { params: filters },
    );
    return response.data;
  },

  async getEarningsChart(
    filters?: StatisticsFilterDto,
  ): Promise<ChartDataPoint[]> {
    const response = await axiosClient.get<
      unknown,
      ApiResponse<ChartDataPoint[]>
    >("/statistics/chart", { params: filters });
    return response.data;
  },

  async getTopProducts(filters?: StatisticsFilterDto): Promise<TopProduct[]> {
    const response = await axiosClient.get<unknown, ApiResponse<TopProduct[]>>(
      "/statistics/top-products",
      { params: filters },
    );
    return response.data;
  },

  async getPlatformDebt(
    id: string,
    signal?: AbortSignal,
  ): Promise<PlatformDebt> {
    const response = await axiosClient.get<unknown, ApiResponse<PlatformDebt>>(
      `/statistics/${id}/platform-debt`,
      { signal },
    );
    return response.data;
  },

  async getFinancialSummary(
    filters?: StatisticsFilterDto,
  ): Promise<FinancialSummary> {
    const response = await axiosClient.get<
      unknown,
      ApiResponse<FinancialSummary>
    >("/statistics/financials", { params: filters });
    return response.data;
  },
};
