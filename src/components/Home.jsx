import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Hero from "./Hero";
import PropertyGrid from "./PropertyGrid";
import AboutUs from "./AboutUs";
import { useSiteContent } from "../context/SiteContentContext";

/** Budget buckets in INR (property.priceNumeric) */
const BUDGETS = {
  Any: [0, Infinity],
  "Under 50 Lakhs": [0, 5000000],
  "50 Lakhs - 1 Cr": [5000000, 10000000],
  "1 Cr - 3 Cr": [10000000, 30000000],
  "Above 3 Cr": [30000000, Infinity],
};

export default function Home() {
  const location = useLocation();
  const { content } = useSiteContent();
  const properties = content.properties;
  const [filters, setFilters] = useState({ location: "", type: "All", budget: "Any" });

  /* Filter the dataset live as the buyer types */
  const results = useMemo(() => {
    const q = filters.location.trim().toLowerCase();
    const [min, max] = BUDGETS[filters.budget] ?? BUDGETS.Any;

    return properties.filter((p) => {
      const matchesLocation =
        !q ||
        `${p.title} ${p.location} ${p.microLocation} ${p.type}`.toLowerCase().includes(q);
      const matchesType = filters.type === "All" || p.type === filters.type;
      const matchesBudget = Number(p.priceNumeric || 0) >= min && Number(p.priceNumeric || 0) <= max;
      return matchesLocation && matchesType && matchesBudget;
    });
  }, [filters, properties]);

  /* Restore the exact scroll position when returning from a detail page */
  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        // Wait one frame so the grid has painted before measuring
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
        onReset={() => setFilters({ location: "", type: "All", budget: "Any" })}
      />
      <AboutUs />
    </>
  );
}
