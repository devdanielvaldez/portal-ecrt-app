import { api } from '@/src/lib/api';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'ORG_USER';
}

export interface Organization {
  id: string;
  name: string;
  type: 'COMMERCE' | 'AGENCY';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
    organization?: Organization;
  };
}

export const authService = {
  loginAdmin: async (credentials: any): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login/admin', credentials);
    return response.data;
  },
  loginOrganization: async (credentials: any): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login/organization', credentials);
    return response.data;
  },
};
