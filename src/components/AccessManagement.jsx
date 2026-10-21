import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, Users, Trash2, ShieldCheck } from "lucide-react";

/**
 * Access Management Section
 * Founder/Developer can invite and manage property owners (50 max)
 */
export const AccessManagement = () => {
  const { user } = useAuth();
  const [owners, setOwners] = useState([
    { id: 1, email: "owner1@example.com", name: "Ramesh Properties", properties: 3, status: "active", joined: "2024-01-15" },
    { id: 2, email: "owner2@example.com", name: "Sunrise Realty", properties: 1, status: "active", joined: "2024-02-20" },
    { id: 3, email: "owner3@example.com", name: "Coastal Builders", properties: 5, status: "suspended", joined: "2024-03-10" },
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const inviteOwner = (e) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setInviteLoading(true);
    setTimeout(() => {
      setOwners([...owners, {
        id: owners.length + 1,
        email: newEmail,
        name: newName,
        properties: 0,
        status: "pending",
        joined: new Date().toISOString().split("T")[0],
      }]);
      setNewEmail("");
      setNewName("");
      setInviteLoading(false);
    }, 600);
  };

  const toggleStatus = (id) => {
    setOwners(owners.map((o) =>
      o.id === id ? { ...o, status: o.status === "active" ? "suspended" : "active" } : o
    ));
  };

  const removeOwner = (id) => {
    if (window.confirm("Remove this owner's access?")) {
      setOwners(owners.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy mb-2">Access Management</h2>
            <p className="text-gray-600 text-sm">Invite and manage property owners (max 50). Founder: {user?.email}</p>
          </div>
          <button
            onClick={() => setInviteLoading(false)}
            className="hidden md:flex items-center gap-2 btn-primary"
          >
            <Plus size={16} strokeWidth={2.5} /> Invite New Owner
          </button>
        </div>

        {/* Invite Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-10">
          <h3 className="font-serif font-bold text-xl text-navy mb-4">Invite Property Owner</h3>
          <form onSubmit={inviteOwner} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
                Owner Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full px-4 py-3 rounded-lg bg-mist border border-gray-200 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
                Company / Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ramesh Properties"
                className="w-full px-4 py-3 rounded-lg bg-mist border border-gray-200 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full py-3 bg-navy text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all hover:bg-gold hover:text-navy disabled:opacity-60"
              >
                {inviteLoading ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          </form>
          <p className="mt-3 text-[10px] text-gray-400 italic">
            Maximum 50 property owners. Invited owners receive Google Login access to /admin.panel only.
          </p>
        </div>

        {/* Owners Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="border-b border-gray-100 bg-mist/60 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users size={18} strokeWidth={2} className="text-gold" />
                <span className="font-serif font-bold text-xl text-navy">Property Owners ({owners.length}/50)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Managed by {user?.name}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-gray-50">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Owner</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Properties</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-[10px] font-bold text-charcoal">
                          {owner.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-navy text-sm">{owner.name}</div>
                          <div className="text-[11px] text-gray-500 uppercase">{owner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-serif font-bold text-navy text-sm">{owner.properties}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          owner.status === "active"
                            ? "bg-green/10 text-green border border-green/20"
                            : owner.status === "suspended"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-gray/10 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {owner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-600">{owner.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(owner.id)}
                          className="p-2 rounded-md text-gray-400 hover:text-gold transition-colors"
                          aria-label="Toggle status"
                        >
                          <ShieldCheck size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => removeOwner(owner.id)}
                          className="p-2 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove owner"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default AccessManagement;
