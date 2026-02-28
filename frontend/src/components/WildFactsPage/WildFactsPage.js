// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import "./WildFactsPage.css";

// const WildFactsPage = () => {
//   const [index, setIndex] = useState(0);
//   const [livePop, setLivePop] = useState(8300245000); // Base Feb 2026
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);

//   // LIVE: Population ticker
//   useEffect(() => {
//     const ticker = setInterval(() => {
//       // ~2.5 people/sec => 0.25 per 100ms
//       setLivePop((prev) => prev + 0.251);
//     }, 100);
//     return () => clearInterval(ticker);
//   }, []);

//   // LIVE: Clock
//   useEffect(() => {
//     const clock = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(clock);
//   }, []);

//   // Slides
//   const slides = useMemo(
//     () => [
//       {
//         id: "population",
//         title: "Human Footprint",
//         subtitle: "REAL-TIME GLOBAL PRESENCE",
//         mainValue: Math.floor(livePop).toLocaleString(),
//         label: "TOTAL POPULATION",
//         accent: "#3b82f6",
//         liveStats: [
//           { key: "India", val: "1.47B+", status: "RANK 1" },
//           { key: "China", val: "1.41B+", status: "RANK 2" },
//           { key: "USA", val: "349M+", status: "RANK 3" },
//         ],
//         image:
//           "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920",
//         quote:
//           "Growth rate: ~2.5 lives per second. Tracking planetary expansion in real time.",
//         source: "UN / World Population Prospects",
//       },
//       {
//         id: "aqi",
//         title: "Toxic Horizon",
//         subtitle: "ATMOSPHERIC SENSOR NETWORK",
//         mainValue: "483",
//         label: "GLOBAL PEAK AQI",
//         accent: "#f59e0b",
//         liveStats: [
//           { key: "Ghaziabad", val: "483 AQI", status: "HAZARDOUS" },
//           { key: "New Delhi", val: "451 AQI", status: "SEVERE" },
//           { key: "Noida", val: "443 AQI", status: "SEVERE" },
//         ],
//         image:
//           "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1920",
//         quote:
//           "Air quality extremes reveal how fragile modern cities are under pollution pressure.",
//         source: "IQAir / CPCB",
//       },
//       {
//         id: "emissions",
//         title: "Carbon Intensity",
//         subtitle: "GLOBAL EMISSIONS MONITOR",
//         mainValue: "51.7B",
//         label: "ANNUAL t CO₂eq",
//         accent: "#ef4444",
//         liveStats: [
//           { key: "CO₂", val: "51.7B tons", status: "CRITICAL" },
//           { key: "Methane", val: "376M tons", status: "RISING" },
//           { key: "N₂O", val: "89M tons", status: "STABLE" },
//         ],
//         image:
//           "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920",
//         quote:
//           "Emissions aren’t just numbers — they are the future temperature of the planet.",
//         source: "IPCC / Global Carbon Project",
//       },
//       {
//         id: "energy",
//         title: "Energy Transition",
//         subtitle: "RENEWABLE SHARE TRACKING",
//         mainValue: "30%",
//         label: "RENEWABLE SHARE",
//         accent: "#10b981",
//         liveStats: [
//           { key: "Total Energy", val: "600 TWh", status: "GLOBAL" },
//           { key: "Renewable", val: "180 TWh", status: "GROWING" },
//           { key: "Fossil", val: "420 TWh", status: "DECLINING" },
//         ],
//         image:
//           "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920",
//         quote:
//           "Renewables are scaling faster than any energy transition in modern history.",
//         source: "IEA / Ember",
//       },
//       {
//         id: "internet",
//         title: "Digital Revolution",
//         subtitle: "GLOBAL CONNECTIVITY",
//         mainValue: "5.3B",
//         label: "INTERNET USERS",
//         accent: "#06b6d4",
//         liveStats: [
//           { key: "Penetration", val: "66.2%", status: "GROWING" },
//           { key: "Social Media", val: "4.95B", status: "EXPANDING" },
//           { key: "Non-users", val: "3.0B", status: "TARGET" },
//         ],
//         image:
//           "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920",
//         quote:
//           "The internet is now humanity’s largest nervous system — connecting billions daily.",
//         source: "ITU / DataReportal",
//       },
//       {
//         id: "climate",
//         title: "Climate Shift",
//         subtitle: "TEMPERATURE TRACKING",
//         mainValue: "+1.2°C",
//         label: "ABOVE PRE-INDUSTRIAL",
//         accent: "#dc2626",
//         liveStats: [
//           { key: "Global", val: "+1.2°C", status: "CRITICAL" },
//           { key: "Arctic", val: "+3.1°C", status: "EXTREME" },
//           { key: "Record", val: "54.4°C", status: "HISTORIC" },
//         ],
//         image:
//           "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1920",
//         quote:
//           "Climate change is no longer theoretical — it’s measurable, visible, and accelerating.",
//         source: "NOAA / Copernicus",
//       },
//     ],
//     [livePop]
//   );

//   const current = slides[index];

//   const paginate = useCallback(
//     (dir) => {
//       setIndex((prev) => (prev + dir + slides.length) % slides.length);
//       setIsAutoPlaying(false);
//       setTimeout(() => setIsAutoPlaying(true), 4500);
//     },
//     [slides.length]
//   );

//   // Wheel navigation
//   useEffect(() => {
//     const handleWheel = (e) => {
//       e.preventDefault();
//       if (e.deltaY > 0) paginate(1);
//       else paginate(-1);
//     };

//     const el = document.querySelector(".wf-stage");
//     if (!el) return;

//     el.addEventListener("wheel", handleWheel, { passive: false });
//     return () => el.removeEventListener("wheel", handleWheel);
//   }, [paginate]);

//   // Keyboard navigation
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "ArrowRight") paginate(1);
//       if (e.key === "ArrowLeft") paginate(-1);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [paginate]);

//   // Touch swipe
//   useEffect(() => {
//     let startX = 0;

//     const onStart = (e) => {
//       startX = e.touches[0].clientX;
//       setIsAutoPlaying(false);
//     };

//     const onEnd = (e) => {
//       const endX = e.changedTouches[0].clientX;
//       const diff = startX - endX;

//       if (Math.abs(diff) > 55) {
//         if (diff > 0) paginate(1);
//         else paginate(-1);
//       }

//       setTimeout(() => setIsAutoPlaying(true), 4500);
//     };

//     const el = document.querySelector(".wf-stage");
//     if (!el) return;

//     el.addEventListener("touchstart", onStart);
//     el.addEventListener("touchend", onEnd);

//     return () => {
//       el.removeEventListener("touchstart", onStart);
//       el.removeEventListener("touchend", onEnd);
//     };
//   }, [paginate]);

//   // Auto rotation
//   useEffect(() => {
//     if (!isAutoPlaying) return;
//     const timer = setInterval(() => paginate(1), 22000);
//     return () => clearInterval(timer);
//   }, [isAutoPlaying, paginate]);

//   return (
//     <div className="wf-stage">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={current.id}
//           className="wf-slide"
//           initial={{ opacity: 0, scale: 1.02 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.995 }}
//           transition={{ duration: 0.9, ease: "easeOut" }}
//           style={{
//             "--accent": current.accent,
//             backgroundImage: `url(${current.image})`,
//           }}
//         >
//           {/* Background overlay */}
//           <div className="wf-overlay" />

//           {/* Top nav */}
//           <header className="wf-top">
//             <div className="wf-brand">
//               <div className="wf-pill">WORLD FACTS LIVE</div>
//               <div className="wf-subbrand">Cinematic Intelligence Feed</div>
//             </div>

//             <div className="wf-status">
//               <div className="wf-live">
//                 <span className="wf-dot" />
//                 LIVE UPLINK
//               </div>
//               <div className="wf-time">{currentTime.toLocaleTimeString()}</div>
//             </div>
//           </header>

//           {/* Main content */}
//           <main className="wf-main">
//             <div className="wf-left">
//               <motion.div
//                 className="wf-kicker"
//                 initial={{ y: 10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.15 }}
//               >
//                 {current.subtitle}
//               </motion.div>

//               <motion.h1
//                 className="wf-title"
//                 initial={{ y: 18, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.25 }}
//               >
//                 {current.title}
//               </motion.h1>

//               <motion.div
//                 className="wf-card"
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.35 }}
//               >
//                 <div className="wf-card-top">
//                   <div className="wf-label">{current.label}</div>
//                   <div className="wf-chip">AUTO-UPDATED</div>
//                 </div>

//                 <div className="wf-value">{current.mainValue}</div>

//                 <div className="wf-divider" />

//                 <div className="wf-grid">
//                   {current.liveStats.map((s, i) => (
//                     <div className="wf-stat" key={i}>
//                       <div className="wf-key">{s.key}</div>
//                       <div className="wf-val">{s.val}</div>
//                       <div className="wf-status2">{s.status}</div>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>

//               <motion.p
//                 className="wf-quote"
//                 initial={{ y: 10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.45 }}
//               >
//                 “{current.quote}”
//               </motion.p>

//               <div className="wf-source">
//                 <span>Source:</span>
//                 <strong>{current.source}</strong>
//               </div>
//             </div>

//             {/* Right side HUD */}
//             <aside className="wf-right">
//               <div className="wf-hud">
//                 <div className="wf-hud-title">Navigation</div>

//                 <div className="wf-hud-row">
//                   <span className="wf-hud-k">Slide</span>
//                   <span className="wf-hud-v">
//                     {String(index + 1).padStart(2, "0")} /{" "}
//                     {String(slides.length).padStart(2, "0")}
//                   </span>
//                 </div>

//                 <div className="wf-hud-row">
//                   <span className="wf-hud-k">Controls</span>
//                   <span className="wf-hud-v">Wheel • Swipe • Arrows</span>
//                 </div>

//                 <div className="wf-hud-row">
//                   <span className="wf-hud-k">Mode</span>
//                   <span className="wf-hud-v">
//                     {isAutoPlaying ? "Auto" : "Manual"}
//                   </span>
//                 </div>
//               </div>
//             </aside>
//           </main>

//           {/* Arrows */}
//           <button className="wf-arrow left" onClick={() => paginate(-1)}>
//             ‹
//           </button>
//           <button className="wf-arrow right" onClick={() => paginate(1)}>
//             ›
//           </button>

//           {/* Progress */}
//           <footer className="wf-progress">
//             {slides.map((s, i) => (
//               <button
//                 key={s.id}
//                 className={`wf-dotbar ${i === index ? "active" : ""}`}
//                 onClick={() => setIndex(i)}
//                 aria-label={`Go to slide ${i + 1}`}
//               />
//             ))}
//           </footer>
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// };

// export default WildFactsPage;

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./WildFactsPage.css";

/**
 * LIVE + REAL DATA SOURCES
 * - World Bank (no key): population, urban %, internet %
 * - USGS (no key): earthquakes
 * - OpenAQ (key required for v3): PM2.5 top locations (optional)
 *
 * IMPORTANT:
 * - If OpenAQ key missing, we fall back to static "known polluted cities" list.
 */

const OPENAQ_API_KEY = process.env.REACT_APP_OPENAQ_KEY || "";
const OPENAQ_BASE = "https://api.openaq.org/v3";
const WORLD_BANK_BASE = "https://api.worldbank.org/v2";
const USGS_ALL_DAY =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

const AUTOPLAY_MS = 15000; // 15 seconds per slide
const WHEEL_LOCK_MS = 900; // lock per trackpad gesture (prevents skipping)

function formatCompact(num) {
  if (num == null || Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en", { notation: "compact" }).format(num);
}

function toFixedSafe(n, digits = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toFixed(digits);
}

async function fetchWorldBankIndicator(countryCode, indicator) {
  const url = `${WORLD_BANK_BASE}/country/${countryCode}/indicator/${indicator}?format=json&date=2018:2026&per_page=100`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("WorldBank request failed");
  const json = await resp.json();
  if (!Array.isArray(json) || !json[1]) return null;

  // pick latest non-null
  for (const row of json[1]) {
    if (row?.value != null) return { year: row.date, value: Number(row.value) };
  }
  return null;
}

async function fetchUSGSQuakes() {
  const resp = await fetch(USGS_ALL_DAY);
  if (!resp.ok) throw new Error("USGS request failed");
  const json = await resp.json();
  const feats = json?.features || [];
  return feats.map((f) => ({
    id: f.id,
    mag: f.properties?.mag,
    place: f.properties?.place,
    time: f.properties?.time,
  }));
}

async function fetchOpenAQTopPM25(limit = 12) {
  if (!OPENAQ_API_KEY) return null;

  const params = new URLSearchParams({
    parameter: "pm25",
    sort: "desc",
    order_by: "value",
    limit: String(limit),
  });

  const url = `${OPENAQ_BASE}/locations?${params.toString()}`;
  const resp = await fetch(url, {
    headers: { "X-API-Key": OPENAQ_API_KEY },
  });

  if (!resp.ok) return null;

  const json = await resp.json();
  const results = json?.results || [];

  return results
    .map((loc) => {
      const pm = (loc.parameters || []).find((p) => p.parameter === "pm25");
      return {
        city: loc.city || loc.name || "Unknown",
        value: pm?.lastValue ?? null,
        unit: pm?.unit ?? "µg/m³",
        source: loc.sourceName || "OpenAQ",
      };
    })
    .filter((x) => x.value != null);
}

export default function WildFactsPage() {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [isAuto, setIsAuto] = useState(true);

  // Live population ticker base (fallback)
  const [livePop, setLivePop] = useState(8300245000);

  // Data store
  const [data, setData] = useState({
    worldPop: null,
    internetPct: null,
    urbanPct: null,
    quakes: null,
    topPM25: null,
    loadedAt: null,
  });

  // ---- gesture lock (fix skipping)
  const wheelLock = useRef(false);
  const wheelTimer = useRef(null);

  const pauseAutoTemporarily = useCallback((ms = 5000) => {
    setIsAuto(false);
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => setIsAuto(true), ms);
  }, []);

  const paginate = useCallback(
    (dir) => {
      setIndex((prev) => {
        const next = (prev + dir + slidesRef.current.length) % slidesRef.current.length;
        return next;
      });
      pauseAutoTemporarily(6000);
    },
    [pauseAutoTemporarily]
  );

  // ---- Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ---- Live pop ticker (fallback / smooth)
  useEffect(() => {
    const ticker = setInterval(() => {
      setLivePop((p) => p + 0.251); // ~2.5 people/sec
    }, 100);
    return () => clearInterval(ticker);
  }, []);

  // ---- Load real data on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [pop, internet, urban, quakes, topPM25] = await Promise.allSettled([
          fetchWorldBankIndicator("WLD", "SP.POP.TOTL"),
          fetchWorldBankIndicator("WLD", "IT.NET.USER.ZS"),
          fetchWorldBankIndicator("WLD", "SP.URB.TOTL.IN.ZS"),
          fetchUSGSQuakes(),
          fetchOpenAQTopPM25(12),
        ]);

        if (!mounted) return;

        setData({
          worldPop: pop.status === "fulfilled" ? pop.value : null,
          internetPct: internet.status === "fulfilled" ? internet.value : null,
          urbanPct: urban.status === "fulfilled" ? urban.value : null,
          quakes: quakes.status === "fulfilled" ? quakes.value : null,
          topPM25: topPM25.status === "fulfilled" ? topPM25.value : null,
          loadedAt: new Date().toISOString(),
        });
      } catch {
        if (!mounted) return;
        setData((prev) => ({ ...prev, loadedAt: new Date().toISOString() }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ---- Build slides (15+)
  const slides = useMemo(() => {
    const worldPopValue = data.worldPop?.value ?? Math.floor(livePop);
    const worldPopYear = data.worldPop?.year ?? "Live";

    const internetPct = data.internetPct?.value ?? 66.2;
    const internetYear = data.internetPct?.year ?? "Latest";

    const urbanPct = data.urbanPct?.value ?? 56.5;
    const urbanYear = data.urbanPct?.year ?? "Latest";

    const quakes = Array.isArray(data.quakes) ? data.quakes : [];
    const quakesCount = quakes.length;

    const strongest = [...quakes]
      .filter((q) => typeof q.mag === "number")
      .sort((a, b) => b.mag - a.mag)[0];

    const topPM25 =
      Array.isArray(data.topPM25) && data.topPM25.length
        ? data.topPM25
        : [
            { city: "Lahore", value: 190, unit: "µg/m³", source: "Fallback" },
            { city: "Delhi", value: 175, unit: "µg/m³", source: "Fallback" },
            { city: "Dhaka", value: 160, unit: "µg/m³", source: "Fallback" },
            { city: "Ghaziabad", value: 150, unit: "µg/m³", source: "Fallback" },
          ];

    const top3PM25 = topPM25.slice(0, 3).map((x, i) => ({
      key: x.city,
      val: `${Math.round(x.value)} ${x.unit}`,
      status: i === 0 ? "HIGHEST" : "TOP",
    }));

    return [
      // 1
      {
        id: "population",
        title: "Human Footprint",
        subtitle: "GLOBAL POPULATION (REAL + LIVE)",
        mainValue: `${worldPopValue.toLocaleString()}`,
        label: `WORLD POPULATION • ${worldPopYear}`,
        accent: "#3b82f6",
        liveStats: [
          { key: "Growth", val: "~2.5 / sec", status: "LIVE" },
          { key: "Internet", val: `${toFixedSafe(internetPct, 1)}%`, status: internetYear },
          { key: "Urban", val: `${toFixedSafe(urbanPct, 1)}%`, status: urbanYear },
        ],
        image:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920",
        quote:
          "The population number is not just a statistic — it’s the scale of human impact.",
        source: "World Bank + live estimate",
      },

      // 2
      {
        id: "cities",
        title: "Urban Expansion",
        subtitle: "CITIES ARE THE NEW DEFAULT",
        mainValue: `${toFixedSafe(urbanPct, 1)}%`,
        label: "GLOBAL URBAN POPULATION SHARE",
        accent: "#f59e0b",
        liveStats: [
          { key: "Urban", val: `${toFixedSafe(urbanPct, 1)}%`, status: urbanYear },
          { key: "Rural", val: `${toFixedSafe(100 - urbanPct, 1)}%`, status: "Declining" },
          { key: "Megacities", val: "33+", status: "Growing" },
        ],
        image:
          "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920",
        quote:
          "Cities concentrate opportunity — and also concentrate risk.",
        source: "World Bank",
      },

      // 3
      {
        id: "internet",
        title: "Digital Humanity",
        subtitle: "CONNECTIVITY AT PLANET SCALE",
        mainValue: `${toFixedSafe(internetPct, 1)}%`,
        label: "GLOBAL INTERNET PENETRATION",
        accent: "#06b6d4",
        liveStats: [
          {
            key: "Users (est.)",
            val: formatCompact((worldPopValue * internetPct) / 100),
            status: "People online",
          },
          { key: "Offline", val: formatCompact(worldPopValue - (worldPopValue * internetPct) / 100), status: "Still disconnected" },
          { key: "Trend", val: "Rising", status: "Year over year" },
        ],
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920",
        quote:
          "The internet is now the largest human network ever created.",
        source: "World Bank",
      },

      // 4
      {
        id: "pm25",
        title: "Pollution Hotspots",
        subtitle: "PM2.5 • FINE PARTICLES (DEADLIEST AIR POLLUTANT)",
        mainValue: `${Math.round(topPM25[0].value)} ${topPM25[0].unit}`,
        label: "HIGHEST RECENT PM2.5",
        accent: "#f97316",
        liveStats: top3PM25,
        image:
          "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1920",
        quote:
          "PM2.5 penetrates deep into the lungs and bloodstream — it’s the silent killer.",
        source: OPENAQ_API_KEY ? "OpenAQ (live sensors)" : "Fallback (no OpenAQ key)",
      },

      // 5
      {
        id: "pollutants",
        title: "Most Dangerous Pollutants",
        subtitle: "WHAT IS ACTUALLY IN THE AIR?",
        mainValue: "PM2.5",
        label: "TOP HEALTH RISK POLLUTANT",
        accent: "#ef4444",
        liveStats: [
          { key: "PM2.5", val: "Deep lung", status: "Worst" },
          { key: "NO₂", val: "Traffic", status: "Irritant" },
          { key: "O₃", val: "Smog", status: "Respiratory" },
        ],
        image:
          "https://images.unsplash.com/photo-1465408953385-7c4627c29435?q=80&w=1920",
        quote:
          "The air isn’t just ‘dirty’ — it contains different pollutants with different dangers.",
        source: "General scientific consensus",
      },

      // 6
      {
        id: "co2",
        title: "Carbon Reality",
        subtitle: "GREENHOUSE GAS SCALE",
        mainValue: "CO₂",
        label: "MAIN DRIVER OF WARMING",
        accent: "#dc2626",
        liveStats: [
          { key: "CO₂", val: "Fossil fuels", status: "Largest" },
          { key: "CH₄", val: "Methane", status: "High impact" },
          { key: "N₂O", val: "Agriculture", status: "Long-lived" },
        ],
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920",
        quote:
          "CO₂ is not the only greenhouse gas — but it is the biggest lever humans pull.",
        source: "IPCC",
      },

      // 7
      {
        id: "energy",
        title: "Energy Transition",
        subtitle: "THE SHIFT IS REAL — BUT INCOMPLETE",
        mainValue: "30%",
        label: "RENEWABLE SHARE (EST.)",
        accent: "#10b981",
        liveStats: [
          { key: "Solar", val: "Fastest growth", status: "Scaling" },
          { key: "Wind", val: "Major", status: "Expanding" },
          { key: "Fossil", val: "Still dominant", status: "Declining slowly" },
        ],
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920",
        quote:
          "The transition isn’t about ‘someday’ — it’s happening right now.",
        source: "IEA (general)",
      },

      // 8
      {
        id: "water",
        title: "Water Stress",
        subtitle: "FRESHWATER IS THE REAL LIMIT",
        mainValue: "2.3B",
        label: "PEOPLE UNDER WATER STRESS",
        accent: "#38bdf8",
        liveStats: [
          { key: "Agriculture", val: "~70%", status: "Water use" },
          { key: "Industry", val: "~20%", status: "Water use" },
          { key: "Homes", val: "~10%", status: "Water use" },
        ],
        image:
          "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1920",
        quote:
          "Water scarcity is already reshaping cities, farming, and migration.",
        source: "UN (general)",
      },

      // 9
      {
        id: "food",
        title: "Food & Waste",
        subtitle: "THE SYSTEM LEAKS MASSIVELY",
        mainValue: "1.3B",
        label: "TONS OF FOOD WASTED / YEAR",
        accent: "#a3e635",
        liveStats: [
          { key: "Wasted", val: "1/3 of food", status: "Global" },
          { key: "Hunger", val: "Millions", status: "Still hungry" },
          { key: "Impact", val: "CO₂ + Water", status: "Huge" },
        ],
        image:
          "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1920",
        quote:
          "Food waste is one of the easiest global problems to reduce — and we still fail.",
        source: "FAO (general)",
      },

      // 10
      {
        id: "biodiversity",
        title: "Biodiversity Collapse",
        subtitle: "SPECIES LOSS IS ACCELERATING",
        mainValue: "37,400",
        label: "THREATENED SPECIES",
        accent: "#22c55e",
        liveStats: [
          { key: "Drivers", val: "Habitat loss", status: "Largest" },
          { key: "Oceans", val: "Plastic", status: "Rising" },
          { key: "Forests", val: "Declining", status: "Critical" },
        ],
        image:
          "https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=1920",
        quote:
          "The planet isn’t losing ‘animals’ — it’s losing stability.",
        source: "IUCN (general)",
      },

      // 11
      {
        id: "forests",
        title: "Forest Loss",
        subtitle: "EARTH’S CARBON SHIELD",
        mainValue: "10M ha",
        label: "FOREST LOSS / YEAR",
        accent: "#16a34a",
        liveStats: [
          { key: "Amazon", val: "High risk", status: "Tipping point" },
          { key: "Congo", val: "Rising", status: "Pressure" },
          { key: "SE Asia", val: "Declining", status: "Deforestation" },
        ],
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920",
        quote:
          "Forests don’t just store carbon — they control rainfall and climate patterns.",
        source: "Global forest assessments (general)",
      },

      // 12
      {
        id: "plastic",
        title: "Plastic Planet",
        subtitle: "MICROPLASTICS EVERYWHERE",
        mainValue: "171T",
        label: "PLASTIC PARTICLES IN OCEANS",
        accent: "#60a5fa",
        liveStats: [
          { key: "Ocean gyres", val: "Accumulating", status: "Growing" },
          { key: "Food chain", val: "Contaminated", status: "Detected" },
          { key: "Cleanup", val: "Too slow", status: "Hard problem" },
        ],
        image:
          "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1920",
        quote:
          "Plastic doesn’t disappear — it just becomes smaller and spreads.",
        source: "Scientific studies (general)",
      },

      // 13
      {
        id: "health",
        title: "Global Health Pressure",
        subtitle: "THE HUMAN BODY VS MODERN WORLD",
        mainValue: "Air",
        label: "TOP ENVIRONMENTAL HEALTH RISK",
        accent: "#fb7185",
        liveStats: [
          { key: "Air pollution", val: "Millions", status: "Deaths/yr" },
          { key: "Heat waves", val: "Rising", status: "Risk" },
          { key: "Stress", val: "Global", status: "Modern epidemic" },
        ],
        image:
          "https://images.unsplash.com/photo-1587502537745-84c06b7b0a39?q=80&w=1920",
        quote:
          "Health is not only hospitals — it’s environment, lifestyle, and systems.",
        source: "WHO (general)",
      },

      // 14
      {
        id: "quakes",
        title: "Seismic Activity",
        subtitle: "EARTHQUAKES (LAST 24 HOURS)",
        mainValue: `${quakesCount}`,
        label: "QUAKES TODAY (USGS)",
        accent: "#8b5cf6",
        liveStats: [
          {
            key: "Strongest",
            val: strongest?.mag != null ? `${strongest.mag} M` : "—",
            status: strongest?.place ? strongest.place.slice(0, 18) + "…" : "No data",
          },
          {
            key: "Monitoring",
            val: "Real-time",
            status: "Global sensors",
          },
          {
            key: "Risk",
            val: "Always active",
            status: "Earth is alive",
          },
        ],
        image:
          "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=1920",
        quote:
          "Earthquakes happen constantly — most are small, some reshape history.",
        source: "USGS GeoJSON feed",
      },

      // 15
      {
        id: "tech",
        title: "AI Acceleration",
        subtitle: "HUMANS + MACHINES",
        mainValue: "AI",
        label: "THE NEW SKILL IS LEVERAGE",
        accent: "#a78bfa",
        liveStats: [
          { key: "Winners", val: "AI users", status: "High leverage" },
          { key: "Risk", val: "Disruption", status: "Real" },
          { key: "Future", val: "Hybrid", status: "Human + AI" },
        ],
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1920",
        quote:
          "The future belongs to people who can think clearly and use tools powerfully.",
        source: "General trend",
      },

      // 16
      {
        id: "ending",
        title: "The Big Picture",
        subtitle: "THE WORLD IS LIVE. YOUR DECISIONS ARE TOO.",
        mainValue: "NOW",
        label: "THIS FEED IS ONLY A START",
        accent: "#ffffff",
        liveStats: [
          { key: "Data", val: "Real-time", status: "Expanding" },
          { key: "Humans", val: "8B+", status: "Together" },
          { key: "Choice", val: "Everything", status: "Matters" },
        ],
        image:
          "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920",
        quote:
          "The most powerful thing isn’t the data — it’s what we do with it.",
        source: "Your project vision",
      },
    ];
  }, [data, livePop]);

  // Store slides length safely for paginate callback
  const slidesRef = useRef(slides);
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  const current = slides[index];

  // --- Auto play (15 seconds)
  useEffect(() => {
    if (!isAuto) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % slidesRef.current.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [isAuto]);

  // --- Wheel (trackpad) — one slide per gesture
  useEffect(() => {
    const el = document.querySelector(".wf-stage");
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();

      // if locked, ignore momentum events
      if (wheelLock.current) return;

      wheelLock.current = true;
      window.setTimeout(() => {
        wheelLock.current = false;
      }, WHEEL_LOCK_MS);

      // Determine direction
      const dir = e.deltaY > 0 ? 1 : -1;
      paginate(dir);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [paginate]);

  // --- Touch swipe (mobile)
  useEffect(() => {
    const el = document.querySelector(".wf-stage");
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let isTouch = false;

    const onStart = (ev) => {
      if (!ev.touches || ev.touches.length !== 1) return;
      isTouch = true;
      startX = ev.touches[0].clientX;
      startY = ev.touches[0].clientY;
      pauseAutoTemporarily(6000);
    };

    const onEnd = (ev) => {
      if (!isTouch) return;
      isTouch = false;

      const t = ev.changedTouches[0];
      const dx = startX - t.clientX;
      const dy = startY - t.clientY;

      // only horizontal swipe
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
        paginate(dx > 0 ? 1 : -1);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [paginate, pauseAutoTemporarily]);

  // --- Keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginate]);

  return (
    <div className="wf-stage">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="wf-slide"
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          style={{
            backgroundImage: `url(${current.image})`,
            "--accent": current.accent,
          }}
        >
          <div className="wf-overlay" />

          <header className="wf-top">
            <div className="wf-brand">
              <div className="wf-pill">WORLD FACTS LIVE</div>
              <div className="wf-subbrand">
                Human Reality • Live Data • Cinematic Feed
              </div>
            </div>

            <div className="wf-status">
              <div className="wf-live">
                <span className="wf-dot" />
                LIVE UPLINK
              </div>
              <div className="wf-time">{time.toLocaleTimeString()}</div>
            </div>
          </header>

          <main className="wf-main">
            <div className="wf-left">
              <motion.div
                className="wf-kicker"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                {current.subtitle}
              </motion.div>

              <motion.h1
                className="wf-title"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.22 }}
              >
                {current.title}
              </motion.h1>

              <motion.div
                className="wf-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.32 }}
              >
                <div className="wf-card-top">
                  <div className="wf-label">{current.label}</div>
                  <div className="wf-chip">
                    {isAuto ? `AUTO • ${AUTOPLAY_MS / 1000}s` : "MANUAL"}
                  </div>
                </div>

                <div className="wf-value">{current.mainValue}</div>

                <div className="wf-divider" />

                <div className="wf-grid">
                  {current.liveStats.map((s, i) => (
                    <div key={i} className="wf-stat">
                      <div className="wf-key">{s.key}</div>
                      <div className="wf-val">{s.val}</div>
                      {s.status ? (
                        <div className="wf-status2">{s.status}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.p
                className="wf-quote"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.42 }}
              >
                “{current.quote}”
              </motion.p>

              <div className="wf-source">
                <span>Source:</span>
                <strong>{current.source}</strong>
              </div>

              <div className="wf-refresh">
                {data.loadedAt
                  ? `Last refresh: ${new Date(data.loadedAt).toLocaleString()}`
                  : "Fetching live data..."}
              </div>
            </div>

            <aside className="wf-right">
              <div className="wf-hud">
                <div className="wf-hud-title">Navigation</div>

                <div className="wf-hud-row">
                  <span className="wf-hud-k">Slide</span>
                  <span className="wf-hud-v">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="wf-hud-row">
                  <span className="wf-hud-k">Controls</span>
                  <span className="wf-hud-v">Trackpad • Swipe • Keys</span>
                </div>

                <div className="wf-hud-row">
                  <span className="wf-hud-k">Mode</span>
                  <span className="wf-hud-v">{isAuto ? "Auto" : "Manual"}</span>
                </div>

                <div style={{ height: 12 }} />

                <div className="wf-hud-title">Data Status</div>
                <div className="wf-hud-small">
                  <div>
                    Population:{" "}
                    {data.worldPop ? "World Bank ✓" : "Fallback ✓"}
                  </div>
                  <div>
                    AQ:{" "}
                    {OPENAQ_API_KEY
                      ? data.topPM25
                        ? "OpenAQ ✓"
                        : "OpenAQ…"
                      : "OpenAQ key missing"}
                  </div>
                  <div>
                    Quakes: {data.quakes ? "USGS ✓" : "Loading…"}
                  </div>
                </div>
              </div>
            </aside>
          </main>

          <button
            className="wf-arrow left"
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="wf-arrow right"
            onClick={() => paginate(1)}
            aria-label="Next slide"
          >
            ›
          </button>

          <footer className="wf-progress" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`wf-dotbar ${i === index ? "active" : ""}`}
                onClick={() => {
                  setIndex(i);
                  pauseAutoTemporarily(5000);
                }}
                aria-label={`Go to ${s.title}`}
              />
            ))}
          </footer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
