import api from "./api.ts";

export const cartService = {
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  async addToCart(productId: string, quantity: number) {
    const response = await api.post("/cart", { productId, quantity });
    return response.data;
  },

  async updateCartItem(id: string, quantity: number) {
    const response = await api.put(`/cart/${id}`, { quantity });
    return response.data;
  },

  async removeCartItem(id: string) {
    const response = await api.delete(`/cart/${id}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },
};
