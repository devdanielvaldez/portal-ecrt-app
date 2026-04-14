import { api } from '@/src/lib/api';
import { ApiResponse } from './organization.service';

export type TerminalStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Terminal {
  id: string;
  name: string;
  serial_number: string;
  merchant_id: string;
  api_key: string;
  status: TerminalStatus;
  organization_id: string;
  group_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  current_connection_at?: string | null;
  last_connection_at?: string | null;
  network?: string | null;
  connection_method?: string;
  total_transactions?: number;
  created_at: string;
  updated_at: string;
  is_claimed: boolean;
  organizations?: {
    id: string;
    name: string;
  } | null;
  terminal_groups?: any | null;
}

export interface CreateTerminalDTO {
  name: string;
  serial_number: string;
  merchant_id: string;
  api_key: string;
  organization_id: string;
  status: TerminalStatus;
}

export interface UpdateTerminalDTO extends Partial<CreateTerminalDTO> {}

export const terminalService = {
  getAll: async (params?: { 
    organization_id?: string; 
    group_id?: string; 
    status?: string; 
    is_claimed?: string; 
    search?: string 
  }) => {
    const response = await api.get<ApiResponse<Terminal[]>>('/terminals', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Terminal>>(`/terminals/${id}`);
    return response.data;
  },
  create: async (data: CreateTerminalDTO) => {
    const response = await api.post<ApiResponse<Terminal>>('/terminals', data);
    return response.data;
  },
  update: async (id: string, data: UpdateTerminalDTO) => {
    const response = await api.put<ApiResponse<Terminal>>(`/terminals/${id}`, data);
    return response.data;
  },
  deactivate: async (id: string) => {
    const response = await api.patch<ApiResponse<Terminal>>(`/terminals/${id}/deactivate`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/terminals/${id}`);
    return response.data;
  },
};
