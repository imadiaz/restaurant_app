import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Si falla, reintenta 1 vez
      refetchOnWindowFocus: false, // No recargar si cambio de pestaña
    },
  },
});

export default queryClient;