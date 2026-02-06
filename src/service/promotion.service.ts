import type { ApiResponse } from "../data/models/api/api.types";
import type { Product } from "../data/models/products/product";
import axiosClient from "./api/axiosClient";


export const PromotionType = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  BOGO: 'bogo',
} as const;

export type PromotionType =
  typeof PromotionType[keyof typeof PromotionType];

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
}

export interface PromotionProduct {
  productId: string;
  promotionId: string;
  status: string;
  product: Product;
}

// --- 2. DTOs (Data Transfer Objects) ---

export interface CreatePromotionDto {
  restaurantId: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  startDate: string; // Se envía como string ISO
  endDate: string;
  productIds: string[]; // Array de UUIDs de los productos a aplicar
}

export interface UpdatePromotionDto extends Partial<Omit<CreatePromotionDto, 'restaurantId' | 'productIds'>> {
  isActive?: boolean; // Campo específico para pausar/activar
}

// --- 3. El Servicio ---

export const promotionsService = {

  /**
   * Obtiene todas las promociones activas de un restaurante específico.
   */
  async getAllByRestaurant(restaurantId: string): Promise<Promotion[]> {
    const response = await axiosClient.get<any, ApiResponse<Promotion[]>>(`/promotions/restaurant/${restaurantId}`);
    return response.data;
  },

  /**
   * Obtiene el detalle de una promoción por su ID.
   */
  async getById(id: string): Promise<Promotion> {
    const response = await axiosClient.get<any, ApiResponse<Promotion>>(`/promotions/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva promoción con sus productos asociados.
   */
  async create(data: CreatePromotionDto): Promise<Promotion> {
    const response = await axiosClient.post<any, ApiResponse<Promotion>>('/promotions', data);
    return response.data;
  },

  /**
   * Actualiza datos básicos de la promoción (Nombre, fechas, valor) o la pausa.
   */
  async update(id: string, data: UpdatePromotionDto): Promise<Promotion> {
    const response = await axiosClient.patch<any, ApiResponse<Promotion>>(`/promotions/${id}`, data);
    return response.data;
  },

  /**
   * Realiza un Soft Delete (Desactiva la promoción y la quita de la lista principal).
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete<any, ApiResponse<any>>(`/promotions/${id}`);
  },
};