import { api } from '@/src/lib/api';
import { ApiResponse, Organization } from './organization.service';
import { TerminalGroup } from './terminal-group.service';

export interface AgencyAssignmentDTO {
  agency_id: string;
  commerce_id?: string;
  group_id?: string;
  terminal_id?: string;
}

export const agencyService = {
  assign: async (data: AgencyAssignmentDTO) => {
    const response = await api.post<ApiResponse<any>>('/agencies/assign', data);
    return response.data;
  },
  getAssignedCommerces: async (agencyId: string) => {
    const response = await api.get<ApiResponse<Organization[]>>(`/agencies/${agencyId}/commerces`);
    return response.data;
  },
  getAssignedGroups: async (agencyId: string) => {
    const response = await api.get<ApiResponse<TerminalGroup[]>>(`/agencies/${agencyId}/groups`);
    return response.data;
  },
};
