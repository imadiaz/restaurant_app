import type { ApiResponse } from "../data/models/api/api.types";
import type { User } from "../data/models/user/user";
import axiosClient from "./api/axiosClient";


export interface CreateUserDto {
  firstName: string;
  lastName: string;
  username?: string; // Optional per your BE DTO
  email?: string;    // Optional per your BE DTO
  phone: string;     // Required
  password: string;  // Required, complex regex
  roleId: number;    // 1=Admin, 2=Restaurante, 3=Driver, 4=Cliente/Staff
  profileImageUrl: string; // Required string URL
  userAccessType?: string; // Optional (e.g., 'web')
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  isActive?: boolean;
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


  async create(data: CreateUserDto): Promise<User> {
    const response = await axiosClient.post<any, ApiResponse<User>>('/users', data);
    return response.data;
  },

//   // --- 4. UPDATE ---
//   async update(id: string, data: UpdateUserDto): Promise<User> {
//     const response = await axiosClient.patch<any, ApiResponse<User>>(`/users/${id}`, data);
//     return response.data;
//   }
};