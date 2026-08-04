import api from "./api.ts";

export interface Rfq {
  id: string;
  buyerId: string;
  title: string;
  category: string;
  description?: string;
  targetPrice: number;
  quantity: number;
  targetDate?: string;
  specifications: {
    weight?: string;
    width?: string;
    composition?: string;
  };
  status: "open" | "fulfilled" | "cancelled";
  createdAt: string;
  buyer?: {
    id: string;
    businessName: string;
    city: string;
    state: string;
  };
  quotes?: RfqQuote[];
}

export interface RfqQuote {
  id: string;
  rfqId: string;
  supplierId: string;
  offeredPrice: number;
  estimatedDeliveryDays: number;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  supplier?: {
    id: string;
    businessName: string;
    phone: string;
    email: string;
  };
  rfq?: Rfq;
}

export const rfqService = {
  async createRfq(rfqData: Partial<Rfq>) {
    const response = await api.post("/rfq", rfqData);
    return response.data;
  },

  async getBuyerRfqs() {
    const response = await api.get("/rfq/my-rfqs");
    return response.data;
  },

  async getRfqBoard() {
    const response = await api.get("/rfq/board");
    return response.data;
  },

  async submitQuote(rfqId: string, quoteData: { offeredPrice: number; estimatedDeliveryDays: number; notes?: string }) {
    const response = await api.post(`/rfq/${rfqId}/quote`, quoteData);
    return response.data;
  },

  async getSupplierQuotes() {
    const response = await api.get("/rfq/my-quotes");
    return response.data;
  },

  async acceptQuote(quoteId: string) {
    const response = await api.post(`/rfq/quotes/${quoteId}/accept`);
    return response.data;
  },
};
