import { api } from '@/src/lib/api';

export type OrgType = 'COMMERCE' | 'AGENCY';
export type OrgStatus = 'ACTIVE' | 'INACTIVE';

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  email: string;
  phone: string;
  status: OrgStatus;
  business_category?: string | null;
  address?: string | null;
  contact_person?: string | null;
  website?: string | null;
  created_at: string;
  users?: Array<{
    id: string;
    role: string;
    email: string;
  }>;
}

export interface CreateOrgDTO {
  name: string;
  type: OrgType;
  email: string;
  phone: string;
  business_category?: string;
  address?: string;
  contact_person?: string;
  website?: string;
}

export interface UpdateOrgDTO extends Partial<CreateOrgDTO> {
  status?: OrgStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateOrgResponse {
  organization: Organization;
  main_user: {
    id: string;
    organization_id: string;
    role: string;
    email: string;
    created_at: string;
    auth_id: string;
  };
  default_password: string;
}

export const organizationService = {
  getAll: async (params?: { type?: string; status?: string; search?: string }) => {
    const response = await api.get<ApiResponse<Organization[]>>('/organizations', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return response.data;
  },
  create: async (data: CreateOrgDTO) => {
    const response = await api.post<ApiResponse<CreateOrgResponse>>('/organizations', data);
    return response.data;
  },
  update: async (id: string, data: UpdateOrgDTO) => {
    const response = await api.put<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/organizations/${id}`);
    return response.data;
  },
};
