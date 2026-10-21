import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Heart, ShieldCheck, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

/** Remember the exact scroll position so "Back to Listings" lands in place */
export const rememberScroll = () => {
  try {
    sessionStorage.setItem("dl_scroll_y", String(window.scrollY));
  } catch {
    /* storage may be unavailable in private mode */
  }
};

export default function PropertyCard({ property }) {
  const { items, addItem, removeItem } = useCart();
  const [justSaved, setJustSaved] = useState(false);
  const saved = items.some((i) => i.id === property.id);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeItem(property.id);
      return;
    }
    addItem(property);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  const readyToMove = property.status === "Ready to Move";

  return (
    <article
      data-property-id={property.id}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_24px_48px_-16px_rgba(10,25,47,0.16)]"
    >
      {/* Cover — 16:10 frame, image keeps its own ratio (no crop, no stretch) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <Link
          to={`/property/${property.id}`}
          onClick={rememberScroll}
          aria-label={`View details for ${property.title}`}
          className="block h-full w-full"
        >
          {/* Same related image fills the empty frame area without cropping the main image */}
          <img
            src={property.thumbnail}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
          />
          <img
            src={property.thumbnail}
            alt={`${property.title} — ${property.location}`}
            loading="lazy"
            className="relative z-[1] h-full w-full object-contain transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 z-[2] bg-gradient-to-t from-navy/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Status badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur-sm ${
              readyToMove
                ? "border border-green/25 bg-white/95 text-green"
                : "border border-navy/20 bg-white/95 text-navy"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${readyToMove ? "bg-green" : "bg-gold"}`} />
            {property.status}
          </span>
          <span className="rounded-full bg-navy px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gold shadow-sm">
            {property.badge}
          </span>
        </div>

        {/* Save / heart */}
        <button
          onClick={handleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-md transition-all duration-200 active:scale-90 ${
            saved
              ? "border-green bg-white text-green"
              : "border-white/70 bg-white/92 text-charcoal backdrop-blur-sm hover:bg-gold hover:text-navy"
          }`}
        >
          <Heart size={16} strokeWidth={2.4} fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Saved confirmation pill */}
        {justSaved && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-green px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg">
            <Check size={11} strokeWidth={3} /> Saved
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="font-serif text-[19px] font-bold leading-snug text-navy">
            <Link to={`/property/${property.id}`} onClick={rememberScroll} className="hover:text-gold transition-colors">
              {property.title}
            </Link>
          </h3>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <MapPin size={12} strokeWidth={2} className="shrink-0 text-gold" />
          {property.location}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">{property.microLocation}</p>

        {/* Spec chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="spec-chip">{property.bhk}</span>
          <span className="spec-chip">{property.carpetArea}</span>
          <span className="spec-chip">{property.totalUnits || property.parking}</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="font-serif text-[26px] font-bold leading-none text-navy">{property.price}</div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              {property.priceLabel}
            </div>
          </div>
          <Link
            to={`/property/${property.id}`}
            onClick={rememberScroll}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-gold hover:text-navy"
          >
            View Details <ArrowRight size={13} strokeWidth={2.6} />
          </Link>
        </div>

        {/* Footer meta */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          <span>{property.possession}</span>
        </div>
      </div>
    </article>
  );
}
