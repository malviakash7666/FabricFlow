import api from "./api.ts";

export const buyerService = {
  async getProfile() {
    const response = await api.get("/buyers/profile");
    return response.data;
  },

  async createProfile(payload: any) {
    const response = await api.post("/buyers/profile", payload);
    return response.data;
  },

  async updateProfile(payload: any) {
    const response = await api.put("/buyers/profile", payload);
    return response.data;
  },
};
