import { Link } from "react-router-dom";
import { Mail, Phone, Calendar, MapPin, ArrowRight, FileText, ShoppingCart, User } from "lucide-react";
import { CONTACT } from "../data/properties";
import { useWhatsAppLead } from "../context/WhatsAppLeadContext";
import { WhatsAppMark } from "./WhatsAppLeadModal";

export default function Me() {
  const { openWhatsAppLead } = useWhatsAppLead();
  const profile = {
    name: "Valued Client",
    email: CONTACT.email,
    phone: CONTACT.phone,
    memberSince: "2022",
    savedSearches: 3,
    upcomingVisits: 2,
  };

  return (
    <div className="min-h-screen bg-mist py-16 md:py-24">
      <nav className="container-luxury mb-8 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <span className="text-navy">Me</span>
      </nav>

      <div className="container-luxury">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center text-white font-serif font-bold text-2xl shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-bold text-navy">{profile.name}</h2>
                <div className="w-2 h-2 rounded-full bg-green" />
              </div>
              <p className="text-gray-600 text-sm mt-1">{profile.email}</p>
              <p className="text-gray-600 text-sm mt-0.5">{profile.phone}</p>
              <div className="mt-4 flex items-center gap-4 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <span>Member since {profile.memberSince}</span>
                <span className="w-px h-3 bg-gray-300"></span>
                <span>{profile.savedSearches} Saved Searches</span>
                <span className="w-px h-3 bg-gray-300"></span>
                <span>{profile.upcomingVisits} Upcoming Visits</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Saved Searches */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-bold text-xl text-navy">Saved Searches</h3>
                <Link to="/properties" className="text-gold text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {[
                  { loc: "Puri, Odisha", type: "Apartment", budget: "₹50L - ₹1 Cr", saved: "2 days ago" },
                  { loc: "Coastal Zone, Odisha", type: "Villa", budget: "₹2 Cr+", saved: "1 week ago" },
                  { loc: "Marina Front, Puri", type: "Plot", budget: "Under ₹50 Lakhs", saved: "3 days ago" },
                ].map((s, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-navy text-sm">{s.loc}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{s.saved}</div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white rounded border border-gray-200 text-[11px] font-medium text-charcoal">{s.type}</span>
                      <span className="px-2 py-1 bg-white rounded border border-gray-200 text-[11px] font-medium text-charcoal">{s.budget}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Visits */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-navy mb-6">Upcoming Site Visits</h3>
              <div className="space-y-4">
                {[
                  { prop: "Sea Princess-1", date: "Dec 15, 2026", time: "11:00 AM", status: "Confirmed" },
                  { prop: "Blu Marina", date: "Dec 18, 2026", time: "3:00 PM", status: "Pending" },
                ].map((v, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-navy text-sm">{v.prop}</div>
                      <div className="text-[11px] text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <Calendar size={14} strokeWidth={1.5} /> {v.date} • {v.time}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${v.status === "Confirmed" ? "bg-green/10 text-green border border-green/20" : "bg-gray/10 text-gray-600 border border-gray-200"}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-navy rounded-2xl p-6 text-white">
              <h3 className="font-serif font-bold text-xl mb-6">Contact Support</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Phone size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">Sales Office</div>
                    <div className="font-semibold text-sm">{CONTACT.phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Mail size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email</div>
                    <div className="font-semibold text-sm">{CONTACT.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <MapPin size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">Address</div>
                    <div className="font-semibold text-sm leading-tight">{CONTACT.address}</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">WhatsApp Quick Chat</div>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppLead({ mode: "inquiry", source: "My Account support" })
                  }
                  className="w-full py-3 bg-gold text-navy font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors"
                >
                  <WhatsAppMark size={16} /> Chat on WhatsApp
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-navy mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/cart" className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-charcoal text-sm font-medium hover:bg-mist hover:text-navy transition-colors block">
                  <ShoppingCart size={18} strokeWidth={2} /> My Cart
                </Link>
                <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-charcoal text-sm font-medium hover:bg-mist hover:text-navy transition-colors block">
                  <MapPin size={18} strokeWidth={2} /> Browse Properties
                </Link>
                <button className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-charcoal text-sm font-medium hover:bg-mist hover:text-navy transition-colors block">
                  <FileText size={18} strokeWidth={2} /> Project Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
