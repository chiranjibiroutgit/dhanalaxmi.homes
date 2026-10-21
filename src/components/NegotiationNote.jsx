import { ShieldCheck } from "lucide-react";

/**
 * The promise shown beside every listed price.
 * Keeps the client on the website while making it clear that the final price is
 * open to a direct conversation.
 */
export default function NegotiationNote({ className = "", iconSize = 11, short = false }) {
  return (
    <p
      className={`inline-flex items-start gap-1.5 font-bold uppercase leading-snug tracking-[0.08em] text-green ${className}`}
    >
      <ShieldCheck size={iconSize} strokeWidth={2.4} className="mt-0.5 shrink-0" />
      {short ? "Negotiation by contact" : "Guaranteed – Negotiation by contact"}
    </p>
  );
}
