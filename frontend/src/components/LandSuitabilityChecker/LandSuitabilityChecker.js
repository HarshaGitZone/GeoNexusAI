// import React, { useState, useEffect, useCallback, useRef, memo } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import SideBar from "../SideBar/SideBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";
// import TopNav from "../TopNav/TopNav";
// import RadarChart from "../RadarChart/RadarChart"; 

// // Fix Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// const varieties = {
//   streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//   satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
//   hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
//   terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
//   roads: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
//   dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
//   light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
//   voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
//   topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
//   watercolor: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
// };

// const LocationMarker = ({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) => {
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
// };

// const FactorsSection = memo(({ data, latVal, lngVal, isDarkMode, viewMode, setViewMode }) => {
//   const nLat = parseFloat(latVal);
//   const nLng = parseFloat(lngVal);
//   const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

//   return (
//     <>
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <div className="mini-map-context">
//           {isValidCoords ? (
//             <MapContainer center={[nLat, nLng]} zoom={15} zoomControl={false} dragging={false} touchZoom={false} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
//                 <TileLayer url={varieties.hybrid} />
//                 <Marker position={[nLat, nLng]} />
//             </MapContainer>
//           ) : <div className="empty-results" style={{fontSize: '11px'}}>Waiting for analysis...</div>}
//           <div className="mini-map-label">Satellite Snapshot</div>
//         </div>

//         <div className="card-coordinates">
//           <span>LAT: {isValidCoords ? nLat.toFixed(4) : "..."}</span>
//           <span>LNG: {isValidCoords ? nLng.toFixed(4) : "..."}</span>
//         </div>
        
//         <h3>Overall Suitability</h3>
//         <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//           {data.suitability_score?.toFixed(1)}
//         </div>
//         <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//       </div>
      
//       <div className="card factors-card">
//         <div className="factors-header">
//           <h3>Terrain Factors</h3>
//           <button className="view-toggle" onClick={() => setViewMode(viewMode === "bars" ? "radar" : "bars")}>
//               {viewMode === "bars" ? "🕸️ Radar View" : "📊 Bar View"}
//           </button>
//         </div>

//         {viewMode === "bars" ? (
//           <div className="bars-container">
//             {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//               <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
//             ))}
//           </div>
//         ) : (
//           <div className="radar-container" style={{ height: '300px', width: '100%', position: 'relative' }}>
//               <RadarChart key={`radar-${nLat}-${nLng}`} data={data.factors} isDarkMode={isDarkMode} />
//           </div>
//         )}
//       </div>
//     </>
//   );
// });

// export default function LandSuitabilityChecker() {
//   const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
//   const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
//   const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
//   const [mapVariety, setMapVariety] = useState("streets");
  
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
//   const [viewMode, setViewMode] = useState("bars"); 

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
//   const [setShowNearby] = useState(false);
//   const [setNearbyData] = useState(null);
//   const [nearbyLoading, setNearbyLoading] = useState(false);
//   const [setShowNearbyB] = useState(false);
//   const [setNearbyDataB] = useState(null);
//   const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
//   const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
//   const [isBFromSavedPlace, setIsBFromSavedPlace] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingName, setEditingName] = useState("");
//   const [locationAName, setLocationAName] = useState("Site A");
//   const [locationBName, setLocationBName] = useState("Site B");
//   const [showLocationB, setShowLocationB] = useState(false);

//   // --- GeoGPT Assistant Logic ---
//   const [isGptOpen, setIsGptOpen] = useState(false);
//   const [chatHistory, setChatHistory] = useState([
//     { role: 'assistant', content: 'Hello! I am GeoGPT. Ask me anything about the project or analyzed land results.' }
//   ]);
//   const [userQuery, setUserQuery] = useState("");
//   const [gptLoading, setGptLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatHistory]);

//   const handleAskGpt = async (e) => {
//     if (e) e.preventDefault();
//     if (!userQuery.trim()) return;

//     const userMessage = { role: 'user', content: userQuery };
//     setChatHistory(prev => [...prev, userMessage]);
//     setGptLoading(true);
//     const queryToSend = userQuery;
//     setUserQuery("");

//     try {
//       // const response = await fetch("http://127.0.0.1:5000/ask_geogpt", {
//       const response = await fetch("/ask_geogpt", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: queryToSend,
//           currentData: result,
//           locationName: locationAName,
//           compareData: compareResult
//         }),
//       });
//       const data = await response.json();
//       setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
//     } catch (err) {
//       setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm currently offline. Please check your backend." }]);
//     } finally {
//       setGptLoading(false);
//     }
//   };

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
    
//     if (isDarkMode && mapVariety === "streets") setMapVariety("dark");
//     if (!isDarkMode && mapVariety === "dark") setMapVariety("streets");
//   }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result, savedPlaces, mapVariety]);

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
//     try { 
//       const data = await performAnalysis(lat, lng); 
//       setResult(data); 
//       setAnalyzedCoords({ lat: lat, lng: lng }); 
//     }
//     catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     setBLatInput(tLat.toString());
//     setBLngInput(tLng.toString());
//     const matchedPlace = savedPlaces.find(p => 
//       p.lat.toFixed(4) === parseFloat(tLat).toFixed(4) && 
//       p.lng.toFixed(4) === parseFloat(tLng).toFixed(4)
//     );
//     let name = existingName || (matchedPlace ? matchedPlace.name : null);
//     if (!name) { name = prompt("Enter name for Location B:") || "Site B"; }
//     setCompareName(name);
//     setLocationBName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     setCompareResult(null);
//     setIsBFromSavedPlace(!!existingName || !!matchedPlace);
//     try { 
//       const data = await performAnalysis(tLat, tLng); 
//       setCompareResult(data);
//       setAnalyzedCoordsB({ lat: tLat.toString(), lng: tLng.toString() });
//     }
//     catch (err) { console.error(err); } 
//     finally { setCompareLoading(false); }
//   };

//   const handleNearbyPlaces = async () => {
//     setNearbyLoading(true);
//     try {
//       const res = await fetch("/nearby_places", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
//       });
//       const data = await res.json();
//       setNearbyData(data);
//       setShowNearby(true);
//     } catch (err) { console.error(err); } finally { setNearbyLoading(false); }
//   };

//   const handleNearbyPlacesB = async () => {
//     setNearbyLoadingB(true);
//     try {
//       const res = await fetch("/nearby_places", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: parseFloat(analyzedCoordsB.lat), longitude: parseFloat(analyzedCoordsB.lng) }),
//       });
//       const data = await res.json();
//       setNearbyDataB(data);
//       setShowNearbyB(true);
//     } catch (err) { console.error(err); } finally { setNearbyLoadingB(false); }
//   };

//   const handleMyLocation = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       const deviceLat = pos.coords.latitude;
//       const deviceLng = pos.coords.longitude;
//       setLat(deviceLat.toString());
//       setLng(deviceLng.toString());
//       setLocationAName("My Location");
//       if (!savedPlaces.some(p => p.name === "My Location")) {
//         setSavedPlaces([...savedPlaces, { name: "My Location", lat: deviceLat, lng: deviceLng }]);
//       }
//     });
//   };

//   const handleSavePlace = () => {
//     const name = prompt("Enter a name for this location:");
//     if (!name) return;
//     setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
//   };

//   const handleMyLocationB = () => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       const deviceLat = pos.coords.latitude;
//       const deviceLng = pos.coords.longitude;
//       setBLatInput(deviceLat.toString());
//       setBLngInput(deviceLng.toString());
//       setLocationBName("My Location");
//       handleCompareSelect(deviceLat, deviceLng, "My Location");
//     });
//   };

//   const handleSavePlaceB = () => {
//     if (!compareName) return;
//     setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);
//   };

//   const EvidenceSection = ({ data }) => (
//     <div className="card evidence-card" style={{ height: '100%' }}>
//       <h3>Evidence Details</h3>
//       <div className="evidence-list">
//         {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
//           const val = data.factors[id] ?? 0;
//           const meta = data.explanation?.factors_meta?.[id];
//           if (!meta) return null;
//           return (
//             <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
//               <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
//               <p>{meta.reason}</p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   const handleSearchResult = (searchLat, searchLng, searchName) => {
//     setLat(searchLat.toString());
//     setLng(searchLng.toString());
//     setLocationAName(searchName);
//     setZoom(16);
//   };

//   return (
//     <div className="app-shell">
//       <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onSearchResult={handleSearchResult} />
      
//       <SideBar
//         onSearchResult={handleSearchResult} // THIS IS THE CRITICAL ADDITION
//         lat={lat} setLat={setLat} lng={lng} setLng={setLng}
//         locationAName={locationAName} setLocationAName={setLocationAName}
//         loading={loading} handleSubmit={handleSubmit}
//         handleMyLocation={handleMyLocation} handleSavePlace={handleSavePlace}
//         handleNearbyPlaces={handleNearbyPlaces} result={result}
//         nearbyLoading={nearbyLoading} showLocationB={showLocationB}
//         setShowLocationB={setShowLocationB} locationBName={locationBName}
//         isSelectingB={isSelectingB} setIsSelectingB={setIsSelectingB}
//         bLatInput={bLatInput} setBLatInput={setBLatInput}
//         bLngInput={bLngInput} setBLngInput={setBLngInput}
//         savedPlaces={savedPlaces} handleCompareSelect={handleCompareSelect}
//         compareLoading={compareLoading} handleMyLocationB={handleMyLocationB}
//         isBFromSavedPlace={isBFromSavedPlace} handleSavePlaceB={handleSavePlaceB}
//         analyzedCoordsB={analyzedCoordsB} nearbyLoadingB={nearbyLoadingB}
//         handleNearbyPlacesB={handleNearbyPlacesB} isCompareMode={isCompareMode}
//         setIsCompareMode={setIsCompareMode} editingIndex={editingIndex}
//         setEditingIndex={setEditingIndex} editingName={editingName}
//         setEditingName={setEditingName} setSavedPlaces={setSavedPlaces}
//         sidebarWidth={sidebarWidth} startResizingSide={startResizingSide}
//       />

//       <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
//         <section className="map-container" style={{ flex: 1, position: 'relative' }}>
//           {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
          
//           <div className="map-variety-picker">
//             <label className="picker-header">🗺️ Map Style</label>
//             <select value={mapVariety} onChange={(e) => setMapVariety(e.target.value)} className="variety-select">
//               <optgroup label="Google Maps">
//                 <option value="hybrid">Satellite Hybrid</option>
//                 <option value="satellite">Pure Satellite</option>
//                 <option value="terrain">Physical Terrain</option>
//               </optgroup>
//               <optgroup label="Analysis Themes">
//                 <option value="dark">Dark Matter (Pro)</option>
//                 <option value="topo">Topographic (Technical)</option>
//                 <option value="streets">Standard Streets</option>
//                 <option value="light">Minimalist Light</option>
//               </optgroup>
//             </select>
//           </div>

//           <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%" }}>
//             <TileLayer url={varieties[mapVariety]} />
//             <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
//           </MapContainer>
//         </section>

//         <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

//         <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
//           {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain Data...</div>}
          
//           {result && !isCompareMode && (
//             <div className="results-grid">
//               <div className="col-1">
//                 <FactorsSection data={result} latVal={analyzedCoords.lat} lngVal={analyzedCoords.lng} isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} />
//               </div>
//               <div className="col-2">
//                 <EvidenceSection data={result} />
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
//                 <div className="compare-pane-ditto">
//                     <h4 className="pane-header">SITE A: CURRENT</h4>
//                     <FactorsSection data={result} latVal={analyzedCoords.lat} lngVal={analyzedCoords.lng} isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} />
//                     <EvidenceSection data={result} />
//                 </div>
//                 <div className="compare-pane-ditto">
//                     <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
//                     {compareResult ? (
//                         <>
//                         <FactorsSection data={compareResult} latVal={analyzedCoordsB.lat || bLatInput} lngVal={analyzedCoordsB.lng || bLngInput} isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} />
//                         <EvidenceSection data={compareResult} />
//                         </>
//                     ) : <div className="empty-results">Waiting for selection...</div>}
//                 </div>
//             </div>
//           )}
//         </section>

//         {/* Floating GeoGPT Container - MOVED TO TOP LEVEL TO BE PAGE-FIXED */}
//         <div className={`geogpt-fixed-container ${isGptOpen ? 'expanded' : ''}`}>
//             {isGptOpen ? (
//               <div className="geogpt-polished-box">
//                 <div className="geogpt-chat-header" onClick={() => setIsGptOpen(false)}>
//                   <div className="gpt-status">
//                     <span className="gpt-dot"></span>
//                     <strong>GeoGPT Intelligence</strong>
//                   </div>
//                   <button className="close-gpt">×</button>
//                 </div>
                
//                 <div className="geogpt-messages">
//                   {chatHistory.map((msg, i) => (
//                     <div key={i} className={`chat-msg ${msg.role}`}>
//                       <div className="msg-bubble">{msg.content}</div>
//                     </div>
//                   ))}
//                   {gptLoading && <div className="chat-msg assistant"><div className="msg-bubble thinking-bubble">Thinking...</div></div>}
//                   <div ref={chatEndRef} />
//                 </div>

//                 <form className="geogpt-input-area" onSubmit={handleAskGpt}>
//                   <input 
//                     type="text"
//                     placeholder="Ask about terrain, scores, or project goals..." 
//                     value={userQuery}
//                     onChange={(e) => setUserQuery(e.target.value)}
//                   />
//                   <button type="submit" disabled={!userQuery.trim() || gptLoading}>
//                     <span className="send-icon">🚀</span>
//                   </button>
//                 </form>
//               </div>
//             ) : (
//               // <button className="geogpt-pill-btn" onClick={() => setIsGptOpen(true)}>
//               //   <div className="gpt-icon-glow">🤖</div>
//               //   <div className="gpt-label-polished">GeoGPT Assistant</div>
//               // </button>
//               // Inside your return statement:
//             <button className="geogpt-pill-btn" onClick={() => setIsGptOpen(true)}>
//               {/* Professional Icon: Use a Sparkle, Robot, or Wand icon */}
//               <div className="gpt-icon-glow">✨</div> 
//             </button>
//             )}
//           </div>
//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import FactorBar from "../FactorBar/FactorBar";
import SideBar from "../SideBar/SideBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LandSuitabilityChecker.css";
import TopNav from "../TopNav/TopNav";
import RadarChart from "../RadarChart/RadarChart"; 
import HistoryView from "../HistoryView/HistoryView"; 

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const varieties = {
  streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
  roads: "https://mt1.google.com/vt/lyrs=h&x={x}/{y}&z={z}",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  watercolor: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
};

const LocationMarker = ({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) => {
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
};

const FactorsSection = memo(({ data, latVal, lngVal, locationName, isDarkMode, viewMode, setViewMode, onOpenHistory, mapVariety }) => {
  const nLat = parseFloat(latVal);
  const nLng = parseFloat(lngVal);
  const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

  return (
    <>
      <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
        <div className="mini-map-context">
          {isValidCoords ? (
            <MapContainer center={[nLat, nLng]} zoom={15} zoomControl={false} dragging={false} touchZoom={false} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer url={varieties[mapVariety] || varieties.hybrid} />
                <Marker position={[nLat, nLng]} />
            </MapContainer>
          ) : <div className="empty-results" style={{fontSize: '11px'}}>Awaiting Geospatial Analysis...</div>}
          <div className="mini-map-label">Tactical Preview</div>
        </div>

        <div className="card-coordinates">
          <span>LAT: {isValidCoords ? nLat.toFixed(4) : "0.0000"}</span>
          <span>LNG: {isValidCoords ? nLng.toFixed(4) : "0.0000"}</span>
        </div>
        
        <div className="suitability-header-row">
          <h3>Suitability Intelligence</h3>
        </div>

        <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
          {data.suitability_score?.toFixed(1)}
        </div>
        <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
        
        <div className="history-action-container">
          <button 
            className="history-pro-btn" 
            onClick={() => onOpenHistory(data, locationName, latVal, lngVal)} 
            title="Execute Temporal Analysis"
          >
            <span className="pulse-dot"></span>
            <span className="btn-text">ANALYZE HISTORICAL TRENDS</span>
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
      
      <div className="card factors-card">
        <div className="factors-header">
          <h3>Terrain Factors</h3>
          <button className="view-toggle" onClick={() => setViewMode(viewMode === "bars" ? "radar" : "bars")}>
              {viewMode === "bars" ? "🕸️ Radar View" : "📊 Bar View"}
          </button>
        </div>

        {viewMode === "bars" ? (
          <div className="bars-container">
            {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
              <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
            ))}
          </div>
        ) : (
          <div className="radar-container" style={{ height: '300px', width: '100%', position: 'relative' }}>
              <RadarChart key={`radar-${nLat}-${nLng}`} data={data.factors} isDarkMode={isDarkMode} />
          </div>
        )}
      </div>
    </>
  );
});

export default function LandSuitabilityChecker() {
  const BACKEND_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://geoai-major-vnrvjiet22-26-itb.onrender.com";

  const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
  const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
  const [mapVariety, setMapVariety] = useState(() => localStorage.getItem("geo_map_style") || "streets");
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("geo_theme");
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("geo_last_result");
    return saved ? JSON.parse(saved) : null;
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
  const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
  const isResizingSide = useRef(false);
  const isResizingBottom = useRef(false);

  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [compareName, setCompareName] = useState("");
  const [isSelectingB, setIsSelectingB] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [bLatInput, setBLatInput] = useState("");
  const [bLngInput, setBLngInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug] = useState(false);
  const [viewMode, setViewMode] = useState("bars"); 

  const [showHistory, setShowHistory] = useState(false); 
  const [historyTargetData, setHistoryTargetData] = useState(null);
  const [historyTargetName, setHistoryTargetName] = useState("");
  const [historyTargetCoords, setHistoryTargetCoords] = useState({ lat: "", lng: "" });

  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = localStorage.getItem("savedPlaces");
    return stored ? JSON.parse(stored) : [];
  });

  const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
  const [locationAName, setLocationAName] = useState("Site A");
  const [locationBName, setLocationBName] = useState("Site B");
  const [showLocationB, setShowLocationB] = useState(false);

  const [isGptOpen, setIsGptOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am GeoGPT. Ask me anything about the project or analyzed land results.' }
  ]);
  const [userQuery, setUserQuery] = useState("");
  const [gptLoading, setGptLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  const handleAskGpt = async (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim()) return;
    const userMessage = { role: 'user', content: userQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setGptLoading(true);
    const queryToSend = userQuery;
    setUserQuery("");

    try {
      const response = await fetch(`${BACKEND_URL}/ask_geogpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryToSend,
          currentData: result,
          locationName: locationAName,
          compareData: compareResult
        }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm currently offline." }]);
    } finally {
      setGptLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("geo_lat", lat);
    localStorage.setItem("geo_lng", lng);
    localStorage.setItem("geo_zoom", zoom);
    localStorage.setItem("geo_theme", isDarkMode);
    localStorage.setItem("geo_map_style", mapVariety);
    localStorage.setItem("sidebar_width", sidebarWidth);
    localStorage.setItem("bottom_height", bottomHeight);
    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
    if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
    else localStorage.removeItem("geo_last_result"); 
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    if (isDarkMode && mapVariety === "streets") setMapVariety("dark");
    if (!isDarkMode && mapVariety === "dark") setMapVariety("streets");
  }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result, savedPlaces, mapVariety]);

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
    const response = await fetch(`${BACKEND_URL}/suitability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),
    });
    return await response.json();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
    
    // Auto-detection logic for Site A
    const matchedPlace = savedPlaces.find(p => 
        p.lat.toFixed(4) === parseFloat(lat).toFixed(4) && 
        p.lng.toFixed(4) === parseFloat(lng).toFixed(4)
    );
    
    let name = matchedPlace ? matchedPlace.name : null;
    if (!name) { 
        name = prompt("Enter name for analyzed Site A:") || "Site A"; 
    }
    setLocationAName(name);

    try { 
      const data = await performAnalysis(lat, lng); 
      setResult(data); 
      setAnalyzedCoords({ lat: lat, lng: lng }); 
    }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenHistory = (targetData, targetName, targetLat, targetLng) => {
    setHistoryTargetData(targetData);
    setHistoryTargetName(targetName);
    setHistoryTargetCoords({ lat: targetLat, lng: targetLng });
    setShowHistory(true);
  };

  const handleCompareSelect = async (tLat, tLng, existingName = null) => {
    setIsSelectingB(false);
    setBLatInput(tLat.toString());
    setBLngInput(tLng.toString());
    
    const matchedPlace = savedPlaces.find(p => 
      p.lat.toFixed(4) === parseFloat(tLat).toFixed(4) && 
      p.lng.toFixed(4) === parseFloat(tLng).toFixed(4)
    );
    
    let name = existingName || (matchedPlace ? matchedPlace.name : null);
    if (!name) { name = prompt("Enter name for Location B:") || "Site B"; }
    setCompareName(name);
    setLocationBName(name);
    setCompareLoading(true);
    setIsCompareMode(true);
    setCompareResult(null);
    try { 
      const data = await performAnalysis(tLat, tLng); 
      setCompareResult(data);
    }
    catch (err) { console.error(err); } 
    finally { setCompareLoading(false); }
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

  const handleSearchResult = (searchLat, searchLng, searchName) => {
    setLat(searchLat.toString());
    setLng(searchLng.toString());
    setZoom(16);
  };

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

  return (
    <div className="app-shell">
      <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onSearchResult={handleSearchResult} />
      
      <SideBar
        onSearchResult={handleSearchResult}
        lat={lat} setLat={setLat} lng={lng} setLng={setLng}
        locationAName={locationAName} setLocationAName={setLocationAName}
        loading={loading} handleSubmit={handleSubmit}
        handleMyLocation={handleMyLocation} handleSavePlace={handleSavePlace}
        result={result} showLocationB={showLocationB}
        setShowLocationB={setShowLocationB} locationBName={locationBName}
        isSelectingB={isSelectingB} setIsSelectingB={setIsSelectingB}
        bLatInput={bLatInput} setBLatInput={setBLatInput}
        bLngInput={bLngInput} setBLngInput={setBLngInput}
        savedPlaces={savedPlaces} handleCompareSelect={handleCompareSelect}
        compareLoading={compareLoading} isCompareMode={isCompareMode}
        setSavedPlaces={setSavedPlaces}
        sidebarWidth={sidebarWidth} startResizingSide={startResizingSide}
      />

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <section className="map-container" style={{ flex: 1, position: 'relative' }}>
          {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
          <div className="map-variety-picker">
            <label className="picker-header">🗺️ Map Style</label>
            <select value={mapVariety} onChange={(e) => setMapVariety(e.target.value)} className="variety-select">
              <optgroup label="Google Maps">
                <option value="hybrid">Satellite Hybrid</option>
                <option value="satellite">Pure Satellite</option>
                <option value="terrain">Physical Terrain</option>
              </optgroup>
              <optgroup label="Analysis Themes">
                <option value="dark">Dark Matter (Pro)</option>
                <option value="topo">Topographic (Technical)</option>
                <option value="streets">Standard Streets</option>
                <option value="light">Minimalist Light</option>
              </optgroup>
            </select>
          </div>

          <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={varieties[mapVariety]} />
            <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} setZoom={setZoom} isSelectingB={isSelectingB} onSelectB={handleCompareSelect} />
          </MapContainer>
        </section>

        <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

        <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
          {(loading || compareLoading) && <div className="loading-overlay">Analyzing Terrain Data...</div>}
          
          {result && !isCompareMode && (
            <div className="results-grid">
              <div className="col-1">
                <FactorsSection 
                  data={result} 
                  latVal={analyzedCoords.lat} 
                  lngVal={analyzedCoords.lng} 
                  locationName={locationAName}
                  isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} 
                  onOpenHistory={handleOpenHistory}
                  mapVariety={mapVariety}
                />
              </div>
              <div className="col-2">
                <EvidenceSection data={result} />
              </div>
            </div>
          )}

          {result && isCompareMode && (
            <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
                <div className="compare-pane-ditto">
                    <h4 className="pane-header">{locationAName.toUpperCase()} (SITE A)</h4>
                    <FactorsSection 
                      data={result} 
                      latVal={analyzedCoords.lat} 
                      lngVal={analyzedCoords.lng} 
                      locationName={locationAName}
                      isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} 
                      onOpenHistory={handleOpenHistory}
                      mapVariety={mapVariety}
                    />
                    <EvidenceSection data={result} />
                </div>
                <div className="compare-pane-ditto">
                    <h4 className="pane-header">{compareName.toUpperCase()} (SITE B)</h4>
                    {compareResult ? (
                        <>
                        <FactorsSection 
                          data={compareResult} 
                          latVal={bLatInput} 
                          lngVal={bLngInput} 
                          locationName={compareName || "Site B"}
                          isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} 
                          onOpenHistory={handleOpenHistory}
                          mapVariety={mapVariety}
                        />
                        <EvidenceSection data={compareResult} />
                        </>
                    ) : <div className="empty-results">Waiting for selection...</div>}
                </div>
            </div>
          )}
        </section>

        <div className={`geogpt-fixed-container ${isGptOpen ? 'expanded' : ''}`}>
            {isGptOpen ? (
              <div className="geogpt-polished-box">
                <div className="geogpt-chat-header" onClick={() => setIsGptOpen(false)}>
                  <div className="gpt-status">
                    <span className="gpt-dot"></span>
                    <strong>GeoGPT Intelligence</strong>
                  </div>
                  <button className="close-gpt">×</button>
                </div>
                <div className="geogpt-messages">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role}`}>
                      <div className="msg-bubble">{msg.content}</div>
                    </div>
                  ))}
                  {gptLoading && <div className="chat-msg assistant"><div className="msg-bubble thinking-bubble">Thinking...</div></div>}
                  <div ref={chatEndRef} />
                </div>
                <form className="geogpt-input-area" onSubmit={handleAskGpt}>
                  <input type="text" placeholder="Ask GeoGPT..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                  <button type="submit" disabled={!userQuery.trim() || gptLoading}>🚀</button>
                </form>
              </div>
            ) : (
            <button className="geogpt-pill-btn" onClick={() => setIsGptOpen(true)}>
              <div className="gpt-icon-glow">✨</div> 
            </button>
            )}
          </div>
      </main>
      
      {showHistory && historyTargetData && (
        <HistoryView 
          data={historyTargetData} 
          locationName={historyTargetName} 
          onClose={() => setShowHistory(false)} 
          lat={historyTargetCoords.lat}
          lng={historyTargetCoords.lng}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}