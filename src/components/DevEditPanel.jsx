import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSiteContent } from "../context/SiteContentContext";
import { PanelGuard } from "./PanelGuard";
import Header from "./Header";
import Home from "./Home";
import Footer from "./Footer";
import {
  Save,
  X,
  Eye,
  Pencil,
  Plus,
  Trash2,
  ChevronDown,
  Package,
  Image as ImageIcon,
  RotateCcw,
  Check,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  ShieldCheck,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────── */

const keyToId = (key) => `field-${key.replace(/\./g, "-")}`;

const splitLines = (text = "") =>
  String(text)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const splitCsv = (text = "") =>
  String(text)
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const blankProduct = () => ({
  id: `prop_${Date.now()}`,
  title: "",
  subtitle: "",
  type: "Apartment",
  status: "Under Construction",
  badge: "New Launch",
  location: "",
  microLocation: "",
  price: "",
  priceNumeric: 0,
  priceLabel: "Starting Price",
  possession: "",
  totalUnits: "",
  bhk: "",
  carpetArea: "",
  parking: "Allocated",
  facing: "East",
  floor: "",
  furnishing: "Semi-Furnished",
  maintenance: "",
  description: "",
  thumbnail:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  floorPlan: "",
  images: [],
  amenities: [],
  specs: [],
  highlights: [],
});

/** Product object → flat form draft (arrays become editable text) */
const toDraft = (p) => ({
  ...p,
  imagesText: (p.images || []).join("\n"),
  amenitiesText: (p.amenities || []).map((a) => a.name).join(", "),
  highlightsText: (p.highlights || []).join("\n"),
  specsText: (p.specs || []).map((s) => `${s.label}: ${s.value}`).join("\n"),
});

/** Flat form draft → schema-safe product object */
const fromDraft = (draft) => {
  const {
    imagesText,
    amenitiesText,
    highlightsText,
    specsText,
    ...base
  } = draft;

  const images = splitLines(imagesText);
  const typedSpecs = splitLines(specsText)
    .map((line) => {
      const i = line.indexOf(":");
      return i === -1
        ? { label: line, value: "" }
        : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    })
    .filter((s) => s.label);

  const derivedSpecs = [
    base.totalUnits && { label: "Total Units", value: base.totalUnits },
    base.possession && { label: "Possession", value: base.possession },
    base.carpetArea && { label: "Carpet Area", value: base.carpetArea },
    base.parking && { label: "Parking", value: base.parking },
    base.facing && { label: "Facing", value: `${base.facing} facing` },
    base.floor && { label: "Floor", value: base.floor },
    base.maintenance && { label: "Maintenance", value: base.maintenance },
    base.location && { label: "Location", value: base.location },
  ].filter(Boolean);

  return {
    ...base,
    priceNumeric: Number(String(base.priceNumeric).replace(/[^\d.]/g, "")) || 0,
    images: images.length ? images : base.thumbnail ? [base.thumbnail] : [],
    floorPlan: base.floorPlan || base.thumbnail,
    amenities: splitCsv(amenitiesText).map((name) => ({ name, icon: "Shield" })),
    highlights: splitLines(highlightsText),
    specs: typedSpecs.length ? typedSpecs : derivedSpecs,
  };
};

/* ──────────────────────────────────────────────────────────────────────
   Small UI primitives
   ────────────────────────────────────────────────────────────────────── */

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{title}</span>
        <ChevronDown
          size={15}
          strokeWidth={2.4}
          className={`text-gray-400 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="space-y-3 px-4 pb-5">{children}</div>}
    </section>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white placeholder-gray-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  rows = 3,
  type = "text",
  hint,
}) {
  return (
    <div id={id} className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={rows}
          className={inputClass}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={inputClass}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <p className="text-[10px] leading-relaxed text-gray-500">{hint}</p>}
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div id={id} className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </label>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0B1220] text-white">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Product editor form
   ────────────────────────────────────────────────────────────────────── */

const TYPES = ["Apartment", "Villa", "Plot", "Commercial", "Penthouse"];
const STATUSES = ["Ready to Move", "Under Construction", "New Launch", "Booking Open"];
const BADGES = ["Exclusive", "New Launch", "Premium", "Limited Units", "Limited Stock", "Best Value"];

const VIEWPORTS = [
  { label: "Desktop", width: 1280, icon: Monitor },
  { label: "Tablet", width: 834, icon: Tablet },
  { label: "Mobile", width: 390, icon: Smartphone },
];

function ProductForm({ draft, setDraft, onCancel, onSave, onDelete, error, isNew }) {
  const set = (field) => (value) => setDraft((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-base font-bold text-white">
            {isNew ? "Add New Product" : "Edit Product"}
          </h3>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Appears instantly in the mirrored grid
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close product form"
        >
          <X size={16} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <TextField id="product-title" label="Title *" value={draft.title} onChange={set("title")} placeholder="Sea Breeze Residency" />
      <TextField id="product-subtitle" label="Subtitle" value={draft.subtitle} onChange={set("subtitle")} placeholder="Sea-Facing Apartments" />

      <div className="grid grid-cols-2 gap-3">
        <SelectField id="product-type" label="Type" value={draft.type} onChange={set("type")} options={TYPES} />
        <SelectField id="product-status" label="Status" value={draft.status} onChange={set("status")} options={STATUSES} />
      </div>
      <SelectField id="product-badge" label="Badge" value={draft.badge} onChange={set("badge")} options={BADGES} />

      <TextField id="product-location" label="Location *" value={draft.location} onChange={set("location")} placeholder="Puri, Odisha" />
      <TextField id="product-micro" label="Micro Location / Khata" value={draft.microLocation} onChange={set("microLocation")} placeholder="Khata no: 123/456" />

      <div className="grid grid-cols-2 gap-3">
        <TextField id="product-price" label="Price display *" value={draft.price} onChange={set("price")} placeholder="₹1.25 Cr*" />
        <TextField id="product-price-numeric" label="Price (numeric)" value={draft.priceNumeric} onChange={set("priceNumeric")} type="number" hint="Used by the budget filter" />
      </div>
      <TextField id="product-price-label" label="Price label" value={draft.priceLabel} onChange={set("priceLabel")} placeholder="Starting Price" />

      <div className="grid grid-cols-2 gap-3">
        <TextField id="product-total-units" label="Total units" value={draft.totalUnits} onChange={set("totalUnits")} placeholder="55 Units" />
        <TextField id="product-possession" label="Availability" value={draft.possession} onChange={set("possession")} placeholder="Booking Open" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField id="product-bhk" label="BHK" value={draft.bhk} onChange={set("bhk")} placeholder="3 BHK" />
        <TextField id="product-area" label="Carpet area" value={draft.carpetArea} onChange={set("carpetArea")} placeholder="1,650 sq. ft." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField id="product-parking" label="Parking" value={draft.parking} onChange={set("parking")} placeholder="2 Covered" />
        <TextField id="product-facing" label="Facing" value={draft.facing} onChange={set("facing")} placeholder="East" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField id="product-floor" label="Floor" value={draft.floor} onChange={set("floor")} placeholder="7 of 12" />
        <TextField id="product-furnishing" label="Furnishing" value={draft.furnishing} onChange={set("furnishing")} placeholder="Semi-Furnished" />
      </div>

      <TextField id="product-maintenance" label="Maintenance" value={draft.maintenance} onChange={set("maintenance")} placeholder="₹2.5 / sq. ft. / month" />

      <TextField id="product-description" label="Description" value={draft.description} onChange={set("description")} textarea rows={4} placeholder="Describe the property..." />

      <TextField
        id="product-thumbnail"
        label="Cover image URL"
        value={draft.thumbnail}
        onChange={set("thumbnail")}
        placeholder="https://..."
      />
      {draft.thumbnail && (
        <img
          src={draft.thumbnail}
          alt="Cover preview"
          className="h-28 w-full rounded-lg border border-white/10 bg-black/20 object-contain"
        />
      )}

      <TextField
        id="product-gallery"
        label="Gallery image URLs"
        value={draft.imagesText}
        onChange={set("imagesText")}
        textarea
        rows={3}
        hint="One URL per line. Falls back to the cover image."
      />

      <TextField
        id="product-floorplan"
        label="Floor plan image URL"
        value={draft.floorPlan}
        onChange={set("floorPlan")}
        placeholder="https://..."
      />

      <TextField
        id="product-amenities"
        label="Amenities"
        value={draft.amenitiesText}
        onChange={set("amenitiesText")}
        textarea
        rows={3}
        hint="Comma or line separated — e.g. Swimming Pool, Clubhouse, 24/7 Security"
      />

      <TextField
        id="product-highlights"
        label="Highlights"
        value={draft.highlightsText}
        onChange={set("highlightsText")}
        textarea
        rows={3}
        hint="One highlight per line"
      />

      <TextField
        id="product-specs"
        label="Custom specifications"
        value={draft.specsText}
        onChange={set("specsText")}
        textarea
        rows={4}
        hint="One per line, formatted as Label: Value. Leave blank to auto-build from the fields above."
      />

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-white/10 bg-[#0B1220] px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-white/20 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-lg bg-gold px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-navy transition hover:bg-white"
        >
          <Check size={14} strokeWidth={3} /> {isNew ? "Add Product" : "Save Product"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/40 px-3 py-2.5 text-red-300 transition hover:bg-red-500/10"
            aria-label="Delete product"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Main panel
   ────────────────────────────────────────────────────────────────────── */

export default function DevEditPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    content,
    updateSection,
    addProperty,
    updateProperty,
    removeProperty,
    save,
    cancel,
    resetToDefaults,
    isDirty,
  } = useSiteContent();

  const [editMode, setEditMode] = useState(true);
  const [tab, setTab] = useState("content");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productDraft, setProductDraft] = useState(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  /* Device-width mirror: render at a fixed CSS width, scale to fit the pane.
     This keeps the editor pixel-identical to the real site on any screen. */
  const [viewport, setViewport] = useState(1280);
  const [scale, setScale] = useState(0.7);
  const [siteHeight, setSiteHeight] = useState(0);

  const siteRef = useRef(null);
  const scrollRef = useRef(null);
  const toastTimer = useRef(null);

  const notify = (message, tone = "ok") => {
    setToast({ message, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /* Scale the fixed-width preview to the available canvas width */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const measure = () => {
      const available = scroller.clientWidth;
      setScale(Math.min(1, available / viewport));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [viewport]);

  /* Reserve the correct scroll height for the scaled site */
  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;
    const measure = () => setSiteHeight(site.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(site);
    return () => observer.disconnect();
  }, []);

  /* Highlight the selected element inside the mirrored site */
  useEffect(() => {
    const root = siteRef.current;
    if (!root) return;
    root.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
    if (!selectedKey) return;
    const target = root.querySelector(`[data-edit-key="${selectedKey}"]`);
    if (target) target.classList.add("is-selected");
  }, [selectedKey, content]);

  const selectKey = (key) => {
    setSelectedKey(key);
    const el = document.getElementById(keyToId(key));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = el.querySelector("input, textarea, select");
      if (input) window.setTimeout(() => input.focus({ preventScroll: true }), 260);
    }
  };

  const handleCanvasClickCapture = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const anchor = target.closest("a");
    if (editMode && anchor) event.preventDefault();
    if (!editMode) return;

    const card = target.closest("[data-property-id]");
    if (card) {
      event.preventDefault();
      event.stopPropagation();
      const property = content.properties.find((p) => p.id === card.dataset.propertyId);
      if (property) {
        setTab("products");
        setSelectedProductId(property.id);
        setProductDraft(toDraft(property));
        setFormError("");
      }
      return;
    }

    const editEl = target.closest("[data-edit-key]");
    if (editEl) {
      event.preventDefault();
      event.stopPropagation();
      setTab("content");
      selectKey(editEl.dataset.editKey);
    }
  };

  const handleSave = () => {
    save();
    setProductDraft(null);
    notify("Saved. The public site now reflects these edits.");
  };

  const handleCancel = () => {
    cancel();
    setProductDraft(null);
    setSelectedProductId(null);
    setSelectedKey(null);
    setFormError("");
    notify("Changes discarded.", "warn");
  };

  const handleReset = () => {
    if (!window.confirm("Restore the original website content? All local edits will be lost.")) return;
    resetToDefaults();
    setProductDraft(null);
    setSelectedProductId(null);
    setSelectedKey(null);
    notify("Restored the original website content.", "warn");
  };

  const startAdd = () => {
    setTab("products");
    setSelectedProductId(null);
    setProductDraft(toDraft(blankProduct()));
    setFormError("");
  };

  const startEdit = (property) => {
    setTab("products");
    setSelectedProductId(property.id);
    setProductDraft(toDraft(property));
    setFormError("");
  };

  const handleProductSave = () => {
    if (!productDraft) return;
    if (!productDraft.title.trim() || !productDraft.location.trim() || !productDraft.price.trim()) {
      setFormError("Title, location and price are required before this product can go live.");
      return;
    }

    const payload = fromDraft(productDraft);
    const exists = content.properties.some((p) => p.id === payload.id);

    if (exists) updateProperty(payload.id, payload);
    else addProperty(payload);

    setProductDraft(null);
    setSelectedProductId(payload.id);
    setFormError("");
    notify(exists ? "Product updated in the live grid." : "Product added to the live grid.");
  };

  const handleProductDelete = () => {
    if (!productDraft) return;
    if (!window.confirm("Remove this product from the website?")) return;
    removeProperty(productDraft.id);
    setProductDraft(null);
    setSelectedProductId(null);
    notify("Product removed from the live grid.", "warn");
  };

  const stats = useMemo(
    () => [
      { label: "Products", value: content.properties.length },
      { label: "Editable fields", value: 40 + content.properties.length },
      { label: "Status", value: isDirty ? "Unsaved" : "Saved" },
    ],
    [content.properties.length, isDirty],
  );

  return (
    <PanelGuard panelPath="/dev.edit.panel">
      <div className="flex h-screen flex-col overflow-hidden bg-[#070D18] text-white">
        {/* ── Top bar ── */}
        <header className="z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0B1220] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold font-bold text-navy">DL</div>
            <div>
              <h1 className="font-serif text-base font-bold leading-none text-white">Dev Edit Panel</h1>
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-gray-400">
                Live site editor · {user?.role.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition ${
                editMode
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/20 text-gray-300 hover:bg-white/10"
              }`}
              title="Toggle between editing and browsing the mirrored site"
            >
              {editMode ? <Pencil size={13} /> : <Eye size={13} />}
              {editMode ? "Edit mode" : "Preview mode"}
            </button>

            {isDirty && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <AlertTriangle size={12} /> Unsaved
              </span>
            )}

            <button
              type="button"
              onClick={handleCancel}
              disabled={!isDirty}
              className="flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={13} /> Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-navy transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={13} /> Save
            </button>

            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gold transition hover:bg-gold/10"
            >
              <ShieldCheck size={13} /> Review
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
              title={`Sign out`}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* ── Inspector ── */}
          <aside className="edit-inspector flex w-[360px] shrink-0 flex-col border-r border-white/10 bg-[#0B1220]">
            <div className="grid grid-cols-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setTab("content")}
                className={`flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-wider transition ${
                  tab === "content" ? "bg-gold/15 text-gold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Layers size={14} /> Content
              </button>
              <button
                type="button"
                onClick={() => setTab("products")}
                className={`flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-wider transition ${
                  tab === "products" ? "bg-gold/15 text-gold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Package size={14} /> Products ({content.properties.length})
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === "content" ? (
                <>
                  <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] leading-relaxed text-gray-400">
                      Click any highlighted element in the live site on the right — the matching field opens
                      here. Everything updates live before you save.
                    </p>
                  </div>

                  <Section title="Brand">
                    <TextField id="field-brand-name" label="Brand name" value={content.brand.name} onChange={(v) => updateSection("brand", { name: v })} />
                    <TextField id="field-brand-subtitle" label="Brand subtitle" value={content.brand.subtitle} onChange={(v) => updateSection("brand", { subtitle: v })} />
                    <TextField id="field-brand-monogram" label="Monogram" value={content.brand.monogram} onChange={(v) => updateSection("brand", { monogram: v })} />
                  </Section>

                  <Section title="Hero">
                    <TextField id="field-hero-eyebrow" label="Location badges" value={content.hero.eyebrow} onChange={(v) => updateSection("hero", { eyebrow: v })} textarea rows={3} hint="Separate locations with | — e.g. Shree Jagannath Dham Puri (International Capital Region) | Ekamra Khetra Bhubaneswar (State Capital Region)" />
                    <TextField id="field-hero-rating" label="Rating line" value={content.hero.rating} onChange={(v) => updateSection("hero", { rating: v })} />
                    <TextField id="field-hero-headline1" label="Headline line 1" value={content.hero.headline1} onChange={(v) => updateSection("hero", { headline1: v })} />
                    <TextField id="field-hero-headline2" label="Headline line 2 (gold)" value={content.hero.headline2} onChange={(v) => updateSection("hero", { headline2: v })} />
                    <TextField id="field-hero-subhead" label="Sub-headline" value={content.hero.subhead} onChange={(v) => updateSection("hero", { subhead: v })} textarea rows={4} />
                    <TextField id="field-hero-primaryCta" label="Primary button" value={content.hero.primaryCta} onChange={(v) => updateSection("hero", { primaryCta: v })} />
                    <TextField id="field-hero-secondaryCta" label="Secondary button" value={content.hero.secondaryCta} onChange={(v) => updateSection("hero", { secondaryCta: v })} />
                    <TextField id="field-hero-backgroundImage" label="Background image URL" value={content.hero.backgroundImage} onChange={(v) => updateSection("hero", { backgroundImage: v })} />
                    {content.hero.backgroundImage && (
                      <img src={content.hero.backgroundImage} alt="Hero preview" className="h-24 w-full rounded-lg border border-white/10 object-cover" />
                    )}

                    <div className="pt-2">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Trust metrics</p>
                      <div className="space-y-3">
                        {(content.hero.stats || []).map((stat, i) => (
                          <div key={i} id={keyToId(`hero.stats.${i}`)} className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 p-2">
                            <TextField
                              label={`Value ${i + 1}`}
                              value={stat.value}
                              onChange={(v) => {
                                const next = [...content.hero.stats];
                                next[i] = { ...next[i], value: v };
                                updateSection("hero", { stats: next });
                              }}
                            />
                            <TextField
                              label="Label"
                              value={stat.label}
                              onChange={(v) => {
                                const next = [...content.hero.stats];
                                next[i] = { ...next[i], label: v };
                                updateSection("hero", { stats: next });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Section>

                  <Section title="Portfolio section" defaultOpen={false}>
                    <TextField id="field-portfolio-eyebrow" label="Eyebrow" value={content.portfolio.eyebrow} onChange={(v) => updateSection("portfolio", { eyebrow: v })} />
                    <TextField id="field-portfolio-heading" label="Heading" value={content.portfolio.heading} onChange={(v) => updateSection("portfolio", { heading: v })} />
                    <TextField id="field-portfolio-subheading" label="Subheading" value={content.portfolio.subheading} onChange={(v) => updateSection("portfolio", { subheading: v })} textarea rows={3} />
                  </Section>

                  <Section title="About section" defaultOpen={false}>
                    <TextField id="field-about-heading" label="Heading" value={content.about.heading} onChange={(v) => updateSection("about", { heading: v })} />
                    <TextField id="field-about-tagline" label="Tagline" value={content.about.tagline} onChange={(v) => updateSection("about", { tagline: v })} />
                    <TextField id="field-about-title" label="Story title" value={content.about.title} onChange={(v) => updateSection("about", { title: v })} />
                    <TextField id="field-about-body1" label="Paragraph 1" value={content.about.body1} onChange={(v) => updateSection("about", { body1: v })} textarea rows={4} />
                    <TextField id="field-about-body2" label="Paragraph 2" value={content.about.body2} onChange={(v) => updateSection("about", { body2: v })} textarea rows={4} />

                    <div className="pt-2">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Metrics</p>
                      <div className="space-y-3">
                        {(content.about.metrics || []).map((metric, i) => (
                          <div key={i} id={keyToId(`about.metrics.${i}`)} className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 p-2">
                            <TextField
                              label={`Value ${i + 1}`}
                              value={metric.value}
                              onChange={(v) => {
                                const next = [...content.about.metrics];
                                next[i] = { ...next[i], value: v };
                                updateSection("about", { metrics: next });
                              }}
                            />
                            <TextField
                              label="Label"
                              value={metric.label}
                              onChange={(v) => {
                                const next = [...content.about.metrics];
                                next[i] = { ...next[i], label: v };
                                updateSection("about", { metrics: next });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Section>

                  <Section title="Contact & Footer" defaultOpen={false}>
                    <TextField id="field-contact-phone" label="Primary phone" value={content.contact.phone} onChange={(v) => updateSection("contact", { phone: v })} />
                    <TextField id="field-contact-phone2" label="Secondary phone" value={content.contact.phone2} onChange={(v) => updateSection("contact", { phone2: v })} />
                    <TextField id="field-contact-whatsapp" label="WhatsApp number" value={content.contact.whatsapp} onChange={(v) => updateSection("contact", { whatsapp: v })} hint="Used by all WhatsApp buttons" />
                    <TextField id="field-contact-email" label="Email" value={content.contact.email} onChange={(v) => updateSection("contact", { email: v })} />
                    <TextField id="field-contact-address" label="Address" value={content.contact.address} onChange={(v) => updateSection("contact", { address: v })} textarea rows={2} />
                    <TextField id="field-contact-domain" label="Domain" value={content.contact.domain} onChange={(v) => updateSection("contact", { domain: v })} />
                    <TextField id="field-contact-tagline" label="Footer tagline" value={content.contact.tagline} onChange={(v) => updateSection("contact", { tagline: v })} textarea rows={3} />
                  </Section>

                  <div className="p-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/10"
                    >
                      <RotateCcw size={13} /> Restore original content
                    </button>
                  </div>
                </>
              ) : productDraft ? (
                <ProductForm
                  draft={productDraft}
                  setDraft={setProductDraft}
                  onCancel={() => {
                    setProductDraft(null);
                    setFormError("");
                  }}
                  onSave={handleProductSave}
                  onDelete={handleProductDelete}
                  error={formError}
                  isNew={!content.properties.some((p) => p.id === productDraft.id)}
                />
              ) : (
                <div className="space-y-3 p-4">
                  <button
                    type="button"
                    onClick={startAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-navy transition hover:bg-white"
                  >
                    <Plus size={15} strokeWidth={3} /> Add New Product
                  </button>

                  <p className="text-[10px] leading-relaxed text-gray-500">
                    Products added here appear immediately in the mirrored homepage grid. Click a card in the
                    canvas to edit it, or use the list below.
                  </p>

                  <div className="space-y-2">
                    {content.properties.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 rounded-xl border p-2 transition ${
                          selectedProductId === p.id
                            ? "border-gold bg-gold/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        <img src={p.thumbnail} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-black/20 object-contain" />
                        <button type="button" onClick={() => startEdit(p)} className="min-w-0 flex-1 text-left">
                          <div className="truncate text-[12px] font-semibold text-white">{p.title || "Untitled"}</div>
                          <div className="truncate text-[10px] text-gray-400">
                            {p.type} · {p.location || "No location"}
                          </div>
                          <div className="text-[10px] font-bold text-gold">{p.price || "No price"}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded-md p-2 text-gray-400 transition hover:bg-white/10 hover:text-gold"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove "${p.title}" from the website?`)) {
                              removeProperty(p.id);
                              notify("Product removed from the live grid.", "warn");
                            }
                          }}
                          className="rounded-md p-2 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {content.properties.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
                      <ImageIcon size={22} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-[11px] text-gray-400">No products yet. Add your first listing.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-white/[0.04] px-2 py-2 text-center">
                  <div className="font-serif text-sm font-bold text-gold">{s.value}</div>
                  <div className="text-[8px] uppercase tracking-wider text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Mirrored live site ── */}
          <main className="relative min-w-0 flex-1 overflow-y-auto bg-gray-200" ref={scrollRef}>
            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-[#070D18]/90 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-gray-400 backdrop-blur">
              <span className="flex items-center gap-1.5">
                <Monitor size={11} /> Live site mirror · {Math.round(scale * 100)}%
              </span>

              <div className="flex items-center gap-1">
                {VIEWPORTS.map(({ label, width, icon: Icon }) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => setViewport(width)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition ${
                      viewport === width
                        ? "bg-gold/20 text-gold"
                        : "text-gray-500 hover:bg-white/10 hover:text-gray-200"
                    }`}
                    title={`${label} · ${width}px`}
                  >
                    <Icon size={10} /> {label}
                  </button>
                ))}
                <span className="ml-2 hidden sm:inline">
                  {editMode ? "Click any outlined element" : "Preview mode"}
                </span>
              </div>
            </div>

            <div style={{ height: siteHeight ? Math.ceil(siteHeight * scale) : undefined }}>
              <div
                ref={siteRef}
                className={`edit-canvas ${editMode ? "is-editing" : ""}`}
                style={{
                  width: viewport,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                onClickCapture={handleCanvasClickCapture}
              >
                <Header forceHomeNav />
                <Home />
                <Footer />
              </div>
            </div>
          </main>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-[12px] shadow-2xl ${
              toast.tone === "warn"
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                : "border-green/40 bg-green/10 text-green-200"
            }`}
          >
            {toast.tone === "warn" ? <AlertTriangle size={15} className="mt-0.5 shrink-0" /> : <Check size={15} className="mt-0.5 shrink-0" />}
            {toast.message}
          </div>
        )}

        {/* ── Review modal ── */}
        {reviewOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1220] p-6 text-white shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl font-bold">Change review</h2>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Local draft only — nothing is committed or deployed from this panel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close review"
                >
                  <X size={18} />
                </button>
              </div>

              <ul className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[12px] text-gray-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold" /> {content.properties.length} products in the live grid
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold" /> Brand, hero, portfolio, about and footer content editable
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold" /> Add / edit / delete products one by one
                </li>
                <li className="flex items-center gap-2">
                  {isDirty ? <AlertTriangle size={14} className="text-amber-300" /> : <Check size={14} className="text-gold" />}
                  {isDirty ? "Unsave draft changes" : "All changes saved locally"}
                </li>
              </ul>

              <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-[11px] leading-relaxed text-amber-200">
                GitHub commit → push → Firebase deploy is intentionally <strong>not</strong> wired yet.
                We will review the editor in localhost first, then connect the reviewed deploy flow.
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
                >
                  <ExternalLink size={13} /> Open public site
                </a>
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="rounded-lg border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setReviewOpen(false);
                  }}
                  disabled={!isDirty}
                  className="rounded-lg bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-navy transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelGuard>
  );
}
