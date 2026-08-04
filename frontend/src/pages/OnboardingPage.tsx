import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { Sparkles, MessageSquare, ArrowRight, ArrowLeft, Send } from "lucide-react";

export const OnboardingPage: React.FC = () => {
  const { user, profile, submitOnboarding, loadProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect if already onboarded
  useEffect(() => {
    if (profile?.isOnboarded) {
      navigate(user?.role === "buyer" ? "/buyer/home" : "/supplier/dashboard");
    }
  }, [profile, user, navigate]);

  // AI chat helpers
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(
    "Hello! I am your Onboarding Assistant. 🤖 You can tell me about your business in plain English (e.g. 'I am a garment maker named Zara Fabrics based in Delhi. We source Cotton and Linen with order sizes around 800m and a 50k budget.'), and I will pre-fill the form for you!"
  );

  // Form states - Buyer
  const [buyerName, setBuyerName] = useState("");
  const [buyerType, setBuyerType] = useState("Garment Manufacturer");
  const [buyerIndustry, setBuyerIndustry] = useState("Apparel");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("India");
  const [buyerState, setBuyerState] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerFabrics, setBuyerFabrics] = useState<string[]>([]);
  const [buyerCategories, setBuyerCategories] = useState<string[]>([]);
  const [buyerQty, setBuyerQty] = useState(500);
  const [buyerBudgetMin, setBuyerBudgetMin] = useState(25000);
  const [buyerBudgetMax, setBuyerBudgetMax] = useState(100000);

  // Form states - Supplier
  const [supplierName, setSupplierName] = useState("");
  const [supplierType, setSupplierType] = useState("Textile Mill");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("India");
  const [supplierState, setSupplierState] = useState("");
  const [supplierCity, setSupplierCity] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierHours, setSupplierHours] = useState("9 AM - 6 PM");
  const [supplierCategories, setSupplierCategories] = useState<string[]>([]);
  const [supplierFabrics, setSupplierFabrics] = useState<string[]>([]);
  const [supplierMOQ, setSupplierMOQ] = useState(200);
  const [supplierDesc, setSupplierDesc] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle AI onboarding text parser
  const handleAIChat = () => {
    if (!aiMessage.trim()) return;

    setError(null);
    const text = aiMessage.toLowerCase();

    // Basic heuristic NLP extraction
    if (user?.role === "buyer") {
      // Extract Business Name (heuristics like "named X" or "called Y")
      const nameMatch = aiMessage.match(/(?:named|called|brand name is|company name is)\s*([a-zA-Z\s0-9]+?)(?:\s+based|\s+in|\s+we|\s+our|\s+and|\s+called|\.|$)/i);
      if (nameMatch && nameMatch[1]) setBuyerName(nameMatch[1].trim());

      // Extract City/Location
      const locationMatch = aiMessage.match(/(?:based in|located in|in|city of)\s*([a-zA-Z\s]+?)(?:\s+we|\s+our|\s+and|\s+named|\.|$)/i);
      if (locationMatch && locationMatch[1]) {
        const city = locationMatch[1].trim().split(" ")[0];
        setBuyerCity(city);
        setBuyerState("Maharashtra"); // Mock state fallback
        setBuyerAddress(`${city} Industrial Zone, ${city}`);
      }

      // Extract Fabrics
      const fabricsList = ["cotton", "silk", "denim", "linen", "polyester", "wool"];
      const matchedFabrics: string[] = [];
      fabricsList.forEach((fab) => {
        if (text.includes(fab)) {
          matchedFabrics.push(fab.charAt(0).toUpperCase() + fab.slice(1));
        }
      });
      if (matchedFabrics.length > 0) setBuyerFabrics(matchedFabrics);

      // Extract Budget
      const budgetMatch = aiMessage.match(/(?:budget of|between)\s*(\d+)(?:\s*(?:k|thousand|to|-)\s*(\d+))?/i);
      if (budgetMatch) {
        if (budgetMatch[2]) {
          const val1 = parseInt(budgetMatch[1]);
          const val2 = parseInt(budgetMatch[2]);
          // Standardize thousand k
          const min = val1 < 1000 ? val1 * 1000 : val1;
          const max = val2 < 1000 ? val2 * 1000 : val2;
          setBuyerBudgetMin(min);
          setBuyerBudgetMax(max);
        } else {
          const val = parseInt(budgetMatch[1]);
          const budget = val < 1000 ? val * 1000 : val;
          setBuyerBudgetMin(Math.round(budget * 0.7));
          setBuyerBudgetMax(budget);
        }
      }

      // Extract Qty
      const qtyMatch = aiMessage.match(/(?:qty|quantity|order|order sizes|around|about|order size is)\s*(\d+)/i);
      if (qtyMatch && qtyMatch[1]) setBuyerQty(parseInt(qtyMatch[1]));

      setAiResponse(
        "✨ AI Profile Parser: I have extracted your business details and auto-populated the form! Please check the fields, select any remaining checkboxes, and hit Submit Profile."
      );
    } else {
      // Supplier Extraction
      const nameMatch = aiMessage.match(/(?:named|called|company name is)\s*([a-zA-Z\s0-9]+?)(?:\s+based|\s+in|\s+we|\s+our|\s+and|\.|$)/i);
      if (nameMatch && nameMatch[1]) setSupplierName(nameMatch[1].trim());

      const locationMatch = aiMessage.match(/(?:based in|located in|in)\s*([a-zA-Z\s]+?)(?:\s+we|\s+our|\s+and|\.|$)/i);
      if (locationMatch && locationMatch[1]) {
        const city = locationMatch[1].trim().split(" ")[0];
        setSupplierCity(city);
        setSupplierState("Gujarat");
        setSupplierAddress(`${city} Textile Hub, ${city}`);
      }

      const moqMatch = aiMessage.match(/(?:moq|minimum|order)\s*(?:of|is)?\s*(\d+)/i);
      if (moqMatch && moqMatch[1]) setSupplierMOQ(parseInt(moqMatch[1]));

      // Extract Fabrics
      const fabricsList = ["cotton", "silk", "denim", "linen", "polyester", "wool"];
      const matchedFabrics: string[] = [];
      fabricsList.forEach((fab) => {
        if (text.includes(fab)) {
          matchedFabrics.push(fab.charAt(0).toUpperCase() + fab.slice(1));
        }
      });
      if (matchedFabrics.length > 0) setSupplierFabrics(matchedFabrics);

      // Contact person extraction
      const contactMatch = aiMessage.match(/(?:contact|person|representative|my name is)\s*([a-zA-Z\s]+?)(?:\s+at|\s+on|\s+and|\.|$)/i);
      if (contactMatch && contactMatch[1]) setSupplierContact(contactMatch[1].trim());

      setSupplierEmail(user?.email || "");

      setAiResponse(
        "✨ AI Profile Parser: I have successfully pre-filled your Mill/Supplier details in the form! Please confirm the entries and click Submit Profile."
      );
    }

    setAiMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (user?.role === "buyer") {
        if (!buyerName || !buyerPhone || !buyerCity || !buyerAddress) {
          throw new Error("Please fill out all required details.");
        }
        await submitOnboarding({
          businessName: buyerName,
          businessType: buyerType,
          industry: buyerIndustry,
          phone: buyerPhone,
          country: buyerCountry,
          state: buyerState || buyerCity,
          city: buyerCity,
          address: buyerAddress,
          preferredFabricTypes: buyerFabrics.length > 0 ? buyerFabrics : ["Cotton"],
          interestedCategories: buyerCategories.length > 0 ? buyerCategories : ["Woven"],
          typicalOrderQuantity: buyerQty,
          budgetMin: buyerBudgetMin,
          budgetMax: buyerBudgetMax,
        });
      } else {
        if (!supplierName || !supplierContact || !supplierPhone || !supplierCity || !supplierAddress) {
          throw new Error("Please fill out all required details.");
        }
        await submitOnboarding({
          businessName: supplierName,
          businessType: supplierType,
          contactPerson: supplierContact,
          phone: supplierPhone,
          email: supplierEmail || user?.email || "mill@fabricflow.com",
          country: supplierCountry,
          state: supplierState || supplierCity,
          city: supplierCity,
          address: supplierAddress,
          operatingHours: supplierHours,
          productCategories: supplierCategories.length > 0 ? supplierCategories : ["Woven"],
          fabricTypes: supplierFabrics.length > 0 ? supplierFabrics : ["Cotton"],
          minimumOrderQuantity: supplierMOQ,
          description: supplierDesc || `${supplierName} are premier manufacturers of wholesale fabrics.`,
        });
      }

      await loadProfile();
      navigate(user?.role === "buyer" ? "/buyer/home" : "/supplier/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFabricCheckbox = (fab: string) => {
    const list = user?.role === "buyer" ? buyerFabrics : supplierFabrics;
    const setter = user?.role === "buyer" ? setBuyerFabrics : setSupplierFabrics;
    if (list.includes(fab)) {
      setter(list.filter((f) => f !== fab));
    } else {
      setter([...list, fab]);
    }
  };

  const handleCategoryCheckbox = (cat: string) => {
    const list = user?.role === "buyer" ? buyerCategories : supplierCategories;
    const setter = user?.role === "buyer" ? setBuyerCategories : setSupplierCategories;
    if (list.includes(cat)) {
      setter(list.filter((c) => c !== cat));
    } else {
      setter([...list, cat]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Onboarding AI assistant Card (Left / Top) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <h3 className="font-bold text-sm">AI Onboarding Assistant</h3>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-[280px] overflow-y-auto">
              {aiResponse}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="Describe your business..."
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
            <button
              onClick={handleAIChat}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Traditional Form Card (Right / Bottom) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-2xl font-extrabold">Complete Your Business Profile</h2>
            <p className="text-slate-400 text-xs mt-1">
              Please finalize your company specifications before listing or purchasing fabrics.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {user?.role === "buyer" ? (
              // Buyer Fields
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Business / Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Zara Garments Ltd"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Business Type
                    </label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    >
                      <option>Garment Manufacturer</option>
                      <option>Fashion Label / Brand</option>
                      <option>Textile Wholesaler</option>
                      <option>Bespoke Designer Studio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Industry Category
                    </label>
                    <select
                      value={buyerIndustry}
                      onChange={(e) => setBuyerIndustry(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    >
                      <option>Apparel</option>
                      <option>Home Decor & Furnishing</option>
                      <option>Technical / Industrial Textiles</option>
                      <option>Footwear & Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Contact Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerCity}
                      onChange={(e) => setBuyerCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerState}
                      onChange={(e) => setBuyerState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerCountry}
                      onChange={(e) => setBuyerCountry(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full Office Address *
                  </label>
                  <textarea
                    required
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Enter complete company shipping/billing address details..."
                    rows={3}
                    className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                {/* Fabrics interest */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Preferred Fabric Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Cotton", "Silk", "Denim", "Linen", "Polyester", "Wool"].map((fab) => (
                      <button
                        type="button"
                        key={fab}
                        onClick={() => handleFabricCheckbox(fab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          buyerFabrics.includes(fab)
                            ? "bg-violet-600 border-violet-600 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {fab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Average Order Size (meters)
                    </label>
                    <input
                      type="number"
                      value={buyerQty}
                      onChange={(e) => setBuyerQty(parseInt(e.target.value))}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Min Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={buyerBudgetMin}
                      onChange={(e) => setBuyerBudgetMin(parseInt(e.target.value))}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Max Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={buyerBudgetMax}
                      onChange={(e) => setBuyerBudgetMax(parseInt(e.target.value))}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>
              </>
            ) : (
              // Supplier Fields
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Supplier / Mill Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="e.g. Gujarat Weaving Mills"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Supplier Type
                    </label>
                    <select
                      value={supplierType}
                      onChange={(e) => setSupplierType(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    >
                      <option>Textile Mill</option>
                      <option>Weaving & Spinning Factory</option>
                      <option>Dyeing & Finishing Mill</option>
                      <option>Wholesale Fabric Distributor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierContact}
                      onChange={(e) => setSupplierContact(e.target.value)}
                      placeholder="e.g. Anil Patel"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      placeholder="+91 99887 76655"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={supplierEmail}
                      onChange={(e) => setSupplierEmail(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierCity}
                      onChange={(e) => setSupplierCity(e.target.value)}
                      placeholder="e.g. Surat"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierState}
                      onChange={(e) => setSupplierState(e.target.value)}
                      placeholder="e.g. Gujarat"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierCountry}
                      onChange={(e) => setSupplierCountry(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full Warehouse / Factory Address *
                  </label>
                  <textarea
                    required
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    placeholder="Enter complete manufacturing/distribution warehouse address..."
                    rows={3}
                    className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Mill Operating Hours
                    </label>
                    <input
                      type="text"
                      value={supplierHours}
                      onChange={(e) => setSupplierHours(e.target.value)}
                      placeholder="e.g. 9 AM - 6 PM, Monday - Saturday"
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Factory Minimum Order Quantity (MOQ in meters)
                    </label>
                    <input
                      type="number"
                      value={supplierMOQ}
                      onChange={(e) => setSupplierMOQ(parseInt(e.target.value))}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Fabric Categories You Manufacture
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Cotton", "Silk", "Denim", "Linen", "Polyester", "Wool"].map((fab) => (
                      <button
                        type="button"
                        key={fab}
                        onClick={() => handleFabricCheckbox(fab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          supplierFabrics.includes(fab)
                            ? "bg-violet-600 border-violet-600 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {fab}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Factory Description / Specialities
                  </label>
                  <textarea
                    value={supplierDesc}
                    onChange={(e) => setSupplierDesc(e.target.value)}
                    placeholder="Summarize your textile specialities, certifications, weaving capacity..."
                    rows={3}
                    className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-tr from-violet-600 to-indigo-600 hover:opacity-95 text-sm font-bold rounded-xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 transition-all cursor-pointer"
            >
              {loading ? "Saving Profile..." : "Submit Profile & Onboard"}
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
