import { authService } from './authService';
import type { SearchUser, PublicProfile } from '../types';

const API_URL = 'http://127.0.0.1:8000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`
});

export const userService = {
  searchUsers: async (query: string): Promise<SearchUser[]> => {
    const response = await fetch(
      `${API_URL}/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  },

  getPublicProfile: async (
    userId: string
  ): Promise<PublicProfile> => {
    const response = await fetch(
      `${API_URL}/users/${userId}/profile`,
      {
        headers: getHeaders()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Gagal mengambil profile user'
      );
    }

    return data;
  }
};
