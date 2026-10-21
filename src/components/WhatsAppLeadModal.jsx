import { useEffect, useState } from "react";
import { X, ArrowRight, Calendar, Clock, User, Phone, ShieldCheck } from "lucide-react";
import { CONTACT } from "../data/properties";

const TIME_SLOTS = ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

/** Local (not UTC) date string so "today" is correct for Indian visitors. */
const todayISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** Brand mark — keeps the WhatsApp action instantly recognisable. */
export function WhatsAppMark({ size = 18, className = "" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.11 17.39c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.21-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.39s1.02 2.78 1.16 2.97c.15.19 2.01 3.07 4.87 4.3.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z" />
      <path d="M16.02 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.47 1.71 6.42L3.2 28.8l6.56-1.72a12.75 12.75 0 0 0 6.26 1.63h.01c7.06 0 12.79-5.73 12.79-12.8 0-3.42-1.33-6.63-3.75-9.04a12.7 12.7 0 0 0-9.05-3.67zm0 23.34h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.58 10.58 0 0 1-1.62-5.56c0-5.87 4.78-10.64 10.65-10.64 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.12 7.53c0 5.87-4.78 10.63-10.67 10.63z" />
    </svg>
  );
}

/**
 * One shared lead form for every WhatsApp action.
 * It collects a unique reference, the visitor's name and number (plus date and
 * time slot for site visits) on the website BEFORE opening WhatsApp, so every
 * enquiry reaches the sales desk with a clear identity and context.
 */
export default function WhatsAppLeadModal({ config, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [error, setError] = useState("");

  const mode = config?.mode === "visit" ? "visit" : "inquiry";
  const product = config?.product || null;

  /* Reset the form each time a new WhatsApp action opens the dialog */
  useEffect(() => {
    if (!config) return;
    setName("");
    setPhone("");
    setDate(todayISO());
    setTime(TIME_SLOTS[0]);
    setError("");
  }, [config]);

  /* Escape closes, background scroll is locked while the dialog is open */
  useEffect(() => {
    if (!config) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [config, onClose]);

  if (!config) return null;

  const submit = (event) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const digits = phone.replace(/\D/g, "");

    if (cleanName.length < 2) {
      setError("Please enter your name so our advisor knows who to assist.");
      return;
    }
    if (digits.length < 10 || digits.length > 15) {
      setError("Please enter a valid mobile number (at least 10 digits).");
      return;
    }
    if (mode === "visit") {
      if (!date) {
        setError("Please choose a preferred visit date.");
        return;
      }
      if (date < todayISO()) {
        setError("Please choose today or a future date for the site visit.");
        return;
      }
    }

    const displayPhone = digits.length === 10 ? `+91 ${digits}` : `+${digits}`;
    const reference = `DL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const target = CONTACT.whatsapp.replace(/\D/g, "");

    const lines = [
      "New WhatsApp enquiry — Dhanalaxmi Group",
      `Reference: ${reference}`,
      `Name: ${cleanName}`,
      `Mobile: ${displayPhone}`,
      product ? `Project: ${product.title}` : null,
      product ? `Location: ${product.location}` : null,
      mode === "visit" ? `Preferred date: ${date}` : null,
      mode === "visit" ? `Preferred time: ${time}` : null,
      `Source: ${config.source || "Website"}`,
      "",
      mode === "visit"
        ? "Please confirm my site visit."
        : product
          ? `Please share the best negotiated price for ${product.title}.`
          : "Please share the best available options and your best negotiated price.",
    ];

    const message = lines.filter((line) => line !== null).join("\n");
    const url = `https://wa.me/${target}?text=${encodeURIComponent(message)}`;

    /* Keep a local copy so the lead is not lost if the visitor closes WhatsApp. */
    try {
      const raw = localStorage.getItem("dl_whatsapp_leads");
      const saved = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        "dl_whatsapp_leads",
        JSON.stringify([
          ...(Array.isArray(saved) ? saved : []),
          {
            reference,
            name: cleanName,
            phone: displayPhone,
            productId: product?.id || null,
            productName: product?.title || null,
            visitDate: mode === "visit" ? date : null,
            visitTime: mode === "visit" ? time : null,
            source: config.source || "Website",
            createdAt: new Date().toISOString(),
          },
        ]),
      );
    } catch {
      /* private mode / storage full — WhatsApp still opens with the message */
    }

    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-lead-title"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close WhatsApp form"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-mist text-charcoal transition hover:bg-gray-200"
        >
          <X size={17} />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]/12 text-[#128C7E]">
            <WhatsAppMark size={24} />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
              {mode === "visit" ? "Private viewing" : "Direct enquiry"}
            </p>
            <h2 id="wa-lead-title" className="font-serif text-xl font-bold leading-tight text-navy">
              {mode === "visit" ? "Book a Site Visit" : "Chat on WhatsApp"}
            </h2>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-gray-600">
          {mode === "visit"
            ? "Share your details and preferred slot. We will open WhatsApp with your visit request ready to send."
            : "Share your name and number. We will open WhatsApp with your enquiry ready to send to our sales desk."}
        </p>

        {product && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-mist p-2.5">
            <img
              src={product.thumbnail}
              alt=""
              aria-hidden="true"
              className="h-12 w-14 shrink-0 rounded-md bg-white object-contain"
            />
            <div className="min-w-0">
              <p className="truncate font-serif text-[13px] font-bold text-navy">{product.title}</p>
              <p className="truncate text-[10px] text-gray-500">{product.location}</p>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="wa-name" className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal">
              <User size={12} strokeWidth={2.2} /> Full Name
            </label>
            <input
              id="wa-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div>
            <label htmlFor="wa-phone" className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal">
              <Phone size={12} strokeWidth={2.2} /> Mobile Number
            </label>
            <input
              id="wa-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 8917622925"
              className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {mode === "visit" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wa-date" className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal">
                  <Calendar size={12} strokeWidth={2.2} /> Date
                </label>
                <input
                  id="wa-date"
                  name="date"
                  type="date"
                  required
                  min={todayISO()}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div>
                <label htmlFor="wa-time" className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal">
                  <Clock size={12} strokeWidth={2.2} /> Time
                </label>
                <select
                  id="wa-time"
                  name="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#25D366]/25 transition-all hover:bg-[#128C7E] active:scale-[0.99]"
          >
            Continue to WhatsApp <ArrowRight size={15} strokeWidth={2.6} />
          </button>

          <p className="flex items-start gap-1.5 text-[9px] leading-relaxed text-gray-400">
            <ShieldCheck size={12} strokeWidth={2.2} className="mt-0.5 shrink-0 text-green" />
            Guaranteed – Negotiation by contact. Your details are used only to prepare this WhatsApp message.
          </p>
        </form>
      </div>
    </div>
  );
}
