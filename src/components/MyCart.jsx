import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Phone, ArrowRight, ShieldCheck, MapPin, Heart, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

/**
 * My Cart / Inquiries — saved properties table with per-item removal
 * and a single-click callback request for all saved listings.
 */
export default function MyCart() {
  const { items, removeItem, clearItems } = useCart();
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allSelected = items.length > 0 && selected.length === items.length;
  const toggleAll = () => setSelected(allSelected ? [] : items.map((p) => p.id));

  const requestCallback = () => {
    const target = selected.length ? selected : items.map((p) => p.id);
    if (!target.length) return;
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-mist">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-luxury py-10 md:py-14">
          <nav className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            <Link to="/" className="transition-colors hover:text-gold">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-navy">My Cart</span>
          </nav>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-3xl font-bold text-navy md:text-4xl">My Cart</h1>
              <p className="mt-2 text-sm text-gray-600">
                {items.length === 0
                  ? "Your saved properties and inquiry shortlist."
                  : `${items.length} saved propert${items.length === 1 ? "y" : "ies"} · review and request a callback.`}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Remove all saved properties?")) {
                    clearItems();
                    setSelected([]);
                  }
                }}
                className="self-start text-[11px] font-bold uppercase tracking-wider text-gray-500 transition-colors hover:text-red-600 sm:self-auto"
              >
                Clear cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-luxury py-10 md:py-14">
        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Heart size={24} strokeWidth={2} />
            </span>
            <h2 className="font-serif text-xl font-bold text-navy">No saved properties yet</h2>
            <p className="mt-2 text-sm text-gray-600">
              Tap the heart on any listing to shortlist it here. Saved items persist on this device.
            </p>
            <Link to="/" className="btn-primary mt-6">
              Browse Properties <ArrowRight size={15} className="ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 bg-mist/60 px-5 py-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-charcoal">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gold"
                  />
                  Select all
                </label>
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Saved listings</span>
              </div>

              <ul className="divide-y divide-gray-100">
                {items.map((p) => (
                  <li key={p.id} className="flex gap-4 px-4 py-4 transition-colors hover:bg-mist/40 sm:px-5">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      aria-label={`Select ${p.title}`}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-gold"
                    />

                    <Link
                      to={`/property/${p.id}`}
                      className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-mist sm:h-24 sm:w-32"
                    >
                      <img
                        src={p.thumbnail}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-md"
                      />
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        loading="lazy"
                        className="relative z-[1] h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/property/${p.id}`} className="font-serif text-[16px] font-bold leading-snug text-navy hover:text-gold">
                            {p.title}
                          </Link>
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                            <MapPin size={11} className="shrink-0 text-gold" /> {p.location}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeItem(p.id);
                            setSelected((prev) => prev.filter((x) => x !== p.id));
                          }}
                          aria-label={`Remove ${p.title}`}
                          className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} strokeWidth={2.2} />
                        </button>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <span className="font-serif text-lg font-bold text-navy">{p.price}</span>
                        <span className="rounded bg-mist px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-charcoal">
                          {p.type}
                        </span>
                        <span className="rounded bg-mist px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-charcoal">
                          {p.bhk}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{p.possession}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary / callback */}
            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
              <h2 className="font-serif text-lg font-bold text-navy">Inquiry Summary</h2>
              <dl className="mt-4 space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Saved properties</dt>
                  <dd className="font-semibold text-charcoal">{items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Selected for callback</dt>
                  <dd className="font-semibold text-charcoal">{selected.length || items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Verified listings</dt>
                  <dd className="flex items-center gap-1 font-semibold text-green">
                    <ShieldCheck size={12} strokeWidth={2.4} /> All
                  </dd>
                </div>
              </dl>

              <button
                onClick={requestCallback}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-gold hover:text-navy"
              >
                <Phone size={15} strokeWidth={2.4} /> Request Callback for All
              </button>

              {submitted && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-[11px] font-medium text-green">
                  <Check size={13} strokeWidth={3} /> Request received — our advisor will call shortly.
                </p>
              )}

              <p className="mt-4 text-[10px] leading-relaxed text-gray-400">
                By requesting a callback you agree to be contacted by the Dhanalaxmi Group sales team.
                No spam, no obligation.
              </p>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <Link
                  to="/me"
                  className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-navy transition-colors hover:text-gold"
                >
                  Go to My Account <ArrowRight size={14} strokeWidth={2.4} />
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
