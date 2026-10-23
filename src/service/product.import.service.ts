import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";

export interface ProductImportRow {
  sourceRow: number;
  sourceCategory: string;
  name: string;
  description: string;
  price: number | null;
  menuSectionId: string | null;
  prepTimeMin: number | null;
  prepTimeMax: number | null;
  status: "pending" | "saved" | "skipped";
  productId: string | null;
  version: number;
  duplicateProductId: string | null;
}
export interface ProductImportSummary {
  id: string;
  restaurantId: string;
  fileName: string;
  sheetName: string;
  rowCount: number;
  savedCount: number;
  skippedCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface ProductImport extends ProductImportSummary {
  rows: ProductImportRow[];
}
export interface ProductImportEdit {
  sourceRow: number;
  expectedVersion: number;
  name?: string;
  description?: string;
  price?: number | null;
  menuSectionId?: string | null;
  prepTimeMin?: number | null;
  prepTimeMax?: number | null;
  status?: "pending" | "skipped";
  allowDuplicate?: boolean;
}
export const productImportService = {
  async list(restaurantId: string, signal?: AbortSignal) {
    const response = await axiosClient.get<
      unknown,
      ApiResponse<ProductImportSummary[]>
    >(`/product-imports/restaurant/${restaurantId}`, { signal });
    return response.data;
  },
  async upload(restaurantId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await axiosClient.post<
      unknown,
      ApiResponse<ProductImport>
    >(`/product-imports/restaurant/${restaurantId}`, form);
    return response.data;
  },
  async get(id: string, restaurantId: string, signal?: AbortSignal) {
    const response = await axiosClient.get<unknown, ApiResponse<ProductImport>>(
      `/product-imports/${id}`,
      { signal },
    );
    if (response.data.restaurantId !== restaurantId)
      throw new Error("This import belongs to another restaurant.");
    return response.data;
  },
  async update(id: string, rows: ProductImportEdit[]) {
    const response = await axiosClient.patch<
      unknown,
      ApiResponse<ProductImport>
    >(`/product-imports/${id}/rows`, { rows });
    return response.data;
  },
  async commit(id: string, row: ProductImportEdit) {
    const response = await axiosClient.post<
      unknown,
      ApiResponse<ProductImport>
    >(`/product-imports/${id}/rows/${row.sourceRow}/commit`, row);
    return response.data;
  },
};
