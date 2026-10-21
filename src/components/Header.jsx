import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MapPin, Building2, User, ShoppingCart, Menu, X, Phone } from "lucide-react";
import { useNav } from "../context/NavContext";
import { useCart } from "../context/CartContext";
import { useSiteContent } from "../context/SiteContentContext";
import { useAuth } from "../context/AuthContext";
import { useWhatsAppLead } from "../context/WhatsAppLeadContext";
import { WhatsAppMark } from "./WhatsAppLeadModal";

/* Zone A — landing page scrollspy links */
const SECTION_LINKS = [
  { id: "home", label: "Home", icon: Home },
  { id: "properties", label: "Properties", icon: MapPin },
  { id: "about", label: "About Us", icon: Building2 },
];

/* Zone B — standalone subpages (instant route swap) */
const PAGE_LINKS = [
  { to: "/cart", label: "My Cart", icon: ShoppingCart },
  { to: "/me", label: "Me", icon: User },
];

export default function Header({ forceHomeNav = false }) {
  const { activeSection } = useNav();
  const { count } = useCart();
  const { content } = useSiteContent();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { openWhatsAppLead } = useWhatsAppLead();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === "/" || forceHomeNav;
  /* Zone A only makes sense on the landing page */
  const showScrollspy = isHome;

  /* Sticky state — active section is handled by IntersectionObserver in NavContext */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close the mobile drawer whenever the route changes */
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const goToSection = (id) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate("/", { state: { scrollTo: id } });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isActivePage = (to) => location.pathname === to;

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border-b transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.90)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottomColor: scrolled ? "#e5e7eb" : "rgba(10,25,47,0.10)",
      }}
    >
      <div className="container-luxury">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* ── Brand lockup ── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Dhanalaxmi Group home">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-navy transition-transform duration-300 group-hover:scale-105">
              {/* Minimal architectural monogram: three pillars + gold pediment */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M4 10L12 4l8 6" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11v9M12 9v11M17 11v9" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="leading-none">
              <span
                data-edit-key="brand.name"
                className="block font-serif text-[17px] font-bold tracking-[0.12em] text-navy"
              >
                {content.brand.name}
              </span>
              <span
                data-edit-key="brand.subtitle"
                className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.34em] text-gray-500"
              >
                {content.brand.subtitle}
              </span>
            </span>
          </Link>

          {/* ── Desktop navigation ── */}
          <nav className="hidden items-center gap-6 lg:flex">
            {/* Zone A with sliding gold underline */}
            {showScrollspy && (
              <div className="flex items-center gap-1">
                {SECTION_LINKS.map(({ id, label, icon: Icon }) => {
                  const active = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => goToSection(id)}
                      className={`relative flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                        active ? "text-navy" : "text-gray-600 hover:text-navy"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={15} strokeWidth={2} className={active ? "text-gold" : ""} />
                      {label}
                      <span
                        className={`absolute inset-x-2 -bottom-0.5 h-[2px] origin-left rounded-full bg-gold transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Visual divider */}
            <span className="h-6 w-px bg-gray-300/80" aria-hidden="true" />

            {/* Zone B */}
            <div className="flex items-center gap-1">
              {PAGE_LINKS.map(({ to, label, icon: Icon }) => {
                const active = isActivePage(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      active ? "bg-navy/5 text-navy" : "text-gray-600 hover:bg-gray-50 hover:text-navy"
                    }`}
                  >
                    <span className="relative">
                      <Icon size={16} strokeWidth={2} />
                      {label === "My Cart" && count > 0 && (
                        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-navy shadow">
                          {count}
                        </span>
                      )}
                    </span>
                    {label}
                    {active && <span className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-gold" />}
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-navy bg-white border border-gray-200 transition-colors hover:bg-gray-50"
                >
                  <User size={16} strokeWidth={2} /> Sign Up
                </Link>
              )}
            </div>
          </nav>

          {/* ── Mobile actions ── */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              aria-label={`My Cart, ${count} saved properties`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-navy"
            >
              <ShoppingCart size={18} strokeWidth={2} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-navy">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-navy"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-[max-height,opacity] duration-300 lg:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container-luxury space-y-1 py-4">
          {showScrollspy &&
            SECTION_LINKS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goToSection(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  activeSection === id ? "bg-gold/10 text-navy" : "text-charcoal"
                }`}
              >
                <Icon size={17} strokeWidth={2} className={activeSection === id ? "text-gold" : "text-gray-400"} />
                {label}
              </button>
            ))}
          <div className="my-2 h-px bg-gray-100" />
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-charcoal"
            >
              <User size={17} strokeWidth={2} /> Sign Up
            </Link>
          )}
          {PAGE_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                isActivePage(to) ? "bg-navy text-white" : "text-charcoal"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
              {label === "My Cart" && count > 0 && (
                <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">{count}</span>
              )}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={`tel:${content.contact.phone.replace(/\s+/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-navy px-3 py-3 text-[12px] font-semibold text-white"
            >
              <Phone size={15} /> Call Sales
            </a>
            <button
              type="button"
              onClick={() =>
                openWhatsAppLead({ mode: "inquiry", source: "Mobile menu" })
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-[12px] font-semibold text-white"
            >
              <WhatsAppMark size={15} /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
