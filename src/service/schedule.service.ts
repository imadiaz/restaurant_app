
import axiosClient from "./api/axiosClient";

export interface ScheduleItem {
  id: string; 
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  status: string;
  restaurantId: string;
}

export interface CreateScheduleItemDto {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface BulkScheduleDto {
  schedules: CreateScheduleItemDto[];
}

export interface ScheduleSyncResponse {
  message: string;
  deleted: number;
  updated: number;
  created: number;
}

export const scheduleService = {
  async getSchedules(restaurantId: string): Promise<ScheduleItem[]> {
    const res = await axiosClient.get<ScheduleItem[]>(`/restaurants/${restaurantId}/schedules`);
    return res.data || [];
  },

  async saveSchedules(restaurantId: string, schedules: CreateScheduleItemDto[]): Promise<ScheduleSyncResponse> {
    const payload: BulkScheduleDto = { schedules };
    const res= await axiosClient.put<ScheduleSyncResponse>(`/restaurants/${restaurantId}/schedules`, payload);
    return res.data;
  }
};