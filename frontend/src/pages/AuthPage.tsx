import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { useToast } from "../components/Toast.tsx";
import { Eye, EyeOff, User, Lock, Mail, Users, ArrowLeft } from "lucide-react";

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginUser, registerUser, isAuthenticated, isOnboarded, user, loading, error } = useAuth();
  const { showToast } = useToast();

  const isRegisterParam = window.location.pathname.includes("register");
  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [role, setRole] = useState<"buyer" | "supplier">(
    (searchParams.get("role") as "buyer" | "supplier") || "buyer"
  );
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync isRegister state when URL path changes
  useEffect(() => {
    setIsRegister(window.location.pathname.includes("register"));
  }, [window.location.pathname]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isOnboarded) {
        navigate(user.role === "buyer" ? "/buyer/home" : "/supplier/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, isOnboarded, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || (isRegister && !name)) {
      setLocalError("Please fill out all required fields.");
      showToast("Please fill out all required fields.", "error");
      return;
    }

    try {
      if (isRegister) {
        await registerUser({ name, email, password, role });
        showToast("Account created successfully!", "success");
      } else {
        await loginUser({ email, password });
        showToast("Logged in successfully!", "success");
      }
    } catch (err: any) {
      setLocalError(err.message || "An authentication error occurred.");
      showToast(err.message || "An authentication error occurred.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center relative py-12 px-6 overflow-hidden">
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-xl font-bold shadow-lg shadow-teal-700/20 text-white mb-4">
          FF
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isRegister ? "Create Wholesale Account" : "Access Marketplace"}
        </h2>
        <p className="text-slate-500 text-xs mt-2 font-medium">
          {isRegister ? "Join FabricFlow to buy or list textiles wholesale." : "Enter your credentials below to access your account."}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection Tabs (Only on Register) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      role === "buyer"
                        ? "bg-teal-700 text-white shadow-md shadow-teal-700/10"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("supplier")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      role === "supplier"
                        ? "bg-teal-700 text-white shadow-md shadow-teal-700/10"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Supplier
                  </button>
                </div>
              </div>
            )}



            {/* Full Name */}
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="mt-2.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-2.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="mt-2.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-700/10 hover:shadow-teal-700/20 font-bold bg-teal-700 hover:bg-teal-800 disabled:bg-slate-100 disabled:text-slate-400 text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all cursor-pointer"
              >
                {loading ? "Authenticating..." : isRegister ? "Create Account" : "Access Platform"}
              </button>
            </div>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegister ? "Already have an account?" : "New to FabricFlow?"}{" "}
            <button
              onClick={() => {
                setLocalError(null);
                setIsRegister(!isRegister);
                navigate(isRegister ? "/login" : "/register");
              }}
              className="text-teal-700 hover:text-teal-800 font-bold ml-1 hover:underline cursor-pointer bg-transparent border-none"
            >
              {isRegister ? "Sign In" : "Register Free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
