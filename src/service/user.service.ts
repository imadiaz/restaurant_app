import type { ApiResponse } from "../data/models/api/api.types";
import type { User } from "../data/models/user/user";
import axiosClient from "./api/axiosClient";


export interface CreateUserDto {
  firstName: string;
  lastName: string;
  username?: string; 
  email?: string;    
  phone: string;    
  password: string;
  roleId: number;
  profileImageUrl: string;
  userAccessType?: string;
  restaurantId?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  status?: string;
}


export const userService = {
  
  async getAll(): Promise<User[]> {
    const response = await axiosClient.get<any, ApiResponse<User[]>>('/users');
    return response.data;
  },

  async getAllByRestaurantId(restaurantId: string): Promise<User[]> {
    const response = await axiosClient.get<any, ApiResponse<User[]>>(`/users/restaurant/all/${restaurantId}`);
    return response.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await axiosClient.get<any, ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  },


  async create(data: CreateUserDto): Promise<User> {
    const response = await axiosClient.post<any, ApiResponse<User>>('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await axiosClient.patch<any, ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  }
};