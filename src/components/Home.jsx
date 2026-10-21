import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Hero from "./Hero";
import PropertyGrid from "./PropertyGrid";
import AboutUs from "./AboutUs";
import { useSiteContent } from "../context/SiteContentContext";

/**
 * Price bands are framed as ownership tiers rather than "cheap vs expensive".
 * The numbers stay in the data; the labels keep the conversation positive.
 */
export const TIERS = {
  Any: [0, Infinity],
  value: [0, 1800],
  prime: [1800, 2500],
  signature: [2500, Infinity],
};

export const DEFAULT_FILTERS = {
  query: "",
  goal: "All",
  type: "All",
  tier: "Any",
  tag: "All",
};

export default function Home() {
  const location = useLocation();
  const { content } = useSiteContent();
  const properties = content.properties;
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /* Filter the dataset live as the buyer types or taps a preference */
  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const [min, max] = TIERS[filters.tier] ?? TIERS.Any;

    return properties.filter((p) => {
      const searchable = [
        p.title,
        p.subtitle,
        p.location,
        p.microLocation,
        p.type,
        p.badge,
        ...(p.tags || []),
        ...(p.goals || []),
        ...(p.highlights || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || searchable.includes(q);
      const matchesGoal = filters.goal === "All" || (p.goals || []).includes(filters.goal);
      const matchesType = filters.type === "All" || p.type === filters.type;
      const matchesTag = filters.tag === "All" || (p.tags || []).includes(filters.tag);
      const value = Number(p.priceNumeric || 0);
      const matchesTier = value >= min && value <= max;

      return matchesQuery && matchesGoal && matchesType && matchesTag && matchesTier;
    });
  }, [filters, properties]);

  /* Restore the exact scroll position when returning from a detail page */
  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "auto", block: "start" }));
      }
      return;
    }
    const saved = sessionStorage.getItem("dl_scroll_y");
    if (saved) {
      sessionStorage.removeItem("dl_scroll_y");
      requestAnimationFrame(() => window.scrollTo({ top: Number(saved), behavior: "auto" }));
    }
  }, [location.state]);

  const handleSearch = () => {
    document.getElementById("properties")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Hero
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
        resultCount={results.length}
      />
      <PropertyGrid
        properties={results}
        total={properties.length}
        filters={filters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />
      <AboutUs />
    </>
  );
}
