import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Cpu, ShoppingBag, ArrowRight } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-violet-600/30">
            FF
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FabricFlow
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-semibold hover:text-violet-400 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            Register Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur-md mb-8">
          <Cpu className="h-3.5 w-3.5" />
          Next-Gen AI B2B Textile Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Streamlining Wholesale{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Fabric Sourcing
          </span>{" "}
          for Global Brands
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect directly with verified textile suppliers, search materials using AI conversational voice, and track orders in a single, high-performance portal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register?role=buyer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:opacity-95 px-8 py-4 font-bold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all"
          >
            Buyer Discovery Portal
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/register?role=supplier"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-8 py-4 font-bold hover:bg-slate-800/50 transition-all"
          >
            Sell Fabric Wholesale
          </Link>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-10 border-y border-slate-900 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-violet-400">5000+</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase mt-1">Listed Fabrics</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-400">100%</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase mt-1">Verified Mills</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-cyan-400">20+</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase mt-1">Countries Served</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-pink-400">₹0</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase mt-1">Escrow Fee</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Engineered for Wholesale</h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">Powerful modules built specifically to eliminate textile sourcing inefficiencies.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-8 hover:border-slate-800 hover:bg-slate-900/10 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Marketplace Assistant</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Find fabrics naturally using voice requests, compare specifications across mills, and receive instant recommendations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-8 hover:border-slate-800 hover:bg-slate-900/10 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mill Inventory Hub</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Suppliers list, edit, and adjust wholesale stocks dynamically. Monitor low stock alerts and mark items out of stock in real-time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-8 hover:border-slate-800 hover:bg-slate-900/10 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Split-Order Checkout</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Checkout multiple fabric types seamlessly. Orders split by supplier automatically so mills receive direct processing channels.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-8 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">© 2026 FabricFlow Marketplace. All rights reserved.</span>
          <div className="flex space-x-6 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
