import { useLocation } from "react-router-dom";
import { useWhatsAppLead } from "../context/WhatsAppLeadContext";
import { WhatsAppMark } from "./WhatsAppLeadModal";

/**
 * Site-wide conversion hook. It stays out of property pages because those
 * already carry their own WhatsApp controls beside the call button.
 */
export default function WhatsAppFab() {
  const { pathname } = useLocation();
  const { openWhatsAppLead } = useWhatsAppLead();

  if (pathname.startsWith("/property/")) return null;

  return (
    <button
      type="button"
      onClick={() =>
        openWhatsAppLead({ mode: "inquiry", source: "Floating WhatsApp button" })
      }
      aria-label="Chat on WhatsApp for the best negotiated price"
      className="fixed bottom-5 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_30px_-8px_rgba(18,140,126,0.65)] transition-all hover:bg-[#128C7E] hover:shadow-[0_16px_36px_-8px_rgba(18,140,126,0.75)] active:scale-95 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3 lg:bottom-6 lg:right-6"
    >
      <WhatsAppMark size={19} />
      <span className="hidden sm:inline">WhatsApp</span>
    </button>
  );
}
