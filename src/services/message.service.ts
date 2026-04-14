import { api } from '@/src/lib/api';
import { ApiResponse } from './organization.service';

export interface SendMessageDTO {
  title: string;
  content: string;
  terminal_id?: string | null;
  group_id?: string | null;
}

export const messageService = {
  send: async (data: SendMessageDTO) => {
    const response = await api.post<ApiResponse<any>>('/messages/send', data);
    return response.data;
  },
};
