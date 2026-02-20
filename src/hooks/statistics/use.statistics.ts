import { useQuery } from '@tanstack/react-query';
import { statisticsService, type StatisticsFilterDto } from '../../service/statistics.service';
import { useAppStore } from '../../store/app.store';
import { useErrorHandler } from '../use.error.handler';


export const useStatistics = (dates?: { startDate?: string; endDate?: string }) => {
  const { handleError } = useErrorHandler();
  const { activeRestaurant } = useAppStore();

  // Combine the dates from the UI with the active restaurant from the global store
  const filters: StatisticsFilterDto = {
    startDate: dates?.startDate,
    endDate: dates?.endDate,
    restaurantId: activeRestaurant?.id,
  };

  // -----------------------------------------------------------------
  // 1. KPI SUMMARY (Totals)
  // -----------------------------------------------------------------
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useQuery({
    // The queryKey includes the filters so it automatically refetches when dates change
    queryKey: ['statistics', 'summary', filters],
    queryFn: async () => {
      try {
        return await statisticsService.getKpiSummary(filters);
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    // Optional: Only run if we have a restaurant (remove this if Super Admins can view all)
    enabled: !!activeRestaurant?.id, 
  });

  // -----------------------------------------------------------------
  // 2. EARNINGS CHART
  // -----------------------------------------------------------------
  const {
    data: chartData = [],
    isLoading: isLoadingChart,
    isError: isErrorChart,
  } = useQuery({
    queryKey: ['statistics', 'chart', filters],
    queryFn: async () => {
      try {
        return await statisticsService.getEarningsChart(filters);
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    enabled: !!activeRestaurant?.id,
  });

  // -----------------------------------------------------------------
  // 3. TOP PRODUCTS
  // -----------------------------------------------------------------
  const {
    data: topProducts = [],
    isLoading: isLoadingTopProducts,
    isError: isErrorTopProducts,
  } = useQuery({
    queryKey: ['statistics', 'top-products', filters],
    queryFn: async () => {
      try {
        return await statisticsService.getTopProducts(filters);
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    enabled: !!activeRestaurant?.id,
  });

  return {
    // --- Data ---
    summary,
    chartData,
    topProducts,

    // --- Loading States ---
    isLoadingSummary,
    isLoadingChart,
    isLoadingTopProducts,
    
    // Combined loading state for convenience if you want to show one giant spinner
    isFetchingAny: isLoadingSummary || isLoadingChart || isLoadingTopProducts,

    // --- Error States ---
    isErrorSummary,
    isErrorChart,
    isErrorTopProducts,
    
    // Combined error state
    hasAnyError: isErrorSummary || isErrorChart || isErrorTopProducts,
  };
};