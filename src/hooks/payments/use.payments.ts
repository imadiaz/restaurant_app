import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService } from '../../service/payment.service';
import { useErrorHandler } from '../use.error.handler';

export const usePayments = (restaurantId?: string) => {

      const { handleError } = useErrorHandler();
    
  const { 
    data: accountStatus, 
    isLoading: isCheckingStatus,
    isError: isStatusError 
  } = useQuery({
    queryKey: ['paymentStatus', restaurantId],
    queryFn: () => {
      if (!restaurantId) throw new Error("No restaurant ID");
      return paymentService.getAccountStatus(restaurantId);
    },
    enabled: !!restaurantId,
    retry: 1,
  });

  const createLinkMutation = useMutation({
    mutationFn: (id: string) => paymentService.createAccountLink(id),
    onError: handleError,
  });

  return {
    accountStatus,
    isCheckingStatus,
    isStatusError,
    createAccountLink: createLinkMutation.mutateAsync,
    isCreatingLink: createLinkMutation.isPending,
  };
};