import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../service/role.service';
import { queryKeys } from '../../config/query.keys';

export const useRoles = () => {
  
  const { 
    data: roles = [],
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: roleService.getAll,
    staleTime: 10000 * 60 * 60, 
  });

  return {
    roles,
    isLoading,
    isError,
    error
  };
};
