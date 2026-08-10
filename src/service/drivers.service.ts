import type { ApiResponse } from "../data/models/api/api.types";
import type { Restaurant } from "../data/models/restaurant/restaurant";
import type { User } from "../data/models/user/user";
import axiosClient from "./api/axiosClient";


export interface Driver {
  id: string;
  status: string;
  userId: string;
  user: User;
  restaurantId: string;
  restaurant?: Restaurant; 
  firstName: string; 
  lastName: string;
  phone: string;
  profileImageUrl: string | null;
  currentLat: string | null;
  currentLng: string | null;
  isAvailable: boolean;
}


export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  profileImageUrl?: string;
  restaurantId: string;
}
export interface UpdateDriverStatusDto {
    id: string;
    status: string;
}
export const driverService = {
  async getAllByRestaurantId(restaurantId: string): Promise<Driver[]> {
    const res = await axiosClient.get<unknown, ApiResponse<Driver[]>>(`/drivers/restaurant/${restaurantId}`);
    return res.data;
  },

  async getAll(): Promise<Driver[]> {
    const res = await axiosClient.get<unknown, ApiResponse<Driver[]>>(`/drivers`);
    return res.data;
  },

  async getDriverById(driverId: string): Promise<Driver> {
    const response = await axiosClient.get<unknown, ApiResponse<Driver>>(`/drivers/${driverId}`);
    return response.data;
  },

  async create(data: CreateDriverDto): Promise<Driver> {
    const res = await axiosClient.post<unknown, ApiResponse<Driver>>('/drivers', data);
    return res.data;
  },

  async update(id: string, data: Partial<CreateDriverDto>): Promise<Driver> {
    const res = await axiosClient.patch<unknown, ApiResponse<Driver>>(`/drivers/${id}`, data);
    return res.data;
  },

  async updateStatus(data: UpdateDriverStatusDto): Promise<void> {
    await axiosClient.patch(`/drivers/${data.id}/status`, data);
  }
};
