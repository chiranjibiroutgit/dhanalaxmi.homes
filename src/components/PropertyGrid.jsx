import { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  SearchX,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import PropertyCard from "./PropertyCard";
import { useSiteContent } from "../context/SiteContentContext";
import { useWhatsAppLead } from "../context/WhatsAppLeadContext";
import { WhatsAppMark } from "./WhatsAppLeadModal";

const SORTS = [
  { value: "featured", label: "Best match" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "size", label: "Largest project" },
  { value: "new", label: "Newly added" },
];

const TIER_LABELS = {
  value: "Best value",
  prime: "Prime address",
  signature: "Signature collection",
};

/** Popularity ranking is derived from the curated order in the dataset */
const POPULARITY = ["prop_102", "prop_103", "prop_101", "prop_104", "prop_105"];

const unitCount = (property) =>
  parseInt(String(property.totalUnits || "").replace(/\D/g, ""), 10) || 0;

export default function PropertyGrid({ properties, total = 0, filters, onReset }) {
  const { content } = useSiteContent();
  const { openWhatsAppLead } = useWhatsAppLead();
  const portfolio = content.portfolio;
  const [sort, setSort] = useState("featured");

  const sorted = useMemo(() => {
    const list = [...properties];
    switch (sort) {
      case "priceLow":
        return list.sort((a, b) => a.priceNumeric - b.priceNumeric);
      case "priceHigh":
        return list.sort((a, b) => b.priceNumeric - a.priceNumeric);
      case "size":
        return list.sort((a, b) => unitCount(b) - unitCount(a));
      case "new":
        return list.sort((a, b) => b.id.localeCompare(a.id));
      default:
        return list.sort((a, b) => POPULARITY.indexOf(a.id) - POPULARITY.indexOf(b.id));
    }
  }, [properties, sort]);

  const isFiltered =
    filters &&
    (filters.query ||
      filters.goal !== "All" ||
      filters.type !== "All" ||
      filters.tier !== "Any" ||
      filters.tag !== "All");

  const filterSummary = useMemo(() => {
    if (!filters) return [];
    const parts = [];
    if (filters.query) parts.push(`“${filters.query}”`);
    if (filters.goal !== "All") parts.push(filters.goal);
    if (filters.type !== "All") parts.push(filters.type);
    if (filters.tier !== "Any") parts.push(TIER_LABELS[filters.tier] || filters.tier);
    if (filters.tag !== "All") parts.push(filters.tag);
    return parts;
  }, [filters]);

  /* If filters are too narrow, show popular alternatives instead of a dead end */
  const alternatives = useMemo(() => {
    if (sorted.length > 0) return [];
    return content.properties.slice(0, 3);
  }, [content.properties, sorted.length]);

  return (
    <section id="properties" className="bg-white py-16 md:py-24">
      <div className="container-luxury">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              data-edit-key="portfolio.eyebrow"
              className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold"
            >
              <span className="h-px w-8 bg-gold" /> {portfolio.eyebrow}
            </span>
            <h2 data-edit-key="portfolio.heading" className="font-serif text-3xl font-bold text-navy md:text-4xl">
              {portfolio.heading}
            </h2>
            <p data-edit-key="portfolio.subheading" className="mt-2 max-w-xl text-sm text-gray-600">
              {portfolio.subheading}
            </p>
          </div>

          {/* Sort control */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:flex">
              <SlidersHorizontal size={14} strokeWidth={2} /> Sort
            </span>
            <div className="relative">
              <ArrowUpDown
                size={14}
                strokeWidth={2}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold"
              />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort properties"
                className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-[12px] font-semibold text-charcoal outline-none transition-colors hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">
                ▾
              </span>
            </div>
            <span className="whitespace-nowrap rounded-full bg-mist px-3 py-2 text-[11px] font-semibold text-charcoal">
              {sorted.length}
              {total ? ` / ${total}` : ""}
            </span>
          </div>
        </div>

        {/* Negotiation promise — the key conversion hook */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-green/20 bg-green/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-green shadow-sm">
              <ShieldCheck size={18} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-green">
                Guaranteed – Negotiation by contact
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                Listed prices are starting points. Tell us your comfort level and our advisor will negotiate the best possible quote for you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              openWhatsAppLead({ mode: "inquiry", source: "Negotiation banner" })
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-gold hover:text-navy"
          >
            <WhatsAppMark size={14} /> Get best price
          </button>
        </div>

        {/* Active filter notice */}
        {isFiltered && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <p className="text-[12px] font-medium text-charcoal">
              Showing <span className="font-bold">{sorted.length}</span> matching propert
              {sorted.length === 1 ? "y" : "ies"}
              {filterSummary.length ? ` · ${filterSummary.join(" · ")}` : ""}
            </p>
            <button
              onClick={onReset}
              className="text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid — 3 / 2 / 1 columns */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5 px-6 py-14 text-center">
              <SearchX size={38} strokeWidth={1.5} className="mb-4 text-gold" />
              <h3 className="font-serif text-xl font-bold text-navy">
                No exact match — but you still have options
              </h3>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                Your ideal address may be available privately, or we can negotiate a better fit for your comfort level.
                Share your requirement and our advisor will shortlist it for you.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppLead({ mode: "inquiry", source: "No-match advisor help" })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-[#128C7E]"
                >
                  <WhatsAppMark size={15} /> Talk to an advisor
                </button>
                <button onClick={onReset} className="btn-outline">
                  Show all projects
                </button>
              </div>
            </div>

            {alternatives.length > 0 && (
              <div className="mt-10">
                <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                  <Sparkles size={13} strokeWidth={2.2} /> Popular right now
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {alternatives.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Disclaimer + contact hook */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="max-w-3xl text-[10px] leading-relaxed text-gray-400">
            *Prices are indicative and negotiable, exclusive of statutory charges, registration and applicable taxes.
            Project details are displayed on each listing. Artistic renders represent conceptual architectural intent.
          </p>
          <button
            type="button"
            onClick={() =>
              openWhatsAppLead({ mode: "inquiry", source: "Grid footer best price" })
            }
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-green transition-colors hover:text-navy"
          >
            <ArrowRight size={12} strokeWidth={2.6} /> Ask for the best negotiated price
          </button>
        </div>
      </div>
    </section>
  );
}
