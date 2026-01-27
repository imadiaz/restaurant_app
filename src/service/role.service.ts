import type { ApiResponse } from "../data/models/api/api.types";
import type { Role } from "../data/models/user/role";
import axiosClient from "./api/axiosClient";


export const roleService = {
  
  async getAll(): Promise<Role[]> {
    const response = await axiosClient.get<any, ApiResponse<Role[]>>('/roles');
    return response.data;
  }

};