import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Calendar,
  ShieldCheck,
  Zap,
  Building2,
  Leaf,
  Waves,
  Anchor,
  Settings,
  Droplets,
  MapPin,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Maximize2,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSiteContent } from "../context/SiteContentContext";
import { useWhatsAppLead } from "../context/WhatsAppLeadContext";
import NegotiationNote from "./NegotiationNote";
import { WhatsAppMark } from "./WhatsAppLeadModal";

/* Icon registry keeps the data schema free of component imports */
const ICONS = { Waves, ShieldCheck, Building2, Zap, Leaf, Anchor, Settings, Droplets, MapPin };

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, removeItem } = useCart();
  const { content } = useSiteContent();
  const { openWhatsAppLead } = useWhatsAppLead();
  const CONTACT = content.contact;
  const property = content.properties.find((p) => p.id === id);
  const saved = items.some((i) => i.id === id);

  const [active, setActive] = useState(0);
  const [planOpen, setPlanOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStart = useRef(null);

  /* Full-screen reader: Esc closes, arrows navigate, +/- zoom */
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setZoomOpen(false);
      else if (e.key === "ArrowRight") setActive((i) => (i + 1) % property.images.length);
      else if (e.key === "ArrowLeft") setActive((i) => (i - 1 + property.images.length) % property.images.length);
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)));
      else if (e.key === "-") setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomOpen, property]);

  if (!property) {
    return (
      <div className="container-luxury flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Not Found</p>
        <h1 className="font-serif text-3xl font-bold text-navy">Property unavailable</h1>
        <p className="mt-2 text-sm text-gray-600">This listing may have been withdrawn or sold.</p>
        <Link to="/" className="btn-primary mt-6">Back to Listings</Link>
      </div>
    );
  }

  /* Returns to the grid at the exact scroll position saved by the card click */
  const goBack = () => navigate("/");

  const toggleSave = () => {
    if (saved) {
      removeItem(property.id);
      return;
    }
    addItem(property);
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };

  const nextImage = () => setActive((i) => (i + 1) % property.images.length);
  const prevImage = () => setActive((i) => (i - 1 + property.images.length) % property.images.length);

  /* Opens the readable full-screen view (hero image stays a normal cover) */
  const openReader = (index) => {
    setActive(index);
    setZoom(1);
    setZoomOpen(true);
  };

  /* Mobile swipe gestures */
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 45) (dx < 0 ? nextImage : prevImage)();
    touchStart.current = null;
  };

  const openInquiry = (source) =>
    openWhatsAppLead({ mode: "inquiry", product: property, source });

  const openVisit = (source) =>
    openWhatsAppLead({ mode: "visit", product: property, source });

  return (
    <div className="bg-white pb-24 lg:pb-0">
      {/* ══ Sticky conversion sidebar (desktop) ══ */}
      <aside className="fixed right-0 top-[72px] z-30 hidden h-[calc(100vh-72px)] w-[330px] overflow-y-auto border-l border-gray-100 bg-white px-6 py-7 shadow-[-8px_0_32px_-24px_rgba(10,25,47,0.4)] lg:block">
        <button
          onClick={goBack}
          className="mb-7 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-navy transition-colors hover:text-gold"
        >
          <ArrowLeft size={15} strokeWidth={2.4} /> Back to Listings
        </button>

        <div className="mb-6 rounded-xl bg-mist p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">Starting at</p>
          <p className="mt-1 font-serif text-3xl font-bold leading-none text-navy">{property.price}</p>
          <p className="mt-1 text-[10px] text-gray-500">{property.priceLabel} · indicative pricing</p>
          <NegotiationNote className="mt-2 text-[9px]" iconSize={11} />
        </div>

        <button
          onClick={() => openVisit("Product detail sidebar")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-navy/20 transition-all hover:bg-gold hover:text-navy"
        >
          <Calendar size={16} strokeWidth={2.2} /> Book a Site Visit
        </button>

        <button
          type="button"
          onClick={() => openInquiry("Product detail sidebar")}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gold py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gold transition-all hover:bg-gold hover:text-navy"
        >
          <WhatsAppMark size={16} /> WhatsApp Inquiry
        </button>
        <a
          href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal transition-colors hover:border-navy hover:text-navy"
        >
          <Phone size={16} strokeWidth={2.2} /> Call {CONTACT.phone}
        </a>
        <button
          onClick={toggleSave}
          className={`mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
            saved ? "border-2 border-green bg-green/5 text-green" : "border border-gray-200 text-charcoal hover:border-gold hover:text-gold"
          }`}
        >
          <Heart size={16} strokeWidth={2.2} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved to Cart" : "Add to Saved Properties"}
        </button>

        <div className="mt-7 space-y-3 border-t border-gray-100 pt-6">
          <div className="flex items-start gap-3">
            <Maximize2 size={17} strokeWidth={2} className="mt-0.5 shrink-0 text-charcoal" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Unit Size</p>
              <p className="mt-0.5 break-all text-[11px] font-semibold text-charcoal">{property.carpetArea}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={17} strokeWidth={2} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Availability</p>
              <p className="mt-0.5 text-[11px] font-semibold text-charcoal">{property.possession}</p>
            </div>
          </div>
        </div>

        <p className="mt-7 text-[9px] leading-relaxed text-gray-400">
          *Prices exclude statutory charges, registration and applicable taxes. Renders are artistic impressions.
        </p>
      </aside>

      {/* ══ Main content ══ */}
      <div className="lg:pr-[330px]">
        <div className="container-luxury py-8 md:py-12">
          <article className="mx-auto max-w-5xl">
            {/* Utility bar */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-navy transition-colors hover:text-gold"
              >
                <ArrowLeft size={15} strokeWidth={2.4} /> Back to Listings
              </button>
              <span className="hidden text-[10px] uppercase tracking-[0.16em] text-gray-400 sm:block">
                {property.type} · {property.badge}
              </span>
            </div>

            {/* Gallery */}
            <div data-gallery className="group relative overflow-hidden rounded-2xl bg-mist">
              <div
                className={`relative w-full touch-pan-y select-none ${
                  property.images[active]?.startsWith("/images/brochures/")
                    ? ""
                    : "aspect-[16/10]"
                } ${active > 0 ? "cursor-zoom-in" : ""}`}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onClick={() => openReader(active)}
              >
                {/* Blurred copy of the same related image fills any empty frame area */}
                <img
                  src={property.images[active]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                />
                {/* Photos keep their frame; brochure pages use their own ratio so every detail is visible */}
                {property.images[active]?.startsWith("/images/brochures/") ? (
                  <div className="relative z-[1] flex min-h-[260px] items-center justify-center py-3">
                    <img
                      key={active}
                      src={property.images[active]}
                      alt={`${property.title} — view ${active + 1} of ${property.images.length}`}
                      title="Click to open full screen and read the details"
                      className="max-h-[75vh] w-auto max-w-full animate-[fadeIn_0.4s_ease-in-out] object-contain drop-shadow-md"
                      loading="eager"
                    />
                  </div>
                ) : (
                  <img
                    key={active}
                    src={property.images[active]}
                    alt={`${property.title} — view ${active + 1} of ${property.images.length}`}
                    className="relative z-[1] h-full w-full animate-[fadeIn_0.4s_ease-in-out] object-contain"
                    loading="eager"
                  />
                )}
                {active > 0 && (
                  <span className="pointer-events-none absolute bottom-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-full bg-navy/85 px-2.5 py-1 text-[10px] font-semibold text-white shadow backdrop-blur">
                    <Maximize2 size={11} strokeWidth={2.4} /> Click to zoom &amp; read
                  </span>
                )}
              </div>

              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md backdrop-blur transition hover:bg-gold"
              >
                <ChevronLeft size={20} strokeWidth={2.4} />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md backdrop-blur transition hover:bg-gold"
              >
                <ChevronRight size={20} strokeWidth={2.4} />
              </button>

              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-green shadow-sm">
                  {property.status}
                </span>
                <span className="rounded-full bg-navy px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gold shadow-sm">
                  {property.badge}
                </span>
              </div>

              <span className="absolute bottom-3 right-3 rounded-full bg-navy/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                {active + 1} / {property.images.length}
              </span>
            </div>

            {/* Thumbnails — each keeps its natural ratio */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {property.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`flex h-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-mist transition-all ${
                    active === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-auto max-w-none object-contain" loading="lazy" />
                </button>
              ))}
            </div>

            {/* Title block */}
            <div className="mt-8">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                <MapPin size={12} strokeWidth={2.2} /> {property.location}
              </p>
              <h1 className="font-serif text-3xl font-bold leading-tight text-navy md:text-[2.75rem]">
                {property.title}
              </h1>
              <p className="mt-2 text-base text-gray-600">{property.subtitle}</p>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600">{property.description}</p>
            </div>

            {/* Price / possession / project-size cards */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Starting Price", value: property.price, note: property.priceLabel, accent: "text-navy" },
                { label: "Availability", value: property.possession, note: "Sales status", accent: "text-navy" },
                { label: "Project Scale", value: property.totalUnits || property.carpetArea, note: "Units in this project", accent: "text-charcoal" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">{c.label}</p>
                  <p className={`mt-1.5 break-words font-serif text-lg font-bold ${c.accent}`}>{c.value}</p>
                  <p className="mt-1 text-[10px] text-gray-400">{c.note}</p>
                  {c.label === "Starting Price" && (
                    <NegotiationNote className="mt-2 text-[9px]" iconSize={10} />
                  )}
                </div>
              ))}
            </div>

            {/* Specs + amenities */}
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 p-5">
                <h2 className="font-serif text-xl font-bold text-navy">Specifications</h2>
                <dl className="mt-4">
                  {property.specs.map((s, i) => (
                    <div
                      key={s.label}
                      className={`flex items-start justify-between gap-4 py-2.5 ${
                        i !== property.specs.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <dt className="text-[12px] text-gray-500">{s.label}</dt>
                      <dd className="max-w-[60%] text-right text-[12px] font-semibold text-charcoal">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-xl border border-gray-100 p-5">
                <h2 className="font-serif text-xl font-bold text-navy">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {property.amenities.map((a) => {
                    const Icon = ICONS[a.icon] || Building2;
                    return (
                      <div
                        key={a.name}
                        className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-mist/60 p-3 transition-colors hover:border-gold/40"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-navy shadow-sm">
                          <Icon size={14} strokeWidth={2} />
                        </span>
                        <span className="text-[11px] font-medium leading-tight text-charcoal">{a.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-10">
              <h2 className="font-serif text-xl font-bold text-navy">Key Highlights</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {property.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[12px] text-gray-600">
                    <Check size={14} strokeWidth={2.6} className="mt-0.5 shrink-0 text-gold" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Floor plan */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-mist/60 p-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-navy">Floor Plan Preview</h2>
                <p className="text-[11px] text-gray-500">Typical layout · dimensions indicative</p>
              </div>
              <button onClick={() => setPlanOpen(true)} className="btn-outline !px-4 !py-2 !text-[10px]">
                <Maximize2 size={14} className="mr-2" /> Open Floor Plan
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* ══ Mobile sticky bottom sheet ══ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">Starting at</p>
            <p className="font-serif text-xl font-bold leading-none text-navy">{property.price}</p>
            <NegotiationNote className="mt-1 max-w-[220px] text-[9px]" iconSize={10} />
          </div>
          <button
            onClick={toggleSave}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              saved ? "border-green text-green" : "border-gray-200 text-charcoal"
            }`}
          >
            <Heart size={13} strokeWidth={2.4} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openVisit("Product mobile sticky")}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gold py-3 text-[11px] font-bold uppercase tracking-wider text-navy"
          >
            <Calendar size={14} strokeWidth={2.4} /> Site Visit
          </button>
          <button
            type="button"
            onClick={() => openInquiry("Product mobile sticky")}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-navy py-3 text-[11px] font-bold uppercase tracking-wider text-white"
          >
            <WhatsAppMark size={14} /> WhatsApp
          </button>
        </div>
      </div>

      {/* Floor plan modal */}
      {planOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          onClick={() => setPlanOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white p-3 shadow-2xl md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-navy">Floor Plan — {property.title}</h2>
              <button onClick={() => setPlanOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist hover:bg-gray-200">
                <X size={17} />
              </button>
            </div>
            <div className="flex max-h-[72vh] w-full items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-mist p-2">
              <img
                src={property.floorPlan}
                alt={`Floor plan for ${property.title}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full-screen zoom reader — lets clients read every detail in brochure images */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-navy/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${property.title} image reader`}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate font-serif text-sm font-bold text-white sm:text-base">{property.title}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/60">
                Image {active + 1} of {property.images.length} · use + / − to zoom
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-navy"
              >
                <Minus size={17} strokeWidth={2.4} />
              </button>
              <button
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
                className="min-w-[54px] rounded-full bg-white/10 px-2 py-2 text-[11px] font-bold text-white transition hover:bg-gold hover:text-navy"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-navy"
              >
                <Plus size={17} strokeWidth={2.4} />
              </button>
              <button
                onClick={() => setZoomOpen(false)}
                aria-label="Close viewer"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy transition hover:bg-gold"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-auto px-2 pb-2 pt-1 sm:px-6"
            onClick={() => setZoomOpen(false)}
            onWheel={(e) =>
              setZoom((z) =>
                Math.min(4, Math.max(1, +(z + (e.deltaY < 0 ? 0.25 : -0.25)).toFixed(2)))
              )
            }
          >
            <img
              src={property.images[active]}
              alt={`${property.title} — full size view ${active + 1}`}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
              className="mx-auto block h-auto w-auto rounded-md bg-white object-contain shadow-2xl"
              style={
                zoom <= 1
                  ? { maxWidth: "100%", maxHeight: "100%" }
                  : { width: `${zoom * 100}%`, maxWidth: "none" }
              }
            />
          </div>

          <div className="flex shrink-0 items-center justify-center gap-4 px-4 py-3">
            <button
              onClick={() => {
                prevImage();
                setZoom(1);
              }}
              aria-label="Previous image"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-navy"
            >
              <ChevronLeft size={20} strokeWidth={2.4} />
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {active + 1} / {property.images.length}
            </span>
            <button
              onClick={() => {
                nextImage();
                setZoom(1);
              }}
              aria-label="Next image"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-navy"
            >
              <ChevronRight size={20} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}

      {/* Saved toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-green px-4 py-2.5 text-white shadow-xl lg:bottom-8 lg:left-auto lg:right-6 lg:translate-x-0">
          <Check size={15} strokeWidth={3} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Saved to My Cart</span>
          <Link to="/cart" className="text-[11px] font-bold underline underline-offset-2">View</Link>
        </div>
      )}
    </div>
  );
}
