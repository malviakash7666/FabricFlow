import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { Eye, EyeOff, User, Lock, Mail, Users, ArrowLeft } from "lucide-react";

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginUser, registerUser, isAuthenticated, isOnboarded, user, loading, error } = useAuth();

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
      return;
    }

    try {
      if (isRegister) {
        await registerUser({ name, email, password, role });
      } else {
        await loginUser({ email, password });
      }
    } catch (err: any) {
      setLocalError(err.message || "An authentication error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center relative py-12 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-xl font-bold shadow-lg shadow-violet-600/20 mb-4">
          FF
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {isRegister ? "Create Wholesale Account" : "Access Marketplace"}
        </h2>
        <p className="text-slate-500 text-xs mt-2 font-medium">
          {isRegister ? "Join FabricFlow to buy or list textiles wholesale." : "Enter your credentials below to access your account."}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection Tabs (Only on Register) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      role === "buyer"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                        : "text-slate-400 hover:text-white"
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
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Supplier
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {(localError || error) && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 font-semibold leading-relaxed">
                {localError || error}
              </div>
            )}

            {/* Full Name */}
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="mt-2.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-2.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="mt-2.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white"
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 font-bold bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all cursor-pointer"
              >
                {loading ? "Authenticating..." : isRegister ? "Create Account" : "Access Platform"}
              </button>
            </div>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {isRegister ? "Already have an account?" : "New to FabricFlow?"}{" "}
            <button
              onClick={() => {
                setLocalError(null);
                setIsRegister(!isRegister);
                navigate(isRegister ? "/login" : "/register");
              }}
              className="text-violet-400 hover:text-violet-300 font-bold ml-1 hover:underline cursor-pointer"
            >
              {isRegister ? "Sign In" : "Register Free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
