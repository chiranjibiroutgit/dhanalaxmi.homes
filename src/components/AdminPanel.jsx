import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PanelGuard } from "./PanelGuard";
import {
  Building2,
  MapPin,
  Heart,
  Phone,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Plus,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

const FILTERS = ["All", "Pending", "Approved", "Disliked"];

const SEED_LISTINGS = [
  {
    id: "lst_1",
    title: "Sea Princess-1",
    location: "Puri, Odisha",
    type: "Apartment",
    price: "₹1,599/ SQ. FT.",
    status: "approved",
    reason: "",
  },
  {
    id: "lst_2",
    title: "Blu Marina",
    location: "Puri, Odisha",
    type: "Villa",
    price: "₹2,999/SQ. FT.",
    status: "approved",
    reason: "",
  },
  {
    id: "lst_3",
    title: "Sea Breeze Residency",
    location: "Chandrabhaga, Puri",
    type: "Apartment",
    price: "₹92 Lakhs*",
    status: "pending",
    reason: "",
  },
  {
    id: "lst_4",
    title: "Puri Beachfront Plots",
    location: "Sipasurubili, Puri",
    type: "Plot",
    price: "₹38 Lakhs*",
    status: "disliked",
    reason: "Incomplete title documentation and pending approvals.",
  },
];

const STATUS_STYLES = {
  approved: "bg-green/10 text-green border-green/20",
  pending: "bg-amber-400/10 text-amber-600 border-amber-400/30",
  disliked: "bg-red-500/10 text-red-600 border-red-500/20",
};

const STATUS_LABELS = {
  approved: "Approved",
  pending: "Pending review",
  disliked: "Disliked",
};

const TYPES = ["Apartment", "Villa", "Plot", "Commercial"];

export default function AdminPanel() {
  const { user } = useAuth();

  const [listings, setListings] = useState(SEED_LISTINGS);
  const [filter, setFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [dislikeTarget, setDislikeTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ title: "", location: "", type: "Apartment", price: "" });
  const [formError, setFormError] = useState("");

  const notify = (message, tone = "ok") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  };

  const counts = useMemo(
    () => ({
      total: listings.length,
      approved: listings.filter((l) => l.status === "approved").length,
      pending: listings.filter((l) => l.status === "pending").length,
      disliked: listings.filter((l) => l.status === "disliked").length,
    }),
    [listings],
  );

  const visible = useMemo(
    () => (filter === "All" ? listings : listings.filter((l) => l.status === filter.toLowerCase())),
    [listings, filter],
  );

  const setStatus = (id, status, rejectionReason = "") => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, reason: rejectionReason } : l)),
    );
  };

  const handleApprove = (listing) => {
    setStatus(listing.id, "approved");
    notify(`"${listing.title}" approved and queued for the public site.`);
  };

  const handleDislikeConfirm = () => {
    if (!dislikeTarget) return;
    setStatus(dislikeTarget.id, "disliked", reason.trim());
    notify(`"${dislikeTarget.title}" disliked — reason saved.`, "warn");
    setDislikeTarget(null);
    setReason("");
  };

  const handleRestore = (listing) => {
    setStatus(listing.id, "pending");
    notify(`"${listing.title}" moved back to pending review.`, "warn");
  };

  const handleAdd = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.price.trim()) {
      setFormError("Title, location and price are required.");
      return;
    }
    const listing = {
      id: `lst_${Date.now()}`,
      ...form,
      status: "pending",
      reason: "",
    };
    setListings((prev) => [listing, ...prev]);
    setForm({ title: "", location: "", type: "Apartment", price: "" });
    setFormError("");
    setAddOpen(false);
    notify("Listing submitted for review.");
  };

  return (
    <PanelGuard panelPath="/admin.panel">
      <div className="min-h-screen bg-mist">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
          <div className="container-luxury flex flex-col justify-between gap-4 px-6 py-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Building2 size={20} strokeWidth={2} className="text-gold" />
              <div>
                <h1 className="font-serif text-xl font-bold text-navy">Admin Panel</h1>
                <p className="text-[11px] uppercase tracking-wider text-gray-500">Property Owner Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="hidden text-[11px] font-medium text-gray-600 md:block">
                {user?.name} • Property Owner
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                {user?.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="container-luxury py-8 md:py-10">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">My Listings</span>
                <Heart size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-navy">{counts.total}</span>
                <span className="text-[11px] text-gray-500">total</span>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Review</span>
                <Calendar size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-navy">{counts.pending}</span>
                <span className="text-[11px] text-gray-500">awaiting decision</span>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Disliked</span>
                <ThumbsDown size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-navy">{counts.disliked}</span>
                <span className="text-[11px] text-gray-500">rejected listings</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Listings + review */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy">My Listings</h2>
                    <p className="text-[11px] text-gray-500">
                      Approve to publish, or dislike with a reason to reject.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-gold hover:text-navy"
                  >
                    <Plus size={14} strokeWidth={3} /> Add Listing
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-mist/50 px-5 py-3">
                  {FILTERS.map((f) => {
                    const count =
                      f === "All" ? counts.total : counts[f.toLowerCase()] ?? 0;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                          filter === f
                            ? "bg-navy text-white"
                            : "border border-gray-200 bg-white text-gray-500 hover:border-gold"
                        }`}
                      >
                        {f} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="divide-y divide-gray-50">
                  {visible.map((listing) => (
                    <div key={listing.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-[16px] font-bold text-navy">{listing.title}</h3>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_STYLES[listing.status]}`}
                          >
                            {STATUS_LABELS[listing.status]}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} strokeWidth={2} className="text-gold" /> {listing.location}
                          </span>
                          <span>{listing.type}</span>
                          <span className="font-semibold text-navy">{listing.price}</span>
                        </div>
                        {listing.status === "disliked" && listing.reason && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-[10px] text-red-500">
                            <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {listing.reason}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {listing.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(listing)}
                            className="inline-flex items-center gap-1 rounded-lg border border-green/30 bg-green/5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-green transition hover:bg-green hover:text-white"
                            title="Approve listing"
                          >
                            <ThumbsUp size={12} /> Approve
                          </button>
                        )}
                        {listing.status !== "disliked" && (
                          <button
                            type="button"
                            onClick={() => {
                              setDislikeTarget(listing);
                              setReason("");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-red-500 transition hover:bg-red-500 hover:text-white"
                            title="Dislike / reject listing"
                          >
                            <ThumbsDown size={12} /> Dislike
                          </button>
                        )}
                        {listing.status !== "pending" && (
                          <button
                            type="button"
                            onClick={() => handleRestore(listing)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-500 transition hover:border-gold hover:text-navy"
                            title="Move back to pending"
                          >
                            <RotateCcw size={12} /> Pending
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {visible.length === 0 && (
                    <div className="px-5 py-12 text-center">
                      <p className="text-sm font-semibold text-navy">Nothing in this view</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Switch the filter to see your other listings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Leads + actions */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-serif text-xl font-bold text-navy">Recent Leads</h3>
                <ul className="space-y-3">
                  {[
                    { name: "Rohan Mishra", prop: "Sea Princess-1", time: "2 hrs ago" },
                    { name: "Anita Patnaik", prop: "Blu Marina", time: "5 hrs ago" },
                    { name: "Siddharth Rao", prop: "Panchtattva ATC", time: "1 day ago" },
                  ].map((lead) => (
                    <li key={lead.name} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="text-sm font-semibold text-navy">{lead.name}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin size={12} strokeWidth={2} /> {lead.prop}
                      </div>
                      <div className="mt-1 text-[10px] text-gray-400">{lead.time}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-serif text-xl font-bold text-navy">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => notify("Callback request sent to the sales desk.")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-gold hover:text-navy"
                  >
                    <Phone size={15} /> Request Callback
                  </button>
                  <button
                    type="button"
                    onClick={() => notify("Site visits open in the Dev Panel calendar.")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-[11px] font-bold uppercase tracking-wider text-charcoal transition hover:bg-mist"
                  >
                    <Calendar size={15} /> View Site Visits
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add listing modal */}
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-navy">Add New Listing</h2>
                  <p className="text-[11px] text-gray-500">Submitted listings start as pending review.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy"
                  aria-label="Close add listing"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-[11px] text-red-600">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {formError}
                </div>
              )}

              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                    Property title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Sea Breeze Residency"
                    className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Puri, Odisha"
                    className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      {TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                      Price
                    </label>
                    <input
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="₹85 Lakhs*"
                      className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-[11px] font-bold uppercase tracking-wider text-navy transition hover:bg-navy hover:text-gold"
                >
                  <Check size={15} strokeWidth={3} /> Submit for Review
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Dislike reason modal */}
        {dislikeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-navy">Dislike this listing?</h2>
                  <p className="mt-1 text-[11px] text-gray-500">
                    "{dislikeTarget.title}" will be marked as rejected and hidden from publishing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDislikeTarget(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy"
                  aria-label="Close dislike dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Missing title document, unclear pricing, wrong project details..."
                className="w-full rounded-lg border border-gray-200 bg-mist px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDislikeTarget(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDislikeConfirm}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-red-600"
                >
                  <ThumbsDown size={13} /> Dislike & Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-[70] flex items-start gap-2 rounded-xl border px-4 py-3 text-[12px] shadow-2xl ${
              toast.tone === "warn"
                ? "border-amber-400/40 bg-amber-50 text-amber-700"
                : "border-green/30 bg-green/5 text-green"
            }`}
          >
            {toast.tone === "warn" ? (
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            ) : (
              <Check size={15} className="mt-0.5 shrink-0" />
            )}
            {toast.message}
          </div>
        )}
      </div>
    </PanelGuard>
  );
}
