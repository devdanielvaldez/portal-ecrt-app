import { api } from '@/src/lib/api';
import { ApiResponse } from './organization.service';

export interface Advertiser {
  id: string;
  organization_id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface CreateAdvertiserDTO {
  organization_id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
}

export const advertiserService = {
  create: async (data: CreateAdvertiserDTO) => {
    const response = await api.post<ApiResponse<Advertiser>>('/advertisers', data);
    return response.data;
  },
  update: async (id: string, data: { name?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    const response = await api.put<ApiResponse<Advertiser>>(`/advertisers/${id}`, data);
    return response.data;
  },
  getByOrganization: async (orgId: string) => {
    const response = await api.get<ApiResponse<Advertiser[]>>(`/advertisers/organization/${orgId}`);
    return response.data;
  },
  assignAds: async (data: { advertiser_id: string; ad_ids: string[] }) => {
    const response = await api.post<ApiResponse<any>>('/advertisers/assign-ads', data);
    return response.data;
  }
};
