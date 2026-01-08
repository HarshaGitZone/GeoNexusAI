// // src/components/LandSuitabilityChecker.js
// import React, { useState, useEffect, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "../../App.css";
// import "./LandSuitabilityChecker.css"

// // Fix default marker icon issue in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// // 📍 Component to handle map clicks
// function LocationMarker({ lat, lng, setLat, setLng }) {
//   const [position, setPosition] = useState({ lat, lng });
//   const map = useMap();

//   useMapEvents({
//     click(e) {
//       setPosition(e.latlng);
//       setLat(e.latlng.lat);
//       setLng(e.latlng.lng);
//     },
//   });

//   // update marker position when lat/lng change manually
//   useEffect(() => {
//     setPosition({ lat, lng });
//     map.setView([lat, lng], map.getZoom());
//   }, [lat, lng, map]);

//   return position ? <Marker position={position} /> : null;
// }

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(17.385);
//   const [lng, setLng] = useState(78.4867);
//   const [loading, setLoading] = useState(false);
  
//   const [error, setError] = useState("");
//   const [debug, setDebug] = useState(false);
//   const [result, setResult] = useState(null);
//   const mapRef = useRef(null);

//   // Saved places (persisted in localStorage)
//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // My Location button functionality
//   const handleMyLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation not supported by this browser.");
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude);
//         setLng(pos.coords.longitude);
//       },
//       (err) => {
//         alert("Failed to get location: " + err.message);
//       }
//     );
//   };

//   // 💾 Save current location
//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const newPlace = { name, lat, lng };
//     const updated = [...savedPlaces, newPlace];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   //  Jump to a saved location
//   const handleSelectPlace = (place) => {
//     setLat(place.lat);
//     setLng(place.lng);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     setResult(null);

//     try {
//       const url = debug ? "/suitability?debug=1" : "/suitability";
//       const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
//       });
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       setResult(data);
//       // If backend returned an explicit water-body rejection, ensure UI highlights it
//       if ((data.suitability_score === 0 || (data.label && data.label.toLowerCase().includes('water'))) && data.reason) {
//         // keep result and scroll to results (basic UX)
//         try { window.scrollTo({ top: 400, behavior: 'smooth' }); } catch (e) {}
//       }
//     } catch (err) {
//       setError("Failed to fetch suitability. Please try again.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const factors = result?.factors || {};
//   const explanation = result?.explanation || {};
//   const temporal = result?.temporal_summary || {};


//   const [isDarkMode, setIsDarkMode] = useState(true);

// const toggleTheme = () => setIsDarkMode(!isDarkMode);
  

//   return (
    
//     <div className="App">
//       <header>
//         <h1>🌍 GeoAI Land Suitability</h1>
//       </header>

//       {/* MAP SECTION */}
//       <div className="panel">
//         <MapContainer
//           whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
//           center={[lat, lng]}
//           zoom={13}
//           style={{ height: "400px", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
//           />
//           <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
//         </MapContainer>
//         <div style={{ marginTop: "10px" }}>
//           Selected: Lat {lat.toFixed(4)}, Lng {lng.toFixed(4)}
//         </div>
//         <button onClick={handleMyLocation} style={{ marginTop: "10px" }}>
//           📍 My Location
//         </button>
//       </div>

      

//      {/* FORM SECTION */}
// <form className="panel" onSubmit={handleSubmit}>
//   <div className="form-row">
//     <div className="form-group">
//       <label htmlFor="lat">Latitude</label>
//       <input
//         id="lat"
//         type="number"
//         step="0.000001"
//         value={lat}
//         onChange={(e) => setLat(Number(e.target.value))}
//       />
//     </div>
//     <div className="form-group">
//       <label htmlFor="lng">Longitude</label>
//       <input
//         id="lng"
//         type="number"
//         step="0.000001"
//         value={lng}
//         onChange={(e) => setLng(Number(e.target.value))}
//       />
//     </div>
//   </div>

//   <div className="debug-row">
//     <label>
//       <input
//         type="checkbox"
//         checked={debug}
//         onChange={(e) => setDebug(e.target.checked)}
//       />{" "}
//       Enable debug mode
//     </label>
//   </div>

//   <div className="button-row">
//     <button type="submit" disabled={loading}>
//       {loading ? "Analyzing…" : "Analyze"}
//     </button>
//     <button type="button" className="save-btn" onClick={handleSavePlace}>
//       ⭐ Save This Place
//     </button>
//   </div>
//   {error && <div className="error">{error}</div>}
// </form>

  
//  {/* SAVED PLACES */}
// <div className="saved-places">
//   <h3>📍 Saved Places</h3>
//   {savedPlaces.length === 0 ? (
//     <p className="no-places">
//       No saved places yet. Click "Save This Place" to bookmark locations.
//     </p>
//   ) : (
//     <div className="saved-grid">
//       {savedPlaces.map((place, i) => (
//         <div
//           key={i}
//           className="saved-item"
//           onClick={() => handleSelectPlace(place)}
//         >
//           <div className="place-name">{place.name}</div>
//           <div className="place-coords">
//             {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
//           </div>
//         </div>
//       ))}
//     </div>
//   )}
// </div>



//       {/* RESULTS SECTION */}
//       {result && (
//         <div className="grid">
//           <div className="panel">
//             <h2>Overall Suitability</h2>
//             <div className="score">
//               <div className="score-value">{result.suitability_score?.toFixed?.(2)}</div>
//               <div
//                 className={`score-badge ${
//                   result.label?.toLowerCase()?.includes("high")
//                     ? "bad"
//                     : result.label?.toLowerCase()?.includes("moderate")
//                     ? "warn"
//                     : "good"
//                 }`}
//               >
//                 {result.label}
//               </div>
//             </div>
//             <div className="meta">
//               <div>Lat: {result.location?.latitude}</div>
//               <div>Lng: {result.location?.longitude}</div>
//               <div>{result.timestamp}</div>
//             </div>
//           </div>

//             <div className="panel">
//               <h2>Why this score?</h2>
//               <div style={{ fontSize: 14 }}>
//                 <ul>
//                   <li><strong>Top negatives:</strong> {result.top_negative_reasons ? result.top_negative_reasons.map(r=> r.factor).join(', ') : (result.explanation?.top_negative_contributors?.map(c=>c.factor).join(', ') || 'None')}</li>
//                   <li><strong>Distance to water:</strong> {result.evidence?.water_distance_km != null ? `${result.evidence.water_distance_km} km` : 'unknown'}</li>
//                   <li><strong>Recent rainfall (7/30/60d):</strong> {result.temporal_summary?.rainfall_totals_mm ? `${result.temporal_summary.rainfall_totals_mm[7]} / ${result.temporal_summary.rainfall_totals_mm[30]} / ${result.temporal_summary.rainfall_totals_mm[60]} mm` : 'not available'}</li>
//                   <li><strong>Model used:</strong> {result.model_used || 'Weighted sum / heuristic'}</li>
//                   <li><strong>Confidence:</strong> {result.explanation?.factors_meta ? Object.entries(result.explanation.factors_meta).map(([k,v])=> `${k}: ${v.confidence}`).join('; ') : 'mixed'}</li>
//                 </ul>
//               </div>
//             </div>

//           {/* <div className="panel-row"> */}
//             <div className="panel breakdown-panel">
//               <h2>Factor Breakdown (0–100)</h2>
//               <div className="bars-wrap">
//                 <FactorBar label="Rainfall (normalized)" value={factors.rainfall} impact={explanation?.deltas?.rainfall} />
//                 <FactorBar label="Flood Safety" value={factors.flood} impact={explanation?.deltas?.flood} />
//                 <FactorBar label="Landslide Safety" value={factors.landslide} impact={explanation?.deltas?.landslide} />
//                 <FactorBar label="Soil Quality" value={factors.soil} impact={explanation?.deltas?.soil} />
//                 <FactorBar label="Proximity (access/markets)" value={factors.proximity} impact={explanation?.deltas?.proximity} />
//                 <FactorBar label="Water Proximity (further is safer)" value={factors.water} impact={explanation?.deltas?.water} />
//                 <FactorBar label="Air Quality (lower PM2.5 is better)" value={factors.pollution} impact={explanation?.deltas?.pollution} />
//                 <FactorBar label="Landuse Compatibility" value={factors.landuse} impact={explanation?.deltas?.landuse} />

//                 {result?.top_negative_reasons && (
//                   <div className="top-negatives">
//                     <h4>Top Negative Contributors</h4>
//                     <ul>
//                       {result.top_negative_reasons.map((r, i) => (
//                         <li key={i}><strong>{r.factor}</strong>: {r.reason} (impact {r.impact})</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {Object.keys(temporal?.rainfall_totals_mm || {}).length > 0 && (
//                   <div className="temporal-summary">
//                     <h4>Temporal Summary</h4>
//                     <div>7d: {temporal.rainfall_totals_mm[7]} mm • 30d: {temporal.rainfall_totals_mm[30]} mm • 60d: {temporal.rainfall_totals_mm[60]} mm</div>
//                     {temporal.recent_share_of_60d_pct != null && (
//                       <div>Recent 7d is {temporal.recent_share_of_60d_pct}% of last 60d.</div>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <div className="hint">Missing factors use a conservative fallback (safer to assume risk). Bars colored by impact (green positive, red negative).</div>
//             </div>

//             <div className="panel evidence-panel">
//               <h2>Factor Evidence</h2>
//               {result?.explanation?.factors_meta ? (
//                 <div className="evidence-list">
//                   {Object.entries(result.explanation.factors_meta).map(([k, meta]) => {
//                     const delta = explanation?.deltas?.[k];
//                     let tone = 'neutral';
//                     if (delta != null) {
//                       tone = delta > 0.5 ? 'positive' : (delta < -0.5 ? 'negative' : 'neutral');
//                     }
//                     return (
//                       <div key={k} className={`evidence-item ${tone}`}>
//                         <div className="evidence-key">{k}</div>
//                         <div className="evidence-reason">{meta.reason}</div>
//                         <div className="evidence-meta">source: <strong>{meta.source}</strong> • confidence: <strong>{meta.confidence}</strong></div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               ) : (
//                 <div className="muted">No evidence available.</div>
//               )}
//             </div>
//           </div>
//         // </div>
        
//       )}
//       {/* TEAM SECTION */}
//       <div className="panel" style={{ marginTop: '16px' }}>
//         <h2>Project Team</h2>
//         {/* <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//           gap: '12px'
//         }}> */}
//         <div className="team-grid">
//           {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
//           <div className="team-card">

//             <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Adepu Vaishnavi</div>
//             <div style={{ color: '#c9d4f1' }}></div>
//           </div>
//           {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
//           <div className="team-card">

//             <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Chinni Jyothika</div>
//             <div style={{ color: '#c9d4f1' }}></div>
//           </div>
//           {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
//           <div className="team-card">

//             <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Harsha vardhan Botlagunta</div>
//             <div style={{ color: '#c9d4f1' }}></div>
//           </div>
//           {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
//           <div className="team-card">

//             <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Maganti Pranathi</div>
//             <div style={{ color: '#c9d4f1' }}></div>
//           </div>
//         </div>
//         <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #333' }}>
//           <div style={{ fontSize: 14, color: 'black' }}>Guide</div>
//           <div style={{ fontWeight: 700, fontSize: 16, color: 'black' }}>Dr. G.Naga Chandrika</div>
//         </div>
//       </div>
//     </div>
//   );
// }







// import React, { useState, useEffect, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       setLat(e.latlng.lat);
//       setLng(e.latlng.lng);
//     },
//   });

//   useEffect(() => {
//     map.setView([lat, lng], map.getZoom());
//   }, [lat, lng, map]);

//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(17.385);
//   const [lng, setLng] = useState(78.4867);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [debug, setDebug] = useState(false);
//   const [result, setResult] = useState(null);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const mapRef = useRef(null);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // Toggle Theme Logic
//   useEffect(() => {
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported.");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude);
//         setLng(pos.coords.longitude);
//       },
//       (err) => alert("Failed to get location: " + err.message)
//     );
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const newPlace = { name, lat, lng };
//     const updated = [...savedPlaces, newPlace];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const url = debug ? "/suitability?debug=1" : "/suitability";
//       const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
//       });
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       setResult(data);
//     } catch (err) {
//       setError("Failed to fetch suitability.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const factors = result?.factors || {};
//   const explanation = result?.explanation || {};
//   const temporal = result?.temporal_summary || {};

//   // Map Tile Logic based on theme
//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="dashboard-container">
//       {/* HEADER / TOP NAV */}
//       <header className="dashboard-header">
//         <div className="logo">🌍 GeoAI Land Suitability</div>
//         <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
//           {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
//         </button>
//       </header>

//       <main className="main-content">
//         {/* LEFT SIDEBAR: CONTROLS */}
//         <aside className="sidebar left-sidebar">
//           <form className="control-panel" onSubmit={handleSubmit}>
//             <h3>📍 Location Input</h3>
//             <div className="input-group">
//               <label>Latitude</label>
//               <input type="number" step="any" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
//             </div>
//             <div className="input-group">
//               <label>Longitude</label>
//               <input type="number" step="any" value={lng} onChange={(e) => setLng(Number(e.target.value))} />
//             </div>
//             <div className="button-stack">
//               <button type="button" className="secondary-btn" onClick={handleMyLocation}>My Location</button>
//               <button type="submit" className="primary-btn" disabled={loading}>
//                 {loading ? "Analyzing..." : "Analyze Terrain"}
//               </button>
//               <button type="button" className="save-btn" onClick={handleSavePlace}>⭐ Save Place</button>
//             </div>
//             <label className="debug-toggle">
//               <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} /> Enable Debug
//             </label>
//             {error && <p className="error-text">{error}</p>}
//           </form>

//           <div className="saved-places-section">
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-card" onClick={() => { setLat(p.lat); setLng(p.lng); }}>
//                   <strong>{p.name}</strong>
//                   <span>{p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </aside>

//         {/* CENTER: FULL MAP */}
//         <section className="map-view">
//           <MapContainer center={[lat, lng]} zoom={13} zoomControl={false} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} attribution="&copy; OpenStreetMap contributors" />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
//           </MapContainer>
//         </section>

//         {/* RIGHT SIDEBAR: RESULTS */}
//         <aside className={`sidebar right-sidebar ${result ? "active" : ""}`}>
//           {result ? (
//             <div className="results-wrapper">
//               <div className="result-card main-score">
//                 <h2>Suitability Score</h2>
//                 <div className="big-score">{result.suitability_score?.toFixed(1)}</div>
//                 <div className={`badge ${result.label?.toLowerCase()}`}>{result.label}</div>
//               </div>

//               <div className="result-card">
//                 <h3>Quick Insights</h3>
//                 <ul className="insights-list">
//                   <li><strong>Water:</strong> {result.evidence?.water_distance_km} km</li>
//                   <li><strong>Rain (30d):</strong> {temporal.rainfall_totals_mm?.[30]} mm</li>
//                   <li><strong>Confidence:</strong> {result.explanation?.factors_meta?.soil?.confidence || "Medium"}</li>
//                 </ul>
//               </div>

//               <div className="result-card breakdown">
//                 <h3>Factor Breakdown</h3>
//                 <div className="factor-grid">
//                   <FactorBar label="Rainfall" value={factors.rainfall} impact={explanation?.deltas?.rainfall} />
//                   <FactorBar label="Flood" value={factors.flood} impact={explanation?.deltas?.flood} />
//                   <FactorBar label="Landslide" value={factors.landslide} impact={explanation?.deltas?.landslide} />
//                   <FactorBar label="Soil" value={factors.soil} impact={explanation?.deltas?.soil} />
//                 </div>
//               </div>

//               <div className="result-card team-section">
//                 <h3>Project Team</h3>
//                 <div className="team-names">
//                   <span>A. Vaishnavi</span><span>C. Jyothika</span>
//                   <span>H. Botlagunta</span><span>M. Pranathi</span>
//                 </div>
//                 <div className="guide">Guide: Dr. G. Naga Chandrika</div>
//               </div>
//             </div>
//           ) : (
//             <div className="empty-state">Select a location and click Analyze to view data.</div>
//           )}
//         </aside>
//       </main>
//     </div>
//   );
// }










import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import FactorBar from "../FactorBar/FactorBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LandSuitabilityChecker.css";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ lat, lng, setLat, setLng }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
    },
  });

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return <Marker position={[lat, lng]} />;
}

export default function LandSuitabilityChecker() {
  const [lat, setLat] = useState(17.385);
  const [lng, setLng] = useState(78.4867);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [debug, setDebug] = useState(false);

  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = localStorage.getItem("savedPlaces");
    return stored ? JSON.parse(stored) : [];
  });
  const handleMyLocation = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    },
    (err) => alert("Error: " + err.message)
  );
};
const handleSelectPlace = (place) => {
  setLat(place.lat);
  setLng(place.lng);
};
  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleSavePlace = () => {
    const name = prompt("Enter a name for this location:");
    if (!name) return;
    const updated = [...savedPlaces, { name, lat, lng }];
    setSavedPlaces(updated);
    localStorage.setItem("savedPlaces", JSON.stringify(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/suitability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const tileLayerUrl = isDarkMode 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR - DOCKED TO EDGE */}
      <aside className="sidebar">
        {/* <div className="sidebar-top">
          <div className="brand">🌍 GeoAI</div>
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div> */}
        {/* <div className="sidebar-top">
  <div className="brand">
    <span style={{ 
      width: '8px', 
      height: '8px', 
      background: '#3b82f6', 
      borderRadius: '50%', 
      boxShadow: '0 0 10px #3b82f6' 
    }}></span>
    GeoAI
  </div>
  <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
    {isDarkMode ? "🌙" : "☀️"}
  </button>
</div> */}
<div className="sidebar-top">
  <div className="brand">
    <div className="brand-dot"></div>
    GeoAI
  </div>
  <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
    {isDarkMode ? "☀️" : "🌙"}
  </button>
</div>

        {/* <div className="sidebar-scrollable">
          <section className="control-group">
            <h3>Coordinates</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Lat</label>
                <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Lng</label>
                <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn-analyze" disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </button>
              <button type="button" onClick={handleSavePlace} className="btn-save">⭐ Save Place</button>
            </form>
          </section>

          <section className="saved-places">
            <h3>Saved Places</h3>
            <div className="places-list">
              {savedPlaces.map((p, i) => (
                <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
                  <strong>{p.name}</strong>
                  <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </section>
        </div> */}
        <div className="sidebar-scrollable">
  {/* COORDINATES SECTION - Fixed Height */}
  <section className="control-group">
    <h3>Coordinates</h3>
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Lat</label>
        <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
      </div>
      <div className="field">
        <label>Lng</label>
        <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
      </div>
    

    {/* ADD THIS: My Location Button next to Save */}
    <div style={{ display: 'flex', gap: '8px' }}>
      <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
      <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
    </div>
      <button type="submit" className="btn-analyze" disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {/* <button type="button" onClick={handleSavePlace} className="btn-save">⭐ Save Place</button> */}
    </form>
  </section>

  {/* SAVED PLACES - This will now expand and scroll internally */}
  <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
    <h3>Saved Places</h3>
    <div className="places-list">
      {savedPlaces.map((p, i) => (
        <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
          <strong>{p.name}</strong>
          <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
        </div>
      ))}
    </div>
  </section>
</div>

        <div className="sidebar-footer">
          <h4>Project Team</h4>
          <div className="team-grid">
            <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
            <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
          </div>
          <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="main-content">
        <section className="map-container">
          <MapContainer center={[lat, lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={tileLayerUrl} />
            <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
          </MapContainer>
        </section>
      <section className="results-container">
  {result ? (
    <div className="results-grid">
      {/* COLUMN 1: SCORE & ALL 8 FACTORS */}
      <div className="col-1">
        <div className="card hero-card">
          <h3>Overall Suitability</h3>
          <div className="score-value">{result.suitability_score?.toFixed(1)}</div>
          <div className={`status-pill ${result.label?.toLowerCase()}`}>{result.label}</div>
        </div>

        <div className="card factors-card">
          <h3>Terrain Factors</h3>
          <FactorBar label="Rainfall" value={result.factors.rainfall} impact={result.explanation?.deltas?.rainfall} />
          <FactorBar label="Flood Safety" value={result.factors.flood} impact={result.explanation?.deltas?.flood} />
          <FactorBar label="Landslide Safety" value={result.factors.landslide} impact={result.explanation?.deltas?.landslide} />
          <FactorBar label="Soil Quality" value={result.factors.soil} impact={result.explanation?.deltas?.soil} />
          <FactorBar label="Proximity" value={result.factors.proximity} impact={result.explanation?.deltas?.proximity} />
          <FactorBar label="Water Dist" value={result.factors.water} impact={result.explanation?.deltas?.water} />
          <FactorBar label="Air Quality" value={result.factors.pollution} impact={result.explanation?.deltas?.pollution} />
          <FactorBar label="Landuse" value={result.factors.landuse} impact={result.explanation?.deltas?.landuse} />
        </div>
      </div>

      {/* COLUMN 2: RISKS & ORDERED EVIDENCE */}
      <div className="col-2">
        {result.top_negative_reasons && (
          <div className="card risk-card">
            <h3>Critical Risks</h3>
            <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
              <li><strong>Model:</strong> {result.model_used || 'Weighted Heuristic'}</li>
              <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
              {result.temporal_summary?.rainfall_totals_mm && (
                <li><strong>Rainfall (7/30d):</strong> {result.temporal_summary.rainfall_totals_mm[7]} / {result.temporal_summary.rainfall_totals_mm[30]} mm</li>
              )}
            </ul>
            {result.top_negative_reasons.map((r, i) => (
              <div key={i} className="risk-item">
                <strong>{r.factor}:</strong> {r.reason}
              </div>
            ))}
          </div>
        )}

        <div className="card evidence-card">
          <h3>Evidence Details</h3>
          <div className="evidence-list">
            {[
  { id: 'rainfall', label: 'RAINFALL' },
  { id: 'flood', label: 'FLOOD SAFETY' },
  { id: 'landslide', label: 'LANDSLIDE SAFETY' },
  { id: 'soil', label: 'SOIL QUALITY' },
  { id: 'proximity', label: 'PROXIMITY' },
  { id: 'water', label: 'WATER DIST' },
  { id: 'pollution', label: 'AIR QUALITY' },
  { id: 'landuse', label: 'LANDUSE' }
].map((item) => {
  const val = result.factors[item.id] || 0;
  const meta = result.explanation?.factors_meta?.[item.id];
  if (!meta) return null;

  // STRICT ORDER: Red (0-39), Yellow (40-69), Green (70-100)
  const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
  const toneClass = `tone-${statusColor}`;

  return (
    <div key={item.id} className={`evidence-entry ${toneClass}`}>
      <strong>{item.label} ({val.toFixed(1)})</strong>
      <p>{meta.reason}</p>
      <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
    </div>
  );
})}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="empty-results">Complete analysis to view data.</div>
  )}
</section>
        
      </main>
    </div>
  );
}




