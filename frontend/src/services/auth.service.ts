import api from "./api.ts";

export const authService = {
  async register(payload: any) {
    const response = await api.post("/users/register", payload);
    return response.data;
  },

  async login(payload: any) {
    const response = await api.post("/users/login", payload);
    return response.data;
  },

  async logout() {
    const response = await api.post("/users/logout");
    return response.data;
  },

  async getMe() {
    const response = await api.get("/users/me");
    return response.data;
  },
};
