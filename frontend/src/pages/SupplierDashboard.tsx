import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.ts";
import { productService } from "../services/product.service.ts";
import api from "../services/api.ts";
import { useToast } from "../components/Toast.tsx";
import { orderService } from "../services/order.service.ts";
import { rfqService } from "../services/rfq.service.ts";
import type { Rfq, RfqQuote } from "../services/rfq.service.ts";
import { aiService } from "../services/ai.service.ts";
import {
  ShoppingBag,
  Package,
  Layers,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Truck,
  Scissors,
  Calendar,
  MapPin,
  Phone,
  Eye,
  LogOut,
  Building,
  Sparkles,
  FileText,
  Clock,
  Minus,
  Check,
  Send
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  colors: string[];
  specifications: any;
  price: number;
  stock: number;
  imageUrls: string[];
  moq: number;
  isAvailable: boolean;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  color: string;
}

interface Order {
  id: string;
  buyerId: string;
  supplierId: string;
  totalAmount: number;
  status: "pending" | "accepted" | "preparing" | "ready_for_dispatch" | "completed";
  shippingAddress: string;
  phone: string;
  contactName: string;
  trackingNumber: string | null;
  createdAt: string;
  buyer: {
    businessName: string;
    phone: string;
    businessType: string;
  };
  items: OrderItem[];
}

export const SupplierDashboard: React.FC = () => {
  const { user, profile, logoutUser } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [myQuotes, setMyQuotes] = useState<RfqQuote[]>([]);
  const [activeTab, setActiveTab] = useState<"inventory" | "orders" | "rfqs">("inventory");
  const [loading, setLoading] = useState(false);
  const [loadingRfqs, setLoadingRfqs] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    lowStockAlerts: 0,
  });

  // CRUD Product modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Cotton");
  const [prodDesc, setProdDesc] = useState("");
  const [prodColors, setProdColors] = useState("White, Blue, Grey");
  const [prodWeight, setProdWeight] = useState("180 gsm");
  const [prodWidth, setProdWidth] = useState("58 inches");
  const [prodComp, setProdComp] = useState("100% Cotton");
  const [prodPrice, setProdPrice] = useState(150);
  const [prodStock, setProdStock] = useState(2000);
  const [prodMOQ, setProdMOQ] = useState(200);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    try {
      const res = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data && res.data.url) {
        setProdImageUrl(res.data.url);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to upload image. Please verify your Cloudinary configurations.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // AI Autocomplete states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Bidding modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [biddingRfq, setBiddingRfq] = useState<Rfq | null>(null);
  const [bidPrice, setBidPrice] = useState(140);
  const [bidDeliveryDays, setBidDeliveryDays] = useState(7);
  const [bidNotes, setBidNotes] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);

  // Tracking details modal
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const prodRes = await productService.getMyProducts();
      const orderRes = await orderService.getSupplierOrders();
      const rfqRes = await rfqService.getRfqBoard();
      const quotesRes = await rfqService.getSupplierQuotes();

      const prodList: Product[] = prodRes.data;
      const orderList: Order[] = orderRes.data;

      setProducts(prodList);
      setOrders(orderList);
      setRfqs(rfqRes.data);
      setMyQuotes(quotesRes.data);

      // Compute statistics
      const totalProducts = prodList.length;
      const activeProducts = prodList.filter((p) => p.isAvailable).length;
      const pendingOrders = orderList.filter((o) => o.status === "pending").length;
      const lowStockAlerts = prodList.filter((p) => p.stock < 500).length;

      setStats({
        totalProducts,
        activeProducts,
        pendingOrders,
        lowStockAlerts,
      });
    } catch (err) {
      console.error("Error loading supplier dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Open modal to add product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategory("Cotton");
    setProdDesc("");
    setProdColors("White, Blue, Grey");
    setProdWeight("180 gsm");
    setProdWidth("58 inches");
    setProdComp("100% Cotton");
    setProdPrice(150);
    setProdStock(2000);
    setProdMOQ(200);
    setProdImageUrl("");
    setAiPrompt("");
    setIsProductModalOpen(true);
  };

  // Open modal to edit product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdDesc(prod.description || "");
    setProdColors(prod.colors.join(", "));
    setProdWeight(prod.specifications?.weight || "");
    setProdWidth(prod.specifications?.width || "");
    setProdComp(prod.specifications?.composition || "");
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdMOQ(prod.moq);
    setProdImageUrl(prod.imageUrls[0] || "");
    setAiPrompt("");
    setIsProductModalOpen(true);
  };

  // AI Fill specs generator
  const handleAiFill = async () => {
    if (!aiPrompt.trim()) {
      showToast("Please describe the fabric first.", "error");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await aiService.generateFabricSpec(aiPrompt);
      if (res.success && res.data) {
        const d = res.data;
        setProdName(d.name || "");
        setProdCategory(d.category || "Cotton");
        setProdDesc(d.description || "");
        setProdColors(d.colors ? d.colors.join(", ") : "White");
        setProdWeight(d.specifications?.weight || "180 gsm");
        setProdWidth(d.specifications?.width || "58 inches");
        setProdComp(d.specifications?.composition || "100% Cotton");
        setProdPrice(d.price || 150);
        setProdMOQ(d.moq || 200);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to generate specs from prompt.", "error");
    } finally {
      setAiGenerating(false);
    }
  };

  // Submit Product Add/Edit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) {
      showToast("Name, Price, and Stock are required fields.", "error");
      return;
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      description: prodDesc,
      colors: prodColors.split(",").map((c) => c.trim()).filter(Boolean),
      specifications: {
        weight: prodWeight,
        width: prodWidth,
        composition: prodComp,
      },
      price: prodPrice,
      stock: prodStock,
      imageUrls: prodImageUrl ? [prodImageUrl] : ["https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"],
      moq: prodMOQ,
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      setIsProductModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || "Failed to save product listing.", "error");
    }
  };

  // Submit Bid Quote
  const handlePostBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingRfq) return;
    setSubmittingBid(true);
    try {
      await rfqService.submitQuote(biddingRfq.id, {
        offeredPrice: bidPrice,
        estimatedDeliveryDays: bidDeliveryDays,
        notes: bidNotes,
      });
      setIsQuoteModalOpen(false);
      setBidNotes("");
      showToast("Bid placed successfully!", "success");
      loadDashboardData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to submit quote.", "error");
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleOpenBidModal = (rfq: Rfq) => {
    setBiddingRfq(rfq);
    setBidPrice(rfq.targetPrice);
    setBidDeliveryDays(7);
    setBidNotes("");
    setIsQuoteModalOpen(true);
  };

  // Stock quick updater
  const handleQuickStockUpdate = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      await productService.updateProduct(id, { stock: newStock });
      loadDashboardData();
    } catch (err) {
      showToast("Failed to update stock", "error");
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (prod: Product) => {
    try {
      await productService.updateProduct(prod.id, { isAvailable: !prod.isAvailable });
      loadDashboardData();
    } catch (err) {
      showToast("Failed to update availability", "error");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await productService.deleteProduct(id);
      loadDashboardData();
    } catch (err) {
      showToast("Failed to delete product", "error");
    }
  };

  // Advance Order Status
  const handleAdvanceOrderStatus = async (order: Order, nextStatus: string) => {
    try {
      if (nextStatus === "ready_for_dispatch") {
        setTrackingModalOrder(order);
        setTrackingNumberInput("");
      } else {
        await orderService.updateOrderStatus(order.id, { status: nextStatus });
        loadDashboardData();
      }
    } catch (err) {
      showToast("Failed to update order status", "error");
    }
  };

  // Dispatch Order with Tracking Number
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    try {
      await orderService.updateOrderStatus(trackingModalOrder.id, {
        status: "ready_for_dispatch",
        trackingNumber: trackingNumberInput,
      });
      setTrackingModalOrder(null);
      loadDashboardData();
    } catch (err) {
      showToast("Failed to dispatch order.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 text-slate-800 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center font-bold text-sm text-white shadow">
            FF
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            FabricFlow Mill Manager
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Building className="h-4 w-4 text-teal-700" />
            <div className="text-left">
              <p className="text-xs font-bold">{profile?.businessName}</p>
              <p className="text-[10px] text-slate-400">Mill Supplier Dashboard</p>
            </div>
          </div>
          <button
            onClick={logoutUser}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Products</p>
              <h3 className="text-2xl font-bold mt-1.5">{stats.totalProducts}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-700/10 border border-teal-200/50 flex items-center justify-center text-teal-700">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Active Listings</p>
              <h3 className="text-2xl font-bold mt-1.5 text-emerald-400">{stats.activeProducts}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Pending Orders</p>
              <h3 className="text-2xl font-bold mt-1.5 text-amber-400">{stats.pendingOrders}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Low Stock Alerts</p>
              <h3 className={`text-2xl font-bold mt-1.5 ${stats.lowStockAlerts > 0 ? "text-red-400" : "text-slate-400"}`}>
                {stats.lowStockAlerts}
              </h3>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
              stats.lowStockAlerts > 0
                ? "bg-red-600/10 border-red-500/20 text-red-400 animate-pulse"
                : "bg-slate-800/10 border-slate-200 text-slate-400"
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-500 hover:text-teal-700"
            }`}
          >
            Inventory Hub
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "orders"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-500 hover:text-teal-700"
            }`}
          >
            Incoming Wholesale Orders
          </button>
          <button
            onClick={() => setActiveTab("rfqs")}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "rfqs"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-500 hover:text-teal-700"
            }`}
          >
            Bidding Sourcing Board
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "inventory" ? (
          // Inventory Panel
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-slate-200 shadow-xs rounded-2xl px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">Factory Product Catalog</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage details, edit stock yards, and list new products.</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-850 px-4 py-2.5 text-xs font-bold text-white cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 text-white" />
                Add Product
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-12 text-center text-slate-400 text-xs">
                Your mill catalog is empty. Click "Add Product" above to list your first fabric!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                     key={prod.id}
                     className="bg-white/50 border border-slate-250 p-4 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-slate-200 transition-all duration-300"
                  >
                    <div>
                      <img
                        src={prod.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                        alt=""
                        className="h-40 w-full rounded-xl object-cover mb-4"
                      />
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] bg-slate-50 border border-slate-855 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase">
                          {prod.category}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                            prod.isAvailable
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {prod.isAvailable ? "Available" : "Hidden / Out of Stock"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm truncate" title={prod.name}>{prod.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">₹{prod.price}/meter • MOQ: {prod.moq}m</p>

                      {/* Stock Quick Editor */}
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                        <span className="text-[10px] text-slate-400">Stock meters:</span>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickStockUpdate(prod.id, Math.max(0, prod.stock - 100));
                            }}
                            className="p-1.5 text-slate-500 hover:text-teal-700 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-16 text-center text-xs font-mono font-bold text-slate-800">
                            {prod.stock}m
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickStockUpdate(prod.id, prod.stock + 100);
                            }}
                            className="p-1.5 text-slate-550 hover:text-teal-700 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleAvailability(prod);
                        }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                          prod.isAvailable
                            ? "bg-slate-50 border-slate-200 text-slate-400 hover:bg-white"
                            : "bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20"
                        }`}
                      >
                        {prod.isAvailable ? "Disable Item" : "Enable Item"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenEditProduct(prod);
                        }}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-white text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Edit specifications"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProduct(prod.id);
                        }}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "orders" ? (
          // Orders Panel
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 shadow-xs rounded-2xl px-6 py-4">
              <h2 className="text-lg font-bold">Incoming Buyer Sourcing Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage customer shipments, update order timeline status, and view onboarding criteria.</p>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-12 text-center text-slate-400 text-xs">
                No orders received yet from buyers.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 hover:border-slate-700 transition-colors space-y-4"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-950/60">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full flex-1">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ref ID</p>
                          <h5 className="font-mono text-xs font-bold text-slate-700 mt-0.5">#{order.id.slice(0, 8)}...</h5>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Buyer Brand</p>
                          <h5 className="text-xs font-bold text-slate-700 mt-0.5 truncate">{order.buyer?.businessName}</h5>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Order Value</p>
                          <h5 className="text-xs font-bold text-teal-700 mt-0.5">₹{parseFloat(order.totalAmount as any).toFixed(2)}</h5>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Status</p>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize mt-1 ${
                              order.status === "completed"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : order.status === "ready_for_dispatch"
                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                : order.status === "pending"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-indigo-500/10 border-indigo-500/20 text-teal-700"
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Status advancement actions */}
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order, "accepted")}
                            className="flex items-center gap-1 bg-teal-700 hover:bg-teal-850 px-3 py-2 rounded-xl text-[10px] font-bold text-white cursor-pointer shadow shadow-violet-600/10"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Accept Order
                          </button>
                        )}
                        {order.status === "accepted" && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order, "preparing")}
                            className="flex items-center gap-1 bg-teal-700 hover:bg-indigo-500 px-3 py-2 rounded-xl text-[10px] font-bold text-white cursor-pointer shadow"
                          >
                            <Scissors className="h-3.5 w-3.5" />
                            Start Preparing Fabric
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order, "ready_for_dispatch")}
                            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 px-3 py-2 rounded-xl text-[10px] font-bold text-white cursor-pointer shadow"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Ready for Dispatch
                          </button>
                        )}
                        {order.status === "ready_for_dispatch" && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(order, "completed")}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-xl text-[10px] font-bold text-white cursor-pointer shadow"
                          >
                            <Package className="h-3.5 w-3.5" />
                            Complete Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom grid: items vs shipping info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div>
                        <h6 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Requested fabrics</h6>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-50/45 p-2 rounded-xl border border-slate-200">
                              <span className="font-bold text-slate-700">{item.productName}</span>
                              <span className="font-semibold text-slate-800">{item.quantity} meters</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h6 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Recipient details</h6>
                        <div className="bg-slate-50/45 p-3 rounded-xl border border-slate-200 space-y-1">
                          <p className="text-slate-400">
                            <span className="font-bold text-slate-700">Brand Contact:</span> {order.contactName} ({order.buyer?.businessType})
                          </p>
                          <p className="text-slate-400">
                            <span className="font-bold text-slate-700">Phone:</span> {order.phone}
                          </p>
                          <p className="text-slate-400">
                            <span className="font-bold text-slate-700">Logistics Destination:</span> {order.shippingAddress}
                          </p>
                          {order.trackingNumber && (
                            <p className="text-cyan-400 mt-2 pt-1 border-t border-slate-250 font-semibold">
                              Tracking Code: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Sourcing requests board / quotes tracking */
          <div className="space-y-8">
            {/* Sourcing requests list */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl px-6 py-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-700" />
                  Active Sourcing Requests (RFQ Board)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Browse active fabric requests posted by verified apparel manufacturers and submit custom pricing quotes.</p>
              </div>

              {rfqs.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-12 text-center text-slate-400 text-xs">
                  No active sourcing requests posted on the board right now. Check back shortly!
                </div>
              ) : (
                <div className="space-y-4">
                  {rfqs.map((rfq) => {
                    const alreadyQuoted = myQuotes.find((q) => q.rfqId === rfq.id);

                    return (
                      <div
                        key={rfq.id}
                        className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col md:flex-row justify-between gap-6"
                      >
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-800">{rfq.title}</h4>
                            <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase">
                              {rfq.category}
                            </span>
                            <span className="text-[9px] text-slate-400">Posted by {rfq.buyer?.businessName} ({rfq.buyer?.city})</span>
                          </div>

                          <p className="text-slate-400 text-xs leading-relaxed">{rfq.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-950/40 text-xs text-slate-400">
                            <div>
                              <span className="text-slate-400">Weight:</span> {rfq.specifications?.weight || "N/A"}
                            </div>
                            <div>
                              <span className="text-slate-400">Width:</span> {rfq.specifications?.width || "N/A"}
                            </div>
                            <div>
                              <span className="text-slate-400">Composition:</span> {rfq.specifications?.composition || "N/A"}
                            </div>
                            {rfq.targetDate && (
                              <div>
                                <span className="text-slate-400">Timeline:</span> {new Date(rfq.targetDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-250 md:min-w-[180px]">
                          <div className="text-right">
                            <p className="text-xs text-slate-450 uppercase">Target Details</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{rfq.quantity} meters</p>
                            <p className="text-xs font-bold text-teal-700 mt-0.5">Target: ₹{rfq.targetPrice}/m</p>
                          </div>

                          {alreadyQuoted ? (
                            <span className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[10px] font-bold capitalize ${
                              alreadyQuoted.status === "accepted"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : alreadyQuoted.status === "rejected"
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              {alreadyQuoted.status === "accepted" ? (
                                <>
                                  <Check className="h-3 w-3" /> Bid Won
                                </>
                              ) : (
                                `Bid ${alreadyQuoted.status}`
                              )}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenBidModal(rfq)}
                              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-850 text-xs font-bold text-white shadow-lg cursor-pointer"
                            >
                              Submit Quote
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* My submitted bids log */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-slate-400" />
                Submitted Sourcing Bids ({myQuotes.length})
              </h3>

              {myQuotes.length === 0 ? (
                <p className="text-slate-400 text-xs italic">You haven't submitted any bids on the RFQ board yet.</p>
              ) : (
                <div className="space-y-3">
                  {myQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className={`p-4 rounded-2xl border text-xs flex justify-between items-center transition-colors ${
                        quote.status === "accepted"
                          ? "bg-emerald-950/15 border-emerald-500/25 text-slate-700"
                          : quote.status === "rejected"
                          ? "bg-slate-50/40 border-slate-250 opacity-60 text-slate-400"
                          : "bg-white/60 border-slate-200 text-slate-350"
                      }`}
                    >
                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-800 text-xs">RFQ: {quote.rfq?.title}</h5>
                        <p className="text-[10px] text-slate-400">Customer: {quote.rfq?.buyer?.businessName} ({quote.rfq?.buyer?.city})</p>
                        {quote.notes && <p className="text-[11px] text-slate-400 mt-1"><span className="text-slate-400">Quote Notes:</span> {quote.notes}</p>}
                      </div>

                      <div className="text-right flex items-center gap-6">
                        <div>
                          <p className="font-bold text-teal-700">Bid: ₹{quote.offeredPrice}/m</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Timeline: {quote.estimatedDeliveryDays} days</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border capitalize tracking-wider ${
                          quote.status === "accepted"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : quote.status === "rejected"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-xs rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-lg border-b border-slate-200 pb-3">
              {editingProduct ? "Edit Product Specifications" : "List New Fabric Product"}
            </h3>

            {/* AI Autocomplete helper block */}
            {!editingProduct && (
              <div className="bg-violet-950/20 border border-violet-800/30 p-4 rounded-xl space-y-2 mt-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Autocomplete Spec Helper
                </span>
                <p className="text-[10px] text-slate-400">Describe the fabric in one line, and the AI will auto-fill the form parameters below.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. soft charcoal merino wool under 450 for blazers"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] focus:outline-none focus:border-teal-700"
                  />
                  <button
                    type="button"
                    onClick={handleAiFill}
                    disabled={aiGenerating}
                    className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-850 font-bold text-[10px] shadow cursor-pointer text-white disabled:opacity-50"
                  >
                    {aiGenerating ? "Generating..." : "AI Auto-fill"}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 mt-6 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Fabric Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Organic Pima Cotton"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Fabric Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  >
                    {["Cotton", "Silk", "Denim", "Linen", "Polyester", "Wool"].map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Fabric Description
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detail weave style, yarn counts, certifications..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Weight (gsm)
                  </label>
                  <input
                    type="text"
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    placeholder="e.g. 150 gsm"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Width (inches)
                  </label>
                  <input
                    type="text"
                    value={prodWidth}
                    onChange={(e) => setProdWidth(e.target.value)}
                    placeholder="e.g. 58 inches"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Composition
                  </label>
                  <input
                    type="text"
                    value={prodComp}
                    onChange={(e) => setProdComp(e.target.value)}
                    placeholder="e.g. 100% Cotton"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Available Colors (comma separated)
                </label>
                <input
                  type="text"
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                  placeholder="White, Blue, Black"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Price per meter (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Stock yards (m) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Minimum MOQ (m) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodMOQ}
                    onChange={(e) => setProdMOQ(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                </div>
              </div>

               <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Product Fabric Image (Cloudinary)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://example.com/texture.jpg or upload below"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <p className="text-[10px] text-teal-400 font-semibold mt-1">Uploading swatch to Cloudinary...</p>
                )}
                {prodImageUrl && (
                  <div className="mt-2 relative h-16 w-16 border border-slate-200 rounded-lg overflow-hidden">
                    <img src={prodImageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 hover:opacity-95 rounded-xl font-bold text-xs shadow-lg mt-4 cursor-pointer text-white"
              >
                {editingProduct ? "Save Fabric Updates" : "List Fabric Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quote / Bid Modal */}
      {isQuoteModalOpen && biddingRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-200 shadow-xs rounded-2xl p-6 relative">
            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="font-extrabold text-sm border-b border-slate-200 pb-3">
              Submit Sourcing Quote
            </h3>
            <form onSubmit={handlePostBid} className="space-y-4 mt-6 text-xs text-slate-800">
              <p className="text-slate-400">
                Bidding on: <span className="font-bold text-slate-350">{biddingRfq.title}</span><br />
                Target Price: <span className="font-bold text-teal-700">₹{biddingRfq.targetPrice}/m</span> • Required Qty: <span className="font-bold text-slate-700">{biddingRfq.quantity}m</span>
              </p>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Offered Price per meter (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Estimated Delivery Timeline (Days) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={bidDeliveryDays}
                  onChange={(e) => setBidDeliveryDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Proposal Notes / Bid Details
                </label>
                <textarea
                  rows={3}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="Detail your yarn metrics, wash finish specifications, or bulk discounts..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingBid}
                className="w-full py-3 bg-teal-700 hover:bg-teal-850 rounded-xl font-bold text-xs text-white shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submittingBid ? "Submitting Bid..." : "Submit Proposal Bid"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Logistics Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-200 shadow-xs rounded-2xl p-6 relative">
            <button
              onClick={() => setTrackingModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="font-extrabold text-sm border-b border-slate-200 pb-3">
              Shipment Logistics Dispatch
            </h3>
            <form onSubmit={handleDispatchSubmit} className="space-y-4 mt-6 text-xs text-slate-800">
              <p className="text-slate-400">
                You are dispatching order <span className="font-mono font-bold text-slate-700">#{trackingModalOrder.id.slice(0, 8)}</span> for <span className="font-bold text-slate-700">{trackingModalOrder.buyer?.businessName}</span>.
              </p>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Logistics Tracking Code / AWB
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. DHL-98327429"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-700 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-850 rounded-xl font-bold text-xs text-white shadow-lg cursor-pointer"
              >
                Log Dispatch Shipment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
