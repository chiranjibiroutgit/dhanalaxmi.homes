const fs = require("fs");
const path = require("path");

// Curated from the contact sheets — each photo matches the project type.
// Delivered at 1600x1000 (16:10) so heroes fill the frame at the correct ratio.
const picks = [
  // Panchtattva — commercial tourism / resort hospitality near Puri beach
  ["panchtattva-1.jpg", "1540541338287-41700207dee6"], // resort infinity pool over ocean
  ["panchtattva-2.jpg", "1582268611958-ebfd161ef9cf"], // resort villa + pool
  ["panchtattva-3.jpg", "1499793983690-e29da59ef1c2"], // tropical beach resort
  ["panchtattva-4.jpg", "1519046904884-53103b34b206"], // palm beach, umbrella

  // Sea Princess-1 — sea-facing luxury apartments
  ["seaprincess-1.jpg", "1507525428034-b723cf961d3e"], // beach sunset
  ["seaprincess-2.jpg", "1560448204-e02f11c3d0e2"],    // bright living room
  ["seaprincess-3.jpg", "1522708323590-d24dbb6b0267"], // modern apartment interior
  ["seaprincess-4.jpg", "1505693416388-ac5ce068fe85"], // luxury bedroom

  // Blu Marina — marina villas with private docks
  ["blumarina-1.jpg", "1567899378494-47b22a2ae96a"],   // yacht on turquoise water
  ["blumarina-2.jpg", "1613490493576-7fde63acd811"],   // modern villa + pool
  ["blumarina-3.jpg", "1571896349842-33c89424de2d"],   // villa lit pool at dusk
  ["blumarina-4.jpg", "1540946485063-a40da27545f8"],   // sailboat on sea

  // Sea Heaven — tropical Sun/Sea/Sand condominiums
  ["seaheaven-1.jpg", "1571003123894-1f0594d2b5d9"],   // overwater cabanas at sunset
  ["seaheaven-2.jpg", "1613977257363-707ba9348227"],   // villa pool + palms
  ["seaheaven-3.jpg", "1613977257592-4871e5fcd7c4"],   // white villa pool
  ["seaheaven-4.jpg", "1512917774080-9991f1c4c750"],   // villa + pool at dusk

  // Sea Sand Lodge — beachfront residence / lodge / plots
  ["seasand-1.jpg", "1564013799919-ab600027ffc6"],     // coastal villa + pool + palms
  ["seasand-2.jpg", "1449844908441-8829872d2607"],     // lodge cabin in greenery
  ["seasand-3.jpg", "1518780664697-55e3ad937233"],     // red lodge cabin on hill
  ["seasand-4.jpg", "1561361513-2d000a50f0dc"],        // beach lifestyle
];

const dir = path.join(process.cwd(), "public", "images", "products");
const base = "https://images.unsplash.com/photo-";

(async () => {
  for (const [name, id] of picks) {
    const url = `${base}${id}?auto=format&fit=crop&w=1600&h=1000&q=82`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(path.join(dir, name), buf);
      console.log(`OK   ${name} ${Math.round(buf.length / 1024)}KB`);
    } catch (e) {
      console.log(`FAIL ${name} ${e.message}`);
    }
  }
})();
