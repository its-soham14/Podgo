import { create } from 'zustand';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('podgo-user')) || null,
  token: localStorage.getItem('podgo-token') || null,
  isAuthenticated: !!localStorage.getItem('podgo-token'),
  activeMode: localStorage.getItem('podgo-active-mode') || 'RIDER',

  register: async (formData) => {
    await axios.post(`${apiBaseUrl}/auth/register`, formData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  setCredentials: (user, token) => {
    localStorage.setItem('podgo-user', JSON.stringify(user));
    localStorage.setItem('podgo-token', token);
    set({ user, token, isAuthenticated: true });
  },

  setActiveMode: (mode) => {
    localStorage.setItem('podgo-active-mode', mode);
    set({ activeMode: mode });
  },

  logout: () => {
    localStorage.removeItem('podgo-user');
    localStorage.removeItem('podgo-token');
    localStorage.removeItem('podgo-active-mode');
    set({ user: null, token: null, isAuthenticated: false, activeMode: 'RIDER' });
  },
}));
