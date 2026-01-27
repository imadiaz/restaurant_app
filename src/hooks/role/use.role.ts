import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../service/role.service';

export const useRoles = () => {
  
  const { 
    data: roles = [],
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ['roles'],
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