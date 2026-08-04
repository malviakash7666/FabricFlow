import api from "./api.ts";

export const orderService = {
  async placeOrder(shippingInfo: {
    shippingAddress: string;
    phone: string;
    contactName: string;
  }) {
    const response = await api.post("/orders", shippingInfo);
    return response.data;
  },

  async getBuyerOrders() {
    const response = await api.get("/orders/buyer");
    return response.data;
  },

  async getSupplierOrders() {
    const response = await api.get("/orders/supplier");
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(
    id: string,
    payload: { status?: string; trackingNumber?: string }
  ) {
    const response = await api.patch(`/orders/${id}/status`, payload);
    return response.data;
  },
};
