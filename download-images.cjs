const fs = require("fs");
const path = require("path");

const ids = [
  "1507525428034-b723cf961d3e",
  "1519046904884-53103b34b206",
  "1520454974749-611b7248ffdb",
  "1540541338287-41700207dee6",
  "1571003123894-1f0594d2b5d9",
  "1564013799919-ab600027ffc6",
  "1568605114967-8130f3a36994",
  "1600585154340-be6161a56a0c",
  "1600607687939-ce8a6c25118c",
  "1600566753086-00f18fb6b3ea",
  "1613977257363-707ba9348227",
  "1613490493576-7fde63acd811",
  "1512917774080-9991f1c4c750",
  "1449844908441-8829872d2607",
  "1494526585095-c41746248156",
  "1523217582562-09d0def993a6",
  "1560448204-e02f11c3d0e2",
  "1502005229762-cf1b2da7c5d6",
  "1505693416388-ac5ce068fe85",
  "1522708323590-d24dbb6b0267",
  "1560185007-cde436f6a4d0",
  "1502672260266-1c1ef2d93688",
  "1493809842364-78817add7ffb",
  "1554995207-c18c203602cb",
  "1567767292278-a4f21aa2d36e",
  "1600210492486-724fe5c67fb0",
  "1600607687920-4e2a09cf159d",
  "1600566753190-17f0baa2a6c3",
  "1600607687644-c7171b42498f",
  "1582268611958-ebfd161ef9cf",
  "1571896349842-33c89424de2d",
  "1500937386664-56d1dfef3854",
  "1540946485063-a40da27545f8",
  "1567899378494-47b22a2ae96a",
  "1599643478518-a784e5dc4c8f",
  "1548013146-72479768bada",
  "1561361513-2d000a50f0dc",
  "1500382017468-9049fed747ef",
  "1499793983690-e29da59ef1c2",
  "1518780664697-55e3ad937233",
  "1600047509807-ba8f99d2cdde",
  "1613977257592-4871e5fcd7c4",
  "1600607688969-a5bfcd646154",
];

const dir = path.join(process.cwd(), "public", "images", "products");
fs.mkdirSync(dir, { recursive: true });

const results = [];

async function one(id) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;
  const file = path.join(dir, `u_${id}.jpg`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return { id, status: res.status };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) return { id, status: "tiny" };
    fs.writeFileSync(file, buf);
    return { id, status: 200, kb: Math.round(buf.length / 1024) };
  } catch (e) {
    return { id, status: e.name };
  }
}

(async () => {
  const queue = [...ids];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const id = queue.shift();
      const r = await one(id);
      results.push(r);
      console.log(r.status === 200 ? `OK   ${id} ${r.kb}KB` : `FAIL ${id} ${r.status}`);
    }
  });
  await Promise.all(workers);
  const ok = results.filter((r) => r.status === 200);
  fs.writeFileSync(path.join(dir, "valid.json"), JSON.stringify(ok, null, 2));
  console.log(`\nVALID ${ok.length}/${ids.length}`);
})();
