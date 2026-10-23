import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productImportService,
  type ProductImport,
  type ProductImportEdit,
} from "../../service/product.import.service";
import { queryKeys } from "../../config/query.keys";
import { useErrorHandler } from "../use.error.handler";

export const useProductImports = (restaurantId: string, importId?: string) => {
  const client = useQueryClient();
  const { handleError } = useErrorHandler();
  const list = useQuery({
    queryKey: queryKeys.productImports.list(restaurantId),
    queryFn: ({ signal }) => productImportService.list(restaurantId, signal),
  });
  const detail = useQuery({
    queryKey: queryKeys.productImports.detail(restaurantId, importId),
    queryFn: ({ signal }) =>
      productImportService.get(importId!, restaurantId, signal),
    enabled: Boolean(importId),
    refetchOnWindowFocus: false,
  });
  const updateCache = (draft: ProductImport) => {
    if (draft.restaurantId !== restaurantId) return;
    client.setQueryData(
      queryKeys.productImports.detail(restaurantId, draft.id),
      draft,
    );
    void client.invalidateQueries({
      queryKey: queryKeys.productImports.list(restaurantId),
    });
  };
  const upload = useMutation({
    mutationFn: (file: File) => productImportService.upload(restaurantId, file),
    onSuccess: updateCache,
    onError: handleError,
  });
  const update = useMutation({
    mutationFn: (rows: ProductImportEdit[]) =>
      productImportService.update(importId!, rows),
    onSuccess: updateCache,
    onError: handleError,
  });
  const commit = useMutation({
    mutationFn: (row: ProductImportEdit) =>
      productImportService.commit(importId!, row),
    onSuccess: (draft) => {
      updateCache(draft);
      void client.invalidateQueries({
        queryKey: queryKeys.products.list(restaurantId),
      });
    },
    onError: handleError,
  });
  return { list, detail, upload, update, commit };
};
