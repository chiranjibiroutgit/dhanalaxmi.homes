import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const NavContext = createContext(null);
const SECTION_IDS = ["home", "properties", "about"];

/**
 * Tracks the active landing-page section with IntersectionObserver.
 * Re-registers whenever the route changes so returning home keeps working.
 */
export const NavProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState("home");
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("home");
      return;
    }

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      // A narrow band around the upper third of the viewport
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <NavContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
};
