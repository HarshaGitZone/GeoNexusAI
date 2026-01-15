import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import FactorBar from "../FactorBar/FactorBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LandSuitabilityChecker.css";

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
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = localStorage.getItem("savedPlaces");
    return stored ? JSON.parse(stored) : [];
  });

const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyData, setNearbyData] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
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

  // const handleSubmit = async (e) => {
  //   if (e) e.preventDefault();
  //   setResult(null); setCompareResult(null); setIsCompareMode(false); setLoading(true);
  //   try { const data = await performAnalysis(lat, lng); setResult(data); }
  //   catch (err) { console.error(err); } finally { setLoading(false); }
  // };
  const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  setResult(null); 
  setCompareResult(null); 
  setIsCompareMode(false); 
  setLoading(true);

  try { 
    const data = await performAnalysis(lat, lng); 
    setResult(data); 
    // SAVE THE COORDINATES HERE
    setAnalyzedCoords({ lat: lat, lng: lng }); 
  }
  catch (err) { 
    console.error(err); 
  } finally { 
    setLoading(false); 
  }
};

 
const handleCompareSelect = async (tLat, tLng, existingName = null) => {
    setIsSelectingB(false);
    setBLatInput(tLat.toString());
    setBLngInput(tLng.toString());

    let name = existingName || prompt("Enter name for Location B:") || "Site B";
    setCompareName(name);
    setCompareLoading(true);
    setIsCompareMode(true);
    try { 
      const data = await performAnalysis(tLat, tLng); 
      setCompareResult(data); 
    }
    catch (err) { console.error(err); } 
    finally { setCompareLoading(false); }
  };

  const handleNearbyPlaces = async () => {
    setNearbyLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/nearby_places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
      });

      const data = await res.json();
      setNearbyData(data);
      setShowNearby(true);
    } catch (err) {
      console.error("Failed to load nearby places", err);
    } finally {
      setNearbyLoading(false);
    }
  };
  <LocationMarker 
  lat={lat} 
  lng={lng} 
  setLat={setLat} 
  setLng={setLng} 
  setZoom={setZoom} 
  isSelectingB={isSelectingB} 
  onSelectB={(tLat, tLng) => {
    setBLatInput(tLat.toString());
    setBLngInput(tLng.toString());
    handleCompareSelect(tLat, tLng);
  }} 
/>
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

 const FactorsSection = ({ data, latVal, lngVal }) => {
    const formatCoord = (val) => {
      const num = parseFloat(val);
      return !isNaN(num) ? num.toFixed(4) : "..."; 
    };

    return (
      <>
        <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
          <div className="card-coordinates">
            <span>LAT: {formatCoord(latVal)}</span>
            <span>LNG: {formatCoord(lngVal)}</span>
          </div>
          
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
                {loading ? "Analyzing..." : "Analyze Location"}
              </button>
              {result && (
                <button type="button" onClick={handleNearbyPlaces} className="btn-analyze" disabled={nearbyLoading} style={{marginTop: '8px', width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)'}}>
                  {nearbyLoading ? "Loading..." : "🏘️ Nearby Places"}
                </button>
              )}
            </form>
          </section>

          {result && (
            <section className="control-group comparison-box compact">
              <h3>Compare with Location B</h3>
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
            <div className="results-grid">
              <div className="col-1">
                {/* Change latVal and lngVal to use analyzedCoords */}
                <FactorsSection 
                  data={result} 
                  latVal={analyzedCoords.lat} 
                  lngVal={analyzedCoords.lng} 
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
              {/* Replaced lat/lng with analyzedCoords to "lock" the data */}
              <FactorsSection 
                data={result} 
                latVal={analyzedCoords.lat} 
                lngVal={analyzedCoords.lng} 
              />
              <EvidenceSection data={result} />
            </div>

            <div className="compare-pane-ditto">
              <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
              {compareResult ? (
                <>
                  <FactorsSection 
                    data={compareResult} 
                    latVal={compareResult.latitude || bLatInput} 
                    lngVal={compareResult.longitude || bLngInput} 
                  />
                  <EvidenceSection data={compareResult} />
                </>
              ) : <div className="empty-results">Waiting for selection...</div>}
            </div>
            </div>
          )}
        </section>

        {showNearby && (
          <div className="modal-overlay" onClick={() => setShowNearby(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Nearby Places (1.5 km)</h3>
                <button className="modal-close" onClick={() => setShowNearby(false)}>✖</button>
              </div>

              <div className="modal-body">
                {nearbyData?.places?.length ? (
                  (() => {
                    const schools = nearbyData.places.filter(p => p.type === "school");
                    const hospitals = nearbyData.places.filter(p => p.type === "hospital");
                    const colleges = nearbyData.places.filter(
                      p => p.type === "college" || p.type === "university"
                    );

                    const Section = ({ title, items }) => (
                      <div className="nearby-section">
                        <h4>{title} ({items.length})</h4>
                        {items.length ? (
                          items.map((p, i) => (
                            <div key={i} className="nearby-item">
                              <span className="nearby-name">{p.name}</span>
                              <span className="nearby-distance">{p.distance_km} km</span>
                            </div>
                          ))
                        ) : (
                          <div className="nearby-empty">No nearby {title.toLowerCase()} found.</div>
                        )}
                      </div>
                    );

                    return (
                      <>
                        <Section title="🏫 Schools" items={schools} />
                        <Section title="🏥 Hospitals" items={hospitals} />
                        <Section title="🎓 Colleges & Universities" items={colleges} />
                      </>
                    );
                  })()
                ) : (
                  <div className="nearby-empty">
                    No mapped amenities within 1.5 km.<br />
                    This likely indicates a rural or low-density region.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}