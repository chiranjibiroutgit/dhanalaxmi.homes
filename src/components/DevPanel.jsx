import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PanelGuard } from "../components/PanelGuard";
import AccessManagement from "./AccessManagement";
import { ShieldCheck, Building2, User, Mail, Phone, Calendar, ArrowRight, Plus, LogOut } from "lucide-react";

/**
 * Dev Panel - System Management Hub
 * Access: super_admin + developer
 * Features: Global property registry, inquiry inbox, booking calendar, analytics
 */
export default function DevPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <PanelGuard panelPath="/devs.panel">
      <div className="min-h-screen bg-mist">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="container-luxury px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} strokeWidth={2} className="text-gold" />
              <div>
                <h1 className="font-serif text-xl font-bold text-navy">Dev Panel</h1>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">System Management Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="hidden md:block text-[11px] text-gray-600 font-medium">
                {user?.name} • {user?.role.replace("_", " ")}
              </div>
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-[10px] font-bold">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                title="Sign out"
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="container-luxury py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Properties</span>
                <Building2 size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-navy">150+</span>
                <span className="text-[11px] text-gray-500">active listings</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Inquiries</span>
                <Mail size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-nagy">24</span>
                <span className="text-[11px] text-gray-500">this week</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Site Visits</span>
                <Calendar size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-navy">12</span>
                <span className="text-[11px] text-gray-500">scheduled</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Access Management */}
            <div className="lg:col-span-2">
              <AccessManagement />
            </div>

            {/* Analytics */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <h3 className="font-serif font-bold text-xl text-navy mb-4">Quick Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-charcoal">Conversion Rate</span>
                    <span className="font-serif text-lg font-bold text-gold">3.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-charcoal">Avg. Response Time</span>
                    <span className="font-serif text-lg font-bold text-navy">4.2 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-charcoal">Top Property</span>
                    <span className="font-serif text-lg font-bold text-charcoal">Sea Princess-1</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-navy mb-4">Recent Alerts</h3>
                <ul className="space-y-3">
                  {[
                    "New inquiry on Sea Princess-1",
                    "Site visit booked for Blu Marina",
                    "Canvas edit saved by developer",
                    "Owner access: Ramesh Properties invited",
                  ].map((alert, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <Phone size={14} strokeWidth={2} className="text-gold shrink-0" />
                      <span className="text-[11px] text-charcoal">{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelGuard>
  );
}
