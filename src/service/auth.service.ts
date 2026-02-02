import type { ApiResponse } from "../data/models/api/api.types";
import type { LoginCredentials } from "../data/models/auth/login.credentials";
import type { User } from "../data/models/user/user";
import axiosClient from "./api/axiosClient";


interface LoginResponsePayload {
  access_token: string;
  user: User
  refresh_token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponsePayload> {
    const response = await axiosClient.post<any, ApiResponse<LoginResponsePayload>>(
      '/auth/login-dashboard', 
      credentials
    );
    return response.data;
  },
};