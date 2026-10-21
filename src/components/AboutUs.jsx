import { ArrowRight, MapPin, User, Phone, Mail, Calendar, ShieldCheck } from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";

export default function AboutUs() {
  const { content } = useSiteContent();
  const about = content.about;
  const metrics = about.metrics?.length ? about.metrics : [];

  return (
    <section id="about" className="py-16 md:py-24 bg-mist">
      <div className="container-luxury">
        <div className="section-header mb-16">
          <h2 data-edit-key="about.heading" className="gold-underline inline-block">{about.heading}</h2>
          <p data-edit-key="about.tagline" className="mt-2">{about.tagline}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="serif">
              <h3 data-edit-key="about.title" className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4">
                {about.title}
              </h3>
              <p data-edit-key="about.body1" className="text-gray-600 leading-relaxed text-sm md:text-base">
                {about.body1}
              </p>
              <p data-edit-key="about.body2" className="text-gray-600 leading-relaxed mt-4 text-sm md:text-base">
                {about.body2}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {metrics.map((m, i) => (
                <div key={i} data-edit-key={`about.metrics.${i}`} className="p-4 bg-white rounded-xl border border-gray-100">
                  <div className="text-2xl font-serif font-bold text-gold">{m.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {[
              { name: "Integrity", desc: "Strict documentation checks, zero hidden clauses, complete lifecycle title transparency." },
              { name: "Prosperity", desc: "Creating wealth-building, appreciating real estate assets." },
              { name: "Refinement", desc: "Curated specifications, luxury imported finishes, functional spatial architecture." },
              { name: "Agility", desc: "E-commerce browsing speed and digital convenience across web and mobile." },
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-gold/30 transition-colors">
                <ShieldCheck size={20} strokeWidth={2.5} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-navy text-sm">{v.name}</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="section-header mb-10">
            <h2 className="gold-underline inline-block">Client Testimonials</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Rohan Mishra",
                role: "Homebuyer, Sea Princess-1",
                text: "Transparent pricing and on-time possession. Truly a generational asset.",
                rating: 5,
              },
              {
                name: "Anita Patnaik",
                role: "Investor, Panchtattva ATC",
                text: "Excellent rental yields from tourist footfall. Professional and trustworthy team.",
                rating: 5,
              },
              {
                name: "Siddharth Rao",
                role: "Homebuyer, Blu Marina",
                text: "Luxury meets comfort at Blu Marina. Exceeded every expectation. Five stars.",
                rating: 5,
              },
            ].map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-1 text-gold mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-mist flex items-center justify-center text-navy font-bold text-[10px]">{t.name.charAt(0)}</div>
                  <div>
                    <div className="text-sm font-bold text-navy">{t.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="mt-16 rounded-3xl bg-navy p-8 md:p-12 text-center text-white">
          <h3 className="serif text-3xl md:text-4xl font-bold mb-4">Ready to find your dream property?</h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto text-sm">Explore our curated portfolio of luxury residential and commercial assets across Puri and beyond.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-3 bg-gold text-navy font-bold text-sm rounded-full hover:bg-white transition-colors">Browse Properties</button>
            <button className="px-8 py-3 border border-white text-white font-bold text-sm rounded-full hover:bg-white/10 transition-colors">Book a Site Visit</button>
          </div>
        </div>
      </div>
    </section>
  );
}
