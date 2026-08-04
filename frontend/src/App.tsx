import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.ts";

// Pages
import { LandingPage } from "./pages/LandingPage.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import { OnboardingPage } from "./pages/OnboardingPage.tsx";
import { BuyerHome } from "./pages/BuyerHome.tsx";
import { BuyerDashboard } from "./pages/BuyerDashboard.tsx";
import { SupplierDashboard } from "./pages/SupplierDashboard.tsx";

// Loading component
const FullScreenLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-lg animate-bounce mb-4">
      FF
    </div>
    <div className="flex space-x-1.5 items-center">
      <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactElement; allowedRole?: "buyer" | "supplier" }> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, isOnboarded, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOnboarded) {
    // Prevent redirect loop if already on onboarding page
    if (window.location.pathname === "/onboarding") {
      return children;
    }
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === "buyer" ? "/buyer/home" : "/supplier/dashboard"} replace />;
  }

  return children;
};

const App: React.FC = () => {
  const { checkSession } = useAuth();
  const [initLoading, setInitLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      await checkSession();
      setInitLoading(false);
    };
    initSession();
  }, []);

  if (initLoading) {
    return <FullScreenLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Onboarding Wizard */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Buyer Experience */}
        <Route
          path="/buyer/home"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/dashboard"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Supplier Experience */}
        <Route
          path="/supplier/dashboard"
          element={
            <ProtectedRoute allowedRole="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
