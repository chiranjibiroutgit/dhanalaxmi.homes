import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Role-Based Route Guard
 * Allows access only if user has panel access
 */
export const PanelGuard = ({ children, panelPath, role }) => {
  const { user, loading, isAuthenticated, hasAccess } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="text-white">
          <p className="text-gold font-bold">Loading Dhanalaxmi Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled by parent
  }

  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center max-w-md">
          <h2 className="font-serif text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don't have permission to access this panel.</p>
          <p className="text-[12px] text-gold font-medium mb-6">Your role: {user.role}</p>
          <button
            onClick={() => navigate("/login")}
            className="btn-gold w-full py-3 text-[12px] font-bold uppercase tracking-wider"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess(panelPath)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center max-w-md">
          <h2 className="font-serif text-2xl font-bold text-white mb-2">Panel Not Available</h2>
          <p className="text-gray-400 mb-4">Your account does not have access to this panel.</p>
          <button
            onClick={() => navigate("/login")}
            className="btn-gold w-full py-3 text-[12px] font-bold uppercase tracking-wider"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
