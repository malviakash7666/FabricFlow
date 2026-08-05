import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { orderService } from "../services/order.service.ts";
import { rfqService } from "../services/rfq.service.ts";
import { useToast } from "../components/Toast.tsx";
import type { Rfq, RfqQuote } from "../services/rfq.service.ts";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Building,
  Plus,
  FileText,
  Check,
  Clock,
  CheckCircle,
  X,
  AlertCircle
} from "lucide-react";

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
  supplier: {
    businessName: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
}

export const BuyerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "rfqs">("orders");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingRfqs, setLoadingRfqs] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedRfqId, setExpandedRfqId] = useState<string | null>(null);

  // RFQ Form states
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqTitle, setRfqTitle] = useState("");
  const [rfqCategory, setRfqCategory] = useState("Cotton");
  const [rfqDesc, setRfqDesc] = useState("");
  const [rfqQty, setRfqQty] = useState(1000);
  const [rfqPrice, setRfqPrice] = useState(150);
  const [rfqDate, setRfqDate] = useState("");
  const [rfqWeight, setRfqWeight] = useState("180 gsm");
  const [rfqWidth, setRfqWidth] = useState("58 inches");
  const [rfqComp, setRfqComp] = useState("100% Cotton");
  const [submittingRfq, setSubmittingRfq] = useState(false);

  useEffect(() => {
    loadOrders();
    loadRfqs();
  }, []);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orderService.getBuyerOrders();
      setOrders(data.data);
    } catch (err) {
      console.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadRfqs = async () => {
    setLoadingRfqs(true);
    try {
      const res = await rfqService.getBuyerRfqs();
      setRfqs(res.data);
    } catch (err) {
      console.error("Failed to load RFQs");
    } finally {
      setLoadingRfqs(false);
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const toggleExpandRfq = (id: string) => {
    setExpandedRfqId(expandedRfqId === id ? null : id);
  };

  const handlePostRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle || !rfqQty || !rfqPrice) {
      showToast("Please fill out all required fields.", "error");
      return;
    }
    setSubmittingRfq(true);
    try {
      await rfqService.createRfq({
        title: rfqTitle,
        category: rfqCategory,
        description: rfqDesc,
        quantity: rfqQty,
        targetPrice: rfqPrice,
        targetDate: rfqDate || undefined,
        specifications: {
          weight: rfqWeight,
          width: rfqWidth,
          composition: rfqComp,
        },
      });
      setIsRfqModalOpen(false);
      // Reset form
      setRfqTitle("");
      setRfqCategory("Cotton");
      setRfqDesc("");
      setRfqQty(1000);
      setRfqPrice(150);
      setRfqDate("");
      setRfqWeight("180 gsm");
      setRfqWidth("58 inches");
      setRfqComp("100% Cotton");
      // Reload
      loadRfqs();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to post sourcing request.", "error");
    } finally {
      setSubmittingRfq(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to accept this quote? All other bids for this request will be rejected.")) {
      return;
    }
    try {
      await rfqService.acceptQuote(quoteId);
      showToast("Quote accepted successfully!", "success");
      loadRfqs();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to accept quote.", "error");
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 1;
      case "accepted":
        return 2;
      case "preparing":
        return 3;
      case "ready_for_dispatch":
        return 4;
      case "completed":
        return 5;
      default:
        return 1;
    }
  };

  const steps = [
    { label: "Request Placed", key: "pending" },
    { label: "Mill Accepted", key: "accepted" },
    { label: "Preparing Fabric", key: "preparing" },
    { label: "Dispatched", key: "ready_for_dispatch" },
    { label: "Completed", key: "completed" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-12 px-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-700/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back */}
        <div className="flex justify-between items-center">
          <Link
            to="/marketplace"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
          <span className="text-xs text-slate-400">Buyer Dashboard</span>
        </div>

        {/* Profile Card Summary */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-700/10 border border-teal-200/50 flex items-center justify-center text-teal-700">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{profile?.businessName}</h3>
              <p className="text-[10px] text-slate-400">{profile?.businessType} • {profile?.industry}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-y md:border-y-0 md:border-x border-slate-200 py-4 md:py-0 md:px-6">
            <div className="h-12 w-12 rounded-xl bg-teal-700/10 border border-indigo-500/20 flex items-center justify-center text-teal-700">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Office Location</p>
              <h4 className="font-bold text-xs mt-0.5">{profile?.city}, {profile?.state}</h4>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Company Contact</p>
              <h4 className="font-bold text-xs mt-0.5">{profile?.phone}</h4>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === "orders"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Wholesale Orders ({orders.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("rfqs")}
            className={`px-6 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === "rfqs"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sourcing Board RFQs ({rfqs.length})
            </div>
          </button>
        </div>

        {activeTab === "orders" ? (
          /* Orders Tracker Section */
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-teal-700" />
              Track Sourced Fabrics
            </h2>

            {loadingOrders ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-white border border-slate-200 shadow-xs rounded-2xl"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-12 text-center text-slate-400 text-xs">
                No orders placed yet. Browse the marketplace catalog to find fabrics!
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const currentStep = getStatusStep(order.status);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden hover:border-slate-700 transition-colors"
                    >
                      {/* Compact row summary */}
                      <div
                        onClick={() => toggleExpandOrder(order.id)}
                        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full flex-1">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Order Reference</p>
                            <h4 className="font-mono text-xs font-bold text-slate-700 mt-1 truncate" title={order.id}>
                              #{order.id.slice(0, 8)}...
                            </h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Supplier Mill</p>
                            <h4 className="text-xs font-bold text-slate-700 mt-1 truncate">
                              {order.supplier?.businessName}
                            </h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Placed On</p>
                            <h4 className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Value</p>
                            <h4 className="text-xs font-bold text-teal-700 mt-1">
                              ₹{parseFloat(order.totalAmount as any).toFixed(2)}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize ${
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
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Timeline progress & details expansion */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-slate-950/60 pt-5 space-y-6 bg-slate-50/30">
                          {/* Timeline Component */}
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-4">
                              Production & Logistics Timeline
                            </p>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
                              {/* Horizontal Line connector */}
                              <div className="absolute top-2.5 left-2 md:left-6 right-2 md:right-6 h-0.5 bg-slate-800 hidden md:block z-0"></div>

                              {steps.map((step, idx) => {
                                const stepNum = idx + 1;
                                const isActive = stepNum <= currentStep;

                                return (
                                  <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 relative z-10 w-full md:text-center">
                                    <div
                                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all border ${
                                        isActive
                                          ? "bg-teal-700 border-teal-700 text-white shadow shadow-violet-600/30 font-bold"
                                          : "bg-white border-slate-200 text-slate-400"
                                      }`}
                                    >
                                      {stepNum}
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold transition-all ${
                                        isActive ? "text-teal-700" : "text-slate-400"
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Order Items snapshot */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-950/30">
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3.5">
                                Sourced Items
                              </p>
                              <div className="space-y-2.5">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                                    <div>
                                      <span className="font-bold text-slate-700">{item.productName}</span>
                                      {item.color && (
                                        <span className="ml-2 text-[9px] bg-white text-slate-400 px-1.5 py-0.5 rounded-lg border border-slate-200">
                                          {item.color}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-slate-700">{item.quantity} meters</span>
                                      <span className="block text-[10px] text-slate-400">₹{item.price}/m</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3.5">
                                Delivery Profile
                              </p>
                              <div className="text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-2">
                                <p className="text-slate-400">
                                  <span className="font-bold text-slate-700">Name:</span> {order.contactName}
                                </p>
                                <p className="text-slate-400">
                                  <span className="font-bold text-slate-700">Phone:</span> {order.phone}
                                </p>
                                <p className="text-slate-400">
                                  <span className="font-bold text-slate-700">Address:</span> {order.shippingAddress}
                                </p>
                                {order.trackingNumber && (
                                  <p className="text-slate-400 pt-2 border-t border-slate-250 mt-2">
                                    <span className="font-bold text-slate-700">Tracking Reference:</span>{" "}
                                    <span className="font-mono text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900">{order.trackingNumber}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Custom RFQs Sourcing procurement section */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-700" />
                  Custom Sourcing Requests (RFP Board)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Post fabric specifications to solicit bids directly from mills.</p>
              </div>
              <button
                onClick={() => setIsRfqModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-850 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Post New RFQ
              </button>
            </div>

            {loadingRfqs ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-white border border-slate-200 shadow-xs rounded-2xl"></div>
                ))}
              </div>
            ) : rfqs.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-12 text-center text-slate-400 text-xs">
                No active RFQ requests. Click "Post New RFQ" to request custom fabric quotes!
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((rfq) => {
                  const isExpanded = expandedRfqId === rfq.id;
                  const bidsCount = rfq.quotes ? rfq.quotes.length : 0;
                  const acceptedQuote = rfq.quotes?.find((q) => q.status === "accepted");

                  return (
                    <div
                      key={rfq.id}
                      className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden hover:border-slate-700 transition-colors"
                    >
                      {/* Summary row */}
                      <div
                        onClick={() => toggleExpandRfq(rfq.id)}
                        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full flex-1">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">RFQ Target</p>
                            <h4 className="text-xs font-bold text-slate-700 mt-1 truncate" title={rfq.title}>
                              {rfq.title}
                            </h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Required Quantity</p>
                            <h4 className="text-xs font-bold text-slate-700 mt-1">
                              {rfq.quantity} meters
                            </h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Target Price</p>
                            <h4 className="text-xs font-bold text-teal-700 mt-1">
                              ₹{rfq.targetPrice}/m
                            </h4>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Received Bids</p>
                            <h4 className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bidsCount > 0 ? "bg-violet-950 text-teal-700 border border-violet-800" : "bg-slate-50 text-slate-400"}`}>
                                {bidsCount} supplier bids
                              </span>
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize ${
                              rfq.status === "fulfilled"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : rfq.status === "cancelled"
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-violet-500/10 border-teal-200/50 text-teal-700"
                            }`}
                          >
                            {rfq.status}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expansion layout */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-slate-950/60 pt-5 space-y-6 bg-slate-50/30 text-xs text-slate-700">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Specs Card */}
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-2">
                              <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-250">RFQ Specifications</h5>
                              <p><span className="text-slate-400">Category:</span> {rfq.category}</p>
                              <p><span className="text-slate-400">Weight:</span> {rfq.specifications?.weight || "N/A"}</p>
                              <p><span className="text-slate-400">Width:</span> {rfq.specifications?.width || "N/A"}</p>
                              <p><span className="text-slate-400">Composition:</span> {rfq.specifications?.composition || "N/A"}</p>
                              {rfq.targetDate && (
                                <p><span className="text-slate-400">Target Delivery:</span> {new Date(rfq.targetDate).toLocaleDateString()}</p>
                              )}
                            </div>

                            {/* Description Card */}
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 md:col-span-2 space-y-2">
                              <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-250">Sourcing Brief / Notes</h5>
                              <p className="leading-relaxed text-slate-400">{rfq.description || "No description provided."}</p>
                            </div>
                          </div>

                          {/* Quotes List Section */}
                          <div className="pt-4 border-t border-slate-950/30">
                            <h4 className="font-bold text-sm mb-3">Incoming Supplier Bids</h4>
                            {(!rfq.quotes || rfq.quotes.length === 0) ? (
                              <p className="text-slate-400 text-xs italic">Waiting for supplier quotes. Sourcing agents are analyzing your RFQ...</p>
                            ) : (
                              <div className="space-y-3">
                                {rfq.quotes.map((quote) => (
                                  <div
                                    key={quote.id}
                                    className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                                      quote.status === "accepted"
                                        ? "bg-emerald-950/15 border-emerald-500/25"
                                        : quote.status === "rejected"
                                        ? "bg-slate-50/40 border-slate-250 opacity-60"
                                        : "bg-slate-50/70 border-slate-200"
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-xs">{quote.supplier?.businessName}</span>
                                        {quote.status === "accepted" && (
                                          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold text-[9px] uppercase border border-emerald-500/20">
                                            <Check className="h-2.5 w-2.5" /> Accepted Quote
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-1"><span className="text-slate-400">Notes:</span> {quote.notes || "No notes provided."}</p>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-end gap-4 md:gap-1.5 w-full md:w-auto justify-between border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-250">
                                      <div className="text-right">
                                        <p className="text-xs font-bold text-teal-700">Offered: ₹{quote.offeredPrice}/m</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Est. Delivery: {quote.estimatedDeliveryDays} days</p>
                                      </div>

                                      {rfq.status === "open" && quote.status === "pending" && (
                                        <button
                                          onClick={() => handleAcceptQuote(quote.id)}
                                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white shadow-lg cursor-pointer"
                                        >
                                          Accept Quote
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RFQ Creation Modal */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-xs rounded-2xl p-6 relative text-slate-800">
            <button
              onClick={() => setIsRfqModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-base mb-2">Create Custom Sourcing Request (RFQ)</h3>
            <p className="text-slate-400 text-xs mb-6">Describe your fabric requirements and suppliers will bid on your order.</p>

            <form onSubmit={handlePostRfq} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Request Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulk White Linen for Summer Shirting"
                  value={rfqTitle}
                  onChange={(e) => setRfqTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-teal-700 focus:outline-none"
                  >
                    {["Cotton", "Silk", "Denim", "Linen", "Polyester", "Wool"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={rfqDate}
                    onChange={(e) => setRfqDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-teal-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Quantity (meters) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={rfqQty}
                    onChange={(e) => setRfqQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-teal-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Price per meter (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={rfqPrice}
                    onChange={(e) => setRfqPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-teal-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-2">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-1">Weight (e.g. 200 gsm)</label>
                    <input
                      type="text"
                      value={rfqWeight}
                      onChange={(e) => setRfqWeight(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-1">Width (e.g. 58 inches)</label>
                    <input
                      type="text"
                      value={rfqWidth}
                      onChange={(e) => setRfqWidth(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-1">Composition (e.g. 100% Cotton)</label>
                    <input
                      type="text"
                      value={rfqComp}
                      onChange={(e) => setRfqComp(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Detailed Sourcing Brief (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional specifications (weaving style, certifications, wash requirements)..."
                  value={rfqDesc}
                  onChange={(e) => setRfqDesc(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRfqModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRfq}
                  className="flex-1 py-3 rounded-xl bg-teal-700 hover:bg-teal-850 font-bold text-xs text-white shadow-lg cursor-pointer"
                >
                  {submittingRfq ? "Posting RFQ..." : "Publish Sourcing Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
