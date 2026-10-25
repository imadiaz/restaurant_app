import type { ApiResponse } from "../data/models/api/api.types";
import type { Product } from "../data/models/products/product";
import type { MenuSection } from "../data/models/menu/menu.section";
import axiosClient from "./api/axiosClient";


export const PromotionType = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  BOGO: 'bogo',
} as const;

export type PromotionType =
  typeof PromotionType[keyof typeof PromotionType];

export const PromotionScope = { PRODUCTS: 'products', SECTIONS: 'sections' } as const;
export type PromotionScope = typeof PromotionScope[keyof typeof PromotionScope];
export type PromotionTargets =
  | { scope: 'products'; productIds: string[]; sectionIds?: never }
  | { scope: 'sections'; sectionIds: string[]; productIds?: never };

export interface Promotion {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  startDate: string; // ISO Date String
  endDate: string;   // ISO Date String
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: PromotionProduct[]; 
  scope?: PromotionScope; // Old product promotions default to products.
  menuSections?: MenuSection[];
}

export interface PromotionProduct {
  productId: string;
  promotionId: string;
  status: string;
  product: Product;
}

// --- 2. DTOs (Data Transfer Objects) ---

interface PromotionDetails {
  restaurantId: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  startDate: string; // Se envía como string ISO
  endDate: string;
}

export type CreatePromotionDto = PromotionDetails & PromotionTargets;
export type UpdatePromotionDto = Partial<Omit<PromotionDetails, 'restaurantId'>> & Partial<PromotionTargets> & { isActive?: boolean };

// --- 3. El Servicio ---

export const promotionsService = {

  /**
   * Obtiene todas las promociones activas de un restaurante específico.
   */
  async getAllByRestaurant(restaurantId: string): Promise<Promotion[]> {
    const response = await axiosClient.get<unknown, ApiResponse<Promotion[]>>(`/promotions/restaurant/${restaurantId}`);
    return response.data;
  },

  /**
   * Obtiene el detalle de una promoción por su ID.
   */
  async getById(id: string): Promise<Promotion> {
    const response = await axiosClient.get<unknown, ApiResponse<Promotion>>(`/promotions/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva promoción con sus productos asociados.
   */
  async create(data: CreatePromotionDto): Promise<Promotion> {
    const response = await axiosClient.post<unknown, ApiResponse<Promotion>>('/promotions', data);
    return response.data;
  },

  /**
   * Actualiza datos básicos de la promoción (Nombre, fechas, valor) o la pausa.
   */
  async update(id: string, data: UpdatePromotionDto): Promise<Promotion> {
    const response = await axiosClient.patch<unknown, ApiResponse<Promotion>>(`/promotions/${id}`, data);
    return response.data;
  },

  /**
   * Realiza un Soft Delete (Desactiva la promoción y la quita de la lista principal).
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete<unknown, ApiResponse<void>>(`/promotions/${id}`);
  },
};
