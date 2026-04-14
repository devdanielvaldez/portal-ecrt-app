import { api } from '@/src/lib/api';
import { ApiResponse } from './organization.service';
import { Terminal } from './terminal.service';

export type GroupStatus = 'ACTIVE' | 'INACTIVE';

export interface TerminalGroup {
  id: string;
  name: string;
  status: GroupStatus;
  organization_id: string;
  created_at: string;
  organizations?: {
    id: string;
    name: string;
  } | null;
  total_terminals?: number;
  terminals?: Terminal[]; // Only present in getById response
}

export interface CreateGroupDTO {
  name: string;
  organization_id: string;
  status: GroupStatus;
}

export interface UpdateGroupDTO {
  name?: string;
  status?: GroupStatus;
}

export interface AssignTerminalsDTO {
  group_id: string;
  terminal_ids: string[];
}

export const terminalGroupService = {
  getAll: async (params?: { organization_id?: string; status?: string }) => {
    const response = await api.get<ApiResponse<TerminalGroup[]>>('/terminal-groups', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<TerminalGroup>>(`/terminal-groups/${id}`);
    return response.data;
  },
  create: async (data: CreateGroupDTO) => {
    const response = await api.post<ApiResponse<TerminalGroup>>('/terminal-groups', data);
    return response.data;
  },
  update: async (id: string, data: UpdateGroupDTO) => {
    const response = await api.put<ApiResponse<TerminalGroup>>(`/terminal-groups/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/terminal-groups/${id}`);
    return response.data;
  },
  assignTerminals: async (data: AssignTerminalsDTO) => {
    const response = await api.post<ApiResponse<any>>('/terminal-groups/assign-terminals', data);
    return response.data;
  },
};
