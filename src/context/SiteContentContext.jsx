import { createContext, useContext, useMemo, useState } from "react";
import { PROPERTIES, CONTACT } from "../data/properties";

/**
 * SiteContentContext
 * ------------------
 * Single source of truth for every editable piece of the public site.
 * The public components (Header, Hero, Grid, About, Footer, Detail) read
 * from here, so the Dev Edit Panel edits the REAL site — not a mock.
 *
 * Persistence is local (localStorage) for now. The same API will later be
 * backed by Firestore + a reviewed GitHub commit.
 */

// v4 — refreshes contact number, negotiation notes and client-friendly filter metadata
const STORAGE_KEY = "dl_site_content_v4";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const defaultContent = {
  brand: {
    name: "DHANALAXMI",
    subtitle: "Homes.com",
    monogram: "DL",
  },
  hero: {
    eyebrow: "Puri, Odisha · Coastal Living",
    rating: "4.9 Client Rating",
    headline1: "Modern Living,",
    headline2: "Crafted With Enduring Trust.",
    subhead:
      "Discover sea-facing residences, marina villas and high-yield commercial assets across Puri's most coveted addresses — engineered for generational value, delivered with complete transparency.",
    primaryCta: "Explore Listings",
    secondaryCta: "Chat on WhatsApp",
    backgroundImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
    stats: [
      { value: "10+", label: "Years of Legacy" },
      { value: "500+", label: "Happy Families" },
      { value: "50+", label: "Landmarks Delivered" },
      { value: "100%", label: "Transparent Deals" },
    ],
  },
  portfolio: {
    eyebrow: "The Portfolio",
    heading: "Featured Properties",
    subheading:
      "Five signature addresses — each ready for private viewing.",
  },
  about: {
    heading: "About Us",
    tagline: "Building legacies, one landmark at a time.",
    title: "Our Legacy",
    body1:
      "Founded upon the harmonious convergence of timeless prosperity and modern architectural permanence, Dhanalaxmi Group serves discerning homebuyers, commercial tenants, and institutional investors seeking high-value residential and mixed-use assets.",
    body2:
      "Every project is engineered with generational structural integrity, transparent transactions, and uncompromising architectural elegance—grounded in cultural prestige and forward-looking sustainability.",
    metrics: [
      { value: "10+", label: "Years" },
      { value: "500+", label: "Happy Families" },
      { value: "100%", label: "Transparent Deals" },
      { value: "50+", label: "Landmark Projects" },
    ],
  },
  contact: {
    phone: CONTACT.phone,
    phone2: "+91 7327859285",
    whatsapp: CONTACT.whatsapp,
    email: CONTACT.email,
    address: CONTACT.address,
    domain: "Dhanalaxmihomes.com",
    tagline: "Engineering generational living spaces with integrity, prosperity, refinement, and agility.",
  },
  properties: clone(PROPERTIES),
};

/** Merge stored config onto defaults so new fields never break old saves. */
function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultContent);
    const stored = JSON.parse(raw);
    const base = clone(defaultContent);

    /* Keep older saved listings working after new filter fields are added */
    const mergeProperties = (savedProperties) => {
      if (!Array.isArray(savedProperties)) return base.properties;
      return savedProperties.map((property) => {
        const fallback = base.properties.find((item) => item.id === property.id);
        return {
          ...fallback,
          ...property,
          goals:
            Array.isArray(property.goals) && property.goals.length
              ? property.goals
              : fallback?.goals || [],
          tags:
            Array.isArray(property.tags) && property.tags.length
              ? property.tags
              : fallback?.tags || [],
        };
      });
    };

    return {
      ...base,
      ...stored,
      brand: { ...base.brand, ...(stored.brand || {}) },
      hero: { ...base.hero, ...(stored.hero || {}) },
      portfolio: { ...base.portfolio, ...(stored.portfolio || {}) },
      about: { ...base.about, ...(stored.about || {}) },
      contact: { ...base.contact, ...(stored.contact || {}) },
      properties: mergeProperties(stored.properties),
    };
  } catch {
    return clone(defaultContent);
  }
}

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(loadContent);
  const [savedSnapshot, setSavedSnapshot] = useState(content);

  const updateSection = (section, patch) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  };

  const addProperty = (property) => {
    setContent((prev) => ({ ...prev, properties: [...prev.properties, property] }));
  };

  const updateProperty = (id, patch) => {
    setContent((prev) => ({
      ...prev,
      properties: prev.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const removeProperty = (id) => {
    setContent((prev) => ({
      ...prev,
      properties: prev.properties.filter((p) => p.id !== id),
    }));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setSavedSnapshot(clone(content));
  };

  const cancel = () => {
    setContent(clone(savedSnapshot));
  };

  const resetToDefaults = () => {
    const next = clone(defaultContent);
    localStorage.removeItem(STORAGE_KEY);
    setContent(next);
    setSavedSnapshot(clone(next));
  };

  const isDirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(savedSnapshot),
    [content, savedSnapshot],
  );

  const value = useMemo(
    () => ({
      content,
      updateSection,
      addProperty,
      updateProperty,
      removeProperty,
      save,
      cancel,
      resetToDefaults,
      isDirty,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content, isDirty],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}
