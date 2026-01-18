// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import SideBar from "../SideBar/SideBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";
// import TopNav from "../TopNav/TopNav";

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

// const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
//   const [showNearby, setShowNearby] = useState(false);
//   const [nearbyData, setNearbyData] = useState(null);
//   const [nearbyLoading, setNearbyLoading] = useState(false);
//   const [showNearbyB, setShowNearbyB] = useState(false);
//   const [nearbyDataB, setNearbyDataB] = useState(null);
//   const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
//   const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
//   const [isBFromSavedPlace, setIsBFromSavedPlace] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingName, setEditingName] = useState("");
//   const [locationAName, setLocationAName] = useState("Site A");
//   const [locationBName, setLocationBName] = useState("Site B");
//   const [showLocationB, setShowLocationB] = useState(false);
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

//   // const handleSubmit = async (e) => {
//   //   if (e) e.preventDefault();
//   //   setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
//   //   try { const data = await performAnalysis(lat, lng); setResult(data); }
//   //   catch (err) { console.error(err); } finally { setLoading(false); }
//   // };
//   const handleSubmit = async (e) => {
//   if (e) e.preventDefault();
//   setResult(null); 
//   setCompareResult(null); 
//   setIsCompareMode(false); 
//   setLoading(true);

//   try { 
//     const data = await performAnalysis(lat, lng); 
//     setResult(data); 
//     // SAVE THE COORDINATES HERE
//     setAnalyzedCoords({ lat: lat, lng: lng }); 
//   }
//   catch (err) { 
//     console.error(err); 
//   } finally { 
//     setLoading(false); 
//   }
// };

 
// const handleCompareSelect = async (tLat, tLng, existingName = null) => {
//     setIsSelectingB(false);
//     setBLatInput(tLat.toString());
//     setBLngInput(tLng.toString());

//     // FIRST: Check if coordinates match a saved place
//     const matchedPlace = savedPlaces.find(p => 
//       p.lat.toFixed(4) === parseFloat(tLat).toFixed(4) && 
//       p.lng.toFixed(4) === parseFloat(tLng).toFixed(4)
//     );
    
//     // Use matched place name, or existingName, or prompt as last resort
//     let name = existingName || (matchedPlace ? matchedPlace.name : null);
    
//     // Only prompt if no name found from existing or saved places
//     if (!name) {
//       name = prompt("Enter name for Location B:") || "Site B";
//     }
    
//     setCompareName(name);
//     setLocationBName(name);
//     setCompareLoading(true);
//     setIsCompareMode(true);
//     // Clear previous result when analyzing a new location B
//     setCompareResult(null);
//     // Track if B is from saved places
//     setIsBFromSavedPlace(!!existingName || !!matchedPlace);
//     try { 
//       const data = await performAnalysis(tLat, tLng); 
//       setCompareResult(data);
//       // Save Location B coordinates for nearby places
//       setAnalyzedCoordsB({ lat: tLat.toString(), lng: tLng.toString() });
//     }
//     catch (err) { console.error(err); } 
//     finally { setCompareLoading(false); }
//   };

//   const handleNearbyPlaces = async () => {
//     setNearbyLoading(true);
//     try {
//       // const res = await fetch("http://127.0.0.1:5000/nearby_places", {
//         const res = await fetch("/nearby_places", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
//       });

//       const data = await res.json();
//       setNearbyData(data);
//       setShowNearby(true);
//     } catch (err) {
//       console.error("Failed to load nearby places", err);
//     } finally {
//       setNearbyLoading(false);
//     }
//   };

//   const handleNearbyPlacesB = async () => {
//     setNearbyLoadingB(true);
//     try {
//       // const res = await fetch("http://127.0.0.1:5000/nearby_places", {
//       const res = await fetch("/nearby_places", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude: parseFloat(analyzedCoordsB.lat), longitude: parseFloat(analyzedCoordsB.lng) }),
//       });

//       const data = await res.json();
//       setNearbyDataB(data);
//       setShowNearbyB(true);
//     } catch (err) {
//       console.error("Failed to load nearby places for Location B", err);
//     } finally {
//       setNearbyLoadingB(false);
//     }
//   };
//   <LocationMarker 
//   lat={lat} 
//   lng={lng} 
//   setLat={setLat} 
//   setLng={setLng} 
//   setZoom={setZoom} 
//   isSelectingB={isSelectingB} 
//   onSelectB={(tLat, tLng) => {
//     setBLatInput(tLat.toString());
//     setBLngInput(tLng.toString());
//     handleCompareSelect(tLat, tLng);
//   }} 
// />
//   const handleMyLocation = () => {
//     // Get device's actual current location
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       const deviceLat = pos.coords.latitude;
//       const deviceLng = pos.coords.longitude;
      
//       setLat(deviceLat.toString());
//       setLng(deviceLng.toString());
//       setLocationAName("My Location");
      
//       // Auto-save "My Location" with device's actual coordinates (no prompt)
//       const myLocExists = savedPlaces.some(p => p.name === "My Location");
//       if (!myLocExists) {
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
//     // Get device's actual current location
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition((pos) => {
//       const deviceLat = pos.coords.latitude;
//       const deviceLng = pos.coords.longitude;
      
//       setBLatInput(deviceLat.toString());
//       setBLngInput(deviceLng.toString());
//       setLocationBName("My Location");
//       handleCompareSelect(deviceLat, deviceLng, "My Location");
      
//       // Auto-save "My Location" with device's actual coordinates (no prompt)
//       const myLocExists = savedPlaces.some(p => p.name === "My Location");
//       if (!myLocExists) {
//         setSavedPlaces([...savedPlaces, { name: "My Location", lat: deviceLat, lng: deviceLng }]);
//       }
//     });
//   };

//   const handleSavePlaceB = () => {
//     if (!compareName) return;
//     setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);
//   };

//  const FactorsSection = ({ data, latVal, lngVal }) => {
//     const formatCoord = (val) => {
//       const num = parseFloat(val);
//       return !isNaN(num) ? num.toFixed(4) : "..."; 
//     };

//     return (
//       <>
//         <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//           <div className="card-coordinates">
//             <span>LAT: {formatCoord(latVal)}</span>
//             <span>LNG: {formatCoord(lngVal)}</span>
//           </div>
          
//           <h3>Overall Suitability</h3>
//           <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//             {data.suitability_score?.toFixed(1)}
//           </div>
//           <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//         </div>
        
//         <div className="card factors-card">
//           <h3>Terrain Factors</h3>
//           {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//             <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
//           ))}
//         </div>
//       </>
//     );
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

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell">
//       <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
//       <SideBar
//         // Location A states and handlers
//         lat={lat}
//         setLat={setLat}
//         lng={lng}
//         setLng={setLng}
//         locationAName={locationAName}
//         setLocationAName={setLocationAName}
//         loading={loading}
//         handleSubmit={handleSubmit}
//         handleMyLocation={handleMyLocation}
//         handleSavePlace={handleSavePlace}
//         handleNearbyPlaces={handleNearbyPlaces}
//         result={result}
//         nearbyLoading={nearbyLoading}
//         // Location B states and handlers
//         showLocationB={showLocationB}
//         setShowLocationB={setShowLocationB}
//         locationBName={locationBName}
//         isSelectingB={isSelectingB}
//         setIsSelectingB={setIsSelectingB}
//         bLatInput={bLatInput}
//         setBLatInput={setBLatInput}
//         bLngInput={bLngInput}
//         setBLngInput={setBLngInput}
//         savedPlaces={savedPlaces}
//         handleCompareSelect={handleCompareSelect}
//         compareLoading={compareLoading}
//         handleMyLocationB={handleMyLocationB}
//         isBFromSavedPlace={isBFromSavedPlace}
//         handleSavePlaceB={handleSavePlaceB}
//         analyzedCoordsB={analyzedCoordsB}
//         nearbyLoadingB={nearbyLoadingB}
//         handleNearbyPlacesB={handleNearbyPlacesB}
//         isCompareMode={isCompareMode}
//         setIsCompareMode={setIsCompareMode}
//         // Saved Places states and handlers
//         editingIndex={editingIndex}
//         setEditingIndex={setEditingIndex}
//         editingName={editingName}
//         setEditingName={setEditingName}
//         setSavedPlaces={setSavedPlaces}
//         // Sidebar styling
//         sidebarWidth={sidebarWidth}
//         startResizingSide={startResizingSide}
//       />

//       <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        
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
//               <div className="col-1">
//                 {/* Change latVal and lngVal to use analyzedCoords */}
//                 <FactorsSection 
//                   data={result} 
//                   latVal={analyzedCoords.lat} 
//                   lngVal={analyzedCoords.lng} 
//                 />
//               </div>
//               <div className="col-2">
//                 <EvidenceSection data={result} />
//               </div>
//             </div>
//           )}

//           {result && isCompareMode && (
//             <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
//             <div className="compare-pane-ditto">
//               <h4 className="pane-header">SITE A: CURRENT</h4>
//               {/* Replaced lat/lng with analyzedCoords to "lock" the data */}
//               <FactorsSection 
//                 data={result} 
//                 latVal={analyzedCoords.lat} 
//                 lngVal={analyzedCoords.lng} 
//               />
//               <EvidenceSection data={result} />
//             </div>

//             <div className="compare-pane-ditto">
//               <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
//               {compareResult ? (
//                 <>
//                   <FactorsSection 
//                     data={compareResult} 
//                     latVal={compareResult.latitude || bLatInput} 
//                     lngVal={compareResult.longitude || bLngInput} 
//                   />
//                   <EvidenceSection data={compareResult} />
//                 </>
//               ) : <div className="empty-results">Waiting for selection...</div>}
//             </div>
//             </div>
//           )}
//         </section>

//         {showNearby && (
//           <div className="modal-overlay" onClick={() => setShowNearby(false)}>
//             <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h3>Nearby Places (1.5 km)</h3>
//                 <button className="modal-close" onClick={() => setShowNearby(false)}>✖</button>
//               </div>

//               <div className="modal-body">
//                 {nearbyData?.places?.length ? (
//                   (() => {
//                     const schools = nearbyData.places.filter(p => p.type === "school");
//                     const hospitals = nearbyData.places.filter(p => p.type === "hospital");
//                     const colleges = nearbyData.places.filter(
//                       p => p.type === "college" || p.type === "university"
//                     );

//                     const Section = ({ title, items }) => (
//                       <div className="nearby-section">
//                         <h4>{title} ({items.length})</h4>
//                         {items.length ? (
//                           <div className="nearby-items-list">
//                             {items.map((p, i) => (
//                               <div key={i} className="nearby-item">
//                                 <span className="nearby-name">{p.name}</span>
//                                 <span className="nearby-distance">{p.distance_km} km</span>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="nearby-empty">No nearby {title.toLowerCase()} found.</div>
//                         )}
//                       </div>
//                     );

//                     return (
//                       <>
//                         <Section title="🏫 Schools" items={schools} />
//                         <Section title="🏥 Hospitals" items={hospitals} />
//                         <Section title="🎓 Colleges & Universities" items={colleges} />
//                       </>
//                     );
//                   })()
//                 ) : (
//                   <div className="nearby-empty">
//                     No mapped amenities within 1.5 km.<br />
//                     This likely indicates a rural or low-density region.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {showNearbyB && (
//           <div className="modal-overlay" onClick={() => setShowNearbyB(false)}>
//             <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h3>Nearby Places - Location B (1.5 km)</h3>
//                 <button className="modal-close" onClick={() => setShowNearbyB(false)}>✖</button>
//               </div>

//               <div className="modal-body">
//                 {nearbyDataB?.places?.length ? (
//                   (() => {
//                     const schools = nearbyDataB.places.filter(p => p.type === "school");
//                     const hospitals = nearbyDataB.places.filter(p => p.type === "hospital");
//                     const colleges = nearbyDataB.places.filter(
//                       p => p.type === "college" || p.type === "university"
//                     );

//                     const Section = ({ title, items }) => (
//                       <div className="nearby-section">
//                         <h4>{title} ({items.length})</h4>
//                         {items.length ? (
//                           <div className="nearby-items-list">
//                             {items.map((p, i) => (
//                               <div key={i} className="nearby-item">
//                                 <span className="nearby-name">{p.name}</span>
//                                 <span className="nearby-distance">{p.distance_km} km</span>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="nearby-empty">No nearby {title.toLowerCase()} found.</div>
//                         )}
//                       </div>
//                     );

//                     return (
//                       <>
//                         <Section title="🏫 Schools" items={schools} />
//                         <Section title="🏥 Hospitals" items={hospitals} />
//                         <Section title="🎓 Colleges & Universities" items={colleges} />
//                       </>
//                     );
//                   })()
//                 ) : (
//                   <div className="nearby-empty">
//                     No mapped amenities within 1.5 km.<br />
//                     This likely indicates a rural or low-density region.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import FactorBar from "../FactorBar/FactorBar";
// import SideBar from "../SideBar/SideBar";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "./LandSuitabilityChecker.css";
// import TopNav from "../TopNav/TopNav";
// import { Radar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   RadialLinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// // Register ChartJS components for Feature 1
// ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// // Fix Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// /**
//  * FIX: Validates Lat/Lng before calling map.setView to prevent NaN crash
//  */
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
//     // Only update view if both are valid numbers
//     if (!isNaN(nLat) && !isNaN(nLng)) {
//       map.setView([nLat, nLng], map.getZoom());
//     }
//   }, [lat, lng, map]);

//   const markerPos = [parseFloat(lat) || 0, parseFloat(lng) || 0];
//   return <Marker position={markerPos} />;
// }

// export default function LandSuitabilityChecker() {
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
//   const [viewMode, setViewMode] = useState("bars"); // Toggle for Radar/Bars

//   const [savedPlaces, setSavedPlaces] = useState(() => {
//     const stored = localStorage.getItem("savedPlaces");
//     return stored ? JSON.parse(stored) : [];
//   });

//   const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
//   const [showNearby, setShowNearby] = useState(false);
//   const [nearbyData, setNearbyData] = useState(null);
//   const [nearbyLoading, setNearbyLoading] = useState(false);
//   const [showNearbyB, setShowNearbyB] = useState(false);
//   const [nearbyDataB, setNearbyDataB] = useState(null);
//   const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
//   const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
//   const [isBFromSavedPlace, setIsBFromSavedPlace] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingName, setEditingName] = useState("");
//   const [locationAName, setLocationAName] = useState("Site A");
//   const [locationBName, setLocationBName] = useState("Site B");
//   const [showLocationB, setShowLocationB] = useState(false);

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
//       if (!savedPlaces.some(p => p.name === "My Location")) {
//         setSavedPlaces([...savedPlaces, { name: "My Location", lat: deviceLat, lng: deviceLng }]);
//       }
//     });
//   };

//   const handleSavePlaceB = () => {
//     if (!compareName) return;
//     setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);
//   };

//   const FactorsSection = ({ data, latVal, lngVal }) => {
//     // FIX: Ensure latVal and lngVal are valid before rendering
//     const nLat = parseFloat(latVal);
//     const nLng = parseFloat(lngVal);
//     const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

//     const chartData = {
//       labels: ['Rainfall', 'Flood', 'Landslide', 'Soil', 'Proximity', 'Water', 'Pollution', 'Landuse'],
//       datasets: [{
//         label: 'Suitability Profile',
//         data: [
//           data.factors.rainfall, data.factors.flood, data.factors.landslide, 
//           data.factors.soil, data.factors.proximity, data.factors.water, 
//           data.factors.pollution, data.factors.landuse
//         ],
//         backgroundColor: 'rgba(45, 138, 138, 0.25)', 
//         borderColor: '#2d8a8a',
//         borderWidth: 2,
//         pointBackgroundColor: '#2d8a8a',
//       }],
//     };

//     const chartOptions = {
//       scales: {
//         r: {
//           angleLines: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
//           grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
//           pointLabels: { color: isDarkMode ? '#f8fafc' : '#0f172a', font: { size: 10, weight: 'bold' } },
//           ticks: { display: false, max: 100, min: 0 }
//         }
//       },
//       plugins: { legend: { display: false } },
//       maintainAspectRatio: false
//     };

//     return (
//       <>
//         <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//           {/* Feature 4: Mini-Map Context (Satellite Snapshot) */}
//           <div className="mini-map-context">
//             {isValidCoords ? (
//               <MapContainer 
//                   center={[nLat, nLng]} 
//                   zoom={15} 
//                   zoomControl={false} 
//                   dragging={false} 
//                   touchZoom={false} 
//                   scrollWheelZoom={false}
//                   style={{ height: "100%", width: "100%" }}
//               >
//                   <TileLayer url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
//                   <Marker position={[nLat, nLng]} />
//               </MapContainer>
//             ) : <div className="empty-results" style={{fontSize: '11px'}}>Waiting for analysis...</div>}
//             <div className="mini-map-label">Satellite Snapshot</div>
//           </div>

//           <div className="card-coordinates">
//             <span>LAT: {isValidCoords ? nLat.toFixed(4) : "..."}</span>
//             <span>LNG: {isValidCoords ? nLng.toFixed(4) : "..."}</span>
//           </div>
          
//           <h3>Overall Suitability</h3>
//           <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
//             {data.suitability_score?.toFixed(1)}
//           </div>
//           <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
//         </div>
        
//         <div className="card factors-card">
//           <div className="factors-header">
//             <h3>Terrain Factors</h3>
//             {/* Feature 1: View Toggle */}
//             <button className="view-toggle" onClick={() => setViewMode(viewMode === "bars" ? "radar" : "bars")}>
//                 {viewMode === "bars" ? "🕸️ Radar View" : "📊 Bar View"}
//             </button>
//           </div>

//           {viewMode === "bars" ? (
//             <div className="bars-container">
//               {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
//                 <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
//               ))}
//             </div>
//           ) : (
//             <div className="radar-container" style={{ height: '300px', width: '100%', position: 'relative' }}>
//                 <Radar data={chartData} options={chartOptions} />
//             </div>
//           )}
//         </div>
//       </>
//     );
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

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell">
//       <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
//       <SideBar
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
//               <div className="col-1">
//                 <FactorsSection data={result} latVal={analyzedCoords.lat} lngVal={analyzedCoords.lng} />
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
//                     <FactorsSection data={result} latVal={analyzedCoords.lat} lngVal={analyzedCoords.lng} />
//                     <EvidenceSection data={result} />
//                 </div>

//                 <div className="compare-pane-ditto">
//                     <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
//                     {compareResult ? (
//                         <>
//                         <FactorsSection data={compareResult} latVal={analyzedCoordsB.lat || bLatInput} lngVal={analyzedCoordsB.lng || bLngInput} />
//                         <EvidenceSection data={compareResult} />
//                         </>
//                     ) : <div className="empty-results">Waiting for selection...</div>}
//                 </div>
//             </div>
//           )}
//         </section>

//         {/* Modals preserved */}
//         {showNearby && (
//           <div className="modal-overlay" onClick={() => setShowNearby(false)}>
//             <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h3>Nearby Places (1.5 km)</h3>
//                 <button className="modal-close" onClick={() => setShowNearby(false)}>✖</button>
//               </div>
//               <div className="modal-body">
//                 {nearbyData?.places?.length ? (
//                   <>
//                     {["school", "hospital", "college"].map(type => (
//                       <div className="nearby-section" key={type}>
//                         <h4>{type === "college" ? "🎓 Colleges" : type === "school" ? "🏫 Schools" : "🏥 Hospitals"}</h4>
//                         <div className="nearby-items-list">
//                           {nearbyData.places.filter(p => p.type === type || (type === "college" && p.type === "university")).map((p, i) => (
//                             <div key={i} className="nearby-item">
//                               <span className="nearby-name">{p.name}</span>
//                               <span className="nearby-distance">{p.distance_km} km</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </>
//                 ) : <div className="nearby-empty">No mapped amenities within 1.5 km.</div>}
//               </div>
//             </div>
//           </div>
//         )}

//         {showNearbyB && (
//           <div className="modal-overlay" onClick={() => setShowNearbyB(false)}>
//             <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h3>Nearby Places - {compareName} (1.5 km)</h3>
//                 <button className="modal-close" onClick={() => setShowNearbyB(false)}>✖</button>
//               </div>
//               <div className="modal-body">
//                 {nearbyDataB?.places?.length ? (
//                   <>
//                     {["school", "hospital", "college"].map(type => (
//                       <div className="nearby-section" key={type}>
//                         <h4>{type === "college" ? "🎓 Colleges" : type === "school" ? "🏫 Schools" : "🏥 Hospitals"}</h4>
//                         <div className="nearby-items-list">
//                           {nearbyDataB.places.filter(p => p.type === type || (type === "college" && p.type === "university")).map((p, i) => (
//                             <div key={i} className="nearby-item">
//                               <span className="nearby-name">{p.name}</span>
//                               <span className="nearby-distance">{p.distance_km} km</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </>
//                 ) : <div className="nearby-empty">No mapped amenities within 1.5 km.</div>}
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



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

// /**
//  * FIX: Marker Component with explicit coordinate validation
//  */
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

// /**
//  * FactorsSection Component
//  * This MUST be a separate component and used with <FactorsSection />
//  * to maintain its own Hook context and prevent the useRef error.
//  */
// const FactorsSection = memo(({ data, latVal, lngVal, isDarkMode, viewMode, setViewMode }) => {
//   const nLat = parseFloat(latVal);
//   const nLng = parseFloat(lngVal);
//   const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

//   return (
//     <>

// // 4. Add a floating control inside the <section className="map-container">
// <div className="map-variety-picker">
//   <button onClick={() => setMapVariety("streets")} className={mapVariety === 'streets' ? 'active' : ''}>📍 Street</button>
//   <button onClick={() => setMapVariety("hybrid")} className={mapVariety === 'hybrid' ? 'active' : ''}>🛰️ Satellite</button>
//   <button onClick={() => setMapVariety("terrain")} className={mapVariety === 'terrain' ? 'active' : ''}>⛰️ Terrain</button>
// </div>
//       <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
//         <div className="mini-map-context">
//           {isValidCoords ? (
//             <MapContainer 
//                 center={[nLat, nLng]} 
//                 zoom={15} 
//                 zoomControl={false} 
//                 dragging={false} 
//                 touchZoom={false} 
//                 scrollWheelZoom={false}
//                 style={{ height: "100%", width: "100%" }}
//             >
//                 <TileLayer url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
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
//               {/* Feature 1: The Radar Chart is now its own properly isolated component */}
//               <RadarChart key={`${nLat}-${nLng}`} data={data.factors} isDarkMode={isDarkMode} />
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
//   const [showNearby, setShowNearby] = useState(false);
//   const [nearbyData, setNearbyData] = useState(null);
//   const [nearbyLoading, setNearbyLoading] = useState(false);
//   const [showNearbyB, setShowNearbyB] = useState(false);
//   const [nearbyDataB, setNearbyDataB] = useState(null);
//   const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
//   const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
//   const [isBFromSavedPlace, setIsBFromSavedPlace] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingName, setEditingName] = useState("");
//   const [locationAName, setLocationAName] = useState("Site A");
//   const [locationBName, setLocationBName] = useState("Site B");
//   const [showLocationB, setShowLocationB] = useState(false);

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

//   const tileLayerUrl = isDarkMode 
//     ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//     : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

//   return (
//     <div className="app-shell">
//       <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
//       <SideBar
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
//               <div className="col-1">
//                 <FactorsSection 
//                    data={result} 
//                    latVal={analyzedCoords.lat} 
//                    lngVal={analyzedCoords.lng} 
//                    isDarkMode={isDarkMode}
//                    viewMode={viewMode}
//                    setViewMode={setViewMode}
//                 />
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
//                     <FactorsSection 
//                       data={result} 
//                       latVal={analyzedCoords.lat} 
//                       lngVal={analyzedCoords.lng} 
//                       isDarkMode={isDarkMode}
//                       viewMode={viewMode}
//                       setViewMode={setViewMode}
//                     />
//                     <EvidenceSection data={result} />
//                 </div>

//                 <div className="compare-pane-ditto">
//                     <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
//                     {compareResult ? (
//                         <>
//                         <FactorsSection 
//                           data={compareResult} 
//                           latVal={analyzedCoordsB.lat || bLatInput} 
//                           lngVal={analyzedCoordsB.lng || bLngInput} 
//                           isDarkMode={isDarkMode}
//                           viewMode={viewMode}
//                           setViewMode={setViewMode}
//                         />
//                         <EvidenceSection data={compareResult} />
//                         </>
//                     ) : <div className="empty-results">Waiting for selection...</div>}
//                 </div>
//             </div>
//           )}
//         </section>

//         {/* Nearby Place Modals logic remained unchanged from your original */}
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

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * 1. Define Map Varieties (Styles)
 */
// const varieties = {
//   streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//   dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
//   satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
//   hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
//   terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
// };
const varieties = {
  // --- STANDARD ---
  streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  
  // --- GOOGLE BUNDLE ---
  satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
  roads: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}", // Transparent Roads only

  // --- PROFESSIONAL / DESIGNER ---
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", // Sleek black
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", // Professional gray
  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", // Colorful
  
  // --- SPECIALIZED ---
  topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", // Technical contour lines
  watercolor: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg" // Artistic
};

/**
 * Marker Component with explicit coordinate validation
 */
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

/**
 * FactorsSection Component
 */
const FactorsSection = memo(({ data, latVal, lngVal, isDarkMode, viewMode, setViewMode }) => {
  const nLat = parseFloat(latVal);
  const nLng = parseFloat(lngVal);
  const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

  return (
    <>
      <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
        <div className="mini-map-context">
          {isValidCoords ? (
            <MapContainer 
                center={[nLat, nLng]} 
                zoom={15} 
                zoomControl={false} 
                dragging={false} 
                touchZoom={false} 
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer url={varieties.hybrid} />
                <Marker position={[nLat, nLng]} />
            </MapContainer>
          ) : <div className="empty-results" style={{fontSize: '11px'}}>Waiting for analysis...</div>}
          <div className="mini-map-label">Satellite Snapshot</div>
        </div>

        <div className="card-coordinates">
          <span>LAT: {isValidCoords ? nLat.toFixed(4) : "..."}</span>
          <span>LNG: {isValidCoords ? nLng.toFixed(4) : "..."}</span>
        </div>
        
        <h3>Overall Suitability</h3>
        <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
          {data.suitability_score?.toFixed(1)}
        </div>
        <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
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
  const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
  const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
  const [mapVariety, setMapVariety] = useState("streets"); // Default style
  
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

  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = localStorage.getItem("savedPlaces");
    return stored ? JSON.parse(stored) : [];
  });

  const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyData, setNearbyData] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showNearbyB, setShowNearbyB] = useState(false);
  const [nearbyDataB, setNearbyDataB] = useState(null);
  const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
  const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
  const [isBFromSavedPlace, setIsBFromSavedPlace] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [locationAName, setLocationAName] = useState("Site A");
  const [locationBName, setLocationBName] = useState("Site B");
  const [showLocationB, setShowLocationB] = useState(false);

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
    
    // Auto-switch to dark map tiles if dark mode is active
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
    try { 
      const data = await performAnalysis(lat, lng); 
      setResult(data); 
      setAnalyzedCoords({ lat: lat, lng: lng }); 
    }
    catch (err) { console.error(err); } finally { setLoading(false); }
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
    setIsBFromSavedPlace(!!existingName || !!matchedPlace);
    try { 
      const data = await performAnalysis(tLat, tLng); 
      setCompareResult(data);
      setAnalyzedCoordsB({ lat: tLat.toString(), lng: tLng.toString() });
    }
    catch (err) { console.error(err); } 
    finally { setCompareLoading(false); }
  };

  const handleNearbyPlaces = async () => {
    setNearbyLoading(true);
    try {
      const res = await fetch("/nearby_places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
      });
      const data = await res.json();
      setNearbyData(data);
      setShowNearby(true);
    } catch (err) { console.error(err); } finally { setNearbyLoading(false); }
  };

  const handleNearbyPlacesB = async () => {
    setNearbyLoadingB(true);
    try {
      const res = await fetch("/nearby_places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(analyzedCoordsB.lat), longitude: parseFloat(analyzedCoordsB.lng) }),
      });
      const data = await res.json();
      setNearbyDataB(data);
      setShowNearbyB(true);
    } catch (err) { console.error(err); } finally { setNearbyLoadingB(false); }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const deviceLat = pos.coords.latitude;
      const deviceLng = pos.coords.longitude;
      setLat(deviceLat.toString());
      setLng(deviceLng.toString());
      setLocationAName("My Location");
      if (!savedPlaces.some(p => p.name === "My Location")) {
        setSavedPlaces([...savedPlaces, { name: "My Location", lat: deviceLat, lng: deviceLng }]);
      }
    });
  };

  const handleSavePlace = () => {
    const name = prompt("Enter a name for this location:");
    if (!name) return;
    setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
  };

  const handleMyLocationB = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const deviceLat = pos.coords.latitude;
      const deviceLng = pos.coords.longitude;
      setBLatInput(deviceLat.toString());
      setBLngInput(deviceLng.toString());
      setLocationBName("My Location");
      handleCompareSelect(deviceLat, deviceLng, "My Location");
    });
  };

  const handleSavePlaceB = () => {
    if (!compareName) return;
    setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);
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
      <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <SideBar
        lat={lat} setLat={setLat} lng={lng} setLng={setLng}
        locationAName={locationAName} setLocationAName={setLocationAName}
        loading={loading} handleSubmit={handleSubmit}
        handleMyLocation={handleMyLocation} handleSavePlace={handleSavePlace}
        handleNearbyPlaces={handleNearbyPlaces} result={result}
        nearbyLoading={nearbyLoading} showLocationB={showLocationB}
        setShowLocationB={setShowLocationB} locationBName={locationBName}
        isSelectingB={isSelectingB} setIsSelectingB={setIsSelectingB}
        bLatInput={bLatInput} setBLatInput={setBLatInput}
        bLngInput={bLngInput} setBLngInput={setBLngInput}
        savedPlaces={savedPlaces} handleCompareSelect={handleCompareSelect}
        compareLoading={compareLoading} handleMyLocationB={handleMyLocationB}
        isBFromSavedPlace={isBFromSavedPlace} handleSavePlaceB={handleSavePlaceB}
        analyzedCoordsB={analyzedCoordsB} nearbyLoadingB={nearbyLoadingB}
        handleNearbyPlacesB={handleNearbyPlacesB} isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode} editingIndex={editingIndex}
        setEditingIndex={setEditingIndex} editingName={editingName}
        setEditingName={setEditingName} setSavedPlaces={setSavedPlaces}
        sidebarWidth={sidebarWidth} startResizingSide={startResizingSide}
      />

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <section className="map-container" style={{ flex: 1, position: 'relative' }}>
          {isSelectingB && <div className="map-instruction-overlay">Click map for Location B</div>}
          
          {/* Map Style Variety Picker */}
          {/* <div className="map-variety-picker">
            <button onClick={() => setMapVariety("streets")} className={mapVariety === 'streets' ? 'active' : ''}>📍 Streets</button>
            <button onClick={() => setMapVariety("hybrid")} className={mapVariety === 'hybrid' ? 'active' : ''}>🛰️ Satellite</button>
            <button onClick={() => setMapVariety("terrain")} className={mapVariety === 'terrain' ? 'active' : ''}>⛰️ Terrain</button>
          </div> */}
          <div className="map-variety-picker">
  <label className="picker-header">🗺️ Map Style</label>
  <select 
    value={mapVariety} 
    onChange={(e) => setMapVariety(e.target.value)}
    className="variety-select"
  >
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
                   isDarkMode={isDarkMode}
                   viewMode={viewMode}
                   setViewMode={setViewMode}
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
                    <h4 className="pane-header">SITE A: CURRENT</h4>
                    <FactorsSection 
                      data={result} 
                      latVal={analyzedCoords.lat} 
                      lngVal={analyzedCoords.lng} 
                      isDarkMode={isDarkMode}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                    />
                    <EvidenceSection data={result} />
                </div>

                <div className="compare-pane-ditto">
                    <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
                    {compareResult ? (
                        <>
                        <FactorsSection 
                          data={compareResult} 
                          latVal={analyzedCoordsB.lat || bLatInput} 
                          lngVal={analyzedCoordsB.lng || bLngInput} 
                          isDarkMode={isDarkMode}
                          viewMode={viewMode}
                          setViewMode={setViewMode}
                        />
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