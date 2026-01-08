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
const handleDeletePlace = (e, index) => {
  e.stopPropagation(); // Prevents the map from jumping to the location when clicking delete
  const updated = savedPlaces.filter((_, i) => i !== index);
  setSavedPlaces(updated);
  localStorage.setItem("savedPlaces", JSON.stringify(updated));
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
  {/* <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
    <h3>Saved Places</h3>
    <div className="places-list">
      {savedPlaces.map((p, i) => (
        <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
          <strong>{p.name}</strong>
          <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
        </div>
      ))}
    </div>
  </section> */}
  <section className="saved-places" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', minHeight: 0 }}>
  <h3>Saved Places</h3>
  <div className="places-list">
    {savedPlaces.map((p, i) => (
      <div key={i} className="place-item" onClick={() => {setLat(p.lat); setLng(p.lng)}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{p.name}</strong>
            <span>{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
          </div>
          <button 
            className="btn-delete" 
            onClick={(e) => handleDeletePlace(e, i)}
            title="Delete Place"
          >
            🗑️
          </button>
        </div>
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




