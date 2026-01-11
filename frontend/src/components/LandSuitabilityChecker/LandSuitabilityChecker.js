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

  // const handleCompareSelect = async (tLat, tLng, existingName = null) => {
  //   setIsSelectingB(false);
  //   let name = existingName || prompt("Enter name for Location B:") || "Site B";
  //   setCompareName(name);
  //   setCompareLoading(true);
  //   setIsCompareMode(true);
  //   try { const data = await performAnalysis(tLat, tLng); setCompareResult(data); }
  //   catch (err) { console.error(err); } finally { setCompareLoading(false); }
  // };
const handleCompareSelect = async (tLat, tLng, existingName = null) => {
    setIsSelectingB(false);
    
    // UPDATE THESE TWO LINES: Fill the inputs with the selected coordinates
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
  <LocationMarker 
  lat={lat} 
  lng={lng} 
  setLat={setLat} 
  setLng={setLng} 
  setZoom={setZoom} 
  isSelectingB={isSelectingB} 
  onSelectB={(tLat, tLng) => {
    // When map is clicked for B, update the inputs immediately
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

  // Components for layout
  // const FactorsSection = ({ data }) => (
  //   <>
  //     <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
  //       {/* Added Coordinates Display */}
  //       <div className="card-coordinates">
  //         <span>LAT: {latVal ? parseFloat(latVal).toFixed(4) : "0.0000"}</span>
  //         <span>LNG: {lngVal ? parseFloat(lngVal).toFixed(4) : "0.0000"}</span>
  //       </div>
  //       <h3>Overall Suitability</h3>
  //       <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
  //         {data.suitability_score?.toFixed(1)}
  //       </div>
  //       <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
  //     </div>
  //     <div className="card factors-card">
  //       <h3>Terrain Factors</h3>
  //       {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
  //         <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
  //       ))}
  //     </div>
  //   </>
  // );
// Components for layout - Strict Data Isolation
 const FactorsSection = ({ data, latVal, lngVal }) => {
    // Use a helper to check if value is a valid number and not just an empty string
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
            /* STANDARD VIEW: SIDE BY SIDE LAYOUT */
            <div className="results-grid">
              {/* <div className="col-1">
                <FactorsSection data={result} />
              </div> */}
              <div className="col-1">
  <FactorsSection data={result} latVal={lat} lngVal={lng} />
</div>
              <div className="col-2">
                <EvidenceSection data={result} />
              </div>
            </div>
          )}

          {result && isCompareMode && (
            /* COMPARE VIEW: SPLIT SCREEN VERTICAL STACKS */
            <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
              {/* <div className="compare-pane-ditto">
                <h4 className="pane-header">SITE A: CURRENT</h4>
                <FactorsSection data={result} />
                <EvidenceSection data={result} />
              </div> */}
              <div className="compare-pane-ditto">
  <h4 className="pane-header">SITE A: CURRENT</h4>
  <FactorsSection data={result} latVal={lat} lngVal={lng} />
  <EvidenceSection data={result} />
</div>
              {/* <div className="compare-pane-ditto">
                <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
                {compareResult ? (
                  <>
                    <FactorsSection data={compareResult} />
                    <EvidenceSection data={compareResult} />
                  </>
                ) : <div className="empty-results">Waiting for selection...</div>}
              </div> */}
              <div className="compare-pane-ditto">
  <h4 className="pane-header">SITE B: {compareName.toUpperCase()}</h4>
  {compareResult ? (
    <>
      {/* IMPORTANT: Use the coordinates that were actually analyzed 
         (passed from the handleCompareSelect function) 
      */}
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
      </main>
    </div>
  );
}