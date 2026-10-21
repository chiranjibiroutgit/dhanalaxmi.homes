import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { NavProvider } from "./context/NavContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import PropertyDetail from "./components/PropertyDetail";
import MyCart from "./components/MyCart";
import Me from "./components/Me";
import LoginPanel from "./components/LoginPanel";
import SignupPanel from "./components/SignupPanel";
import ForgotPasswordPanel from "./components/ForgotPasswordPanel";
import DevPanel from "./components/DevPanel";
import AdminPanel from "./components/AdminPanel";
import DevEditPanel from "./components/DevEditPanel";

/** Public shell: sticky header + page + footer */
function PublicLayout() {
  const { pathname } = useLocation();

  // Reset scroll on navigation (PropertyDetail restores its own saved position)
  useEffect(() => {
    if (!pathname.startsWith("/property/")) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Blocks panel routes until authentication is resolved */
function RequireAuth({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <p className="animate-pulse font-bold text-gold">Initializing Dhanalaxmi Panels...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="container-luxury py-24 text-center">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">404</p>
      <h2 className="font-serif text-3xl font-bold text-navy">Page Not Found</h2>
      <p className="mt-2 text-sm text-gray-600">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary mt-6 inline-flex">
        Return to Home
      </a>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/cart" element={<MyCart />} />
        <Route path="/me" element={<Me />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPanel />} />
      <Route path="/signup" element={<SignupPanel />} />
      <Route path="/forgot-password" element={<ForgotPasswordPanel />} />

      {/* Protected panels */}
      <Route
        path="/devs.panel"
        element={
          <RequireAuth>
            <DevPanel />
          </RequireAuth>
        }
      />
      <Route
        path="/admin.panel"
        element={
          <RequireAuth>
            <AdminPanel />
          </RequireAuth>
        }
      />
      <Route
        path="/dev.edit.panel"
        element={
          <RequireAuth>
            <DevEditPanel />
          </RequireAuth>
        }
      />

      {/* Fallback */}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteContentProvider>
        <CartProvider>
          <NavProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </NavProvider>
        </CartProvider>
      </SiteContentProvider>
    </BrowserRouter>
  );
}
