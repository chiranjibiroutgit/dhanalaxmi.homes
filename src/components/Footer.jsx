import { useSiteContent } from "../context/SiteContentContext";

export default function Footer() {
  const { content } = useSiteContent();
  const { brand, contact } = content;

  return (
    <footer className="bg-navy text-white border-t border-white/10">
      <div className="container-luxury py-12 md:py-16">
        <div className="mb-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold text-[10px] font-bold text-navy">
                {brand.monogram}
              </div>
              <div className="leading-none">
                <div data-edit-key="brand.name" className="font-serif text-lg font-bold tracking-[0.1em] text-white">
                  {brand.name}
                </div>
                <div data-edit-key="brand.subtitle" className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-gray-400">
                  {brand.subtitle}
                </div>
              </div>
            </div>
            <p data-edit-key="contact.tagline" className="max-w-xs text-[13px] leading-relaxed text-gray-400">
              {contact.tagline}
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Explore</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#home" className="hover:text-gold transition-colors">Home</a></li>
              <li><a href="#properties" className="hover:text-gold transition-colors">Properties</a></li>
              <li><a href="#about" className="hover:text-gold transition-colors">About Us</a></li>
              <li><a href="/cart" className="hover:text-gold transition-colors">My Cart</a></li>
              <li><a href="/me" className="hover:text-gold transition-colors">My Account</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Contact</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">📞</span>
                <span data-edit-key="contact.phone" className="break-all">
                  {contact.phone}, {contact.phone2}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">✉️</span>
                <span data-edit-key="contact.email" className="break-all">{contact.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">📍</span>
                <span data-edit-key="contact.address">{contact.address}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Compliance</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-gold transition-colors">Project Documentation</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Legal Disclaimers</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} {brand.name} Group. All rights reserved. Domain: {contact.domain}
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-gray-400 text-xs">
              in
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-gray-400 text-xs">
              f
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-gray-400 text-xs">
              ⌘
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
