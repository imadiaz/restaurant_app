import { useQuery } from "@tanstack/react-query";
import {
  statisticsService,
  type StatisticsFilterDto,
} from "../../service/statistics.service";
import { useAppStore } from "../../store/app.store";
import { queryKeys } from "../../config/query.keys";

export const useStatistics = (
  selection: Omit<StatisticsFilterDto, "restaurantId">,
  validRange: boolean,
) => {
  const restaurantId = useAppStore((state) => state.activeRestaurant?.id);
  const filters = { ...selection, restaurantId };
  const dashboard = useQuery({
    queryKey: queryKeys.statistics.resource("dashboard", filters),
    queryFn: ({ signal }) => statisticsService.getDashboard(filters, signal),
    enabled: Boolean(restaurantId) && validRange,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
  // This is the current ledger balance, never a date/payment-filtered amount.
  const debt = useQuery({
    queryKey: queryKeys.statistics.resource("platform-debt", { restaurantId }),
    queryFn: ({ signal }) =>
      statisticsService.getPlatformDebt(restaurantId!, signal),
    enabled: Boolean(restaurantId),
    refetchInterval: 60_000,
    refetchOnWindowFocus: "always",
    staleTime: 0,
  });
  return { dashboard, debt };
};
