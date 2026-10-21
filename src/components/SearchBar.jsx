import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Building2, Wallet, ArrowRight } from "lucide-react";

/**
 * Multi-parameter marketplace search bar.
 * Controlled by the Home page so results filter live in the property grid.
 */
export default function SearchBar({ filters, onChange, onSearch, resultCount }) {
  const [focused, setFocused] = useState(false);

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.();
      }}
      className={`rounded-2xl border bg-white/95 p-3 shadow-[0_25px_60px_-20px_rgba(10,25,47,0.55)] backdrop-blur-md transition-all duration-300 md:p-4 ${
        focused ? "border-gold/60 ring-4 ring-gold/10" : "border-white/60"
      }`}
      role="search"
      aria-label="Property search"
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3">
        {/* Location */}
        <div className="md:col-span-4">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Location
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <MapPin size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <input
              type="text"
              value={filters.location}
              onChange={set("location")}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Puri, Odisha"
              className="w-full bg-transparent text-sm font-medium text-charcoal placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Property type */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Property Type
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <Building2 size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <select
              value={filters.type}
              onChange={set("type")}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Budget Range
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
            <Wallet size={16} className="shrink-0 text-gold" strokeWidth={2} />
            <select
              value={filters.budget}
              onChange={set("budget")}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
            >
              <option value="Any">Any Budget</option>
              <option value="Under 50 Lakhs">Under ₹50 Lakhs</option>
              <option value="50 Lakhs - 1 Cr">₹50L – ₹1 Cr</option>
              <option value="1 Cr - 3 Cr">₹1 Cr – ₹3 Cr</option>
              <option value="Above 3 Cr">Above ₹3 Cr</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-end md:col-span-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-navy transition-all hover:bg-navy hover:text-white active:scale-[0.98]"
          >
            Search <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-gray-500">
        <span>
          <span className="font-bold text-navy">{resultCount}</span> verified listings match your criteria
        </span>
        <Link to="/cart" className="font-semibold text-gold hover:underline">
          View saved properties
        </Link>
      </div>
    </form>
  );
}
