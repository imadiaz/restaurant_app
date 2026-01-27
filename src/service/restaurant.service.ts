import type { ApiResponse } from "../data/models/api/api.types";
import type { PriceRange, Restaurant } from "../data/models/restaurant/restaurant";
import axiosClient from "./api/axiosClient";


// Interfaz de Lectura (Lo que recibes del Backend)


// DTO para CREAR (Lo que envías en el POST)
export interface CreateRestaurantDto {
  userId: string; // El dueño asignado
  name: string;
  description?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  priceRange?: PriceRange;
  
  // Dirección (Obligatorios según tu entity)
  streetAddress: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Geo
  lat: number;
  lng: number;
  
  // Fiscales (Opcionales al crear, se pueden llenar luego)
  rfc?: string;
  legalName?: string;
  responsibleName?: string;
  responsiblePhone?: string;

  // Configuración inicial
  commissionRate?: number;
  publicPhone?: string;
  privatePhone?: string;
  averagePrepTimeMin?: number;
  isOpen?: boolean;
}

// DTO para ACTUALIZAR (Partial)
export interface UpdateRestaurantDto extends Partial<CreateRestaurantDto> {
  status?: string;
}

export const restaurantService = {
  
  async getAll(): Promise<Restaurant[]> {
    const response = await axiosClient.get<any, ApiResponse<Restaurant[]>>('/restaurants');
    return response.data; 
  },

  async getById(id: string): Promise<Restaurant> {
    const response = await axiosClient.get<any, ApiResponse<Restaurant>>(`/restaurants/${id}`);
    return response.data;
  },

  async create(data: CreateRestaurantDto): Promise<Restaurant> {
    const response = await axiosClient.post<any, ApiResponse<Restaurant>>('/restaurants', data);
    return response.data;
  },

  async update(id: string, data: UpdateRestaurantDto): Promise<Restaurant> {
    const response = await axiosClient.patch<any, ApiResponse<Restaurant>>(`/restaurants/${id}`, data);
    return response.data;
  },


  async toggleOpenStatus(id: string, isOpen: boolean): Promise<Restaurant> {
    const response = await axiosClient.patch<any, ApiResponse<Restaurant>>(`/restaurants/${id}`, { isOpen });
    return response.data;
  }
};