// import React, { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
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
//   const [result, setResult] = useState(null);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported.");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude);
//         setLng(pos.coords.longitude);
//       },
//       (err) => alert("Error: " + err.message)
//     );
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   useEffect(() => {
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   // --- THE FIXED SUBMIT LOGIC ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null); // CRITICAL: Reset state to prevent "undefined rainfall" error on 2nd search
//     setLoading(true);
//     try {
//       const response = await fetch("/suitability", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
//       });
//       const data = await response.json();
//       setResult(data);
//     } catch (err) {
//       console.error("Analysis failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <div className="sidebar-top">
//           <div className="brand">
//             <div className="brand-dot"></div>
//             GeoAI
//           </div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
//             {isDarkMode ? "☀️" : "🌙"}
//           </button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Coordinates</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>
//                 {loading ? "Analyzing..." : "Analyze"}
//               </button>
//             </form>
//           </section>

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <strong>{p.name}</strong>
//                       <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
//                     </div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)} title="Delete Place">🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//             <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//             <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//       </aside>

//       <main className="main-content">
//         <section className="map-container">
//           <MapContainer center={[lat, lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
//           </MapContainer>
//         </section>

//         {/* <section className="results-container">
//           {loading && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {result ? (
//             <div className="results-grid">
//               <div className="col-1">
//                 <div className="card hero-card">
//                   <h3>Overall Suitability</h3>
//                   <div className="score-value">{result.suitability_score?.toFixed(1)}</div>
//                   <div className={`status-pill ${result.label?.toLowerCase()}`}>{result.label}</div>
//                 </div>

//                 <div className="card factors-card">
//                   <h3>Terrain Factors</h3>
//                   {result?.factors ? (
//                     <>
//                       <FactorBar label="Rainfall" value={result.factors.rainfall} />
//                       <FactorBar label="Flood Safety" value={result.factors.flood} />
//                       <FactorBar label="Landslide Safety" value={result.factors.landslide} />
//                       <FactorBar label="Soil Quality" value={result.factors.soil} />
//                       <FactorBar label="Proximity" value={result.factors.proximity} />
//                       <FactorBar label="Water Dist" value={result.factors.water} />
//                       <FactorBar label="Air Quality" value={result.factors.pollution} />
//                       <FactorBar label="Landuse" value={result.factors.landuse} />
//                     </>
//                   ) : (
//                     <p>No detailed factors available for this location.</p>
//                   )}
//                 </div>
//               </div>

//               {result.suitability_score === 0 && (
//                 <div className="water-alert-box" style={{ 
//                     backgroundColor: '#fee2e2', 
//                     border: '1px solid #ef4444', 
//                     padding: '15px', 
//                     borderRadius: '8px',
//                     gridColumn: '1 / -1',
//                     marginBottom: '20px' 
//                 }}>
//                   <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Water Body Detected</h3>
//                   <p style={{ color: '#7f1d1d', lineHeight: '1.5' }}>{result.reason}</p>
//                 </div>
//               )}

//               <div className="col-2">
//                 {result.top_negative_reasons && result.top_negative_reasons.length > 0 && (
//                   <div className="card risk-card">
//                     <h3>Critical Risks</h3>
//                     <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
//                       <li><strong>Model:</strong> {result.model_used || 'Hard Constraint'}</li>
//                       <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
//                     </ul>
//                     {result.top_negative_reasons.map((r, i) => (
//                       <div key={i} className="risk-item">
//                         <strong>{r.factor}:</strong> {r.reason}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {result.factors && [
//                       { id: 'rainfall', label: 'RAINFALL' },
//                       { id: 'flood', label: 'FLOOD SAFETY' },
//                       { id: 'landslide', label: 'LANDSLIDE SAFETY' },
//                       { id: 'soil', label: 'SOIL QUALITY' },
//                       { id: 'proximity', label: 'PROXIMITY' },
//                       { id: 'water', label: 'WATER DIST' },
//                       { id: 'pollution', label: 'AIR QUALITY' },
//                       { id: 'landuse', label: 'LANDUSE' }
//                     ].map((item) => {
//                       const val = result.factors[item.id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[item.id];
//                       if (!meta) return null;

//                       const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//                       return (
//                         <div key={item.id} className={`evidence-entry tone-${statusColor}`}>
//                           <strong>{item.label} ({val.toFixed(1)})</strong>
//                           <p>{meta.reason}</p>
//                           <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="empty-results">Complete analysis to view data.</div>
//           )}
//         </section> */}
//         {/* <section className="results-container">
//   {loading && <div className="loading-overlay">Analyzing Terrain...</div>}
  
//   {result ? (
//     <div className="results-grid">
      
//       <div className="col-1">
//         <div className="card hero-card">
//           <h3>Overall Suitability</h3>

//           <div 
//             className="score-value" 
//             style={{ 
//               color: result.suitability_score < 40 ? "#ef4444" : 
//                      result.suitability_score < 70 ? "#f59e0b" : "#10b981" 
//             }}
//           >
//             {result.suitability_score?.toFixed(1)}
//           </div>
//           <div className={`status-pill ${result.label?.toLowerCase()}`}>{result.label}</div>
//         </div>

//         <div className="card factors-card">
//           <h3>Terrain Factors</h3>
//           {result?.factors ? (
//             <>
//               <FactorBar label="Rainfall" value={result.factors.rainfall} />
//               <FactorBar label="Flood Safety" value={result.factors.flood} />
//               <FactorBar label="Landslide Safety" value={result.factors.landslide} />
//               <FactorBar label="Soil Quality" value={result.factors.soil} />
//               <FactorBar label="Proximity" value={result.factors.proximity} />
//               <FactorBar label="Water Dist" value={result.factors.water} />
//               <FactorBar label="Air Quality" value={result.factors.pollution} />
//               <FactorBar label="Landuse" value={result.factors.landuse} />
//             </>
//           ) : (
//             <p>No detailed factors available for this location.</p>
//           )}
//         </div>
//       </div>


//       <div className="col-2">
        
//         {result.suitability_score === 0 && (
//           <div className="water-alert-box" style={{ 
//               backgroundColor: '#fee2e2', 
//               border: '1px solid #ef4444', 
//               padding: '15px', 
//               borderRadius: '8px',
//               marginBottom: '20px' 
//           }}>
//             <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Water Body Detected</h3>
//             <p style={{ color: '#7f1d1d', lineHeight: '1.5' }}>{result.reason}</p>
//           </div>
//         )}

//         {result.suitability_score > 0 && result.top_negative_reasons && result.top_negative_reasons.length > 0 && (
//           <div className="card risk-card">
//             <h3>Critical Risks</h3>
//             <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
//               <li><strong>Model:</strong> {result.model_used || 'Hard Constraint'}</li>
//               <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
//             </ul>
//             {result.top_negative_reasons.map((r, i) => (
//               <div key={i} className="risk-item">
//                 <strong>{r.factor}:</strong> {r.reason}
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="card evidence-card">
//           <h3>Evidence Details</h3>
//           <div className="evidence-list">
//             {result.factors && [
//               { id: 'rainfall', label: 'RAINFALL' },
//               { id: 'flood', label: 'FLOOD SAFETY' },
//               { id: 'landslide', label: 'LANDSLIDE SAFETY' },
//               { id: 'soil', label: 'SOIL QUALITY' },
//               { id: 'proximity', label: 'PROXIMITY' },
//               { id: 'water', label: 'WATER DIST' },
//               { id: 'pollution', label: 'AIR QUALITY' },
//               { id: 'landuse', label: 'LANDUSE' }
//             ].map((item) => {
//               const val = result.factors[item.id] ?? 0;
//               const meta = result.explanation?.factors_meta?.[item.id];
//               if (!meta) return null;

//               const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//               return (
//                 <div key={item.id} className={`evidence-entry tone-${statusColor}`}>
//                   <strong>{item.label} ({val.toFixed(1)})</strong>
//                   <p>{meta.reason}</p>
//                   <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   ) : (
//     <div className="empty-results">Complete analysis to view data.</div>
//   )}
// </section> */}
//   <section className="results-container">
//   {loading && <div className="loading-overlay">Analyzing Terrain...</div>}
  
//   {result ? (
//     <div className="results-grid">
//       {/* COLUMN 1: LEFT SIDE (Scores and Bars) */}
//       <div className="col-1">
//         {/* <div className="card hero-card glass-morphic">
//           <h3>Overall Suitability</h3>
          
      
//           <div 
//             className="score-value" 
//             style={{ 
//               color: result.suitability_score < 40 ? "#ef4444" :
//                      result.suitability_score < 70 ? "#f59e0b" : 
//                      "#10b981", 
//               textShadow: result.suitability_score < 40 ? "0 0 20px rgba(239, 68, 68, 0.3)" : "none"
//             }}
//           >
//             {result.suitability_score?.toFixed(1)}
//           </div>
          
//           <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>
//             {result.label}
//           </div>
//         </div> */}
//         <div className={`card hero-card glass-morphic ${result.suitability_score < 40 ? 'danger-glow' : ''}`}>
//           <h3>Overall Suitability</h3>
//           {/* <div 
//             className="score-value" 
//             style={{ 
//               color: result.suitability_score < 40 ? "#ef4444" : // Force RED for 0.0 scores
//                     result.suitability_score < 70 ? "#f59e0b" : 
//                     "#10b981",
//               textShadow: result.suitability_score < 40 ? "0 0 15px rgba(239, 68, 68, 0.4)" : "none"
//             }}
//           >
//             {result.suitability_score?.toFixed(1)}
//           </div> */}
//           {/* <div className="score-value" style={{ color: result.suitability_score < 40 ? "#ef4444 !important" :  result.suitability_score < 70 ? "#f59e0b !important" : "#10b981 !important",
//               textShadow: result.suitability_score < 40 ? "0 0 20px rgba(239, 68, 68, 0.5)" : "none",
//               fontWeight: "800"
//             }}
//           >
//             {result.suitability_score?.toFixed(1)}
//           </div> */}
//           <div 
//               className="score-value" 
//               // style={{ 
//               //   color: result.suitability_score < 40 ? "#ef4444 !important" : 
//               //         result.suitability_score < 70 ? "#f59e0b !important" : 
//               //         "#10b981 !important",
//               //   textShadow: result.suitability_score < 40 ? "0 0 30px rgba(239, 68, 68, 0.6)" : "none"
//               // }}
//               style={{ "--score-color": result.suitability_score < 40 ? "#ef4444" : result.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//               {result.suitability_score?.toFixed(1)}
//             </div>
//           <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>
//             {result.label}
//           </div>
//         </div>

//         <div className="card factors-card">
//           <h3>Terrain Factors</h3>
//           {result?.factors ? (
//             <>
//               <FactorBar label="Rainfall" value={result.factors.rainfall} />
//               <FactorBar label="Flood Safety" value={result.factors.flood} />
//               <FactorBar label="Landslide Safety" value={result.factors.landslide} />
//               <FactorBar label="Soil Quality" value={result.factors.soil} />
//               <FactorBar label="Proximity" value={result.factors.proximity} />
//               <FactorBar label="Water Dist" value={result.factors.water} />
//               <FactorBar label="Air Quality" value={result.factors.pollution} />
//               <FactorBar label="Landuse" value={result.factors.landuse} />
//             </>
//           ) : (
//             <p>No detailed factors available for this location.</p>
//           )}
//         </div>
//       </div>

//       {/* COLUMN 2: RIGHT SIDE (Alerts, Risks, and Evidence) */}
//       <div className="col-2">
//         {/* Water Alert Box - Positioned in the right column */}
//         {result.suitability_score === 0 && (
//           <div className="water-alert-box glass-morphic-alert" style={{ 
//               backgroundColor: '#fee2e2', 
//               border: '1px solid #ef4444', 
//               padding: '15px', 
//               borderRadius: '8px',
//               marginBottom: '20px' 
//           }}>
//             <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Water Body Detected</h3>
//             <p style={{ color: '#7f1d1d', lineHeight: '1.5' }}>{result.reason}</p>
//           </div>
//         )}

//         {/* Critical Risks shown only if score > 0 */}
//         {result.suitability_score > 0 && result.top_negative_reasons && result.top_negative_reasons.length > 0 && (
//           <div className="card risk-card">
//             <h3>Critical Risks</h3>
//             <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
//               <li><strong>Model:</strong> {result.model_used || 'Hard Constraint'}</li>
//               <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
//             </ul>
//             {result.top_negative_reasons.map((r, i) => (
//               <div key={i} className="risk-item">
//                 <strong>{r.factor}:</strong> {r.reason}
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="card evidence-card">
//           <h3>Evidence Details</h3>
//           <div className="evidence-list">
//             {result.factors && [
//               { id: 'rainfall', label: 'RAINFALL' },
//               { id: 'flood', label: 'FLOOD SAFETY' },
//               { id: 'landslide', label: 'LANDSLIDE SAFETY' },
//               { id: 'soil', label: 'SOIL QUALITY' },
//               { id: 'proximity', label: 'PROXIMITY' },
//               { id: 'water', label: 'WATER DIST' },
//               { id: 'pollution', label: 'AIR QUALITY' },
//               { id: 'landuse', label: 'LANDUSE' }
//             ].map((item) => {
//               const val = result.factors[item.id] ?? 0;
//               const meta = result.explanation?.factors_meta?.[item.id];
//               if (!meta) return null;

//               const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//               return (
//                 <div key={item.id} className={`evidence-entry tone-${statusColor}`}>
//                   <strong>{item.label} ({val.toFixed(1)})</strong>
//                   <p>{meta.reason}</p>
//                   <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   ) : (
//     <div className="empty-results">Complete analysis to view data.</div>
//   )}
// </section>
//       </main>
//     </div>
//   );
// }











// import React, { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// // Helper component to handle location and zoom state updates
// function LocationMarker({ lat, lng, setLat, setLng, setZoom }) {
//   const map = useMap();
  
//   useMapEvents({
//     click(e) {
//       setLat(e.latlng.lat);
//       setLng(e.latlng.lng);
//     },
//     zoomend() {
//       // Capture the zoom level when the user stops zooming
//       setZoom(map.getZoom());
//     },
//   });

//   useEffect(() => {
//     // Keep the view in sync with the persisted coordinates
//     map.setView([lat, lng], map.getZoom());
//   }, [lat, lng, map]);

//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   // 1. INITIALIZATION: Load all values from localStorage
//   const [lat, setLat] = useState(() => {
//     const savedLat = localStorage.getItem("geo_lat");
//     return savedLat ? Number(savedLat) : 17.385;
//   });
  
//   const [lng, setLng] = useState(() => {
//     const savedLng = localStorage.getItem("geo_lng");
//     return savedLng ? Number(savedLng) : 78.4867;
//   });

//   const [zoom, setZoom] = useState(() => {
//     const savedZoom = localStorage.getItem("geo_zoom");
//     return savedZoom ? Number(savedZoom) : 13;
//   });

//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const savedTheme = localStorage.getItem("geo_theme");
//     return savedTheme !== null ? JSON.parse(savedTheme) : true;
//   });

//   const [result, setResult] = useState(() => {
//     const savedResult = localStorage.getItem("geo_last_result");
//     return savedResult ? JSON.parse(savedResult) : null;
//   });

//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // 2. PERSISTENCE: Save values when they change
//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//   }, [lat, lng]);

//   useEffect(() => {
//     localStorage.setItem("geo_zoom", zoom);
//   }, [zoom]);

//   useEffect(() => {
//     localStorage.setItem("geo_theme", isDarkMode);
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   useEffect(() => {
//     if (result) {
//       localStorage.setItem("geo_last_result", JSON.stringify(result));
//     }
//   }, [result]);

//   // Handlers (Ditto Logic)
//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported.");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude);
//         setLng(pos.coords.longitude);
//       },
//       (err) => alert("Error: " + err.message)
//     );
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null); 
//     setLoading(true);
//     try {
//       const response = await fetch("/suitability", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
//       });
//       const data = await response.json();
//       setResult(data);
//     } catch (err) {
//       console.error("Analysis failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <div className="sidebar-top">
//           <div className="brand">
//             <div className="brand-dot"></div>
//             GeoAI
//           </div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
//             {isDarkMode ? "☀️" : "🌙"}
//           </button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Coordinates</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>
//                 {loading ? "Analyzing..." : "Analyze"}
//               </button>
//             </form>
//           </section>

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <strong>{p.name}</strong>
//                       <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
//                     </div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)} title="Delete Place">🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//             <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//             <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//       </aside>

//       <main className="main-content">
//         <section className="map-container">
//           <MapContainer 
//             center={[lat, lng]} 
//             zoom={zoom} 
//             style={{ height: "100%", width: "100%" }}
//           >
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker 
//               lat={lat} 
//               lng={lng} 
//               setLat={setLat} 
//               setLng={setLng} 
//               setZoom={setZoom} 
//             />
//           </MapContainer>
//         </section>

//         <section className="results-container">
//           {loading && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {result ? (
//             <div className="results-grid">
//               <div className="col-1">
//                 <div className={`card hero-card glass-morphic ${result.suitability_score < 40 ? 'danger-glow' : ''}`}>
//                   <h3>Overall Suitability</h3>
//                   <div 
//                     className="score-value" 
//                     style={{ "--score-color": result.suitability_score < 40 ? "#ef4444" : result.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//                     {result.suitability_score?.toFixed(1)}
//                   </div>
//                   <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>
//                     {result.label}
//                   </div>
//                 </div>

//                 <div className="card factors-card">
//                   <h3>Terrain Factors</h3>
//                   {result?.factors ? (
//                     <>
//                       <FactorBar label="Rainfall" value={result.factors.rainfall} />
//                       <FactorBar label="Flood Safety" value={result.factors.flood} />
//                       <FactorBar label="Landslide Safety" value={result.factors.landslide} />
//                       <FactorBar label="Soil Quality" value={result.factors.soil} />
//                       <FactorBar label="Proximity" value={result.factors.proximity} />
//                       <FactorBar label="Water Dist" value={result.factors.water} />
//                       <FactorBar label="Air Quality" value={result.factors.pollution} />
//                       <FactorBar label="Landuse" value={result.factors.landuse} />
//                     </>
//                   ) : (
//                     <p>No detailed factors available for this location.</p>
//                   )}
//                 </div>
//               </div>

//               <div className="col-2">
//                 {result.suitability_score === 0 && (
//                   <div className="water-alert-box glass-morphic-alert" style={{ 
//                       backgroundColor: '#fee2e2', 
//                       border: '1px solid #ef4444', 
//                       padding: '15px', 
//                       borderRadius: '8px',
//                       marginBottom: '20px' 
//                   }}>
//                     <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Water Body Detected</h3>
//                     <p style={{ color: '#7f1d1d', lineHeight: '1.5' }}>{result.reason}</p>
//                   </div>
//                 )}

//                 {result.suitability_score > 0 && result.top_negative_reasons && result.top_negative_reasons.length > 0 && (
//                   <div className="card risk-card">
//                     <h3>Critical Risks</h3>
//                     <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
//                       <li><strong>Model:</strong> {result.model_used || 'Hard Constraint'}</li>
//                       <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
//                     </ul>
//                     {result.top_negative_reasons.map((r, i) => (
//                       <div key={i} className="risk-item">
//                         <strong>{r.factor}:</strong> {r.reason}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {result.factors && [
//                       { id: 'rainfall', label: 'RAINFALL' },
//                       { id: 'flood', label: 'FLOOD SAFETY' },
//                       { id: 'landslide', label: 'LANDSLIDE SAFETY' },
//                       { id: 'soil', label: 'SOIL QUALITY' },
//                       { id: 'proximity', label: 'PROXIMITY' },
//                       { id: 'water', label: 'WATER DIST' },
//                       { id: 'pollution', label: 'AIR QUALITY' },
//                       { id: 'landuse', label: 'LANDUSE' }
//                     ].map((item) => {
//                       const val = result.factors[item.id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[item.id];
//                       if (!meta) return null;

//                       const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//                       return (
//                         <div key={item.id} className={`evidence-entry tone-${statusColor}`}>
//                           <strong>{item.label} ({val.toFixed(1)})</strong>
//                           <p>{meta.reason}</p>
//                           <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="empty-results">Complete analysis to view data.</div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }


// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// // Helper component to handle location and zoom state updates
// function LocationMarker({ lat, lng, setLat, setLng, setZoom }) {
//   const map = useMap();
  
//   useMapEvents({
//     click(e) {
//       setLat(e.latlng.lat);
//       setLng(e.latlng.lng);
//     },
//     zoomend() {
//       setZoom(map.getZoom());
//     },
//   });

//   useEffect(() => {
//     map.setView([lat, lng], map.getZoom());
//   }, [lat, lng, map]);

//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   // 1. INITIALIZATION: Load all values from localStorage
//   const [lat, setLat] = useState(() => {
//     const savedLat = localStorage.getItem("geo_lat");
//     return savedLat ? Number(savedLat) : 17.385;
//   });
  
//   const [lng, setLng] = useState(() => {
//     const savedLng = localStorage.getItem("geo_lng");
//     return savedLng ? Number(savedLng) : 78.4867;
//   });

//   const [zoom, setZoom] = useState(() => {
//     const savedZoom = localStorage.getItem("geo_zoom");
//     return savedZoom ? Number(savedZoom) : 13;
//   });

//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const savedTheme = localStorage.getItem("geo_theme");
//     return savedTheme !== null ? JSON.parse(savedTheme) : true;
//   });

//   const [result, setResult] = useState(() => {
//     const savedResult = localStorage.getItem("geo_last_result");
//     return savedResult ? JSON.parse(savedResult) : null;
//   });

//   // --- RESIZABLE SIDEBAR STATE ---
//   const [sidebarWidth, setSidebarWidth] = useState(() => {
//     const savedWidth = localStorage.getItem("sidebar_width");
//     return savedWidth ? Number(savedWidth) : 350; // Default 350px
//   });
//   const isResizing = useRef(false);

//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // 2. PERSISTENCE: Save values when they change
//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//   }, [lat, lng]);

//   useEffect(() => {
//     localStorage.setItem("geo_zoom", zoom);
//   }, [zoom]);

//   useEffect(() => {
//     localStorage.setItem("geo_theme", isDarkMode);
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   useEffect(() => {
//     if (result) {
//       localStorage.setItem("geo_last_result", JSON.stringify(result));
//     }
//   }, [result]);

//   useEffect(() => {
//     localStorage.setItem("sidebar_width", sidebarWidth);
//   }, [sidebarWidth]);

//   // --- RESIZE HANDLERS ---
//   const startResizing = useCallback(() => {
//     isResizing.current = true;
//     document.addEventListener("mousemove", resizeSidebar);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//     // Disable pointer events on map while resizing to prevent lag
//     document.querySelector('.map-container').style.pointerEvents = 'none';
//   }, [sidebarWidth]);

//   const stopResizing = useCallback(() => {
//     isResizing.current = false;
//     document.removeEventListener("mousemove", resizeSidebar);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//     document.querySelector('.map-container').style.pointerEvents = 'auto';
//   }, []);

//   const resizeSidebar = useCallback((e) => {
//     if (!isResizing.current) return;
//     const newWidth = e.clientX;
//     if (newWidth > 250 && newWidth < 600) { // Constraint: Min 250px, Max 600px
//       setSidebarWidth(newWidth);
//     }
//   }, []);

//   // Handlers (Ditto Logic)
//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation not supported.");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude);
//         setLng(pos.coords.longitude);
//       },
//       (err) => alert("Error: " + err.message)
//     );
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null); 
//     setLoading(true);
//     try {
//       const response = await fetch("/suitability", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
//       });
//       const data = await response.json();
//       setResult(data);
//     } catch (err) {
//       console.error("Analysis failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell">
//       {/* UPDATE: Sidebar now uses dynamic width and has a resize handle 
//       */}
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px` }}>
//         <div className="sidebar-top">
//           <div className="brand">
//             <div className="brand-dot"></div>
//             GeoAI
//           </div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
//             {isDarkMode ? "☀️" : "🌙"}
//           </button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Coordinates</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>
//                 {loading ? "Analyzing..." : "Analyze"}
//               </button>
//             </form>
//           </section>

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                       <strong>{p.name}</strong>
//                       <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
//                     </div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)} title="Delete Place">🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//             <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//             <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>

//         {/* --- RESIZE HANDLE --- */}
//         <div 
//           className="sidebar-resizer" 
//           onMouseDown={startResizing}
//           style={{
//             position: 'absolute',
//             top: 0,
//             right: 0,
//             width: '5px',
//             height: '100%',
//             cursor: 'col-resize',
//             zIndex: 10,
//             background: 'transparent'
//           }}
//         />
//       </aside>

//       <main className="main-content">
//         <section className="map-container">
//           <MapContainer 
//             center={[lat, lng]} 
//             zoom={zoom} 
//             style={{ height: "100%", width: "100%" }}
//           >
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker 
//               lat={lat} 
//               lng={lng} 
//               setLat={setLat} 
//               setLng={setLng} 
//               setZoom={setZoom} 
//             />
//           </MapContainer>
//         </section>

//         <section className="results-container">
//           {loading && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {result ? (
//             <div className="results-grid">
//               <div className="col-1">
//                 <div className={`card hero-card glass-morphic ${result.suitability_score < 40 ? 'danger-glow' : ''}`}>
//                   <h3>Overall Suitability</h3>
//                   <div 
//                     className="score-value" 
//                     style={{ "--score-color": result.suitability_score < 40 ? "#ef4444" : result.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//                     {result.suitability_score?.toFixed(1)}
//                   </div>
//                   <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>
//                     {result.label}
//                   </div>
//                 </div>

//                 <div className="card factors-card">
//                   <h3>Terrain Factors</h3>
//                   {result?.factors ? (
//                     <>
//                       <FactorBar label="Rainfall" value={result.factors.rainfall} />
//                       <FactorBar label="Flood Safety" value={result.factors.flood} />
//                       <FactorBar label="Landslide Safety" value={result.factors.landslide} />
//                       <FactorBar label="Soil Quality" value={result.factors.soil} />
//                       <FactorBar label="Proximity" value={result.factors.proximity} />
//                       <FactorBar label="Water Dist" value={result.factors.water} />
//                       <FactorBar label="Air Quality" value={result.factors.pollution} />
//                       <FactorBar label="Landuse" value={result.factors.landuse} />
//                     </>
//                   ) : (
//                     <p>No detailed factors available for this location.</p>
//                   )}
//                 </div>
//               </div>

//               <div className="col-2">
//                 {result.suitability_score === 0 && (
//                   <div className="water-alert-box glass-morphic-alert" style={{ 
//                       backgroundColor: '#fee2e2', 
//                       border: '1px solid #ef4444', 
//                       padding: '15px', 
//                       borderRadius: '8px',
//                       marginBottom: '20px' 
//                   }}>
//                     <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Water Body Detected</h3>
//                     <p style={{ color: '#7f1d1d', lineHeight: '1.5' }}>{result.reason}</p>
//                   </div>
//                 )}

//                 {result.suitability_score > 0 && result.top_negative_reasons && result.top_negative_reasons.length > 0 && (
//                   <div className="card risk-card">
//                     <h3>Critical Risks</h3>
//                     <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
//                       <li><strong>Model:</strong> {result.model_used || 'Hard Constraint'}</li>
//                       <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
//                     </ul>
//                     {result.top_negative_reasons.map((r, i) => (
//                       <div key={i} className="risk-item">
//                         <strong>{r.factor}:</strong> {r.reason}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {result.factors && [
//                       { id: 'rainfall', label: 'RAINFALL' },
//                       { id: 'flood', label: 'FLOOD SAFETY' },
//                       { id: 'landslide', label: 'LANDSLIDE SAFETY' },
//                       { id: 'soil', label: 'SOIL QUALITY' },
//                       { id: 'proximity', label: 'PROXIMITY' },
//                       { id: 'water', label: 'WATER DIST' },
//                       { id: 'pollution', label: 'AIR QUALITY' },
//                       { id: 'landuse', label: 'LANDUSE' }
//                     ].map((item) => {
//                       const val = result.factors[item.id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[item.id];
//                       if (!meta) return null;

//                       const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//                       return (
//                         <div key={item.id} className={`evidence-entry tone-${statusColor}`}>
//                           <strong>{item.label} ({val.toFixed(1)})</strong>
//                           <p>{meta.reason}</p>
//                           <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="empty-results">Complete analysis to view data.</div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }







// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       setLat(e.latlng.lat);
//       setLng(e.latlng.lng);
//     },
//     zoomend() {
//       setZoom(map.getZoom());
//     },
//   });
//   useEffect(() => {
//     map.setView([lat, lng], map.getZoom());
//   }, [lat, lng, map]);
//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   // 1. INITIALIZATION & PERSISTENCE
//   const [lat, setLat] = useState(() => Number(localStorage.getItem("geo_lat")) || 17.385);
//   const [lng, setLng] = useState(() => Number(localStorage.getItem("geo_lng")) || 78.4867);
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   // --- RESIZABLE LAYOUT STATE ---
//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 350);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 400);
  
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);
//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // Sync to LocalStorage
//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result]);

//   // --- RESIZE LOGIC ---
//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, []);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, []);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, []);

//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 150 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   // Ditto Handlers
//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude);
//       setLng(pos.coords.longitude);
//     });
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null); 
//     setLoading(true);
//     try {
//       const response = await fetch("/suitability", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
//       });
//       const data = await response.json();
//       setResult(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
//       {/* SIDEBAR */}
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot"></div>GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Coordinates</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>
//             </form>
//           </section>

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div><strong>{p.name}</strong><span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span></div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)}>🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//             <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//             <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>

//         {/* VERTICAL RESIZER HANDLE */}
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} style={{ position: 'absolute', right: 0, top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 10 }} />
//       </aside>

//       {/* MAIN CONTENT AREA */}
//       <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
//         {/* MAP SECTION (Top) */}
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} />
//           </MapContainer>
//         </section>

//         {/* HORIZONTAL RESIZER HANDLE */}
//         <div 
//           className="horizontal-resizer" 
//           onMouseDown={startResizingBottom} 
//           style={{ height: '6px', width: '100%', cursor: 'row-resize', background: 'transparent', zIndex: 100 }} 
//         />

//         {/* RESULTS SECTION (Bottom) */}
//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {loading && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {result ? (
//             <div className="results-grid">
//               <div className="col-1">
//                 <div className={`card hero-card glass-morphic ${result.suitability_score < 40 ? 'danger-glow' : ''}`}>
//                   <h3>Overall Suitability</h3>
//                   <div className="score-value" style={{ "--score-color": result.suitability_score < 40 ? "#ef4444" : result.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//                     {result.suitability_score?.toFixed(1)}
//                   </div>
//                   <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>{result.label}</div>
//                 </div>
//                 <div className="card factors-card">
//                   <h3>Terrain Factors</h3>
//                   <FactorBar label="Rainfall" value={result.factors.rainfall} />
//                   <FactorBar label="Flood Safety" value={result.factors.flood} />
//                   <FactorBar label="Landslide Safety" value={result.factors.landslide} />
//                   <FactorBar label="Soil Quality" value={result.factors.soil} />
//                   <FactorBar label="Proximity" value={result.factors.proximity} />
//                   <FactorBar label="Water Dist" value={result.factors.water} />
//                   <FactorBar label="Air Quality" value={result.factors.pollution} />
//                   <FactorBar label="Landuse" value={result.factors.landuse} />
//                 </div>
//               </div>

//               <div className="col-2">
//                 {result.suitability_score === 0 && (
//                   <div className="water-alert-box glass-morphic-alert" style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
//                     <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Water Body Detected</h3>
//                     <p style={{ color: '#7f1d1d' }}>{result.reason}</p>
//                   </div>
//                 )}
//                 {result.suitability_score > 0 && result.top_negative_reasons?.length > 0 && (
//                   <div className="card risk-card">
//                     <h3>Critical Risks</h3>
//                     <ul style={{ fontSize: '13px', paddingLeft: '15px', color: 'var(--text)', marginBottom: '15px' }}>
//                       <li><strong>Model:</strong> {result.model_used || 'Hard Constraint'}</li>
//                       <li><strong>Water Dist:</strong> {result.evidence?.water_distance_km || '0'} km</li>
//                     </ul>
//                     {result.top_negative_reasons.map((r, i) => (
//                       <div key={i} className="risk-item"><strong>{r.factor}:</strong> {r.reason}</div>
//                     ))}
//                   </div>
//                 )}
//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {result.factors && ['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map((id) => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//                       return (
//                         <div key={id} className={`evidence-entry tone-${statusColor}`}>
//                           <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//                           <p>{meta.reason}</p>
//                           <small>Source: {meta.source} | Confidence: {meta.confidence}</small>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="empty-results">Complete analysis to view data.</div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }




//compare started
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       setLat(e.latlng.lat);
//       setLng(e.latlng.lng);
//     },
//     zoomend() {
//       setZoom(map.getZoom());
//     },
//   });
//   useEffect(() => {
//     map.setView([lat, lng], map.getZoom());
//   }, [lat, lng, map]);
//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   // 1. INITIALIZATION & PERSISTENCE
//   const [lat, setLat] = useState(() => Number(localStorage.getItem("geo_lat")) || 17.385);
//   const [lng, setLng] = useState(() => Number(localStorage.getItem("geo_lng")) || 78.4867);
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   // --- NEW COMPARISON STATE ---
//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [compareLoading, setCompareLoading] = useState(false);

//   // --- RESIZABLE LAYOUT STATE ---
//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 350);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 400);
  
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);
//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // Sync to LocalStorage
//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result]);

//   // --- RESIZE LOGIC ---
//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, []);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, []);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, []);

//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 150 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   // Handlers
//   const fetchAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: tLat, longitude: tLng, debug }),
//     });
//     return await response.json();
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude);
//       setLng(pos.coords.longitude);
//     });
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null); 
//     setCompareResult(null);
//     setIsCompareMode(false);
//     setLoading(true);
//     try {
//       const data = await fetchAnalysis(lat, lng);
//       setResult(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompareSelection = async (targetLat, targetLng) => {
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     try {
//       const data = await fetchAnalysis(targetLat, targetLng);
//       setCompareResult(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setCompareLoading(false);
//     }
//   };

//   const promptCustomCompare = () => {
//     const cLat = prompt("Enter Latitude for comparison:");
//     const cLng = prompt("Enter Longitude for comparison:");
//     if (cLat && cLng) handleCompareSelection(Number(cLat), Number(cLng));
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   // Helper component to render a result column
//   const ResultColumn = ({ data, title }) => (
//     <div className="compare-column" style={{ flex: 1, padding: '10px', borderRight: '1px solid rgba(128,128,128,0.2)', minWidth: '300px' }}>
//       <h4 style={{ textAlign: 'center', margin: '0 0 10px 0', color: 'var(--primary)' }}>{title}</h4>
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <h3>Overall Score</h3>
//         <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//           {data.suitability_score?.toFixed(1)}
//         </div>
//         <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//       </div>
      
//       <div className="card factors-card">
//         <h3>Terrain Factors</h3>
//         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//           <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f]} />
//         ))}
//       </div>

//       {data.top_negative_reasons?.length > 0 && (
//         <div className="card risk-card">
//           <h3>Critical Risks</h3>
//           {data.top_negative_reasons.map((r, i) => (
//             <div key={i} className="risk-item"><strong>{r.factor}:</strong> {r.reason}</div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="app-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot"></div>GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Coordinates</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "Analyzing..." : "Analyze Current"}</button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group" style={{marginTop: '15px'}}>
//               <h3>Compare Locations</h3>
//               <div className="compare-menu">
//                 <p style={{fontSize: '11px', color: '#94a3b8'}}>Select second location:</p>
//                 <select 
//                   className="btn-save" 
//                   style={{width: '100%', marginBottom: '8px', cursor: 'pointer'}}
//                   onChange={(e) => {
//                     if(e.target.value === "custom") promptCustomCompare();
//                     else {
//                       const place = savedPlaces[e.target.value];
//                       handleCompareSelection(place.lat, place.lng);
//                     }
//                   }}
//                   value=""
//                 >
//                   <option value="" disabled>Choose a place...</option>
//                   {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//                   <option value="custom">➕ Custom Location...</option>
//                 </select>
//                 {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete" style={{width: '100%'}}>Exit Comparison</button>}
//               </div>
//             </section>
//           )}

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div><strong>{p.name}</strong><span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span></div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)}>🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//             <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//             <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>

//         <div className="sidebar-resizer" onMouseDown={startResizingSide} style={{ position: 'absolute', right: 0, top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 10 }} />
//       </aside>

//       <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} style={{ height: '6px', width: '100%', cursor: 'row-resize', background: 'transparent', zIndex: 100 }} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {result ? (
//             <div className="results-wrapper" style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
              
//               <ResultColumn data={result} title={isCompareMode ? "Location A (Current)" : ""} />

//               {isCompareMode && compareResult && (
//                 <ResultColumn data={compareResult} title="Location B (Target)" />
//               )}

//               {isCompareMode && !compareResult && !compareLoading && (
//                 <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
//                   Select Location B from sidebar to compare
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="empty-results">Complete analysis to view data.</div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }





// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
//       else { setLat(e.latlng.lat); setLng(e.latlng.lng); }
//     },
//     zoomend() { setZoom(map.getZoom()); },
//   });
//   useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(() => Number(localStorage.getItem("geo_lat")) || 17.385);
//   const [lng, setLng] = useState(() => Number(localStorage.getItem("geo_lng")) || 78.4867);
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [isSelectingB, setIsSelectingB] = useState(false);
//   const [compareLoading, setCompareLoading] = useState(false);

//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 350);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 400);
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);
//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result]);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, []);

//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 250 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 150 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, [handleMouseMove, stopResizing]);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, [handleMouseMove, stopResizing]);

//   const performAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: tLat, longitude: tLng, debug }),
//     });
//     return await response.json();
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//     try { const data = await performAnalysis(lat, lng); setResult(data); }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   const handleCompareSelect = async (tLat, tLng) => {
//     setIsSelectingB(false); setCompareLoading(true); setIsCompareMode(true);
//     try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
//     catch (err) { console.error(err); } finally { setCompareLoading(false); }
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude); setLng(pos.coords.longitude);
//     });
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot"></div>GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Location A (Main)</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "Analyzing..." : "Analyze Location A"}</button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group" style={{ marginTop: '15px', border: '1px solid #3b82f6', padding: '10px', borderRadius: '8px' }}>
//               <h3>Compare with Location B</h3>
//               <button 
//                 className={`btn-save ${isSelectingB ? 'active-selection' : ''}`} 
//                 onClick={() => setIsSelectingB(!isSelectingB)}
//                 style={{ width: '100%', marginBottom: '8px', backgroundColor: isSelectingB ? '#ef4444' : '' }}
//               >
//                 {isSelectingB ? "Cancel - Click on Map" : "🖱️ Choose Location B on Map"}
//               </button>
//               <select className="btn-save" style={{ width: '100%' }} onChange={(e) => handleCompareSelect(savedPlaces[e.target.value].lat, savedPlaces[e.target.value].lng)} value="">
//                 <option value="" disabled>Or select Saved Place</option>
//                 {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//               </select>
//               {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete" style={{ width: '100%', marginTop: '10px' }}>Exit Compare</button>}
//             </section>
//           )}

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div><strong>{p.name}</strong><span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span></div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)}>🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>
//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//              <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//              <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} />
//       </aside>

//       <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
//           <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {!result && <div className="empty-results">Complete analysis to view data.</div>}

//           {result && !isCompareMode && (
//             /* --- SINGLE MODE: DITTO BOX LAYOUT --- */
//             <div className="results-grid">
//               <div className="col-1">
//                 <div className={`card hero-card glass-morphic ${result.suitability_score < 40 ? 'danger-glow' : ''}`}>
//                   <h3>Overall Suitability</h3>
//                   <div className="score-value" style={{ "--score-color": result.suitability_score < 40 ? "#ef4444" : result.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//                     {result.suitability_score?.toFixed(1)}
//                   </div>
//                   <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>{result.label}</div>
//                 </div>
//                 <div className="card factors-card">
//                   <h3>Terrain Factors</h3>
//                   {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => <FactorBar key={f} label={f} value={result.factors[f]} />)}
//                 </div>
//               </div>
//               <div className="col-2">
//                 {result.suitability_score === 0 && <div className="water-alert-box glass-morphic-alert"><p>{result.reason}</p></div>}
//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       return <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}><strong>{id.toUpperCase()} ({val.toFixed(1)})</strong><p>{meta.reason}</p></div>
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             /* --- COMPARE MODE: SPLIT & STACK LAYOUT --- */
//             <div className="compare-layout" style={{ display: 'flex', width: '100%', height: '100%' }}>
//               {[ {data: result, title: "Location A"}, {data: compareResult, title: "Location B"} ].map((col, idx) => (
//                 <div key={idx} className="compare-column" style={{ flex: 1, padding: '15px', borderRight: idx === 0 ? '1px solid rgba(128,128,128,0.2)' : 'none', overflowY: 'auto' }}>
//                   <h3 style={{ textAlign: 'center', color: 'var(--primary)' }}>{col.title}</h3>
//                   {col.data ? (
//                     <div className="stacked-details" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                       <div className={`card hero-card glass-morphic ${col.data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//                          <div className="score-value" style={{ "--score-color": col.data.suitability_score < 40 ? "#ef4444" : col.data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>{col.data.suitability_score?.toFixed(1)}</div>
//                       </div>
//                       <div className="card factors-card">
//                         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => <FactorBar key={f} label={f} value={col.data.factors[f]} />)}
//                       </div>
//                     </div>
//                   ) : <div className="empty-results">Waiting for selection...</div>}
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }




// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
//       else { setLat(e.latlng.lat); setLng(e.latlng.lng); }
//     },
//     zoomend() { setZoom(map.getZoom()); },
//   });
//   useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(() => Number(localStorage.getItem("geo_lat")) || 17.385);
//   const [lng, setLng] = useState(() => Number(localStorage.getItem("geo_lng")) || 78.4867);
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   // --- COMPARISON STATES ---
//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [compareName, setCompareName] = useState(""); // Stores name for Location B
//   const [isSelectingB, setIsSelectingB] = useState(false);
//   const [compareLoading, setCompareLoading] = useState(false);

//   // --- LAYOUT STATES ---
//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 350);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 400);
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);
//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result]);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, []);

//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 250 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 150 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, [handleMouseMove, stopResizing]);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, [handleMouseMove, stopResizing]);

//   const performAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: tLat, longitude: tLng, debug }),
//     });
//     return await response.json();
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//     try { const data = await performAnalysis(lat, lng); setResult(data); }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   // --- UPDATED LOGIC: Prompt for name after selection ---
//   const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     let name = existingName;
//     if (!name) {
//       name = prompt("Enter a name for Location B:");
//       if (!name) name = "Selected Area"; // Default if user cancels
//     }
    
//     setCompareName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     try { 
//       const data = await performAnalysis(tLat, tLng); 
//       setCompareResult(data); 
//     }
//     catch (err) { console.error(err); } finally { setCompareLoading(false); }
//   };

//   const promptCompareCoords = () => {
//     const bLat = prompt("Enter Latitude for Location B:");
//     const bLng = prompt("Enter Longitude for Location B:");
//     if (bLat && bLng) handleCompareSelect(Number(bLat), Number(bLng));
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude); setLng(pos.coords.longitude);
//     });
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   const CompareColumn = ({ data, title }) => (
//     <div className="compare-column">
//       <h3 className="compare-title">{title}</h3>
//       {data ? (
//         <div className="vertical-stack">
//           <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//             <h3>Overall Suitability</h3>
//             <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//               {data.suitability_score?.toFixed(1)}
//             </div>
//             <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//           </div>

//           <div className="card factors-card">
//             <h3>Terrain Factors</h3>
//             {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//               <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f]} />
//             ))}
//           </div>

//           <div className="card evidence-card">
//             <h3>Description & Evidence</h3>
//             <div className="evidence-list">
//               {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                 const val = data.factors[id] ?? 0;
//                 const meta = data.explanation?.factors_meta?.[id];
//                 if (!meta) return null;
//                 const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//                 return (
//                   <div key={id} className={`evidence-entry tone-${statusColor}`}>
//                     <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//                     <p>{meta.reason}</p>
//                     <small>Source: {meta.source}</small>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       ) : <div className="empty-results">Waiting for selection...</div>}
//     </div>
//   );

//   return (
//     <div className="app-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot"></div>GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group">
//             <h3>Location A (Current)</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="field">
//                 <label>Lat</label>
//                 <input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} />
//               </div>
//               <div className="field">
//                 <label>Lng</label>
//                 <input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1 }}>📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1 }}>⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "Analyzing..." : "Analyze Location A"}</button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group comparison-box" style={{ marginTop: '15px' }}>
//               <h3>Compare with Location B</h3>
//               <button className="btn-save" onClick={() => setIsSelectingB(!isSelectingB)} style={{ width: '100%', marginBottom: '8px', border: isSelectingB ? '2px solid #ef4444' : '' }}>
//                 {isSelectingB ? "Cancel Map Selection" : "🖱️ Choose Location B on Map"}
//               </button>
//               <button className="btn-save" onClick={promptCompareCoords} style={{ width: '100%', marginBottom: '8px' }}>
//                 ⌨️ Enter Coordinates for B
//               </button>
//               <select className="btn-save" style={{ width: '100%' }} onChange={(e) => {
//                 const place = savedPlaces[e.target.value];
//                 handleCompareSelect(place.lat, place.lng, place.name);
//               }} value="">
//                 <option value="" disabled>Or select Saved Place</option>
//                 {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//               </select>
//               {isCompareMode && <button onClick={() => {setIsCompareMode(false); setCompareResult(null);}} className="btn-delete" style={{ width: '100%', marginTop: '10px' }}>Exit Comparison</button>}
//             </section>
//           )}

//           <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
//             <h3>Saved Places</h3>
//             <div className="places-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div><strong>{p.name}</strong><span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span></div>
//                     <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)}>🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>
//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid">
//              <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//              <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} />
//       </aside>

//       <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
//           <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain...</div>}
          
//           {!result && <div className="empty-results">Complete analysis to view data.</div>}

//           {result && !isCompareMode && (
//             <div className="results-grid">
//               <div className="col-1">
//                 <div className={`card hero-card glass-morphic ${result.suitability_score < 40 ? 'danger-glow' : ''}`}>
//                   <h3>Overall Suitability</h3>
//                   <div className="score-value" style={{ "--score-color": result.suitability_score < 40 ? "#ef4444" : result.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//                     {result.suitability_score?.toFixed(1)}
//                   </div>
//                   <div className={`status-pill ${result.label?.toLowerCase().replace(/\s+/g, '-')}`}>{result.label}</div>
//                 </div>
//                 <div className="card factors-card">
//                   <h3>Terrain Factors</h3>
//                   {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={result.factors[f]} />)}
//                 </div>
//               </div>
//               <div className="col-2">
//                 {result.suitability_score === 0 && <div className="water-alert-box glass-morphic-alert"><p>{result.reason}</p></div>}
//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       const statusColor = val < 40 ? "red" : val < 70 ? "yellow" : "green";
//                       return <div key={id} className={`evidence-entry tone-${statusColor}`}><strong>{id.toUpperCase()} ({val.toFixed(1)})</strong><p>{meta.reason}</p></div>
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-container">
//               <CompareColumn data={result} title="Location A (Current)" />
//               <CompareColumn data={compareResult} title={`Location B (${compareName})`} />
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }





// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
//       else { setLat(e.latlng.lat); setLng(e.latlng.lng); }
//     },
//     zoomend() { setZoom(map.getZoom()); },
//   });
//   useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(() => Number(localStorage.getItem("geo_lat")) || 17.385);
//   const [lng, setLng] = useState(() => Number(localStorage.getItem("geo_lng")) || 78.4867);
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);

//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [compareName, setCompareName] = useState("");
//   const [isSelectingB, setIsSelectingB] = useState(false);
//   const [compareLoading, setCompareLoading] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);
//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result]);

//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 280 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 150 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, [handleMouseMove]);

//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, [handleMouseMove, stopResizing]);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, [handleMouseMove, stopResizing]);

//   const performAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: tLat, longitude: tLng, debug }),
//     });
//     return await response.json();
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//     try { const data = await performAnalysis(lat, lng); setResult(data); }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     let name = existingName || prompt("Enter name for Location B:") || "Selected Area";
//     setCompareName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
//     catch (err) { console.error(err); } finally { setCompareLoading(false); }
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude); setLng(pos.coords.longitude);
//     });
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   const ResultStack = ({ data }) => (
//     <div className="vertical-stack">
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <h3>Suitability</h3>
//         <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//           {data.suitability_score?.toFixed(1)}
//         </div>
//         <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//       </div>
//       <div className="card factors-card">
//         <h3>Terrain Factors</h3>
//         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//           <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f]} />
//         ))}
//       </div>
//       <div className="card evidence-card">
//         <h3>Evidence Details</h3>
//         <div className="evidence-list">
//           {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//             const val = data.factors[id] ?? 0;
//             const meta = data.explanation?.factors_meta?.[id];
//             if (!meta) return null;
//             return (
//               <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//                 <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//                 <p>{meta.reason}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="app-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot"></div>GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group compact">
//             <h3>Coordinates</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="row">
//                 <div className="field"><input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} placeholder="Lat" /></div>
//                 <div className="field"><input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} placeholder="Lng" /></div>
//               </div>
//               <div className="row btn-row">
//                 <button type="button" onClick={handleMyLocation} className="btn-save mini">📍 Map</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save mini">⭐ Save</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "Analyzing..." : "Analyze Location A"}</button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group comparison-box compact">
//               <h3>Comparison</h3>
//               <button className="btn-save mini-full" onClick={() => setIsSelectingB(!isSelectingB)} style={{ border: isSelectingB ? '1px solid #ef4444' : '' }}>
//                 {isSelectingB ? "Cancel Selection" : "🖱️ Choose B on Map"}
//               </button>
//               <select className="btn-save mini-full" onChange={(e) => handleCompareSelect(savedPlaces[e.target.value].lat, savedPlaces[e.target.value].lng, savedPlaces[e.target.value].name)} value="">
//                 <option value="" disabled>Select Saved Place</option>
//                 {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//               </select>
//               {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete mini-full">Exit Compare</button>}
//             </section>
//           )}

//           <section className="saved-places">
//             <h3 style={{marginBottom: '6px'}}>Saved Places</h3>
//             <div className="places-list compact-list">
//               {savedPlaces.slice(0, 5).map((p, i) => (
//                 <div key={i} className="place-item compact" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div className="place-info"><strong>{p.name}</strong></div>
//                   <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)}>🗑️</button>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <h4>Project Team</h4>
//           <div className="team-grid compact-team">
//              <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//              <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} />
//       </aside>

//       <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           {isSelectingB && <div className="map-instruction-overlay">Click Map for Location B</div>}
//           <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Loading Terrain Data...</div>}
          
//           {result && !isCompareMode && (
//             <div className="results-grid">
//               <div className="col-1"><ResultStack data={result} /></div>
//               <div className="col-2">
//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       return <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}><strong>{id.toUpperCase()} ({val.toFixed(1)})</strong><p>{meta.reason}</p></div>
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-container">
//               <div className="compare-column"><h4 className="compare-title">A: Current</h4><ResultStack data={result} /></div>
//               <div className="compare-column"><h4 className="compare-title">B: {compareName}</h4>{compareResult ? <ResultStack data={compareResult} /> : <div className="empty-results">Waiting for selection...</div>}</div>
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }








// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
//       else { setLat(e.latlng.lat); setLng(e.latlng.lng); }
//     },
//     zoomend() { setZoom(map.getZoom()); },
//   });
//   useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
//   return <Marker position={[lat, lng]} />;
// }

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(() => Number(localStorage.getItem("geo_lat")) || 17.385);
//   const [lng, setLng] = useState(() => Number(localStorage.getItem("geo_lng")) || 78.4867);
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);

//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [compareName, setCompareName] = useState("");
//   const [isSelectingB, setIsSelectingB] = useState(false);
//   const [compareLoading, setCompareLoading] = useState(false);
  
//   const [bLatInput, setBLatInput] = useState("");
//   const [bLngInput, setBLngInput] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);
//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result]);

//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 280 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 150 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, [handleMouseMove]);

//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, [handleMouseMove, stopResizing]);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, [handleMouseMove, stopResizing]);

//   const performAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: tLat, longitude: tLng, debug }),
//     });
//     return await response.json();
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//     try { const data = await performAnalysis(lat, lng); setResult(data); }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     let name = existingName || prompt("Enter name for Location B:") || "Selected Area";
//     setCompareName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
//     catch (err) { console.error(err); } finally { setCompareLoading(false); }
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude); setLng(pos.coords.longitude);
//     });
//   };

//   const handleDeletePlace = (e, index) => {
//     e.stopPropagation();
//     const updated = savedPlaces.filter((_, i) => i !== index);
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     const updated = [...savedPlaces, { name, lat, lng }];
//     setSavedPlaces(updated);
//     localStorage.setItem("savedPlaces", JSON.stringify(updated));
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   const ResultStack = ({ data }) => (
//     <div className="vertical-stack">
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <h3>Suitability</h3>
//         <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//           {data.suitability_score?.toFixed(1)}
//         </div>
//         <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//       </div>
//       <div className="card factors-card">
//         <h3>Terrain Factors</h3>
//         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//           <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f]} />
//         ))}
//       </div>
//       <div className="card evidence-card">
//         <h3>Evidence Details</h3>
//         <div className="evidence-list">
//           {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//             const val = data.factors[id] ?? 0;
//             const meta = data.explanation?.factors_meta?.[id];
//             if (!meta) return null;
//             return (
//               <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//                 <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//                 <p>{meta.reason}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="app-shell">
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px` }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot"></div>GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group compact">
//             <h3>Location A (Main)</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="row">
//                 <div className="field"><input type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} placeholder="Latitude (Lat)" /></div>
//                 <div className="field"><input type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} placeholder="Longitude (Lng)" /></div>
//               </div>
//               <div className="row btn-row">
//                 <button type="button" onClick={handleMyLocation} className="btn-save mini">📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save mini">⭐ Save</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "..." : "Analyze A"}</button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group comparison-box compact">
//               <h3>Compare with B</h3>
//               <button className="btn-save mini-full" onClick={() => setIsSelectingB(!isSelectingB)} style={{ border: isSelectingB ? '1px solid #ef4444' : '' }}>
//                 {isSelectingB ? "Cancel Selection" : "🖱️ Choose B on Map"}
//               </button>
              
//               <select className="btn-save mini-full" onChange={(e) => handleCompareSelect(savedPlaces[e.target.value].lat, savedPlaces[e.target.value].lng, savedPlaces[e.target.value].name)} value="">
//                 <option value="" disabled>Select Saved Place</option>
//                 {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//               </select>

//               <div className="manual-compare-inputs">
//                 <div className="row">
//                     <input type="number" placeholder="Lat B" value={bLatInput} onChange={e => setBLatInput(e.target.value)} />
//                     <input type="number" placeholder="Lng B" value={bLngInput} onChange={e => setBLngInput(e.target.value)} />
//                 </div>
//                 <button className="btn-save mini-full" onClick={() => handleCompareSelect(Number(bLatInput), Number(bLngInput))}>🚀 Compare Direct</button>
//               </div>

//               {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete mini-full">Exit Compare</button>}
//             </section>
//           )}

//           <section className="saved-places-section">
//             <h3>Saved Places</h3>
//             <div className="places-list scrollable-list">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item compact" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
//                   <div className="place-info"><strong>{p.name}</strong></div>
//                   <button className="btn-delete" onClick={(e) => handleDeletePlace(e, i)}>🗑️</button>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <div className="team-grid compact-team">
//              <span>A. Vaishnavi</span><span>C. Jyothika</span>
//              <span>H. Botlagunta</span><span>M. Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} />
//       </aside>

//       <main className="main-content">
//         <section className="map-container">
//           {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
//           <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px` }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Loading...</div>}
          
//           {result && !isCompareMode && (
//             <div className="results-grid">
//               <div className="col-1"><ResultStack data={result} /></div>
//               <div className="col-2">
//                 <div className="card evidence-card">
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       return <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}><strong>{id.toUpperCase()}</strong><p>{meta.reason}</p></div>
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-container">
//               <div className="compare-column"><h4 className="compare-title">A: Current</h4><ResultStack data={result} /></div>
//               <div className="compare-column"><h4 className="compare-title">B: {compareName}</h4>{compareResult ? <ResultStack data={compareResult} /> : <div className="empty-results">Waiting...</div>}</div>
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }








// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
//       else { 
//         setLat(e.latlng.lat.toString()); 
//         setLng(e.latlng.lng.toString()); 
//       }
//     },
//     zoomend() { setZoom(map.getZoom()); },
//   });

//   useEffect(() => {
//     const nLat = parseFloat(lat);
//     const nLng = parseFloat(lng);
//     if (!isNaN(nLat) && !isNaN(nLng)) {
//       map.setView([nLat, nLng], map.getZoom());
//     }
//   }, [lat, lng, map]);

//   const markerPos = [parseFloat(lat) || 0, parseFloat(lng) || 0];
//   return <Marker position={markerPos} />;
// }

// export default function LandSuitabilityChecker() {
//   // 1. PERSISTENCE & INITIALIZATION
//   const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
//   const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   // RESIZABLE DIMENSIONS
//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);

//   // COMPARISON STATES
//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [compareName, setCompareName] = useState("");
//   const [isSelectingB, setIsSelectingB] = useState(false);
//   const [compareLoading, setCompareLoading] = useState(false);
//   const [bLatInput, setBLatInput] = useState("");
//   const [bLngInput, setBLngInput] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);
//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   // Global Persistence Effect
//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result, savedPlaces]);

//   // DRAG HANDLERS
//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 260 && newWidth < 500) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 100 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, [handleMouseMove]);

//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, [handleMouseMove, stopResizing]);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, [handleMouseMove, stopResizing]);

//   // CORE LOGIC
//   const performAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),
//     });
//     return await response.json();
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//     try { const data = await performAnalysis(lat, lng); setResult(data); }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     let name = existingName || prompt("Enter name for Location B:") || "Site B";
//     setCompareName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
//     catch (err) { console.error(err); } finally { setCompareLoading(false); }
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude.toString());
//       setLng(pos.coords.longitude.toString());
//     });
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter name for this place:");
//     if (!name) return;
//     setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
//   };

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   // Reusable Vertical Result Column (for Comparison and Single Mode)
//   const ResultStack = ({ data }) => (
//     <div className="vertical-stack-ditto">
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <h3>Overall Suitability</h3>
//         <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//           {data.suitability_score?.toFixed(1)}
//         </div>
//         <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//       </div>

//       <div className="card factors-card">
//         <h3>Terrain Factors</h3>
//         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//           <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f]} />
//         ))}
//       </div>

//       <div className="card evidence-card">
//         <h3>Evidence Details</h3>
//         <div className="evidence-list">
//           {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//             const val = data.factors[id] ?? 0;
//             const meta = data.explanation?.factors_meta?.[id];
//             if (!meta) return null;
//             return (
//               <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//                 <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//                 <p>{meta.reason}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="app-shell">
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot" />GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable">
//           <section className="control-group compact-group">
//             <h3>Location A</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="compact-row">
//                 <div className="field">
//                   <label className="input-label">Lat</label>
//                   <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="highlighted-box" />
//                 </div>
//                 <div className="field">
//                   <label className="input-label">Lng</label>
//                   <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="highlighted-box" />
//                 </div>
//               </div>
//               <div className="compact-row" style={{marginTop: '8px'}}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save same-size">📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save same-size">⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading} style={{marginTop: '8px', width: '100%'}}>
//                 {loading ? "Analyzing..." : "Analyze Location A"}
//               </button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group comparison-box compact">
//               <h3>Compare with B</h3>
//               <div className="compact-row">
//                 <button className="btn-save mini" onClick={() => setIsSelectingB(!isSelectingB)} style={{ flex: 1, border: isSelectingB ? '1px solid #ef4444' : '' }}>
//                    {isSelectingB ? "Cancel" : "🖱️ Map"}
//                 </button>
//                 <select className="btn-save mini" style={{ flex: 1.5 }} onChange={(e) => {
//                     const p = savedPlaces[e.target.value];
//                     handleCompareSelect(p.lat, p.lng, p.name);
//                 }} value="">
//                   <option value="" disabled>Saved Places...</option>
//                   {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//                 </select>
//               </div>
//               <div className="compact-row" style={{marginTop: '8px'}}>
//                 <div className="field">
//                   <label className="input-label">Lat B</label>
//                   <input type="text" value={bLatInput} onChange={e => setBLatInput(e.target.value)} 
//                          onKeyDown={e => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)} className="highlighted-box" />
//                 </div>
//                 <div className="field">
//                   <label className="input-label">Lng B</label>
//                   <input type="text" value={bLngInput} onChange={e => setBLngInput(e.target.value)} 
//                          onKeyDown={e => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)} className="highlighted-box" />
//                 </div>
//               </div>
//               {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete" style={{width: '100%', marginTop: '8px'}}>Exit Compare</button>}
//             </section>
//           )}

//           <section className="saved-places">
//             <h3 style={{marginBottom: '10px'}}>Saved Places</h3>
//             <div className="places-list scroll-area">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-item" onClick={() => {setLat(p.lat.toString()); setLng(p.lng.toString())}}>
//                   <div className="place-info"><strong>{p.name}</strong></div>
//                   <button className="btn-delete" onClick={(e) => {
//                     e.stopPropagation();
//                     const updated = savedPlaces.filter((_, idx) => idx !== i);
//                     setSavedPlaces(updated);
//                   }}>🗑️</button>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <div className="team-grid">
//              <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//              <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} />
//       </aside>

//       <main className="main-content">
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
//           <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={tileLayerUrl} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain Data...</div>}
          
//           {result && !isCompareMode && (
//             <div className="results-grid">
//               <div className="col-1"><ResultStack data={result} /></div>
//               <div className="col-2">
//                 <div className="card evidence-card" style={{ height: '100%' }}>
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       return <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//                         <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong><p>{meta.reason}</p>
//                       </div>
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
//               <div className="compare-pane-ditto"><h4 className="pane-header">SITE A: CURRENT</h4><ResultStack data={result} /></div>
//               <div className="compare-pane-ditto"><h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>{compareResult ? <ResultStack data={compareResult} /> : <div className="empty-results">Waiting for selection...</div>}</div>
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }










// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";

// // Fix default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
//   const map = useMap();
//   useMapEvents({
//     click(e) {
//       if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
//       else { 
//         setLat(e.latlng.lat.toString()); 
//         setLng(e.latlng.lng.toString()); 
//       }
//     },
//     zoomend() { setZoom(map.getZoom()); },
//   });

//   useEffect(() => {
//     const nLat = parseFloat(lat);
//     const nLng = parseFloat(lng);
//     if (!isNaN(nLat) && !isNaN(nLng)) {
//       map.setView([nLat, nLng], map.getZoom());
//     }
//   }, [lat, lng, map]);

//   const markerPos = [parseFloat(lat) || 0, parseFloat(lng) || 0];
//   return <Marker position={markerPos} />;
// }

// export default function LandSuitabilityChecker() {
//   // 1. INITIALIZATION & PERSISTENCE
//   const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
//   const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("geo_theme");
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const [result, setResult] = useState(() => {
//     const saved = localStorage.getItem("geo_last_result");
//     return saved ? JSON.parse(saved) : null;
//   });

//   // RESIZABLE DIMENSIONS
//   const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
//   const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
//   const isResizingSide = useRef(false);
//   const isResizingBottom = useRef(false);

//   // COMPARISON STATES
//   const [isCompareMode, setIsCompareMode] = useState(false);
//   const [compareResult, setCompareResult] = useState(null);
//   const [compareName, setCompareName] = useState("");
//   const [isSelectingB, setIsSelectingB] = useState(false);
//   const [compareLoading, setCompareLoading] = useState(false);
//   const [bLatInput, setBLatInput] = useState("");
//   const [bLngInput, setBLngInput] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [debug] = useState(false);
//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("geo_lat", lat);
//     localStorage.setItem("geo_lng", lng);
//     localStorage.setItem("geo_zoom", zoom);
//     localStorage.setItem("geo_theme", isDarkMode);
//     localStorage.setItem("sidebar_width", sidebarWidth);
//     localStorage.setItem("bottom_height", bottomHeight);
//     localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
//     if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
//     document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result, savedPlaces]);

//   // DRAG HANDLERS
//   const handleMouseMove = useCallback((e) => {
//     if (isResizingSide.current) {
//       const newWidth = e.clientX;
//       if (newWidth > 260 && newWidth < 600) setSidebarWidth(newWidth);
//     }
//     if (isResizingBottom.current) {
//       const newHeight = window.innerHeight - e.clientY;
//       if (newHeight > 100 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
//     }
//   }, []);

//   const stopResizing = useCallback(() => {
//     isResizingSide.current = false;
//     isResizingBottom.current = false;
//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "default";
//   }, [handleMouseMove]);

//   const startResizingSide = useCallback(() => {
//     isResizingSide.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "col-resize";
//   }, [handleMouseMove, stopResizing]);

//   const startResizingBottom = useCallback(() => {
//     isResizingBottom.current = true;
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", stopResizing);
//     document.body.style.cursor = "row-resize";
//   }, [handleMouseMove, stopResizing]);

//   const performAnalysis = async (tLat, tLng) => {
//     const response = await fetch("/suitability", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),
//     });
//     return await response.json();
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//     try { const data = await performAnalysis(lat, lng); setResult(data); }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     let name = existingName || prompt("Enter name for Location B:") || "Site B";
//     setCompareName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
//     catch (err) { console.error(err); } finally { setCompareLoading(false); }
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setLat(pos.coords.latitude.toString());
//       setLng(pos.coords.longitude.toString());
//     });
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
//   };

//   const ResultStack = ({ data }) => (
//     <div className="vertical-stack-ditto">
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <h3>Overall Suitability</h3>
//         <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//           {data.suitability_score?.toFixed(1)}
//         </div>
//         <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//       </div>
//       <div className="card factors-card">
//         <h3>Terrain Factors</h3>
//         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//           <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f]} />
//         ))}
//       </div>
//       <div className="card evidence-card">
//         <h3>Evidence Details</h3>
//         <div className="evidence-list">
//           {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//             const val = data.factors[id] ?? 0;
//             const meta = data.explanation?.factors_meta?.[id];
//             if (!meta) return null;
//             return (
//               <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//                 <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//                 <p>{meta.reason}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="app-shell">
//       <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
//         <div className="sidebar-top">
//           <div className="brand"><div className="brand-dot" />GeoAI</div>
//           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
//         </div>

//         <div className="sidebar-scrollable" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
//           <section className="control-group compact-group">
//             <h3>Location A</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="compact-row">
//                 <div className="field">
//                   <label className="input-label">Lat</label>
//                   <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="highlighted-box" />
//                 </div>
//                 <div className="field">
//                   <label className="input-label">Lng</label>
//                   <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="highlighted-box" />
//                 </div>
//               </div>
//               <div className="compact-row" style={{marginTop: '8px'}}>
//                 <button type="button" onClick={handleMyLocation} className="btn-save same-size">📍 My Location</button>
//                 <button type="button" onClick={handleSavePlace} className="btn-save same-size">⭐ Save Place</button>
//               </div>
//               <button type="submit" className="btn-analyze" disabled={loading} style={{marginTop: '8px', width: '100%'}}>
//                 {loading ? "Analyzing..." : "Analyze Location A"}
//               </button>
//             </form>
//           </section>

//           {result && (
//             <section className="control-group comparison-box compact">
//               <h3>Compare with B</h3>
//               <div className="compact-row">
//                 <button className="btn-save mini" onClick={() => setIsSelectingB(!isSelectingB)} style={{ flex: 1, border: isSelectingB ? '1px solid #ef4444' : '' }}>
//                    {isSelectingB ? "Cancel" : "🖱️ Map"}
//                 </button>
//                 <select className="btn-save mini" style={{ flex: 1.5 }} onChange={(e) => {
//                     const p = savedPlaces[e.target.value];
//                     handleCompareSelect(p.lat, p.lng, p.name);
//                 }} value="">
//                   <option value="" disabled>Saved Places...</option>
//                   {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
//                 </select>
//               </div>
//               <div className="compact-row" style={{marginTop: '8px'}}>
//                 <div className="field">
//                   <label className="input-label">Lat B</label>
//                   <input type="text" value={bLatInput} onChange={e => setBLatInput(e.target.value)} 
//                          onKeyDown={e => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)} className="highlighted-box" />
//                 </div>
//                 <div className="field">
//                   <label className="input-label">Lng B</label>
//                   <input type="text" value={bLngInput} onChange={e => setBLngInput(e.target.value)} 
//                          onKeyDown={e => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)} className="highlighted-box" />
//                 </div>
//               </div>
//               {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete-wide" style={{marginTop: '8px'}}>Exit Compare</button>}
//             </section>
//           )}

//           <section className="saved-places-section">
//             <h3>Saved Places</h3>
//             <div className="places-grid attractive-scroll">
//               {savedPlaces.map((p, i) => (
//                 <div key={i} className="place-card-compact" onClick={() => {setLat(p.lat.toString()); setLng(p.lng.toString())}}>
//                   <div className="place-info-mini">
//                     <strong>{p.name}</strong>
//                     <span>{p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span>
//                   </div>
//                   <button className="btn-cross" onClick={(e) => {
//                     e.stopPropagation();
//                     const updated = savedPlaces.filter((_, idx) => idx !== i);
//                     setSavedPlaces(updated);
//                   }}>✕</button>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>

//         <div className="sidebar-footer">
//           <div className="team-grid">
//              <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
//              <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
//           </div>
//           <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
//         </div>
//         <div className="sidebar-resizer" onMouseDown={startResizingSide} />
//       </aside>

//       <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
//           <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain Data...</div>}
          
//           {result && !isCompareMode && (
//             <div className="results-grid">
//               <div className="col-1"><ResultStack data={result} /></div>
//               <div className="col-2">
//                 <div className="card evidence-card" style={{ height: '100%' }}>
//                   <h3>Evidence Details</h3>
//                   <div className="evidence-list">
//                     {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//                       const val = result.factors[id] ?? 0;
//                       const meta = result.explanation?.factors_meta?.[id];
//                       if (!meta) return null;
//                       return <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//                         <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong><p>{meta.reason}</p>
//                       </div>
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
//               <div className="compare-pane-ditto"><h4 className="pane-header">SITE A: CURRENT</h4><ResultStack data={result} /></div>
//               <div className="compare-pane-ditto"><h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>{compareResult ? <ResultStack data={compareResult} /> : <div className="empty-results">Waiting...</div>}</div>
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback, useRef } from "react";
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

function LocationMarker({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
      else { 
        setLat(e.latlng.lat.toString()); 
        setLng(e.latlng.lng.toString()); 
      }
    },
    zoomend() { setZoom(map.getZoom()); },
  });

  useEffect(() => {
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);
    if (!isNaN(nLat) && !isNaN(nLng)) {
      map.setView([nLat, nLng], map.getZoom());
    }
  }, [lat, lng, map]);

  const markerPos = [parseFloat(lat) || 0, parseFloat(lng) || 0];
  return <Marker position={markerPos} />;
}

export default function LandSuitabilityChecker() {
  // 1. INITIALIZATION & PERSISTENCE
  const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
  const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("geo_theme");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("geo_last_result");
    return saved ? JSON.parse(saved) : null;
  });

  // RESIZABLE DIMENSIONS
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
  const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
  const isResizingSide = useRef(false);
  const isResizingBottom = useRef(false);

  // COMPARISON STATES
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [compareName, setCompareName] = useState("");
  const [isSelectingB, setIsSelectingB] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [bLatInput, setBLatInput] = useState("");
  const [bLngInput, setBLngInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [debug] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = localStorage.getItem("savedPlaces");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("geo_lat", lat);
    localStorage.setItem("geo_lng", lng);
    localStorage.setItem("geo_zoom", zoom);
    localStorage.setItem("geo_theme", isDarkMode);
    localStorage.setItem("sidebar_width", sidebarWidth);
    localStorage.setItem("bottom_height", bottomHeight);
    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
    if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result, savedPlaces]);

  // DRAG HANDLERS (With Dependencies for Build)
  const handleMouseMove = useCallback((e) => {
    if (isResizingSide.current) {
      const newWidth = e.clientX;
      if (newWidth > 260 && newWidth < 600) setSidebarWidth(newWidth);
    }
    if (isResizingBottom.current) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingSide.current = false;
    isResizingBottom.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
  }, [handleMouseMove]);

  const startResizingSide = useCallback(() => {
    isResizingSide.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
  }, [handleMouseMove, stopResizing]);

  const startResizingBottom = useCallback(() => {
    isResizingBottom.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "row-resize";
  }, [handleMouseMove, stopResizing]);

  const performAnalysis = async (tLat, tLng) => {
    const response = await fetch("/suitability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),
    });
    return await response.json();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
    try { const data = await performAnalysis(lat, lng); setResult(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCompareSelect = async (tLat, tLng, existingName = null) => {
    setIsSelectingB(false);
    let name = existingName || prompt("Enter name for Location B:") || "Site B";
    setCompareName(name);
    setCompareLoading(true);
    setIsCompareMode(true);
    try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
    catch (err) { console.error(err); } finally { setCompareLoading(false); }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toString());
      setLng(pos.coords.longitude.toString());
    });
  };

  const handleSavePlace = () => {
    const name = prompt("Enter a name for this location:");
    if (!name) return;
    setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
  };

  // Components for layout
  const FactorsSection = ({ data }) => (
    <>
      <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
        <h3>Overall Suitability</h3>
        <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
          {data.suitability_score?.toFixed(1)}
        </div>
        <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
      </div>
      <div className="card factors-card">
        <h3>Terrain Factors</h3>
        {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
          <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
        ))}
      </div>
    </>
  );

  const EvidenceSection = ({ data }) => (
    <div className="card evidence-card" style={{ height: '100%' }}>
      <h3>Evidence Details</h3>
      <div className="evidence-list">
        {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
          const val = data.factors[id] ?? 0;
          const meta = data.explanation?.factors_meta?.[id];
          if (!meta) return null;
          return (
            <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
              <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
              <p>{meta.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const tileLayerUrl = isDarkMode 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="app-shell">
      <aside className="sidebar" style={{ width: `${sidebarWidth}px`, flex: `0 0 ${sidebarWidth}px`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-top">
          <div className="brand"><div className="brand-dot" />GeoAI</div>
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
        </div>

        <div className="sidebar-scrollable" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <section className="control-group compact-group">
            <h3>Location A</h3>
            <form onSubmit={handleSubmit}>
              <div className="compact-row">
                <div className="field">
                  <label className="input-label">Lat</label>
                  <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="highlighted-box" />
                </div>
                <div className="field">
                  <label className="input-label">Lng</label>
                  <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="highlighted-box" />
                </div>
              </div>
              <div className="compact-row" style={{marginTop: '8px'}}>
                <button type="button" onClick={handleMyLocation} className="btn-save same-size">📍 My Location</button>
                <button type="button" onClick={handleSavePlace} className="btn-save same-size">⭐ Save Place</button>
              </div>
              <button type="submit" className="btn-analyze" disabled={loading} style={{marginTop: '8px', width: '100%'}}>
                {loading ? "Analyzing..." : "Analyze Location A"}
              </button>
            </form>
          </section>

          {result && (
            <section className="control-group comparison-box compact">
              <h3>Compare with B</h3>
              <div className="compact-row">
                <button className="btn-save mini" onClick={() => setIsSelectingB(!isSelectingB)} style={{ flex: 1, border: isSelectingB ? '1px solid #ef4444' : '' }}>
                   {isSelectingB ? "Cancel" : "🖱️ Map"}
                </button>
                <select className="btn-save mini" style={{ flex: 1.5 }} onChange={(e) => {
                    const p = savedPlaces[e.target.value];
                    handleCompareSelect(p.lat, p.lng, p.name);
                }} value="">
                  <option value="" disabled>Saved Places...</option>
                  {savedPlaces.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
                </select>
              </div>
              <div className="compact-row" style={{marginTop: '8px'}}>
                <div className="field">
                  <label className="input-label">Lat B</label>
                  <input type="text" value={bLatInput} onChange={e => setBLatInput(e.target.value)} 
                         onKeyDown={e => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)} className="highlighted-box" />
                </div>
                <div className="field">
                  <label className="input-label">Lng B</label>
                  <input type="text" value={bLngInput} onChange={e => setBLngInput(e.target.value)} 
                         onKeyDown={e => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)} className="highlighted-box" />
                </div>
              </div>
              {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete-wide" style={{marginTop: '8px'}}>Exit Compare</button>}
            </section>
          )}

          <section className="saved-places-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h3>Saved Places</h3>
            <div className="places-grid attractive-scroll" style={{ flex: 1, overflowY: 'auto' }}>
              {savedPlaces.map((p, i) => (
                <div key={i} className="place-card-compact" onClick={() => {setLat(p.lat.toString()); setLng(p.lng.toString())}}>
                  <div className="place-info-mini"><strong>{p.name}</strong><span>{p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span></div>
                  <button className="btn-cross" onClick={(e) => {
                    e.stopPropagation();
                    const updated = savedPlaces.filter((_, idx) => idx !== i);
                    setSavedPlaces(updated);
                  }}>✕</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sidebar-footer">
          <div className="team-grid">
             <span>Adepu Vaishnavi</span><span>Chinni Jyothika</span>
             <span>Harsha vardhan Botlagunta</span><span>Maganti Pranathi</span>
          </div>
          <div className="guide-tag">Guide: Dr. G. Naga Chandrika</div>
        </div>
        <div className="sidebar-resizer" onMouseDown={startResizingSide} />
      </aside>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <section className="map-container" style={{ flex: 1, position: 'relative' }}>
          {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
          <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={tileLayerUrl} />
            <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
          </MapContainer>
        </section>

        <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

        <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
          {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain Data...</div>}
          
          {result && !isCompareMode && (
            /* STANDARD VIEW: SIDE BY SIDE LAYOUT */
            <div className="results-grid">
              <div className="col-1">
                <FactorsSection data={result} />
              </div>
              <div className="col-2">
                <EvidenceSection data={result} />
              </div>
            </div>
          )}

          {result && isCompareMode && (
            /* COMPARE VIEW: SPLIT SCREEN VERTICAL STACKS */
            <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
              <div className="compare-pane-ditto">
                <h4 className="pane-header">SITE A: CURRENT</h4>
                <FactorsSection data={result} />
                <EvidenceSection data={result} />
              </div>
              <div className="compare-pane-ditto">
                <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
                {compareResult ? (
                  <>
                    <FactorsSection data={compareResult} />
                    <EvidenceSection data={compareResult} />
                  </>
                ) : <div className="empty-results">Waiting for selection...</div>}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}