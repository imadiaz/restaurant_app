import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";


export interface StatisticsFilterDto {
  startDate?: string;
  endDate?: string;  
  restaurantId?: string;
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

// --- SERVICE ---

export const statisticsService = {
  
  async getKpiSummary(filters?: StatisticsFilterDto): Promise<KpiSummary> {
    const response = await axiosClient.get<any, ApiResponse<KpiSummary>>(
      '/statistics/summary', 
      { params: filters }
    );
    return response.data;
  },

  async getEarningsChart(filters?: StatisticsFilterDto): Promise<ChartDataPoint[]> {
    const response = await axiosClient.get<any, ApiResponse<ChartDataPoint[]>>(
      '/statistics/chart', 
      { params: filters }
    );
    return response.data;
  },

  async getTopProducts(filters?: StatisticsFilterDto): Promise<TopProduct[]> {
    const response = await axiosClient.get<any, ApiResponse<TopProduct[]>>(
      '/statistics/top-products', 
      { params: filters }
    );
    return response.data;
  },

  async getPlatformDebt(id: string): Promise<PlatformDebt> {
    const response = await axiosClient.get<any, ApiResponse<PlatformDebt>>(
      `/statistics/${id}/platform-debt`
    );
    return response.data;
  },
};