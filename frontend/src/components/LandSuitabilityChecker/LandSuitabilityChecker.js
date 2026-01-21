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
import TerrainSlope from "../TerrainSlope/TerrainSlope";
import WeatherCard from "../Weather/WeatherCard";
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

/** * UTILITY: Moved outside to avoid unnecessary dependency warnings 
 */
const isNearbyDevice = (lat1, lng1, deviceLoc) => {
  if (!deviceLoc || !deviceLoc.lat || !deviceLoc.lng) return false;
  return (
    parseFloat(lat1).toFixed(4) === deviceLoc.lat &&
    parseFloat(lng1).toFixed(4) === deviceLoc.lng
  );
};

// --- DYNAMIC INFERENCE ENGINE ---
const getSitePotential = (factors) => {
  const potentials = [];
  const f = factors;

  const hazards = Object.entries(f)
    .filter(([key, val]) => (key === 'flood' || key === 'landslide' || key === 'pollution') && val < 45)
    .map(([key]) => key.toUpperCase());

  if (hazards.length > 0) {
    potentials.push({
      type: "Risk",
      label: "Environmental Constraints",
      class: "pot-red",
      icon: "⚠️",
      reason: `Warning: This site faces critical risks due to low safety scores in ${hazards.join(" & ")}. Development may require expensive mitigation or be restricted to conservation.`
    });
  }

  if (f.flood > 50 && f.landslide > 50 && f.pollution > 40) {
    const strength = f.pollution > 70 ? "pristine air quality" : "stable terrain";
    potentials.push({
      type: "Residential",
      label: "Residential Potential",
      class: "pot-green",
      icon: "🏠",
      reason: `Recommended for housing due to ${strength}. The site provides a safe foundation with manageable environmental risks.`
    });
  }

  if (f.soil > 60 || f.rainfall > 60) {
    const leadFactor = f.soil > f.rainfall ? "High Soil Nutrient Density" : "Abundant Rainfall Patterns";
    potentials.push({
      type: "Agricultural",
      label: "Agricultural Utility",
      class: "pot-blue",
      icon: "🚜",
      reason: `Viable for farming driven by ${leadFactor}. This land can support sustainable crop cycles if water management is maintained.`
    });
  }

  if (f.proximity > 60 && f.landuse > 40) {
    potentials.push({
      type: "Industrial",
      label: "Logistics & Industry",
      class: "pot-purple",
      icon: "🏭",
      reason: `Strategic for commercial use because it ranks top 20% in Infrastructure Proximity (${f.proximity.toFixed(0)}%). Ideal for warehouses or manufacturing.`
    });
  }

  return potentials;
};

const PotentialSection = ({ factors, score }) => {
  const recommendations = getSitePotential(factors);
  const rating = score > 80 ? "A" : score > 60 ? "B" : score > 40 ? "C" : "F";
  
  return (
    <div className="card potential-card glass-morphic" style={{ marginBottom: '16px' }}>
      <div className="potential-header">
        <div className="title-stack">
          <h3>Site Potential Analysis</h3>
          <p className="subtitle">Algorithmic Terrain Synthesis</p>
        </div>
        <div className="rating-badge-container">
            <span className="rating-label">Grade</span>
            <span className={`rating-letter grade-${rating}`}>{rating}</span>
        </div>
      </div>
      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`potential-item ${rec.class}`}>
            <div className="potential-tag-row">
              <span className="potential-icon">{rec.icon}</span>
              <span className="potential-label">{rec.label}</span>
            </div>
            <p className="potential-reason">{rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
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

const FactorsSection = memo(({ data, latVal, lngVal, locationName, isDarkMode, viewMode, setViewMode, onOpenHistory, mapVariety, isCompareMode }) => {
  const nLat = parseFloat(latVal);
  const nLng = parseFloat(lngVal);
  const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

  const FactorCard = (
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
  );

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

      {isCompareMode ? (
        <>
          {FactorCard}
          <PotentialSection factors={data.factors} score={data.suitability_score} />
        </>
      ) : (
        FactorCard
      )}
    </>
  );
});

export default function LandSuitabilityChecker() {
  const [deviceLocation, setDeviceLocation] = useState({ lat: null, lng: null });
  const [analysisHistory, setAnalysisHistory] = useState(() => 
      JSON.parse(localStorage.getItem("analysis_history")) || []
  );
  const BACKEND_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" : "https://geoai-major-vnrvjiet22-26-itb.onrender.com";

  const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
  const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
  const [mapVariety, setMapVariety] = useState(() => localStorage.getItem("geo_map_style") || "streets");
  
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("geo_theme")) ?? true);
  const [result, setResult] = useState(() => JSON.parse(localStorage.getItem("geo_last_result")) || null);
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
const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [savedPlaces, setSavedPlaces] = useState(() => JSON.parse(localStorage.getItem("savedPlaces")) || []);
  const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
  const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
  const [locationAName, setLocationAName] = useState("Site A");
  const [locationBName, setLocationBName] = useState("Site B");
  const [showLocationB, setShowLocationB] = useState(false);
  const [isBFromSavedPlace] = useState(false);
  
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyData, setNearbyData] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyDataB, setNearbyDataB] = useState(null);
  const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
  const [showNearbyB, setShowNearbyB] = useState(false);

  const [isGptOpen, setIsGptOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([{ role: 'assistant', content: 'Hello! I am GeoGPT.' }]);
  const [userQuery, setUserQuery] = useState("");
  const [gptLoading, setGptLoading] = useState(false);
  const chatEndRef = useRef(null);

  /**
   * Resolve site name based on: Saved Places > My Location > Prompt
   */
  const resolveLocationName = useCallback((targetLat, targetLng, defaultFallback) => {
    const curLat = parseFloat(targetLat).toFixed(4);
    const curLng = parseFloat(targetLng).toFixed(4);

    const matchedPlace = savedPlaces.find(p => 
      p.lat.toFixed(4) === curLat && p.lng.toFixed(4) === curLng
    );
    if (matchedPlace) return matchedPlace.name;

    if (isNearbyDevice(targetLat, targetLng, deviceLocation)) {
      return "My Location";
    }

    const userName = prompt(`Enter a name for the site at ${curLat}, ${curLng}:`);
    return userName || defaultFallback;
  }, [savedPlaces, deviceLocation]);

  const performAnalysis = useCallback(async (tLat, tLng) => {
    try {
      const response = await fetch(`/suitability`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Analysis Request Failed:", error);
      throw error; 
    }
  }, [debug]);

  const handleCompareSelect = useCallback(async (tLat, tLng, existingName = null) => {
      setIsSelectingB(false);
      setBLatInput(tLat.toString());
      setBLngInput(tLng.toString());
      
      let name = existingName || resolveLocationName(tLat, tLng, "Site B");
      
      setCompareName(name);
      setLocationBName(name);
      setCompareLoading(true);
      setIsCompareMode(true);
      setCompareResult(null); 

      try { 
        const data = await performAnalysis(tLat, tLng); 
        setCompareResult(data);
        setAnalyzedCoordsB({ lat: tLat.toString(), lng: tLng.toString() });
      } catch (err) { console.error(err); } 
      finally { setCompareLoading(false); }
  }, [resolveLocationName, performAnalysis]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setDeviceLocation({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4)
        });
      });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [chatHistory, scrollToBottom]);

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
        body: JSON.stringify({ query: queryToSend, currentData: result, locationName: locationAName, compareData: compareResult }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm currently offline." }]);
    } finally { setGptLoading(false); }
  };

  useEffect(() => {
    localStorage.setItem("geo_lat", lat);
    localStorage.setItem("geo_lng", lng);
    localStorage.setItem("geo_zoom", zoom);
    localStorage.setItem("geo_theme", JSON.stringify(isDarkMode));
    localStorage.setItem("geo_map_style", mapVariety);
    localStorage.setItem("sidebar_width", sidebarWidth);
    localStorage.setItem("bottom_height", bottomHeight);
    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
    if (result) localStorage.setItem("geo_last_result", JSON.stringify(result));
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [lat, lng, zoom, isDarkMode, sidebarWidth, bottomHeight, result, savedPlaces, mapVariety]);

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const sharedLat = params.get("lat");
  //   const sharedLng = params.get("lng");
  //   const sharedBLat = params.get("bLat");
  //   const sharedBLng = params.get("bLng");
  //   const isSharedCompare = params.get("compare") === "1" || params.get("compare") === "true";

  //   if (sharedLat && sharedLng) {
  //       setLat(sharedLat);
  //       setLng(sharedLng);
  //   }

  //   if (isSharedCompare && sharedBLat && sharedBLng) {
  //       setBLatInput(sharedBLat);
  //       setBLngInput(sharedBLng);
  //       setShowLocationB(true);
  //       setIsCompareMode(true);
  //       handleCompareSelect(sharedBLat, sharedBLng);
  //   }
  // }, [handleCompareSelect]);
  // LandSuitabilityChecker.js - inside the useEffect for URL params
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const sharedLat = params.get("lat");
  const sharedLng = params.get("lng");
  const sharedNameA = params.get("nameA"); // Get name A
  const sharedBLat = params.get("bLat");
  const sharedBLng = params.get("bLng");
  const sharedNameB = params.get("nameB"); // Get name B
  const isSharedCompare = params.get("compare") === "1" || params.get("compare") === "true";

  if (sharedLat && sharedLng) {
    setLat(sharedLat);
    setLng(sharedLng);
    if (sharedNameA) setLocationAName(sharedNameA); // Set name A
  }

  if (isSharedCompare && sharedBLat && sharedBLng) {
    setBLatInput(sharedBLat);
    setBLngInput(sharedBLng);
    if (sharedNameB) {
        setLocationBName(sharedNameB); // Set name B
        setCompareName(sharedNameB);
    }
    setShowLocationB(true);
    setIsCompareMode(true);
    
    // Pass the name directly to handleCompareSelect to prevent logic triggering prompt
    handleCompareSelect(sharedBLat, sharedBLng, sharedNameB || "Site B");
  }
}, [handleCompareSelect]);

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const nameA = resolveLocationName(lat, lng, "Site A");
    setLocationAName(nameA);

    setResult(null); 
    setCompareResult(null); 
    setLoading(true);

    if (showLocationB) {
        setIsCompareMode(true);
        setCompareLoading(true);
        const nameB = resolveLocationName(bLatInput, bLngInput, "Site B");
        setLocationBName(nameB);
        setCompareName(nameB);
    } else {
        setIsCompareMode(false);
    }

    const tasks = [performAnalysis(lat, lng)];
    if (showLocationB && bLatInput && bLngInput) {
        tasks.push(performAnalysis(bLatInput, bLngInput));
    }

    try { 
        const results = await Promise.allSettled(tasks);
        
        if (results[0].status === 'fulfilled') {
            const analysisData = results[0].value; 
            setResult(analysisData);
            setAnalyzedCoords({ lat, lng });

            const newHistoryEntry = {
                name: nameA,
                lat, lng,
                score: analysisData.suitability_score,
                timestamp: new Date().getTime()
            };
            
            setAnalysisHistory(prev => {
                const updated = [newHistoryEntry, ...prev].slice(0, 20);
                localStorage.setItem("analysis_history", JSON.stringify(updated));
                return updated;
            });
        }
        
        if (results[1] && results[1].status === 'fulfilled') {
            const compareData = results[1].value;
            setCompareResult(compareData);
            setAnalyzedCoordsB({ lat: bLatInput.toString(), lng: bLngInput.toString() });
            
            const historyEntryB = {
                name: locationBName,
                lat: bLatInput, lng: bLngInput,
                score: compareData.suitability_score,
                timestamp: new Date().getTime()
            };
            setAnalysisHistory(prev => [historyEntryB, ...prev].slice(0, 20));
        }
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false); 
        setCompareLoading(false);
    }
};

  const handleNearbyPlaces = async () => {
    if (!lat || !lng) return;
    setNearbyLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/nearby_places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setNearbyData(data);
      setShowNearby(true);
    } catch (err) { alert("Backend starting up, please retry in 10s"); } finally { setNearbyLoading(false); }
  };

  const handleNearbyPlacesB = async () => {
    const targetLat = analyzedCoordsB.lat || bLatInput;
    const targetLng = analyzedCoordsB.lng || bLngInput;
    if (!targetLat || !targetLng) return;
    setNearbyLoadingB(true);
    try {
      const res = await fetch(`${BACKEND_URL}/nearby_places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(targetLat), longitude: parseFloat(targetLng) }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setNearbyDataB(data);
      setShowNearbyB(true);
    } catch (err) { alert("Backend starting up, please retry in 10s"); } finally { setNearbyLoadingB(false); }
  };

  const handleOpenHistory = (targetData, targetName, targetLat, targetLng) => {
    setHistoryTargetData(targetData);
    setHistoryTargetName(targetName);
    setHistoryTargetCoords({ lat: targetLat, lng: targetLng });
    setShowHistory(true);
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

  const handleMyLocationB = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setBLatInput(pos.coords.latitude.toString());
      setBLngInput(pos.coords.longitude.toString());
      handleCompareSelect(pos.coords.latitude, pos.coords.longitude);
    });
  };

  const handleSavePlaceB = () => {
    if (!compareName) return;
    setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);
  };

  const handleSearchResult = (searchLat, searchLng, searchName) => {
    setLat(searchLat.toString());
    setLng(searchLng.toString());
    setZoom(16);
  };

  const EvidenceSection = ({ data }) => (
    <div className="card evidence-card" style={{ height: 'auto' }}>
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
      <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} analysisHistory={analysisHistory} onSearchResult={handleSearchResult} />
      
      <SideBar
        onSearchResult={handleSearchResult}
        lat={lat} setLat={setLat} lng={lng} setLng={setLng}
        locationAName={locationAName} setLocationAName={setLocationAName}
        loading={loading} handleSubmit={handleSubmit}
        handleMyLocation={handleMyLocation} handleSavePlace={handleSavePlace}
        handleNearbyPlaces={handleNearbyPlaces}
        nearbyLoading={nearbyLoading}
        nearbyData={nearbyData}
        result={result} showLocationB={showLocationB}
        setShowLocationB={setShowLocationB} locationBName={locationBName}
        isSelectingB={isSelectingB} setIsSelectingB={setIsSelectingB}
        bLatInput={bLatInput} setBLatInput={setBLatInput}
        bLngInput={bLngInput} setBLngInput={setBLngInput}
        savedPlaces={savedPlaces} handleCompareSelect={handleCompareSelect}
        compareLoading={compareLoading} isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode}
        handleMyLocationB={handleMyLocationB}
        handleSavePlaceB={handleSavePlaceB}
        isBFromSavedPlace={isBFromSavedPlace}
        setSavedPlaces={setSavedPlaces}
        sidebarWidth={sidebarWidth} startResizingSide={startResizingSide}
        analyzedCoordsB={analyzedCoordsB}
        nearbyLoadingB={nearbyLoadingB}
        handleNearbyPlacesB={handleNearbyPlacesB}
        showNearby={showNearby}
        setShowNearby={setShowNearby}
        compareResult={compareResult}
        editingIndex={editingIndex}
        setEditingIndex={setEditingIndex}
        editingName={editingName}
        setEditingName={setEditingName}
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
                <h4 className="pane-header">{locationAName.toUpperCase()}</h4>
                <FactorsSection 
                  data={result} latVal={analyzedCoords.lat} lngVal={analyzedCoords.lng} locationName={locationAName}
                  isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} onOpenHistory={handleOpenHistory} mapVariety={mapVariety}
                  isCompareMode={false}
                />
                 {/* In your FactorsSection return logic */}
                  <WeatherCard weather={result?.weather} />
                {/* ✅ Terrain & Slope Analysis (FINAL CHECK) */}
                {result.terrain_analysis && (<TerrainSlope terrain={result.terrain_analysis} />)}
               
              </div>
              <div className="col-2">
                <PotentialSection factors={result.factors} score={result.suitability_score} />
                <EvidenceSection data={result} />
                
              </div>
            </div>
          )}

          {isCompareMode && (
            <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
                <div className="compare-pane-ditto">
                    <h4 className="pane-header">{locationAName.toUpperCase()}</h4>
                    {result ? (
                      <>
                        <FactorsSection 
                          data={result} latVal={analyzedCoords.lat} lngVal={analyzedCoords.lng} locationName={locationAName}
                          isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} onOpenHistory={handleOpenHistory} mapVariety={mapVariety}
                          isCompareMode={true}
                        />
                        {/* FIXED: Correct result object for Side A */}
                      <WeatherCard weather={result?.weather} />
                        {result.terrain_analysis && (<TerrainSlope terrain={result.terrain_analysis} />)}
                        <EvidenceSection data={result} />
                      </>
                    ) : <div className="empty-results">Analyzing Site A...</div>}
                </div>
                <div className="compare-pane-ditto">
                    <h4 className="pane-header">{compareName.toUpperCase() || "SITE B"}</h4>
                    {compareResult ? (
                        <>
                        <FactorsSection 
                          data={compareResult} latVal={analyzedCoordsB.lat || bLatInput} lngVal={analyzedCoordsB.lng || bLngInput} locationName={compareName || "Site B"}
                          isDarkMode={isDarkMode} viewMode={viewMode} setViewMode={setViewMode} onOpenHistory={handleOpenHistory} mapVariety={mapVariety}
                          isCompareMode={true}
                        />
                        {/* In your FactorsSection return logic */}
                          <WeatherCard weather={compareResult?.weather} />
                        {compareResult?.terrain_analysis && (<TerrainSlope terrain={compareResult.terrain_analysis} />)}
                        <EvidenceSection data={compareResult} />
                        </>
                    ) : <div className="empty-results">Waiting for selection or Analyzing Site B...</div>}
                </div>
            </div>
          )}
        </section>

        <div className={`geogpt-fixed-container ${isGptOpen ? 'expanded' : ''}`}>
            {isGptOpen ? (
              <div className="geogpt-polished-box">
                <div className="geogpt-chat-header" onClick={() => setIsGptOpen(false)}>
                  <div className="gpt-status"><span className="gpt-dot"></span><strong>GeoGPT Intelligence</strong></div>
                  <button className="close-gpt">×</button>
                </div>
                <div className="geogpt-messages">
                  {chatHistory.map((msg, i) => <div key={i} className={`chat-msg ${msg.role}`}><div className="msg-bubble">{msg.content}</div></div>)}
                  {gptLoading && <div className="chat-msg assistant"><div className="msg-bubble thinking-bubble">Thinking...</div></div>}
                  <div ref={chatEndRef} />
                </div>
                <form className="geogpt-input-area" onSubmit={handleAskGpt}>
                  <input type="text" placeholder="Ask GeoGPT..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                  <button type="submit" disabled={!userQuery.trim() || gptLoading}>🚀</button>
                </form>
              </div>
            ) : <button className="geogpt-pill-btn" onClick={() => setIsGptOpen(true)}><div className="gpt-icon-glow">✨</div></button>}
        </div>
      </main>

      {(showNearby || showNearbyB) && (
          <div className="modal-overlay" onClick={() => { setShowNearby(false); setShowNearbyB(false); }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Nearby Amenities ({showNearbyB ? locationBName : locationAName})</h3>
                <button className="modal-close" onClick={() => { setShowNearby(false); setShowNearbyB(false); }}>✖</button>
              </div>
              <div className="modal-body">
                {(() => {
                  const data = showNearbyB ? nearbyDataB : nearbyData;
                  if (!data?.places?.length) return <div className="nearby-empty">No mapped amenities within 1.5 km.</div>;
                  
                  const schools = data.places.filter(p => p.type === "school");
                  const hospitals = data.places.filter(p => p.type === "hospital");
                  const colleges = data.places.filter(p => p.type === "college" || p.type === "university");

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
                }
              </div>
            </div>
          </div>
        )}
      
      {showHistory && historyTargetData && (
        <HistoryView 
          data={historyTargetData} locationName={historyTargetName} onClose={() => setShowHistory(false)} 
          lat={historyTargetCoords.lat} lng={historyTargetCoords.lng} isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}