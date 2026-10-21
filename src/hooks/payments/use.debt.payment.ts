import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../../service/payment.service";
import { queryKeys } from "../../config/query.keys";

export const useDebtPayment = (
  restaurantId: string | null,
  sessionId: string | null,
  enabled: boolean,
) => {
  const queryClient = useQueryClient();
  const confirmation = useQuery({
    queryKey: queryKeys.payments.debtSession(restaurantId, sessionId),
    queryFn: ({ signal }) =>
      paymentService.confirmDebtSession(restaurantId!, sessionId!, signal),
    enabled: enabled && Boolean(restaurantId && sessionId),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: "always",
    refetchInterval: (query) =>
      query.state.data?.pending && query.state.dataUpdateCount < 10
        ? 3000
        : false,
  });

  useEffect(() => {
    if (!confirmation.data?.verified) return;
    void queryClient.invalidateQueries({ queryKey: ["statistics"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
  }, [confirmation.data, queryClient]);

  return confirmation;
};
