import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { useCart } from "../hooks/useCart.ts";
import { useToast } from "../components/Toast.tsx";
import { productService } from "../services/product.service.ts";
import { orderService } from "../services/order.service.ts";
import { AIChatPanel } from "../components/AIChatPanel.tsx";
import {
  Search,
  Filter,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  X,
  Sparkles,
  ClipboardList,
  LogOut,
  MapPin,
  Phone,
  UserCheck,
  CheckCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  imageUrls: string[];
  colors: string[];
  specifications: any;
  moq: number;
  supplierId: string;
  supplier: {
    id: string;
    businessName: string;
  };
}

export const BuyerHome: React.FC = () => {
  const { user, logoutUser, profile } = useAuth();
  const { showToast } = useToast();
  const {
    items: cartItems,
    fetchCart,
    addItemToCart,
    updateItemQty,
    removeItem,
    clearAllCart,
    cartCount,
    cartTotal,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [maxMoq, setMaxMoq] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // UI state overlays
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(100);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Checkout inputs
  const [shippingName, setShippingName] = useState(profile?.businessName || "");
  const [shippingPhone, setShippingPhone] = useState(profile?.phone || "");
  const [shippingAddress, setShippingAddress] = useState(profile?.address || "");

  // Load catalog & cart
  useEffect(() => {
    loadCatalog();
    fetchCart();
  }, []);

  const loadCatalog = async (filtersObj?: any) => {
    setLoadingProducts(true);
    try {
      const data = await productService.getProducts(filtersObj);
      setProducts(data.data);
    } catch (err) {
      console.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleApplyFilters = () => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedColor) params.color = selectedColor;
    if (maxMoq) params.maxMoq = maxMoq;
    if (maxPrice) params.maxPrice = maxPrice;
    loadCatalog(params);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedColor("");
    setMaxMoq("");
    setMaxPrice("");
    loadCatalog({});
  };

  const handleOpenDetail = (prod: any) => {
    setSelectedProduct(prod);
    setDetailQty(prod.moq); // Start with MOQ limit
  };

  const handleAddToCartFromDetail = async () => {
    if (!selectedProduct) return;
    if (detailQty < selectedProduct.moq) {
      showToast(`Minimum Order Quantity (MOQ) is ${selectedProduct.moq}m.`, "error");
      return;
    }
    try {
      await addItemToCart(selectedProduct.id, detailQty);
      setSelectedProduct(null);
      setIsCartOpen(true);
    } catch (err: any) {
      showToast(err.message || "Failed to add to cart", "error");
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress || !shippingPhone || !shippingName) {
      showToast("Please fill out all shipping details.", "error");
      return;
    }
    try {
      await orderService.placeOrder({
        shippingAddress,
        phone: shippingPhone,
        contactName: shippingName,
      });
      clearAllCart();
      setCheckoutSuccess(true);
      setIsCheckingOut(false);
    } catch (err: any) {
      showToast(err.message || "Checkout failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-sm shadow shadow-violet-600/30">
            FF
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FabricFlow Marketplace
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <Link
            to="/buyer/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            My Dashboard
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-xs font-bold">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logoutUser}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Filter className="h-4.5 w-4.5 text-violet-400" />
            <h4 className="font-bold text-sm">Filters & Sorting</h4>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Organic Cotton, Silk..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Fabric Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            >
              <option value="">All Categories</option>
              {["Cotton", "Silk", "Denim", "Linen", "Polyester", "Wool"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Color
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            >
              <option value="">All Colors</option>
              {["White", "Black", "Blue", "Red", "Green", "Yellow", "Grey", "Indigo", "Pink", "Beige"].map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Max MOQ */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Max MOQ limit (m)
            </label>
            <input
              type="number"
              value={maxMoq}
              onChange={(e) => setMaxMoq(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Max Price per meter (₹)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 400"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-xs text-white cursor-pointer"
            >
              Apply Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4">
            <div>
              <h2 className="text-xl font-bold">Fabric Catalog</h2>
              <p className="text-xs text-slate-400 mt-1">Browse wholesale fabrics and place bulk requests.</p>
            </div>
            <span className="text-xs bg-violet-950 border border-violet-800 text-violet-400 px-3 py-1 rounded-full font-bold">
              {products.length} Products Found
            </span>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-900 border border-slate-800"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              No products match your filters. Try search keywords or resetting sidebar entries.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-slate-900 bg-slate-900/50 hover:bg-slate-900 p-4 hover:border-slate-800 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={prod.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                      alt={prod.name}
                      className="h-40 w-full rounded-xl object-cover mb-4"
                    />
                    <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold">
                      {prod.category}
                    </span>
                    <h3 className="font-bold text-sm mt-3 truncate">{prod.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">By {prod.supplier?.businessName}</p>
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                      <span className="text-violet-400 font-extrabold text-sm">₹{prod.price}/m</span>
                      <span className="text-slate-400">MOQ: {prod.moq}m</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenDetail(prod)}
                    className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-violet-600 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 relative text-slate-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <img
                  src={selectedProduct.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                  alt={selectedProduct.name}
                  className="h-56 w-full rounded-xl object-cover mb-4"
                />
                <div className="flex gap-2">
                  {selectedProduct.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt="" className="h-12 w-12 rounded-lg object-cover border border-slate-800" />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-extrabold text-xl mt-2">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Listed by: <span className="font-semibold text-slate-300">{selectedProduct.supplier?.businessName}</span></p>

                  <p className="text-xs text-slate-300 mt-4 leading-relaxed line-clamp-3">
                    {selectedProduct.description || "Premium quality fabric sourced directly from verified wholesale mills. Meets compliance specs."}
                  </p>

                  {/* Specifications Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-b border-slate-800 py-3 text-[11px]">
                    <div>
                      <span className="text-slate-500">Weight:</span>{" "}
                      <span className="font-medium text-slate-300">{selectedProduct.specifications?.weight || "200 gsm"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Width:</span>{" "}
                      <span className="font-medium text-slate-300">{selectedProduct.specifications?.width || "58 inches"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Composition:</span>{" "}
                      <span className="font-medium text-slate-300">{selectedProduct.specifications?.composition || "100% Cotton"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Available:</span>{" "}
                      <span className="font-medium text-slate-300">{selectedProduct.stock}m</span>
                    </div>
                  </div>

                  {/* Colors */}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Available Colors:</span>
                      <div className="flex gap-1.5">
                        {selectedProduct.colors.map((c) => (
                          <span key={c} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-violet-400">₹{selectedProduct.price}/meter</span>
                    <span className="text-xs text-slate-400">MOQ: {selectedProduct.moq}m</span>
                  </div>

                  {/* Quantity input */}
                  <div className="flex gap-2">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2">
                      <button
                        onClick={() => setDetailQty(Math.max(selectedProduct.moq, detailQty - 50))}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        value={detailQty}
                        onChange={(e) => setDetailQty(Math.max(selectedProduct.moq, parseInt(e.target.value) || 0))}
                        className="w-16 text-center text-xs bg-transparent border-none text-white focus:outline-none"
                      />
                      <button
                        onClick={() => setDetailQty(Math.min(selectedProduct.stock, detailQty + 50))}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCartFromDetail}
                      className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs shadow-lg shadow-violet-600/10 cursor-pointer text-white"
                    >
                      Add To Wholesale Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Slider Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between text-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-violet-400" />
                <h4 className="font-extrabold text-sm">Shopping Cart ({cartCount})</h4>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckingOut(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isCheckingOut ? (
                // Shipping Address Form
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 mb-6">
                    <h5 className="font-bold text-xs text-slate-300">Order Summary</h5>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                      <span>Total Yards:</span>
                      <span>{cartCount} meters</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-white pt-2 border-t border-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-violet-400">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <h5 className="font-bold text-xs text-slate-300">Shipping Details</h5>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Recipient / Contact Name *
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        required
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        placeholder="Company Contact Name"
                        className="block w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        required
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="+91 99999 88888"
                        className="block w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Shipping Address *
                    </label>
                    <div className="mt-1.5 relative">
                      <textarea
                        required
                        rows={4}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter complete shipping details..."
                        className="block w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs shadow-lg shadow-violet-600/10 cursor-pointer text-white"
                    >
                      Place Wholesale Order
                    </button>
                  </div>
                </form>
              ) : cartItems.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  Your shopping cart is empty. Sourced fabrics will appear here.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 bg-slate-950 border border-slate-800 p-3 rounded-xl relative hover:border-slate-700 transition-colors"
                  >
                    <img
                      src={item.product?.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-xs line-clamp-1">{item.product?.name}</h5>
                        <p className="text-[9px] text-slate-500 mt-0.5 truncate">Mill: {item.product?.supplier?.businessName}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-violet-400">₹{item.product?.price}/m</span>
                        {/* Qty controller */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                          <button
                            onClick={() => updateItemQty(item.id, Math.max(item.product.moq, item.quantity - 50))}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="w-8 text-center text-[10px] font-bold">{item.quantity}m</span>
                          <button
                            onClick={() => updateItemQty(item.id, Math.min(item.product.stock, item.quantity + 50))}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer summary */}
            {!isCheckingOut && cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Subtotal Yards:</span>
                  <span>{cartCount} meters</span>
                </div>
                <div className="flex justify-between text-sm font-bold mb-4">
                  <span>Total Amount:</span>
                  <span className="text-violet-400">₹{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-xl shadow-violet-600/10 transition-colors cursor-pointer text-center"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Success Confirmation Modal */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-200">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <h3 className="font-extrabold text-lg">Wholesale Order Sourced!</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your bulk order requests have been split by mill supplier and logged successfully. Mills will process your request shortly.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/buyer/dashboard"
                onClick={() => setCheckoutSuccess(false)}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-lg cursor-pointer"
              >
                Track Orders Timeline
              </Link>
              <button
                onClick={() => setCheckoutSuccess(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs cursor-pointer text-slate-300"
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant Panel */}
      <AIChatPanel onSelectProduct={handleOpenDetail} />
    </div>
  );
};
