import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Truck, Cpu, ShoppingBag, ArrowRight, Sparkles, MessageSquare, Plus, CheckCircle, Database } from "lucide-react";
import { productService } from "../services/product.service.ts";
import { AIChatPanel } from "../components/AIChatPanel.tsx";
import { useAuth } from "../hooks/useAuth.ts";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  moq: number;
  imageUrls: string[];
  supplier: {
    businessName: string;
  };
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [featuredFabrics, setFeaturedFabrics] = useState<Product[]>([]);
  const [loadingFabrics, setLoadingFabrics] = useState(true);

  // Load first 3 fabrics from catalog to show in Featured section
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts({ limit: 3 });
        // Show first 3 products
        setFeaturedFabrics(data.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load featured fabrics", err);
      } finally {
        setLoadingFabrics(false);
      }
    };
    fetchFeatured();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden scroll-smooth">
      {/* Sticky Premium Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <Link to="/" className="h-9 w-9 rounded-xl bg-teal-700 flex items-center justify-center font-bold text-white shadow-md shadow-teal-700/20">
            FF
          </Link>
          <span className="font-extrabold text-xl tracking-tight text-teal-900">
            FabricFlow
          </span>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-teal-700 transition-colors cursor-pointer bg-transparent border-none">
            Home
          </button>
          <Link to="/marketplace" className="hover:text-teal-700 transition-colors">
            Marketplace
          </Link>
          <button onClick={() => scrollToSection("categories")} className="hover:text-teal-700 transition-colors cursor-pointer bg-transparent border-none">
            Categories
          </button>
          <button onClick={() => scrollToSection("suppliers")} className="hover:text-teal-700 transition-colors cursor-pointer bg-transparent border-none">
            For Suppliers
          </button>
          <button onClick={() => scrollToSection("how-it-works")} className="hover:text-teal-700 transition-colors cursor-pointer bg-transparent border-none">
            How It Works
          </button>
          <button onClick={() => scrollToSection("footer")} className="hover:text-teal-700 transition-colors cursor-pointer bg-transparent border-none">
            About
          </button>
          <button onClick={() => scrollToSection("footer")} className="hover:text-teal-700 transition-colors cursor-pointer bg-transparent border-none">
            Contact
          </button>
        </nav>

        {/* Right Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              to={user?.role === "buyer" ? "/marketplace" : "/supplier/dashboard"}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition-all cursor-pointer"
            >
              Go to Console
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-teal-700/20 transition-all active:scale-95 cursor-pointer"
              >
                Register Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section (Keep Dark Theme as Requested) */}
      <section className="relative z-10 bg-slate-950 text-white pt-36 pb-24 px-6 text-center overflow-hidden border-b border-slate-900">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/5 px-4 py-1.5 text-xs font-bold text-teal-300 backdrop-blur-md mb-8">
            <Cpu className="h-3.5 w-3.5 animate-pulse" />
            Next-Gen AI Sourcing B2B Textile Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Streamlining Wholesale{" "}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Fabric Sourcing
            </span>{" "}
            for Global Brands
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect directly with verified textile mills, discover premium fabrics using natural language AI search, and manage bulk checkout systems in a unified portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 px-8 py-4 font-bold text-sm shadow-xl shadow-teal-700/20 hover:shadow-teal-700/35 transition-all"
            >
              Explore Fabrics Catalog
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/register?role=supplier"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-8 py-4 font-bold text-sm hover:bg-slate-800/50 transition-all"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-extrabold text-teal-800">5000+</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Listed Fabrics</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-teal-800">100%</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Verified Mills</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-teal-800">20+</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Countries Served</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-teal-800">₹0</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Escrow Fee</p>
          </div>
        </div>
      </section>

      {/* Featured Fabrics Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20" id="featured">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Premium Catalog Selection</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Featured Fabrics</h2>
          </div>
          <Link to="/marketplace" className="mt-4 md:mt-0 flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline">
            View All Fabrics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingFabrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 h-80 animate-pulse flex flex-col justify-between">
                <div className="h-44 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-5 bg-slate-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredFabrics.map((prod) => (
              <div
                key={prod.id}
                onClick={() => navigate(`/marketplace?category=${prod.category}`)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="overflow-hidden rounded-xl h-44 mb-4 border border-slate-100 relative">
                    <img
                      src={prod.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                    {prod.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-3 truncate">{prod.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">Mill: <span className="font-semibold text-slate-600">{prod.supplier?.businessName}</span></p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold pt-3 border-t border-slate-100">
                  <span className="text-teal-700 font-extrabold text-sm">₹{prod.price}/m</span>
                  <span className="text-slate-500">MOQ: {prod.moq}m</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product Categories */}
      <section className="relative z-10 bg-white border-y border-slate-200 py-20" id="categories">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Global Materials Board</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Fabric Categories</h2>
            <p className="text-slate-400 text-xs mt-3">Filter our premium wholesale products catalog directly by raw material base.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              { name: "Cotton", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300", count: "1,200+ listed" },
              { name: "Silk", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300", count: "400+ listed" },
              { name: "Denim", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300", count: "800+ listed" },
              { name: "Linen", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300", count: "600+ listed" },
              { name: "Polyester", img: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=300", count: "1,500+ listed" },
              { name: "Wool", img: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300", count: "300+ listed" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/marketplace?category=${cat.name}`}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-xs border border-slate-200 cursor-pointer flex flex-col justify-end p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300"
              >
                <img src={cat.img} alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                <div className="relative z-10">
                  <h4 className="font-bold text-xs text-white">{cat.name}</h4>
                  <p className="text-[9px] text-slate-300 font-medium mt-0.5">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant showcase */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20" id="ai-showcase">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/50 px-3 py-1 text-xs font-bold text-teal-700">
              <Sparkles className="h-3.5 w-3.5" />
              Sourcing Redefined
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Instant Sourcing & Discovery via Conversational AI
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Ditch complicated filters. Simply talk to the FabricFlow AI Assistant to translate standard buyer requests into structured e-commerce catalog parameters instantly.
            </p>
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <span className="h-6 w-6 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-teal-700 text-[10px]">1</span>
                <div>
                  <p className="text-slate-900 font-bold">Natural Query Parsing</p>
                  <p className="text-slate-400 text-[10px] font-normal mt-0.5">Understands categories, prices, colors, and residual purpose descriptions like "lightweight summer shirts".</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <span className="h-6 w-6 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-teal-700 text-[10px]">2</span>
                <div>
                  <p className="text-slate-900 font-bold">Automatic Filter Redirection</p>
                  <p className="text-slate-400 text-[10px] font-normal mt-0.5">Finds matching fabrics from the Postgres database and navigates the buyer straight to the catalog results.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white font-mono text-[11px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              </div>
              <span className="text-slate-500 text-[9px]">ask-fabricflow-assistant.sh</span>
            </div>
            <div className="space-y-3">
              <p className="text-slate-500">// Natural Request</p>
              <div className="flex gap-2">
                <span className="text-teal-400">Buyer:</span>
                <span className="text-slate-200">"Show me lightweight cotton fabric for summer shirts under 200 rupees"</span>
              </div>
              <p className="text-slate-500">// Structured AI Extract</p>
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-teal-300 space-y-1">
                <p>{"{"}</p>
                <p className="pl-4">"category": "Cotton",</p>
                <p className="pl-4">"maxPrice": 200,</p>
                <p className="pl-4">"search": "lightweight summer shirts"</p>
                <p>{"}"}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400">System:</span>
                <span className="text-emerald-400">Redirecting to /marketplace?category=Cotton&maxPrice=200&search=lightweight+summer+shirts... 🚀</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Section (Premium Light Theme) */}
      <section className="relative z-10 bg-white border-y border-slate-200 py-20" id="suppliers">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Industrial Growth Channels</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Grow your textile business with FabricFlow</h2>
            <p className="text-slate-400 text-xs mt-3">We connect leading fabric mills directly with global garment brands and boutique retailers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {[
              {
                icon: <Database className="h-5 w-5" />,
                title: "Manage Inventory",
                desc: "List wholesale fabric catalog listings, define price steps, control quantities, and update stocks in a few clicks.",
              },
              {
                icon: <ShoppingBag className="h-5 w-5" />,
                title: "Receive Bulk Orders",
                desc: "Receive structured direct orders. Invoices split by mill automatically, giving you independent customer channels.",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "RFQ Bidding Board",
                desc: "Review open buyer sourcing requests, generate AI specification estimates, and place custom quotes directly.",
              },
              {
                icon: <Truck className="h-5 w-5" />,
                title: "Track Shipments",
                desc: "Keep buyers informed with built-in logistics tracking. Update statuses from accepted to dispatched easily.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-xs transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                  {item.icon}
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Marketplace Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20" id="how-it-works">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">B2B Workflow Steps</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How It Works</h2>
          <p className="text-slate-400 text-xs mt-3">Simple transparent transactions from swatch selection to factory delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Buyers Side */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
            <h4 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>For Buyers</span>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Brand Portal</span>
            </h4>
            <div className="space-y-4 text-xs">
              <div className="flex gap-4">
                <span className="font-extrabold text-teal-700">01</span>
                <div>
                  <p className="font-bold text-slate-800">Source Materials</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Explore catalog or query the AI assistant to locate specific fabrics.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-extrabold text-teal-700">02</span>
                <div>
                  <p className="font-bold text-slate-800">Direct Bulk checkout</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Place split wholesale orders. FabricFlow automatically routes products to respective mills.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-extrabold text-teal-700">03</span>
                <div>
                  <p className="font-bold text-slate-800">Post RFQs Sourcing Requests</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Post custom spec sheets to the public RFQ board for mill quotes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers Side */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
            <h4 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>For Suppliers & Mills</span>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Mill Portal</span>
            </h4>
            <div className="space-y-4 text-xs">
              <div className="flex gap-4">
                <span className="font-extrabold text-teal-700">01</span>
                <div>
                  <p className="font-bold text-slate-800">List Fabrics Catalog</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Add products, define colors, GSM weight, width details, and upload swatches.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-extrabold text-teal-700">02</span>
                <div>
                  <p className="font-bold text-slate-800">Submit RFQ Bids</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Quote pricing and production lead days on global buyer requirements.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-extrabold text-teal-700">03</span>
                <div>
                  <p className="font-bold text-slate-800">Fulfill direct Orders</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Update tracking IDs and dispatch fabrics direct from your warehouse.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-white border-t border-slate-800 py-16" id="footer">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center font-bold text-white">
                FF
              </div>
              <span className="font-extrabold text-lg tracking-tight">FabricFlow</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Voted leading AI platform for wholesale textile sourcing, connecting global apparel makers directly to weaving mills.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-xs text-white mb-4 uppercase tracking-wider">Explore</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace Catalog</Link></li>
              <li><button onClick={() => scrollToSection("categories")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Fabric Categories</button></li>
              <li><Link to="/register?role=supplier" className="hover:text-white transition-colors">Supplier Onboarding</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs text-white mb-4 uppercase tracking-wider">B2B Core Features</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => scrollToSection("ai-showcase")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">AI Sourcing Chat</button></li>
              <li><button onClick={() => scrollToSection("suppliers")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Mill Inventory Hub</button></li>
              <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Wholesale Timeline</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs text-white mb-4 uppercase tracking-wider">Support & Office</h5>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cotton Exchange Building, Mumbai - 400002<br />
              info@fabricflow.com<br />
              +91 (22) 555-0199
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-slate-500">© 2026 FabricFlow Marketplace. All rights reserved. Built for B2B Textile Sourcing.</span>
          <div className="flex space-x-6 text-[10px] text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Developer API</a>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Assistant Panel with Compact Toggle Button */}
      <AIChatPanel />
    </div>
  );
};
