import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../../service/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { useErrorHandler } from "../use.error.handler";

export const useLogout = () => {
  const { logout } = useAuthStore((state) => state);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: (_) => {
     logout();
      navigate('/');
    },
    onError: handleError
});

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};