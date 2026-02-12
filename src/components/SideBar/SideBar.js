import React, { useState, useEffect, useRef } from "react";
import "./SideBar.css";
import { API_BASE } from "../../config/api";
import QRCode from "react-qr-code"; 
export default function SideBar({
  lat, setLat, lng, setLng,
  locationAName, setLocationAName,
  loading, handleSubmit,
  handleMyLocation, handleSavePlace,
  handleNearbyPlaces, result,
  compareResult, 
  nearbyLoading,
  showLocationB, setShowLocationB,
  locationBName, isSelectingB,
  setIsSelectingB, bLatInput,
  setBLatInput, bLngInput,
  setBLngInput, savedPlaces,
  handleCompareSelect, compareLoading,
  handleMyLocationB, isBFromSavedPlace,
  handleSavePlaceB, analyzedCoordsB,
  setAnalyzedCoordsB, // 🚀 ADD THIS HERE
  nearbyLoadingB, handleNearbyPlacesB,
  isCompareMode, setIsCompareMode,
  editingIndex, setEditingIndex,
  editingName, setEditingName,
  setSavedPlaces,
  sidebarWidth, startResizingSide,
  onSearchResult,
  setCompareResult,    
  setSnapshotDataB,    
  snapshotData,        
  snapshotDataB,        
  setLocationBName,
  closeSiteA, setCloseSiteA,
  setResult, setAnalyzedCoords,
  analyzedCoords,
  onProjectImport,
}) {
  const [saveProjectLoading, setSaveProjectLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const searchContainerRef = useRef(null);
  const [shareModalMode, setShareModalMode] = useState("share"); 
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const importFileRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportProjectFile = () => {
  if (!result) {
    alert("Analyze Location A first.");
    return;
  }

  const payload = {
    projectName: projectName?.trim() || `${locationAName} Analysis`,
    siteA: {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      name: locationAName,
      result: result,
      snapshotData: snapshotData  // Add snapshot data for Site A
    },
    compare: {
      enabled: Boolean(isCompareMode && compareResult),
    },
    siteB: isCompareMode && compareResult ? {
      lat: parseFloat(bLatInput),
      lng: parseFloat(bLngInput),
      name: locationBName,
      result: compareResult,
      snapshotData: snapshotDataB  // Add snapshot data for Site B
    } : null,
    meta: {
      exportedAt: new Date().toISOString(),
      app: "CERES GEOAI",
      version: "geoai-v1",
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const safeName = (payload.projectName || "GeoAI_Project")
    .replace(/[^a-z0-9]/gi, "_")
    .slice(0, 60);

  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
const importProjectFile = async (file) => {
  try {
    const text = await file.text();

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (parseError) {
      alert("Invalid JSON format. File may be corrupted.");
      return;
    }

    if (!payload || typeof payload !== "object") {
      alert("Invalid project file format.");
      return;
    }

    if (
      !payload.siteA ||
      payload.siteA.lat === undefined ||
      payload.siteA.lng === undefined
    ) {
      alert("Invalid project file: missing Site A coordinates.");
      return;
    }

    // --- Restore Site A ---
    setLat(String(payload.siteA.lat));
    setLng(String(payload.siteA.lng));
    setLocationAName(payload.siteA.name || "Site A");

    // Restore Site A analysis result (IMPORTANT)
    if (payload.siteA.result) {
      if (setResult) setResult(payload.siteA.result);
      if (onProjectImport) onProjectImport(payload.siteA.result);
    }

    // Restore analyzed coords (marker)
    if (setAnalyzedCoords) {
      setAnalyzedCoords({
        lat: payload.siteA.lat,
        lng: payload.siteA.lng,
      });
    }

    // --- Restore Compare Mode ---
    const hasB =
      payload?.compare?.enabled &&
      payload?.siteB?.lat !== undefined &&
      payload?.siteB?.lng !== undefined;

    if (hasB) {
      setShowLocationB(true);
      setIsCompareMode(true);

      setBLatInput(String(payload.siteB.lat));
      setBLngInput(String(payload.siteB.lng));

      if (setLocationBName) setLocationBName(payload.siteB.name || "Site B");

      if (payload.siteB.result) {
        if (setCompareResult) setCompareResult(payload.siteB.result);
      }


      if (setSnapshotDataB) {
        setSnapshotDataB(payload.siteB.snapshotData || null);
      }
    } else {
      setShowLocationB(false);
      setIsCompareMode(false);
      if (setCompareResult) setCompareResult(null);
      if (setSnapshotDataB) setSnapshotDataB(null);
      if (setAnalyzedCoordsB) setAnalyzedCoordsB({ lat: null, lng: null });
      localStorage.removeItem("geo_snapshot_data_b"); // Clear localStorage
      localStorage.removeItem("geo_name_b"); // Clear persisted name
    }

    setProjectName(payload.projectName || "");

    alert("✅ Project imported successfully!");
  } catch (err) {
    console.error("Import failed:", err);
    alert("Import failed. File may be corrupted.");
  }
};

 // --- HIGH-TECH TELEMETRY CALCULATIONS ---
  const getGeospatialTelemetry = () => {
    const now = currentTime;
    
    // 1. UTC / Zulu Time
    const utcTime = now.toISOString().split('T')[1].split('.')[0] + " Z";
    
    // 2. GMT Offset (e.g., +05:30)
    const offsetMinutes = -now.getTimezoneOffset(); // Reverse sign for ISO standard
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offsetMinutes) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
    const gmtStr = `GMT ${sign}${hours}:${minutes}`;
    
    // 3. Unix Epoch
    const epoch = Math.floor(now.getTime() / 1000);
    
    // 4. Day of Year (DOY)
    const start = new Date(now.getFullYear(), 0, 0);
    const doy = Math.floor((now - start) / (1000 * 60 * 60 * 24)).toString().padStart(3, '0');
    
    // 5. Year Percentage (Dynamic to 4 decimals for "live" feel)
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
    const progress = ((now - yearStart) / (yearEnd - yearStart)) * 100;
    
    // 6. Solar Phase (Based on Local Hour)
    const hour = now.getHours();
    let solarPhase = "DAY PHASE";
    let solarIcon = "☀️";
    if (hour >= 20 || hour < 5) { solarPhase = "NIGHT"; solarIcon = "🌙"; }
    else if (hour >= 5 && hour < 7) { solarPhase = "DAWN"; solarIcon = "🌅"; }
    else if (hour >= 18 && hour < 20) { solarPhase = "DUSK / TWILIGHT"; solarIcon = "🌇"; }

    return { utcTime, gmtStr, epoch, doy, progress: progress.toFixed(4), solarPhase, solarIcon };
  };

  const telemetry = getGeospatialTelemetry();

  const handleSearch = async (val) => {
    console.log('Search triggered with value:', val);
    setSearchQuery(val);
    // Start search after 2 characters for better UX
    if (val.length > 1) {
      setIsSearching(true);
      try {
        console.log('Making search request for:', val);
        
        // Use backend proxy to bypass CSP issues
        const res = await fetch(
          `${API_BASE}/api/geocode?q=${encodeURIComponent(val)}`
        );
        
        console.log('Backend proxy response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Backend proxy success - Search results:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            // Filter out duplicates and sort by importance
            const uniqueResults = data.filter((item, index, arr) =>
              index === arr.findIndex((t) => t.display_name === item.display_name)
            );
            console.log('Setting REAL suggestions:', uniqueResults.slice(0, 8));
            setSuggestions(uniqueResults.slice(0, 8));
          } else {
            console.log('No results found for:', val);
            setSuggestions([]);
          }
        } else {
          throw new Error(`Backend proxy failed: ${res.status}`);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      // For single character, don't clear immediately to allow typing
      if (val.length === 1 && /^[a-zA-Z]$/.test(val)) {
        console.log('Single character, keeping suggestions');
        return;
      }
      console.log('Clearing suggestions - input too short');
      setSuggestions([]);
    }
  };

  const selectResult = (item) => {
    if (onSearchResult) {
      onSearchResult(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
    }
    setSelectedDescription(item.display_name);
    setSuggestions([]);
    setSearchQuery("");
  };

  
// const generateShareLink = async () => {
//   // Add nameA to the link
//   let shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}&nameA=${encodeURIComponent(locationAName)}`;
  
//   // If in compare mode, add nameB as well
//   if (isCompareMode && bLatInput && bLngInput) {
//     shareUrl += `&bLat=${encodeURIComponent(bLatInput)}&bLng=${encodeURIComponent(bLngInput)}&nameB=${encodeURIComponent(locationBName)}&compare=true`;
//   }

//   try {
//     await navigator.clipboard.writeText(shareUrl);
//     alert(isCompareMode ? "Comparison link copied to clipboard!" : "Shareable link copied!");
//   } catch (err) {
//     console.error("Clipboard failed:", err);
//     prompt("Copy this link to share your analysis:", shareUrl);
//   }
// };
// const generateShareLink = async () => {
//   let shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}&nameA=${encodeURIComponent(locationAName)}`;
  
//   if (isCompareMode && bLatInput && bLngInput) {
//     shareUrl += `&bLat=${encodeURIComponent(bLatInput)}&bLng=${encodeURIComponent(bLngInput)}&nameB=${encodeURIComponent(locationBName)}&compare=true`;
//   }

//   setCurrentShareUrl(shareUrl);
//   setShowSharePopup(true);

//   // Automatically copy to clipboard for convenience
//   try {
//     await navigator.clipboard.writeText(shareUrl);
//   } catch (err) {
//     console.error("Auto-copy failed", err);
//   }
// };
// const generateShareLink = () => {
//   // Construct the URL (keeping your logic for nameA, nameB, and coordinates)
//   let url = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}&nameA=${encodeURIComponent(locationAName)}`;
  
//   if (isCompareMode && bLatInput && bLngInput) {
//     url += `&bLat=${encodeURIComponent(bLatInput)}&bLng=${encodeURIComponent(bLngInput)}&nameB=${encodeURIComponent(locationBName)}&compare=true`;
//   }

//   setShareUrl(url);
//   setIsShareModalOpen(true); // Open the center modal
// };
// ... inside SideBar function
const openProjectManager = () => {
  setShareModalMode("project");
  setShareUrl(""); // clear old link (optional but clean)
  setIsShareModalOpen(true);
};

const generateShareLink = () => {
  const url = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}&nameA=${encodeURIComponent(locationAName)}${isCompareMode && bLatInput && bLngInput ? `&bLat=${encodeURIComponent(bLatInput)}&bLng=${encodeURIComponent(bLngInput)}&nameB=${encodeURIComponent(locationBName)}&compare=true` : ''}`;
  
  setShareUrl(url);
  setShareModalMode("share");
  setIsShareModalOpen(true);
};
  const saveAsProject = async () => {
  if (!result) {
    alert("Analyze a location first.");
    return;
  }

  setSaveProjectLoading(true);

  try {
    const payload = {
      siteA: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: locationAName,
        result: result,
        snapshotData: snapshotData  // Add snapshot data for Site A
      },
      compare: {
        enabled: Boolean(isCompareMode && compareResult)
      },
      siteB: isCompareMode && compareResult ? {
        lat: parseFloat(bLatInput),
        lng: parseFloat(bLngInput),
        name: locationBName,
        result: compareResult,
        snapshotData: snapshotDataB  // Add snapshot data for Site B
      } : null,
      meta: {
        savedAt: new Date().toISOString(),
        app: "CERES GEOAI"
      }
    };

    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: projectName?.trim() || (isCompareMode ? `${locationAName} vs ${locationBName}` : locationAName),

        payload
      })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Save failed");

    // Create share URL
    const finalUrl = `${window.location.origin}${json.shareUrl}`;

    setShareUrl(finalUrl);
    setShareModalMode("project");
    setIsShareModalOpen(true);

    // auto copy
    try {
      await navigator.clipboard.writeText(finalUrl);
    } catch {
      // ignore
    }

  } catch (e) {
    console.error("Save project failed:", e);
    alert("Saving project failed. Check backend logs.");
  } finally {
    setSaveProjectLoading(false);
  }
};

  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPDF = async () => {
    if (!result) {
        alert("Please analyze a location first");
        return;
    }

    setPdfLoading(true);
    // Construct the same link logic used in your Share Modal
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const mainLink = `${baseUrl}?lat=${lat}&lng=${lng}&nameA=${encodeURIComponent(locationAName)}`;
    try {
        const payload = {
            ...result,
            weather: result.weather,
            locationName: locationAName,
            shareLink: mainLink,
            location: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            },
            compareData: (isCompareMode && compareResult) ? {
                ...compareResult,
                locationName: locationBName,
                shareLink: `${mainLink}&bLat=${bLatInput}&bLng=${bLngInput}&nameB=${encodeURIComponent(locationBName)}&compare=true`,
                location: {
                    latitude: parseFloat(bLatInput),
                    longitude: parseFloat(bLngInput)
                }
            } : null
        };

        // const res = await fetch("http://127.0.0.1:5000/generate_report", {
        // const res = await fetch("/generate_report", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify(payload),
        // });
        const res = await fetch(`${API_BASE}/generate_report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Backend failed to generate report");

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const link = document.createElement("a");
        link.href = downloadUrl;
        

        const cleanName = locationAName.replace(/\s+/g, '_');
        const fileName = isCompareMode ? 
            `Comparison_${cleanName}_vs_${locationBName.replace(/\s+/g, '_')}.pdf` : 
            `GeoAI_Report_${cleanName}.pdf`;
        
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        }, 100);

    } catch (err) {
        console.error("PDF Error:", err);
        alert("Report download failed. Check if your browser is blocking pop-ups.");
    } finally {
        setPdfLoading(false);
    }
  };

  return (
    <>
    <aside
      className="sidebar glass-morphic"
      style={{
        width: `${sidebarWidth}px`,
        flex: `0 0 ${sidebarWidth}px`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Date and Time Display */}
      {/* <div className="sidebar-datetime-display">
        <span className="datetime-date">{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        <span className="datetime-separator">•</span>
        <span className="datetime-time">{currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div> */}
      {/* Date and Time Display - Updated for 24h + Year */}
{/* <div className="sidebar-datetime-display">
  <div className="datetime-content">
    <span className="datetime-date">
      {currentTime.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })}
    </span>
    <span className="datetime-separator">|</span>
    <span className="datetime-time">
      {currentTime.toLocaleTimeString('en-GB', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })}
    </span>
  </div>
</div> */}
{/* Centered Tactical Datetime Badge */}
{/* <div className="sidebar-top-header">
  
  <div className="header-wing left-wing">
    <div className="satellite-hub">
      <span className="telemetry-icon-large" title="">📡</span>
      <div className="signal-waves">
        <span></span>
        <span></span>
      </div>
    </div>
   
  </div>

  
  <div className="sidebar-datetime-display">
     <div className="datetime-content">
      <span className="datetime-date">
        {currentTime.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}
      </span>
      <span className="datetime-separator">|</span>
      <span className="datetime-time">
        {currentTime.toLocaleTimeString('en-GB', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })}
      </span>
    </div>
  </div>


<div className="header-wing right-wing">
  <div className="live-status-container">
    <div className="live-indicator-hub">
      <div className="live-pulse-ring"></div>
      <div className="live-pulse-dot-large"></div>
    </div>
    <span className="status-text-prime">LIVE</span>
  </div>
</div>
</div> */}
<div className="sidebar-top-header tactical-telemetry">
  {/* ROW 1: System Status & Local Time */}
  <div className="telemetry-row-primary">
    <div className="satellite-hub">
      <span className="telemetry-icon-large">📡</span>
      <div className="signal-waves"><span></span><span></span></div>
    </div>
    
    <div className="main-datetime-display">
      <div className="datetime-content">
        <span className="datetime-date">
          {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
        <span className="datetime-separator">|</span>
        <span className="datetime-time">
          {currentTime.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <span className="timezone-badge">{telemetry.gmtStr}</span>
      </div>
    </div>

    {/* <div className="header-wing">
      <div className="live-status-container">
        <div className="live-pulse-dot-large"></div>
        <span className="status-text-prime">LIVE</span>
      </div>
    </div> */}
    <div className="header-wing right-wing">
  <div className="live-status-container">
    <div className="live-indicator-hub">
      {/* The pulse ring is the expanding circle behind the dot */}
      <div className="live-pulse-ring"></div>
      {/* The dot itself */}
      <div className="live-pulse-dot-large"></div>
    </div>
    <span className="status-text-prime">LIVE</span>
  </div>
</div>
  </div>

  {/* ROW 2: Global Telemetry Dashboard */}
  <div className="telemetry-row-sub">
    <div className="telemetry-pill">
      <span className="pill-label">UTC</span>
      <span className="pill-value">{telemetry.utcTime}</span>
    </div>
    <div className="telemetry-pill">
      <span className="pill-label">EPOCH</span>
      <span className="pill-value">{telemetry.epoch}</span>
    </div>
    <div className="telemetry-pill">
      <span className="pill-label">DOY</span>
      <span className="pill-value">{telemetry.doy}</span>
    </div>
    <div className="telemetry-pill highlight">
      <span className="pill-label">YEAR</span>
      <span className="pill-value">{telemetry.progress}%</span>
    </div>
    <div className="telemetry-pill solar">
      <span className="pill-label">{telemetry.solarIcon}</span>
      <span className="pill-value">{telemetry.solarPhase}</span>
    </div>
  </div>
</div>


      <div style={{ height: "2px", width: "100%" }}></div>

      <div className="sidebar-scrollable" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* SEARCH SECTION - FORCE FULL WIDTH */}
        <section className="sidebar-search-section" ref={searchContainerRef} style={{ width: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
          <div className="search-wrapper" style={{ width: '100%', position: 'relative' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="sidebar-search-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {isSearching && <div className="search-spinner-small" />}
          </div>

          {suggestions.length > 0 && (
            <div className="sidebar-suggestions-dropdown" style={{ width: 'calc(100% - 20px)' }}>
              {suggestions.map((item, idx) => (
                <div key={idx} className="suggestion-item" onClick={() => selectResult(item)}>
                  <span className="suggestion-pin">📍</span>
                  <div className="suggestion-text">
                    <div className="suggestion-main">{item.display_name.split(",")[0]}</div>
                    <div className="suggestion-sub">{item.display_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedDescription && (
            <div className="search-result-description" style={{ width: '100%' }}>
              <span className="desc-label">Selected Location</span>
              {selectedDescription}
              <button className="clear-desc" onClick={() => setSelectedDescription("")}>✕</button>
            </div>
          )}
        </section>

        {/* 📄 REPORT ACTIONS */}
        <section className="control-group compact-group" style={{ marginTop: "12px" }}>
          <h3 style={{ marginBottom: '8px', fontSize: '14px' }}>📄 Actions</h3>
          <div className="compact-row" style={{ gap: "4px" }}>
            <button 
              type="button" 
              className="btn-save" 
              onClick={downloadPDF} 
              disabled={!result || pdfLoading} 
              style={{ flex: 1, padding: '6px 8px', fontSize: '11px', position: 'relative' }}
            >
              {pdfLoading ? (
                <span className="pdf-loader-text">⏳ Generating...</span>
              ) : (
                "⬇️ Generate Report"
              )}
            </button>
            <button type="button" className="btn-save" onClick={generateShareLink} style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}>
              🔗 Share this Link
            </button>
            {/* <button
  type="button"
  className="btn-save"
  // onClick={saveAsProject}
  onClick={openProjectManager}
  // disabled={!result || saveProjectLoading}
  disabled={saveProjectLoading}
  style={{ flex: 1, padding: "6px 8px", fontSize: "11px" }}
>
  {saveProjectLoading ? "⏳ Saving..." : "💾 Save / Import Project"}
</button> */}
<button
  type="button"
  className="btn-save"
  onClick={openProjectManager}
  disabled={saveProjectLoading}
  style={{ flex: 1, padding: "6px 8px", fontSize: "11px" }}
>
  {saveProjectLoading
    ? "⏳ Saving..."
    : result
      ? "💾 Project Manager"
      : "📥 Import Project"}
</button>

            
          
          </div>
        </section>

       
        <section className="control-group compact-group">
  <h3>📍 Location A: {locationAName}</h3>
  <form onSubmit={handleSubmit}>
    {/* ROW 1: Lat, Lng, and Analyze button in one compact line */}
    <div className="geo-unified-logic-row">
      <div className="field"><label>Lat</label><input value={lat} onChange={(e) => setLat(e.target.value)} className="highlighted-box" /></div>
      <div className="field"><label>Lng</label><input value={lng} onChange={(e) => setLng(e.target.value)} className="highlighted-box" /></div>
      <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "..." : "Analyze"}</button>
      {result && (
        <button 
          type="button" 
          onClick={() => setCloseSiteA(true)}
          className="btn-cross"
          title="Close Site A Analysis"
        >
          ✕
        </button>
      )}
    </div>

    {/* ROW 2: My Loc, Save, and Nearby in one compact line */}
    <div className="geo-tools-row-triple">
      <button type="button" onClick={handleMyLocation} className="btn-mono-tool">📍 My Loc</button>
      <button type="button" onClick={handleSavePlace} className="btn-mono-tool">⭐ Save</button>
      <button type="button" onClick={handleNearbyPlaces} disabled={!result || nearbyLoading} className="btn-mono-tool">🏘️ Nearby</button>
    </div>
  </form>
</section>

        
        {/* <section
          className="control-group comparison-box compact"
          style={{ display: showLocationB ? "block" : "none" }}
        >
          <h3>📍 Location B: {locationBName}</h3>
          <div className="compact-row">
            <button
              className="btn-save mini"
              onClick={() => setIsSelectingB(!isSelectingB)}
              style={{
                flex: 1,
                border: isSelectingB ? "1px solid #ef4444" : "",
                padding: "4px 6px",
                fontSize: "10px",
              }}
            >
              {isSelectingB ? "Cancel" : "🗺️ Map"}
            </button>
            <select
              className="btn-save mini"
              style={{ flex: 1.5, padding: "4px 6px", fontSize: "10px" }}
              onChange={(e) => {
                const p = savedPlaces[e.target.value];
                if (p && p.lat !== undefined) {
                  handleCompareSelect(p.lat, p.lng, p.name);
                }
              }}
              value=""
            >
              <option value="" disabled>Saved Places...</option>
              {savedPlaces.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>
<div className="geo-unified-logic-row">
  <div className="field">
    <label>Lat B</label>
    <input
      type="text"
      value={bLatInput}
      onChange={(e) => setBLatInput(e.target.value)}
      className="highlighted-box"
    />
  </div>
  <div className="field">
    <label>Lng B</label>
    <input
      type="text"
      value={bLngInput}
      onChange={(e) => setBLngInput(e.target.value)}
      className="highlighted-box"
    />
  </div>
  

  <button
    type="button"
    onClick={() => bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
    className="btn-analyze"
  >
    {compareLoading ? "..." : "Go"}
  </button>
  
 
  {isCompareMode && (
  <button 
  
    onClick={(e) => {
  if (e) e.stopPropagation();
  setIsCompareMode(false);
  setShowLocationB(false);     
  setBLatInput("");
  setBLngInput("");
  setCompareResult(null);     
  if (setSnapshotDataB) setSnapshotDataB(null);
  setLocationBName("Site B");
  localStorage.removeItem("geo_name_b"); 
  if (setAnalyzedCoordsB) setAnalyzedCoordsB({ lat: null, lng: null });  
  localStorage.removeItem("geo_lat_b_analyzed");
  localStorage.removeItem("geo_lng_b_analyzed");
  localStorage.removeItem("geo_snapshot_data_b");
}}
    className="btn-cross" 
    title="Exit Compare"
  >
    ✕
  </button>
)}
</div>

          <div className="compact-row" style={{ marginTop: "6px", gap: "4px" }}>
           
            <div className="geo-tools-row-triple">
  <button 
    type="button" 
    onClick={handleMyLocationB} 
    className="btn-mono-tool" 
    title="My Location"
  >
    📍
  </button>
  <button 
    type="button" 
    onClick={handleSavePlaceB} 
    disabled={isBFromSavedPlace} 
    className="btn-mono-tool" 
    title="Save Place"
  >
    ⭐
  </button>
  <button 
    type="button" 
    onClick={handleNearbyPlacesB} 
    disabled={!analyzedCoordsB?.lat || nearbyLoadingB} 
    className="btn-mono-tool" 
    title="Nearby Places"
  >
    {nearbyLoadingB ? "..." : "🏘️"}
  </button>
</div>
          </div>
        </section> */}
        {showLocationB && (
  <section className="control-group comparison-box compact">
    <h3>📍 Location B: {locationBName}</h3>
    
    <div className="compact-row">
      <button
        className="btn-save mini"
        onClick={() => setIsSelectingB(!isSelectingB)}
        style={{
          flex: 1,
          border: isSelectingB ? "1px solid #ef4444" : "",
          padding: "4px 6px",
          fontSize: "10px",
        }}
      >
        {isSelectingB ? "Cancel" : "🗺️ Map"}
      </button>
      <select
        className="btn-save mini"
        style={{ flex: 1.5, padding: "4px 6px", fontSize: "10px" }}
        onChange={(e) => {
          const p = savedPlaces[e.target.value];
          if (p && p.lat !== undefined) {
            handleCompareSelect(p.lat, p.lng, p.name);
          }
        }}
        value=""
      >
        <option value="" disabled>Saved Places...</option>
        {savedPlaces.map((p, i) => (
          <option key={i} value={i}>{p.name}</option>
        ))}
      </select>
    </div>

    <div className="geo-unified-logic-row">
      <div className="field">
        <label>Lat B</label>
        <input
          type="text"
          value={bLatInput}
          onChange={(e) => setBLatInput(e.target.value)}
          className="highlighted-box"
        />
      </div>
      <div className="field">
        <label>Lng B</label>
        <input
          type="text"
          value={bLngInput}
          onChange={(e) => setBLngInput(e.target.value)}
          className="highlighted-box"
        />
      </div>
      
      <button
        type="button"
        onClick={() => bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
        className="btn-analyze"
      >
        {compareLoading ? "..." : "Go"}
      </button>
      
      {isCompareMode && (
        <button 
          onClick={(e) => {
            if (e) e.stopPropagation();
            setIsCompareMode(false);
            setShowLocationB(false); 
            setBLatInput("");
            setBLngInput("");
            setCompareResult(null);
            if (setSnapshotDataB) setSnapshotDataB(null);
            setLocationBName("Site B");
            localStorage.removeItem("geo_name_b");
            if (setAnalyzedCoordsB) setAnalyzedCoordsB({ lat: null, lng: null });
            localStorage.removeItem("geo_lat_b_analyzed");
            localStorage.removeItem("geo_lng_b_analyzed");
            localStorage.removeItem("geo_snapshot_data_b");
          }}
          className="btn-cross" 
          title="Exit Compare"
        >
          ✕
        </button>
      )}
    </div>

    <div className="compact-row" style={{ marginTop: "6px", gap: "4px" }}>
      <div className="geo-tools-row-triple">
        <button 
          type="button" 
          onClick={handleMyLocationB} 
          className="btn-mono-tool" 
          title="My Location"
        >
          📍
        </button>
        <button 
          type="button" 
          onClick={handleSavePlaceB} 
          disabled={isBFromSavedPlace} 
          className="btn-mono-tool" 
          title="Save Place"
        >
          ⭐
        </button>
        <button 
          type="button" 
          onClick={handleNearbyPlacesB} 
          disabled={!analyzedCoordsB?.lat || nearbyLoadingB} 
          className="btn-mono-tool" 
          title="Nearby Places"
        >
          {nearbyLoadingB ? "..." : "🏘️"}
        </button>
      </div>
    </div>
  </section>
)}

        {/* 🔄 TOGGLE BUTTON FOR LOCATION B */}
        {/* <button
          onClick={() => setShowLocationB(!showLocationB)}
          className="compare-toggle-btn"
          style={{
            width: "calc(100% - 20px)",
            margin: "6px 10px",
            padding: "4px",
            background: showLocationB
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #ec4899, #f43f5e)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {showLocationB ? "✕ Close Comparison" : "🔄 Compare with Location B"}
        </button> */}
         {/* <button
          onClick={() => setShowLocationB(!showLocationB)}
          className="compare-toggle-btn"
          style={{
            width: "calc(100% - 20px)",
            margin: "6px 10px",
            padding: "4px",
            background: showLocationB
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #ec4899, #f43f5e)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {showLocationB ? "✕ Close Comparison" : "🔄 Compare with Location B"}
        </button> */}
        {/* <button
  onClick={() => {
    if (showLocationB) {
      setShowLocationB(false);
      setIsCompareMode(false);
      setCompareResult(null);
      if (setSnapshotDataB) setSnapshotDataB(null);
      setBLatInput("");
      setBLngInput("");
      setLocationBName("Site B");
      localStorage.removeItem("geo_name_b"); // Clear persisted name
      if (setAnalyzedCoordsB) setAnalyzedCoordsB({ lat: null, lng: null });
      localStorage.removeItem("geo_lat_b_analyzed");
      localStorage.removeItem("geo_lng_b_analyzed");
      localStorage.removeItem("geo_snapshot_data_b"); // Clear localStorage
    } else {
      setShowLocationB(true);
    }
  }}
  className="compare-toggle-btn"
>
  {showLocationB ? "✕ Close Comparison" : "🔄 Compare with Location B"}
</button> */}
{/* 🔄 TOGGLE BUTTON FOR LOCATION B */}
<button
  onClick={() => setShowLocationB(!showLocationB)} // Just toggle visibility
  className="compare-toggle-btn"
  style={{
    width: "calc(100% - 20px)",
    margin: "6px 10px",
    padding: "4px",
    background: showLocationB
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #ec4899, #f43f5e)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  {showLocationB ? "✕ Hide Comparison" : "🔄 Compare with Location B"}
</button>

        {/* Saved Places Section */}
        <section className="saved-places-section" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <h3>Saved Places</h3>
          <div className="places-grid attractive-scroll" style={{ flex: 1, overflowY: "auto" }}>
            {savedPlaces.map((p, i) => (
              <div
                key={i}
                className="place-card-compact"
                onClick={() => {
                  // We set the name first so the coord-watcher doesn't overwrite it
    setLocationAName(p.name);
                  setLat(p.lat.toString());
                  setLng(p.lng.toString());
                }}
              >
                <div className="place-info-mini">
                  {editingIndex === i ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const updated = [...savedPlaces];
                          updated[i].name = editingName || p.name;
                          setSavedPlaces(updated);
                          setEditingIndex(null);
                        } else if (e.key === "Escape") setEditingIndex(null);
                      }}
                      className="highlighted-box"
                      style={{ padding: "4px", fontSize: "12px" }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <strong>{p.name}</strong>
                      <span>{p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {editingIndex !== i && (
                    <button className="btn-edit" onClick={(e) => {
                      e.stopPropagation();
                      setEditingIndex(i);
                      setEditingName(p.name);
                    }}>✎</button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedPlaces(savedPlaces.filter((_, idx) => idx !== i));
                    }} 
                    className="btn-cross" 
                    title="Delete Saved Place"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <div className="sidebar-resizer" onMouseDown={startResizingSide} />
    </aside>
    {/* 🚀 MOVE THE MODAL OUTSIDE THE ASIDE TAG 🚀 */}
      {isShareModalOpen && (
        <div className="share-modal-overlay" onClick={() => setIsShareModalOpen(false)}>
          <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="share-modal-close-top" onClick={() => setIsShareModalOpen(false)}>✕</button>
            <div className="share-modal-content">
              {/* <h3 className="share-title">Share Analysis</h3> */}
              {/* <h3 className="share-title">
  {shareModalMode === "project" ? "Project Saved" : "Share Analysis"}
</h3> */}
<h3 className="share-title">
  {shareModalMode === "share"
    ? "Share Analysis"
    : result
      ? "Save Project"
      : "Import Project"}
</h3>



              <div className="share-qr-section">
                {/* <div className="qr-container-box">
                  <QRCode value={shareUrl} size={180} level="M" />
                </div> */}
                <div className="qr-container-box">
  {shareUrl ? (
    <QRCode value={shareUrl} size={180} level="M" />
  ) : (
    <div style={{ fontSize: "12px", opacity: 0.6, textAlign: "center" }}>
      No saved project link yet.
      <br />
      Click "Save to Cloud" after analysis.
    </div>
  )}
</div>

                <p className="share-subtitle">
                  {isCompareMode ? `${locationAName} vs ${locationBName}` : locationAName}
                </p>
              </div>
              {/* <div className="share-actions-vertical">
                <button 
                  className="share-action-primary" 
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    alert("Link copied!");
                  }}
                >
                  Copy Link
                </button>
                <button className="share-action-secondary" onClick={() => setIsShareModalOpen(false)}>Close</button>
              </div> */}
              <div className="share-actions-vertical">

  {/* Copy */}
  {/* <button 
    className="share-action-primary" 
    onClick={async () => {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    }}
  >
    Copy Link
  </button> */}

  {/* Rename Project */}
  {/* <div style={{ width: "100%", marginTop: "10px" }}>
    <label style={{ fontSize: "11px", opacity: 0.7, display: "block", marginBottom: "6px" }}>
      Project Name
    </label>
    <input
      value={projectName}
      onChange={(e) => setProjectName(e.target.value)}
      placeholder="Rename project..."
      className="sidebar-search-input"
      style={{ width: "100%", fontSize: "12px", padding: "10px" }}
    />
  </div>

  <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "10px" }}>
    <button
      className="share-action-secondary"
      onClick={exportProjectFile}
      style={{ flex: 1 }}
    >
      📦 Export JSON
    </button>

    <button
      className="share-action-secondary"
      onClick={() => importFileRef.current?.click()}
      style={{ flex: 1 }}
    >
      📥 Import JSON
    </button>
  </div> */}
  {/* ============ SHARE MODE ============ */}
  {shareModalMode === "share" && (
    <>
      <button
        className="share-action-primary"
        disabled={!shareUrl}
        style={{ opacity: !shareUrl ? 0.5 : 1 }}
        onClick={async () => {
          if (!shareUrl) return;
          await navigator.clipboard.writeText(shareUrl);
          alert("Link copied!");
        }}
      >
        Copy Link
      </button>
    </>
  )}
  {/* ============ PROJECT MODE ============ */}
  {shareModalMode === "project" && (
    <>
      {/* Save to Cloud */}
      <button
        className="share-action-primary"
        onClick={saveAsProject}
        disabled={!result || saveProjectLoading}
        style={{ marginTop: "10px", opacity: !result ? 0.5 : 1 }}
      >
        {saveProjectLoading ? "⏳ Saving..." : "☁️ Save to Cloud"}
      </button>

      {/* Copy Cloud Link only if it exists */}
      <button
        className="share-action-primary"
        disabled={!shareUrl}
        style={{ opacity: !shareUrl ? 0.5 : 1 }}
        onClick={async () => {
          if (!shareUrl) return;
          await navigator.clipboard.writeText(shareUrl);
          alert("Project link copied!");
        }}
      >
        Copy Saved Project Link
      </button>

    {/* Rename Project */}
    <div style={{ width: "100%", marginTop: "10px" }}>
      <label style={{ fontSize: "11px", opacity: 0.7, display: "block", marginBottom: "6px" }}>
        Project Name
      </label>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Rename project..."
        className="sidebar-search-input"
        style={{ width: "100%", fontSize: "12px", padding: "10px" }}
      />
    </div>

    {/* Export / Import Row */}
    <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "10px" }}>
      <button
        className="share-action-secondary"
        onClick={exportProjectFile}
        style={{ flex: 1 }}
      >
        📦 Export JSON
      </button>

      <button
        className="share-action-secondary"
        onClick={() => importFileRef.current?.click()}
        style={{ flex: 1 }}
      >
        📥 Import JSON
      </button>
    </div>
  </>
)}


  {/* Close */}
  <button 
    className="share-action-secondary" 
    onClick={() => setIsShareModalOpen(false)}
    style={{ marginTop: "10px" }}
  >
    Close
  </button>
</div>

            </div>
          </div>
        </div>
      )}
      <input
  ref={importFileRef}
  type="file"
  accept="application/json"
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) importProjectFile(file);
    e.target.value = "";
  }}
/>

      </>
  );
}