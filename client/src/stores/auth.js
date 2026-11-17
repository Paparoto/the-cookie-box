import { reactive } from 'vue';
import api from '../api/axios';

export const authState = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Checks if user is already logged in via cookie on page reload
  async checkAuth() {
    try {
      const response = await api.get('/auth/me');
      this.user = response.data.user;
      this.isAuthenticated = true;
    } catch (error) {
      this.user = null;
      this.isAuthenticated = false;
    } finally {
      this.isLoading = false;
    }
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    this.user = response.data.user;
    this.isAuthenticated = true;
    return response.data;
  },

  async register(name, email, password) {
    return await api.post('/auth/register', { name, email, password });
  },

  async logout() {
    await api.post('/auth/logout');
    this.user = null;
    this.isAuthenticated = false;
  }
});