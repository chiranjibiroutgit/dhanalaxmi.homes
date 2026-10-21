import { createContext, useCallback, useContext, useMemo, useState } from "react";
import WhatsAppLeadModal from "../components/WhatsAppLeadModal";

const WhatsAppLeadContext = createContext(null);

/**
 * One provider owns the lead dialog for the whole site.
 * Any component can call openWhatsAppLead({ mode, product, source }) and the
 * visitor is asked for their name, number (and visit slot) before WhatsApp opens.
 */
export function WhatsAppLeadProvider({ children }) {
  const [config, setConfig] = useState(null);

  const openWhatsAppLead = useCallback((options = {}) => {
    setConfig({
      mode: options.mode === "visit" ? "visit" : "inquiry",
      product: options.product || null,
      source: options.source || "Website",
    });
  }, []);

  const closeWhatsAppLead = useCallback(() => setConfig(null), []);

  const value = useMemo(
    () => ({ openWhatsAppLead, closeWhatsAppLead }),
    [openWhatsAppLead, closeWhatsAppLead],
  );

  return (
    <WhatsAppLeadContext.Provider value={value}>
      {children}
      <WhatsAppLeadModal config={config} onClose={closeWhatsAppLead} />
    </WhatsAppLeadContext.Provider>
  );
}

export function useWhatsAppLead() {
  const context = useContext(WhatsAppLeadContext);
  if (!context) throw new Error("useWhatsAppLead must be used within WhatsAppLeadProvider");
  return context;
}
