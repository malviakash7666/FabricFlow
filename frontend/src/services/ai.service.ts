import api from "./api.ts";

export const aiService = {
  async chatWithAI(message: string) {
    const response = await api.post("/ai/chat", { message });
    return response.data;
  },

  async generateFabricSpec(description: string) {
    const response = await api.post("/ai/generate-spec", { description });
    return response.data;
  },
};
