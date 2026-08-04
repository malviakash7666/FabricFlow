import api from "./api.ts";

export const supplierService = {
  async getProfile() {
    const response = await api.get("/suppliers/profile");
    return response.data;
  },

  async createProfile(payload: any) {
    const response = await api.post("/suppliers/profile", payload);
    return response.data;
  },

  async updateProfile(payload: any) {
    const response = await api.put("/suppliers/profile", payload);
    return response.data;
  },
};
