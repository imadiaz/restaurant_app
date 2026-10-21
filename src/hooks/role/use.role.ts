import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../service/role.service';
import { queryKeys } from '../../config/query.keys';
import { useAuthStore } from '../../store/auth.store';

export const useRoles = () => {
  const user = useAuthStore((state) => state.user);
  
  const { 
    data: roles = [],
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: [...queryKeys.roles.all, user?.id, user?.role.name],
    queryFn: roleService.getAll,
    staleTime: 60_000,
    enabled: Boolean(user),
  });

  return {
    roles,
    isLoading,
    isError,
    error
  };
};
