import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Target, Building2, Wallet, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useWhatsAppLead } from "../context/WhatsAppLeadContext";

const GOALS = [
  { value: "All", label: "All goals" },
  { value: "Rental Income", label: "Rental income" },
  { value: "Holiday Home", label: "Holiday home" },
  { value: "Land Appreciation", label: "Land appreciation" },
  { value: "Commercial Business", label: "Commercial business" },
];

const TYPES = [
  { value: "All", label: "All types" },
  { value: "Plot", label: "Plots" },
  { value: "Commercial", label: "Commercial" },
];

const TIERS = [
  { value: "Any", label: "Any budget" },
  { value: "value", label: "Best value" },
  { value: "prime", label: "Prime address" },
  { value: "signature", label: "Signature collection" },
];

const QUICK_TAGS = [
  { value: "All", label: "All projects" },
  { value: "Waterfront", label: "Waterfront" },
  { value: "Rental Pool", label: "Rental income" },
  { value: "New Launch", label: "New launch" },
  { value: "Commercial", label: "Commercial" },
];

/**
 * Multi-parameter marketplace search bar.
 * The wording deliberately avoids "cheap" or hard budget cut-offs so a visitor
 * never feels priced out before speaking to an advisor.
 */
export default function SearchBar({ filters, onChange, onSearch, resultCount }) {
  const [focused, setFocused] = useState(false);
  const { openWhatsAppLead } = useWhatsAppLead();

  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.();
      }}
      className={`rounded-2xl border bg-white/95 p-3 shadow-[0_25px_60px_-20px_rgba(10,25,47,0.55)] backdrop-blur-md transition-all duration-300 md:p-4 ${
        focused ? "border-gold/60 ring-4 ring-gold/10" : "border-white/60"
      }`}
      role="search"
      aria-label="Property search"
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
          <Sparkles size={12} strokeWidth={2.2} /> Find your perfect address
        </p>
        <button
          type="button"
          onClick={() =>
            openWhatsAppLead({ mode: "inquiry", source: "Search bar advisor help" })
          }
          className="shrink-0 text-[10px] font-semibold text-navy underline decoration-gold/60 underline-offset-2 transition-colors hover:text-gold"
        >
          Need help choosing?
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3">
        {/* Search */}
        <div className="md:col-span-3">
          <label htmlFor="market-search" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Search
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <Search size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <input
              id="market-search"
              type="text"
              value={filters.query}
              onChange={set("query")}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Project, area or landmark"
              className="w-full bg-transparent text-sm font-medium text-charcoal placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Goal */}
        <div className="md:col-span-3">
          <label htmlFor="market-goal" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            I'm looking for
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <Target size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <select
              id="market-goal"
              value={filters.goal}
              onChange={set("goal")}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
            >
              {GOALS.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Property type */}
        <div className="md:col-span-2">
          <label htmlFor="market-type" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Property type
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <Building2 size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <select
              id="market-type"
              value={filters.type}
              onChange={set("type")}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
            >
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comfort level */}
        <div className="md:col-span-2">
          <label htmlFor="market-tier" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Comfort level
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <Wallet size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <select
              id="market-tier"
              value={filters.tier}
              onChange={set("tier")}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
            >
              {TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-end md:col-span-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-navy transition-all hover:bg-navy hover:text-white active:scale-[0.98]"
          >
            Show matches <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Quick picks — one tap for the most common buyer intentions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">Quick pick</span>
        {QUICK_TAGS.map((tag) => {
          const active = filters.tag === tag.value;
          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => onChange({ ...filters, tag: tag.value })}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-all ${
                active
                  ? "border-gold bg-gold text-navy"
                  : "border-gray-200 bg-white text-charcoal hover:border-gold hover:text-navy"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col gap-1.5 px-1 text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="font-bold text-navy">{resultCount}</span> projects match your lifestyle
          {filters.tag !== "All" ? ` · ${filters.tag}` : ""}
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-green">
          <ShieldCheck size={12} strokeWidth={2.4} /> Every price is negotiable — final quote on WhatsApp
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-gray-400">
        <Link to="/cart" className="font-semibold text-gold hover:underline">
          View saved properties
        </Link>
        <span>No obligation · No spam</span>
      </div>
    </form>
  );
}
