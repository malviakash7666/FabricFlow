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
      navigate(user?.role === "buyer" ? "/marketplace" : "/supplier/dashboard");
    }
  }, [profile, user, navigate]);

  interface OnboardingMessage {
    sender: "user" | "ai";
    text: string;
  }

  // AI chat helpers
  const [aiMessage, setAiMessage] = useState("");
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);

  // Load email and update welcome message on mount/user load
  useEffect(() => {
    if (user) {
      if (user.role === "supplier") {
        if (user.email) setSupplierEmail(user.email);
        setMessages([
          {
            sender: "ai",
            text: "Hello! I am your Supplier Onboarding Assistant. 🏭 You can describe your textile mill in plain English (e.g. 'We are a textile mill named Gujarat Weaving Mills based in Surat, Gujarat. We manufacture Cotton and Denim fabrics with a minimum order quantity of 200 meters. Contact person is Anil Patel, and phone is +91 9988776655.'), or simply paste your details list here, and I will pre-fill the mill profile for you!"
          }
        ]);
      } else {
        setMessages([
          {
            sender: "ai",
            text: "Hello! I am your Onboarding Assistant. 🤖 You can tell me about your business in plain English (e.g. 'I am a garment maker named Zara Fabrics based in Delhi, Delhi. We source Cotton and Linen with order sizes around 800m and a 50k budget. Phone is +91 9876543210.'), or paste your details list here, and I will pre-fill the form for you!"
          }
        ]);
      }
    }
  }, [user]);

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
    const userPromptText = aiMessage;
    setMessages((prev) => [...prev, { sender: "user", text: userPromptText }]);
    const text = aiMessage.toLowerCase();

    // Heuristics for Phone Number Extraction (for both roles)
    const phoneMatch = aiMessage.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || 
                       aiMessage.match(/(?:\+?91|0)?[6789]\d{9}/g);
    
    // Heuristics for State extraction (for both roles)
    const statesList = ["Gujarat", "Maharashtra", "Delhi", "Punjab", "Rajasthan", "Tamil Nadu", "Karnataka", "West Bengal", "Uttar Pradesh", "Haryana"];
    let detectedState = "";
    statesList.forEach((st) => {
      if (text.includes(st.toLowerCase())) {
        detectedState = st;
      }
    });

    // Check if user is pasting a comma-separated or newline-separated values list
    const isListFormat = aiMessage.includes(",") || aiMessage.includes("\n") || aiMessage.includes(":");

    // Basic heuristic NLP extraction
    if (user?.role === "buyer") {
      // Extract Business Name
      let buyerNameVal = "";
      const nameMatch = aiMessage.match(/(?:named|called|brand name is|company name is|from)\s*([a-zA-Z\s0-9]+?)(?:\s+based|\s+in|\s+we|\s+our|\s+and|\s+called|\.|$)/i);
      if (nameMatch && nameMatch[1]) {
        buyerNameVal = nameMatch[1].trim();
      } else if (isListFormat) {
        const firstSegment = aiMessage.split(/[,:\n]/)[0].trim();
        if (firstSegment.split(/\s+/).length <= 5) buyerNameVal = firstSegment;
      } else {
        const startMatch = aiMessage.match(/^([a-zA-Z\s0-9]+?)\s+(?:based in|is based in|is a|apparel|garment)/i);
        if (startMatch && startMatch[1]) buyerNameVal = startMatch[1].trim();
      }
      if (buyerNameVal) setBuyerName(buyerNameVal);

      // Extract City/Location
      const locationMatch = aiMessage.match(/(?:based in|located in|in|city of)\s*([a-zA-Z\s]+?)(?:\s+we|\s+our|\s+and|\s+called|\.|$)/i);
      let cityVal = "";
      let stateVal = "";
      if (locationMatch && locationMatch[1]) {
        const rawCity = locationMatch[1].trim();
        const parts = rawCity.split(/[\s,]+/);
        cityVal = parts[0];
        stateVal = detectedState || "Maharashtra";
        if (!detectedState && parts.length > 1) {
          const possibleState = parts[1];
          if (statesList.some(s => s.toLowerCase() === possibleState.toLowerCase())) {
            stateVal = possibleState;
          }
        }
      } else if (isListFormat) {
        const citiesList = ["surat", "ahmedabad", "mumbai", "delhi", "ludhiana", "coimbatore", "tiruppur", "jaipur", "panipat", "chennai", "kolkata", "bengaluru", "hyderabad", "pune"];
        citiesList.forEach((c) => {
          if (text.includes(c)) cityVal = c.charAt(0).toUpperCase() + c.slice(1);
        });
        stateVal = detectedState || "Maharashtra";
      }
      if (cityVal) {
        setBuyerCity(cityVal);
        setBuyerState(stateVal);
        setBuyerAddress(`${cityVal} Industrial Zone, ${cityVal}`);
      }

      if (phoneMatch && phoneMatch[0]) {
        setBuyerPhone(phoneMatch[0].trim());
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
      const qtyMatch = aiMessage.match(/(?:qty|quantity|order|order sizes|around|about|order size is)\s*(\d+)/i) || 
                       aiMessage.match(/\b(\d{3,5})\b/);
      if (qtyMatch && qtyMatch[1]) setBuyerQty(parseInt(qtyMatch[1]));

      setMessages((prev) => [...prev, {
        sender: "ai",
        text: "✨ AI Profile Parser: I have extracted your business details and auto-populated the form! Please check the fields, select any remaining checkboxes, and hit Submit Profile."
      }]);
    } else {
      // Supplier Extraction
      let supplierNameVal = "";
      const nameMatch = aiMessage.match(/(?:named|called|company name is|from)\s*([a-zA-Z\s0-9]+?)(?:\s+based|\s+in|\s+we|\s+our|\s+and|\.|$)/i);
      if (nameMatch && nameMatch[1]) {
        supplierNameVal = nameMatch[1].trim();
      } else if (isListFormat) {
        const firstSegment = aiMessage.split(/[,:\n]/)[0].trim();
        if (firstSegment.split(/\s+/).length <= 5) supplierNameVal = firstSegment;
      } else {
        const startMatch = aiMessage.match(/^([a-zA-Z\s0-9]+?)\s+(?:based in|is based in|is a|textile mill|weaving)/i);
        if (startMatch && startMatch[1]) supplierNameVal = startMatch[1].trim();
      }
      if (supplierNameVal) setSupplierName(supplierNameVal);

      // Extract City/Location
      const locationMatch = aiMessage.match(/(?:based in|located in|in)\s*([a-zA-Z\s]+?)(?:\s+we|\s+our|\s+and|\.|$)/i);
      let cityVal = "";
      let stateVal = "";
      if (locationMatch && locationMatch[1]) {
        const rawCity = locationMatch[1].trim();
        const parts = rawCity.split(/[\s,]+/);
        cityVal = parts[0];
        stateVal = detectedState || "Gujarat";
        if (!detectedState && parts.length > 1) {
          const possibleState = parts[1];
          if (statesList.some(s => s.toLowerCase() === possibleState.toLowerCase())) {
            stateVal = possibleState;
          }
        }
      } else if (isListFormat) {
        const citiesList = ["surat", "ahmedabad", "mumbai", "delhi", "ludhiana", "coimbatore", "tiruppur", "jaipur", "panipat", "chennai", "kolkata", "bengaluru", "hyderabad", "pune"];
        citiesList.forEach((c) => {
          if (text.includes(c)) cityVal = c.charAt(0).toUpperCase() + c.slice(1);
        });
        stateVal = detectedState || "Gujarat";
      }
      if (cityVal) {
        setSupplierCity(cityVal);
        setSupplierState(stateVal);
        setSupplierAddress(`${cityVal} Textile Hub, ${cityVal}`);
      }

      const moqMatch = aiMessage.match(/(?:moq|minimum|order|limit)\s*(?:of|is)?\s*(\d+)/i) ||
                       aiMessage.match(/\b(\d{3,4})\b/);
      if (moqMatch && moqMatch[1]) setSupplierMOQ(parseInt(moqMatch[1]));

      if (phoneMatch && phoneMatch[0]) {
        setSupplierPhone(phoneMatch[0].trim());
      }

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
      let contactVal = "";
      const contactMatch = aiMessage.match(/(?:contact|person|representative|name|my name is)\s*[:=-]?\s*([a-zA-Z\s]+?)(?:\s+at|\s+on|\s+and|\.|\,|$)/i);
      if (contactMatch && contactMatch[1]) {
        contactVal = contactMatch[1].trim();
      } else {
        const namePairs = aiMessage.match(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g);
        if (namePairs) {
          const exclusions = ["Gujarat", "Maharashtra", "Delhi", "Punjab", "Rajasthan", "India", "Textile", "Mill", "Weaving", "Mills", "Factory", "Cotton", "Silk", "Denim", "Linen", "Polyester", "Wool"];
          const contactName = namePairs.find(np => !exclusions.some(exc => np.includes(exc)));
          if (contactName) contactVal = contactName;
        }
      }
      if (contactVal) setSupplierContact(contactVal);

      setSupplierEmail(user?.email || "");

      setMessages((prev) => [...prev, {
        sender: "ai",
        text: "✨ AI Profile Parser: I have successfully pre-filled your Mill/Supplier details in the form! Please confirm the entries and click Submit Profile."
      }]);
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
      navigate(user?.role === "buyer" ? "/marketplace" : "/supplier/dashboard");
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
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-700/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Onboarding AI assistant Card (Left / Top) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-xs rounded-2xl p-6 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <h3 className="font-bold text-sm">AI Onboarding Assistant</h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-[280px] overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-teal-700 text-white rounded-tr-none" 
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAIChat();
                }
              }}
              placeholder="Describe your business..."
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
            <button
              onClick={handleAIChat}
              className="p-2 rounded-xl bg-teal-700 hover:bg-teal-850 text-white cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Traditional Form Card (Right / Bottom) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-xs rounded-2xl p-8 shadow-2xl">
          <div className="border-b border-slate-200 pb-4 mb-6">
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Business Type
                    </label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                    className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                            ? "bg-teal-700 border-teal-700 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-white"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Supplier Type
                    </label>
                    <select
                      value={supplierType}
                      onChange={(e) => setSupplierType(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                    className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                      className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                            ? "bg-teal-700 border-teal-700 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-white"
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
                    className="mt-2 block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-teal-700 hover:bg-teal-800 hover:opacity-95 text-sm font-bold rounded-xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 transition-all cursor-pointer"
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
