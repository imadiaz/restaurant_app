import type { ApiResponse } from "../data/models/api/api.types";
import axiosClient from "./api/axiosClient";


interface ImagesResponse {
  url: string;
}

export const imagesService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<any, ApiResponse<ImagesResponse>>(
      '/images/upload/user-file', 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.url;
  }
};