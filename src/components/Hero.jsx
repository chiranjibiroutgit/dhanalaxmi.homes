import { ShieldCheck, Star, ArrowDown } from "lucide-react";
import SearchBar from "./SearchBar";
import { useSiteContent } from "../context/SiteContentContext";

const STATS = [
  { value: "10+", label: "Years of Legacy" },
  { value: "500+", label: "Happy Families" },
  { value: "50+", label: "Landmarks Delivered" },
  { value: "100%", label: "Transparent Deals" },
];

/**
 * Hero — architectural backdrop, value proposition and the marketplace search bar.
 * Anchored at #home for the scrollspy navigation.
 */
export default function Hero({ filters, onChange, onSearch, resultCount }) {
  const { content } = useSiteContent();
  const hero = content.hero;
  const stats = hero.stats?.length ? hero.stats : STATS;

  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Architectural backdrop */}
      <img
        src={hero.backgroundImage}
        alt="Dhanalaxmi Group luxury architecture at twilight"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        data-edit-key="hero.backgroundImage"
      />
      {/* Contrast overlays — guarantees WCAG AA text contrast */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/80 via-transparent to-navy/30" />

      <div className="container-luxury w-full pb-16 pt-32 md:pb-24 md:pt-36">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span
              data-edit-key="hero.eyebrow"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold backdrop-blur-sm"
            >
              <ShieldCheck size={13} strokeWidth={2.2} /> {hero.eyebrow}
            </span>
            <span
              data-edit-key="hero.rating"
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70"
            >
              <Star size={12} className="fill-gold text-gold" /> {hero.rating}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[2.6rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span data-edit-key="hero.headline1">{hero.headline1}</span>
            <span data-edit-key="hero.headline2" className="mt-2 block text-gold">
              {hero.headline2}
            </span>
          </h1>

          <p
            data-edit-key="hero.subhead"
            className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 md:text-base"
          >
            {hero.subhead}
          </p>

          {/* Primary actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#properties" data-edit-key="hero.primaryCta" className="btn-gold">
              {hero.primaryCta}
            </a>
            <a
              href={`https://wa.me/${content.contact.whatsapp.replace(/\D/g, "")}?text=Hi%20Dhanalaxmi%20Group,%20I%20would%20like%20to%20book%20a%20site%20visit`}
              target="_blank"
              rel="noopener noreferrer"
              data-edit-key="hero.secondaryCta"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-navy"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        {/* Search card */}
        <div className="mt-10 md:mt-12">
          <SearchBar filters={filters} onChange={onChange} onSearch={onSearch} resultCount={resultCount} />
        </div>

        {/* Trust metrics */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={`${s.label}-${i}`} data-edit-key={`hero.stats.${i}`}>
              <dt className="font-serif text-2xl font-bold text-gold md:text-3xl">{s.value}</dt>
              <dd className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Scroll cue */}
      <a
        href="#properties"
        aria-label="Scroll to featured properties"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition-colors hover:text-gold md:flex"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </a>
    </section>
  );
}
