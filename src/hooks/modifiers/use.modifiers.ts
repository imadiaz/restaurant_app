import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../../store/app.store";
import { modifierService } from "../../service/modifiers.service";
export const useModifiers = () => {
  const { activeRestaurant } = useAppStore();

  const queryKey = ["modifiers", activeRestaurant?.id || "all"];

  const {
    data: modifiers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!activeRestaurant?.id) return [];
      return modifierService.getAllByRestaurant(activeRestaurant.id);
    },
    enabled: !!activeRestaurant?.id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    modifiers,
    isLoading,
    isError,
    refetchModifiers: refetch,
  };
};