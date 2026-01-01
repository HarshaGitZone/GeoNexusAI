// src/components/LandSuitabilityChecker.js
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import FactorBar from "../FactorBar/FactorBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../App.css";
import "./LandSuitabilityChecker.css"

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 📍 Component to handle map clicks
function LocationMarker({ lat, lng, setLat, setLng }) {
  const [position, setPosition] = useState({ lat, lng });
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
    },
  });

  // update marker position when lat/lng change manually
  useEffect(() => {
    setPosition({ lat, lng });
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return position ? <Marker position={position} /> : null;
}

export default function LandSuitabilityChecker() {
  const [lat, setLat] = useState(17.385);
  const [lng, setLng] = useState(78.4867);
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState("");
  const [debug, setDebug] = useState(false);
  const [result, setResult] = useState(null);
  const mapRef = useRef(null);

  // Saved places (persisted in localStorage)
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const stored = localStorage.getItem("savedPlaces");
    return stored ? JSON.parse(stored) : [];
  });

  // My Location button functionality
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => {
        alert("Failed to get location: " + err.message);
      }
    );
  };

  // 💾 Save current location
  const handleSavePlace = () => {
    const name = prompt("Enter a name for this location:");
    if (!name) return;
    const newPlace = { name, lat, lng };
    const updated = [...savedPlaces, newPlace];
    setSavedPlaces(updated);
    localStorage.setItem("savedPlaces", JSON.stringify(updated));
  };

  //  Jump to a saved location
  const handleSelectPlace = (place) => {
    setLat(place.lat);
    setLng(place.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const url = debug ? "/suitability?debug=1" : "/suitability";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, debug }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setResult(data);
      // If backend returned an explicit water-body rejection, ensure UI highlights it
      if ((data.suitability_score === 0 || (data.label && data.label.toLowerCase().includes('water'))) && data.reason) {
        // keep result and scroll to results (basic UX)
        try { window.scrollTo({ top: 400, behavior: 'smooth' }); } catch (e) {}
      }
    } catch (err) {
      setError("Failed to fetch suitability. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const factors = result?.factors || {};
  const explanation = result?.explanation || {};
  const temporal = result?.temporal_summary || {};

  

  return (
    <div className="App">
      <header>
        <h1>🌍 GeoAI Land Suitability</h1>
      </header>

      {/* MAP SECTION */}
      <div className="panel">
        <MapContainer
          whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
          center={[lat, lng]}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          <LocationMarker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
        </MapContainer>
        <div style={{ marginTop: "10px" }}>
          Selected: Lat {lat.toFixed(4)}, Lng {lng.toFixed(4)}
        </div>
        <button onClick={handleMyLocation} style={{ marginTop: "10px" }}>
          📍 My Location
        </button>
      </div>

      

     {/* FORM SECTION */}
<form className="panel" onSubmit={handleSubmit}>
  <div className="form-row">
    <div className="form-group">
      <label htmlFor="lat">Latitude</label>
      <input
        id="lat"
        type="number"
        step="0.000001"
        value={lat}
        onChange={(e) => setLat(Number(e.target.value))}
      />
    </div>
    <div className="form-group">
      <label htmlFor="lng">Longitude</label>
      <input
        id="lng"
        type="number"
        step="0.000001"
        value={lng}
        onChange={(e) => setLng(Number(e.target.value))}
      />
    </div>
  </div>

  <div className="debug-row">
    <label>
      <input
        type="checkbox"
        checked={debug}
        onChange={(e) => setDebug(e.target.checked)}
      />{" "}
      Enable debug mode
    </label>
  </div>

  <div className="button-row">
    <button type="submit" disabled={loading}>
      {loading ? "Analyzing…" : "Analyze"}
    </button>
    <button type="button" className="save-btn" onClick={handleSavePlace}>
      ⭐ Save This Place
    </button>
  </div>
  {error && <div className="error">{error}</div>}
</form>

  
 {/* SAVED PLACES */}
<div className="saved-places">
  <h3>📍 Saved Places</h3>
  {savedPlaces.length === 0 ? (
    <p className="no-places">
      No saved places yet. Click "Save This Place" to bookmark locations.
    </p>
  ) : (
    <div className="saved-grid">
      {savedPlaces.map((place, i) => (
        <div
          key={i}
          className="saved-item"
          onClick={() => handleSelectPlace(place)}
        >
          <div className="place-name">{place.name}</div>
          <div className="place-coords">
            {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
          </div>
        </div>
      ))}
    </div>
  )}
</div>



      {/* RESULTS SECTION */}
      {result && (
        <div className="grid">
          <div className="panel">
            <h2>Overall Suitability</h2>
            <div className="score">
              <div className="score-value">{result.suitability_score?.toFixed?.(2)}</div>
              <div
                className={`score-badge ${
                  result.label?.toLowerCase()?.includes("high")
                    ? "bad"
                    : result.label?.toLowerCase()?.includes("moderate")
                    ? "warn"
                    : "good"
                }`}
              >
                {result.label}
              </div>
            </div>
            <div className="meta">
              <div>Lat: {result.location?.latitude}</div>
              <div>Lng: {result.location?.longitude}</div>
              <div>{result.timestamp}</div>
            </div>
          </div>

            <div className="panel">
              <h2>Why this score?</h2>
              <div style={{ fontSize: 14 }}>
                <ul>
                  <li><strong>Top negatives:</strong> {result.top_negative_reasons ? result.top_negative_reasons.map(r=> r.factor).join(', ') : (result.explanation?.top_negative_contributors?.map(c=>c.factor).join(', ') || 'None')}</li>
                  <li><strong>Distance to water:</strong> {result.evidence?.water_distance_km != null ? `${result.evidence.water_distance_km} km` : 'unknown'}</li>
                  <li><strong>Recent rainfall (7/30/60d):</strong> {result.temporal_summary?.rainfall_totals_mm ? `${result.temporal_summary.rainfall_totals_mm[7]} / ${result.temporal_summary.rainfall_totals_mm[30]} / ${result.temporal_summary.rainfall_totals_mm[60]} mm` : 'not available'}</li>
                  <li><strong>Model used:</strong> {result.model_used || 'Weighted sum / heuristic'}</li>
                  <li><strong>Confidence:</strong> {result.explanation?.factors_meta ? Object.entries(result.explanation.factors_meta).map(([k,v])=> `${k}: ${v.confidence}`).join('; ') : 'mixed'}</li>
                </ul>
              </div>
            </div>

          {/* <div className="panel-row"> */}
            <div className="panel breakdown-panel">
              <h2>Factor Breakdown (0–100)</h2>
              <div className="bars-wrap">
                <FactorBar label="Rainfall (normalized)" value={factors.rainfall} impact={explanation?.deltas?.rainfall} />
                <FactorBar label="Flood Safety" value={factors.flood} impact={explanation?.deltas?.flood} />
                <FactorBar label="Landslide Safety" value={factors.landslide} impact={explanation?.deltas?.landslide} />
                <FactorBar label="Soil Quality" value={factors.soil} impact={explanation?.deltas?.soil} />
                <FactorBar label="Proximity (access/markets)" value={factors.proximity} impact={explanation?.deltas?.proximity} />
                <FactorBar label="Water Proximity (further is safer)" value={factors.water} impact={explanation?.deltas?.water} />
                <FactorBar label="Air Quality (lower PM2.5 is better)" value={factors.pollution} impact={explanation?.deltas?.pollution} />
                <FactorBar label="Landuse Compatibility" value={factors.landuse} impact={explanation?.deltas?.landuse} />

                {result?.top_negative_reasons && (
                  <div className="top-negatives">
                    <h4>Top Negative Contributors</h4>
                    <ul>
                      {result.top_negative_reasons.map((r, i) => (
                        <li key={i}><strong>{r.factor}</strong>: {r.reason} (impact {r.impact})</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Object.keys(temporal?.rainfall_totals_mm || {}).length > 0 && (
                  <div className="temporal-summary">
                    <h4>Temporal Summary</h4>
                    <div>7d: {temporal.rainfall_totals_mm[7]} mm • 30d: {temporal.rainfall_totals_mm[30]} mm • 60d: {temporal.rainfall_totals_mm[60]} mm</div>
                    {temporal.recent_share_of_60d_pct != null && (
                      <div>Recent 7d is {temporal.recent_share_of_60d_pct}% of last 60d.</div>
                    )}
                  </div>
                )}
              </div>
              <div className="hint">Missing factors use a conservative fallback (safer to assume risk). Bars colored by impact (green positive, red negative).</div>
            </div>

            <div className="panel evidence-panel">
              <h2>Factor Evidence</h2>
              {result?.explanation?.factors_meta ? (
                <div className="evidence-list">
                  {Object.entries(result.explanation.factors_meta).map(([k, meta]) => {
                    const delta = explanation?.deltas?.[k];
                    let tone = 'neutral';
                    if (delta != null) {
                      tone = delta > 0.5 ? 'positive' : (delta < -0.5 ? 'negative' : 'neutral');
                    }
                    return (
                      <div key={k} className={`evidence-item ${tone}`}>
                        <div className="evidence-key">{k}</div>
                        <div className="evidence-reason">{meta.reason}</div>
                        <div className="evidence-meta">source: <strong>{meta.source}</strong> • confidence: <strong>{meta.confidence}</strong></div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="muted">No evidence available.</div>
              )}
            </div>
          </div>
        // </div>
        
      )}
      {/* TEAM SECTION */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <h2>Project Team</h2>
        {/* <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}> */}
        <div className="team-grid">
          {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
          <div className="team-card">

            <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Adepu Vaishnavi</div>
            <div style={{ color: '#c9d4f1' }}></div>
          </div>
          {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
          <div className="team-card">

            <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Chinni Jyothika</div>
            <div style={{ color: '#c9d4f1' }}></div>
          </div>
          {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
          <div className="team-card">

            <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Harsha vardhan Botlagunta</div>
            <div style={{ color: '#c9d4f1' }}></div>
          </div>
          {/* <div className="card" style={{ padding: '12px', borderRadius: 8, background: '#1b1f2a', border: '1px solid #2f3b52' }}> */}
          <div className="team-card">

            <div style={{ fontWeight: 700, fontSize: 16, color: '#f5f7fb' }}>Maganti Pranathi</div>
            <div style={{ color: '#c9d4f1' }}></div>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #333' }}>
          <div style={{ fontSize: 14, color: 'black' }}>Guide</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'black' }}>Dr. G.Naga Chandrika</div>
        </div>
      </div>
    </div>
  );
}




