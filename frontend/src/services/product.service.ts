import api from "./api.ts";

export const productService = {
  async getProducts(params?: any) {
    const response = await api.get("/products", { params });
    return response.data;
  },

  async getMyProducts() {
    const response = await api.get("/products/my-products");
    return response.data;
  },

  async getProductById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(payload: any) {
    const response = await api.post("/products", payload);
    return response.data;
  },

  async updateProduct(id: string, payload: any) {
    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
