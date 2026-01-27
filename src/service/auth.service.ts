import type { ApiResponse } from "../data/models/api/api.types";
import type { LoginCredentials } from "../data/models/auth/login.credentials";
import type { User } from "../data/models/user/user";
import axiosClient from "./api/axiosClient";


interface LoginResponsePayload {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string; 
    lastName?: string; 
    phone: string;
    role: {
      id: number;
      name: string;
      description?: string;
    };
    status: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await axiosClient.post<any, ApiResponse<LoginResponsePayload>>(
      '/auth/login-dashboard', 
      credentials
    );

    const { user, access_token } = response.data;
    
    const mappedUser: User = {
      id: user.id,
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: access_token,
      status: user.status
    };

    return mappedUser;
  },
};