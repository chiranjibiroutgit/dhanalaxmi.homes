import { useMemo, useState } from "react";
import { SlidersHorizontal, ArrowUpDown, SearchX } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { useSiteContent } from "../context/SiteContentContext";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price", label: "Price: Low to High" },
  { value: "popularity", label: "Popularity" },
  { value: "new", label: "Newly Added" },
];

/** Popularity ranking is derived from the curated order in the dataset */
const POPULARITY = ["prop_102", "prop_103", "prop_101", "prop_104", "prop_105"];

export default function PropertyGrid({ properties, total = 0, filters, onReset }) {
  const { content } = useSiteContent();
  const portfolio = content.portfolio;
  const [sort, setSort] = useState("featured");

  const sorted = useMemo(() => {
    const list = [...properties];
    switch (sort) {
      case "price":
        return list.sort((a, b) => a.priceNumeric - b.priceNumeric);
      case "new":
        return list.sort((a, b) => b.id.localeCompare(a.id));
      case "popularity":
        return list.sort((a, b) => POPULARITY.indexOf(a.id) - POPULARITY.indexOf(b.id));
      default:
        return list;
    }
  }, [properties, sort]);

  const isFiltered =
    filters && (filters.location || filters.type !== "All" || filters.budget !== "Any");

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
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort properties"
                className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-[12px] font-semibold text-charcoal outline-none transition-colors hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
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

        {/* Active filter notice */}
        {isFiltered && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <p className="text-[12px] font-medium text-charcoal">
              Showing <span className="font-bold">{sorted.length}</span> matching propert
              {sorted.length === 1 ? "y" : "ies"}
              {filters.location ? ` in “${filters.location}”` : ""}
              {filters.type !== "All" ? ` · ${filters.type}` : ""}
              {filters.budget !== "Any" ? ` · ${filters.budget}` : ""}
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-mist px-6 py-20 text-center">
            <SearchX size={40} strokeWidth={1.5} className="mb-4 text-gray-400" />
            <h3 className="font-serif text-xl font-bold text-navy">No properties match those filters</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-600">
              Try widening your budget or searching another location. Our advisors can also curate options for you.
            </p>
            <button onClick={onReset} className="btn-primary mt-6">
              Reset Filters
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-10 text-center text-[10px] leading-relaxed text-gray-400">
          *Prices indicative and exclusive of statutory charges, registration and applicable taxes. Project details are
          displayed on each listing. Artistic renders represent conceptual architectural intent.
        </p>
      </div>
    </section>
  );
}
