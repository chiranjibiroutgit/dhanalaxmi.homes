import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ShieldCheck, Building2, Calendar, Mail, Phone } from "lucide-react";

/**
 * Sidebar Navigation for Panels
 */
export const PanelSidebar = ({ activePanel, onPanelChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const panels = [
    { path: "/devs.panel", label: "Dev Panel", icon: ShieldCheck, desc: "System Management" },
    { path: "/admin.panel", label: "Admin Panel", icon: Building2, desc: "Property Owner Portal" },
    { path: "/dev.edit.panel", label: "Dev Edit Panel", icon: User, desc: "Frontend Canvas Editor" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-navy border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center text-navy font-bold text-xs">DL</div>
          <div className="font-serif text-lg font-bold text-white">Dhanalaxmi</div>
          <div className="text-[9px] uppercase tracking-widest text-gray-400 font-medium">panel</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {user?.role.replace("_", " ")}
          </div>
          <div className="text-[11px] text-white font-medium">Authorized</div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {panels.map((panel) => {
          const isActive = activePanel === panel.path;
          const hasAccess = user?.panels?.includes(panel.path);
          return (
            <div key={panel.path}>
              {!hasAccess && (
                <div className="px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  Locked
                </div>
              )}
              <button
                onClick={() => {
                  if (hasAccess) {
                    onPanelChange(panel.path);
                    navigate(panel.path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive && hasAccess
                    ? "bg-gold text-navy font-bold shadow-lg"
                    : hasAccess
                    ? "text-gray-300 hover:bg-white/10 hover:text-white"
                    : "text-gray-600 cursor-not-allowed"
                }`}
                disabled={!hasAccess}
              >
                <panel.icon size={18} strokeWidth={2} />
                <span className="font-medium">{panel.label}</span>
              </button>
              <p className="px-4 text-[9px] text-gray-500 uppercase tracking-wider">{panel.desc}</p>
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <LogOut size={16} strokeWidth={2} />
            <span>Sign Out</span>
          </div>
          <div className="text-[9px] text-gray-400 uppercase">v2.0</div>
        </button>
      </div>
    </aside>
  );
};
