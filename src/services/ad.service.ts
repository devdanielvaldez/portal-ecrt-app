import { api } from '@/src/lib/api';
import { ApiResponse } from './organization.service';

export type AdStatus = 'IN_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface Ad {
  id: string;
  name: string;
  media_url: string;
  is_all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  days_of_week: string[];
  status: AdStatus;
  created_at: string;
  organization_id: string;
  advertiser_id: string | null;
  organizations?: {
    id: string;
    name: string;
    type: string;
  };
  advertisers?: any;
}

export interface CreateAdDTO {
  organization_id: string;
  name: string;
  media_url: string;
  is_all_day?: boolean;
  start_time?: string;
  end_time?: string;
  days_of_week?: string[];
}

export interface AdFilters {
  status?: AdStatus;
  organization_id?: string;
  advertiser_id?: string;
  search?: string;
  is_all_day?: string;
  day_of_week?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total_items: number;
    current_page: number;
    total_pages: number;
  };
}

export const adService = {
  getAll: async (params?: AdFilters) => {
    const response = await api.get<PaginatedResponse<Ad>>('/ads', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Ad>>(`/ads/${id}`);
    return response.data;
  },
  create: async (data: CreateAdDTO) => {
    const response = await api.post<ApiResponse<Ad>>('/ads', data);
    return response.data;
  },
  review: async (id: string, status: 'ACTIVE' | 'REJECTED' | 'INACTIVE') => {
    const response = await api.patch<ApiResponse<Ad>>(`/ads/${id}/review`, { status });
    return response.data;
  },
  assign: async (data: { ad_id: string; terminal_id?: string; group_id?: string }) => {
    const response = await api.post<ApiResponse<any>>('/ads/assign', data);
    return response.data;
  }
};
