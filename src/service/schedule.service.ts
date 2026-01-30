
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

export interface ScheduleOverride {
  id: string;
  status: string;
  date: string;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  reason: string;
  restaurantId: string;
}

export interface CreateOverrideDto {
  date: string;
  isClosed: boolean;
  reason: string;
  openTime?: string;
  closeTime?: string;
}

interface OverridesResponseWrapper {
  statusCode: number;
  message: string;
  data: ScheduleOverride[];
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
  },

  async getOverrides(restaurantId: string): Promise<ScheduleOverride[]> {
    const res = await axiosClient.get<ScheduleOverride[]>(`/restaurants/${restaurantId}/schedules/overrides`);
    return res.data || [];
  },

  async createOverride(restaurantId: string, data: CreateOverrideDto): Promise<ScheduleOverride> {
    const res = await axiosClient.post<ScheduleOverride>(`/restaurants/${restaurantId}/schedules/overrides`, data);
    return res.data;
  },

  async deleteOverride(restaurantId: string, overrideId: string): Promise<void> {
    await axiosClient.delete(`/restaurants/${restaurantId}/schedules/overrides/${overrideId}`);
  }
};