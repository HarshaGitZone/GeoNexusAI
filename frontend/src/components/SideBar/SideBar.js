import React, { useState, useEffect, useRef } from "react";
import "./SideBar.css";
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
  nearbyLoadingB, handleNearbyPlacesB,
  isCompareMode, setIsCompareMode,
  editingIndex, setEditingIndex,
  editingName, setEditingName,
  setSavedPlaces,
  sidebarWidth, startResizingSide,
  onSearchResult,
  setCompareResult,    // <--- Add this
  setSnapshotDataB,    // <--- Add this
  setLocationBName,
}) {

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");

  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length > 2) {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(val)}`
        );
        const data = await res.json();
        setSuggestions(data.slice(0, 5));
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    } else {
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
  //   let shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}`;
  //   if (isCompareMode && bLatInput && bLngInput) {
  //     shareUrl += `&bLat=${encodeURIComponent(bLatInput)}&bLng=${encodeURIComponent(bLngInput)}&compare=true`;
  //   }

  //   try {
  //     await navigator.clipboard.writeText(shareUrl);
  //     alert(isCompareMode ? "Comparison link copied to clipboard!" : "Shareable link copied!");
  //   } catch (err) {
  //     console.error("Clipboard failed:", err);
  //     prompt("Copy this link to share your analysis:", shareUrl);
  //   }
  // };
  // SideBar.js - inside generateShareLink function
const generateShareLink = async () => {
  // Add nameA to the link
  let shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}&nameA=${encodeURIComponent(locationAName)}`;
  
  // If in compare mode, add nameB as well
  if (isCompareMode && bLatInput && bLngInput) {
    shareUrl += `&bLat=${encodeURIComponent(bLatInput)}&bLng=${encodeURIComponent(bLngInput)}&nameB=${encodeURIComponent(locationBName)}&compare=true`;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    alert(isCompareMode ? "Comparison link copied to clipboard!" : "Shareable link copied!");
  } catch (err) {
    console.error("Clipboard failed:", err);
    prompt("Copy this link to share your analysis:", shareUrl);
  }
};

  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPDF = async () => {
    if (!result) {
        alert("Please analyze a location first");
        return;
    }

    setPdfLoading(true);

    try {
        const payload = {
            ...result,
            weather: result.weather,
            locationName: locationAName,
            location: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            },
            compareData: (isCompareMode && compareResult) ? {
                ...compareResult,
                locationName: locationBName,
                location: {
                    latitude: parseFloat(bLatInput),
                    longitude: parseFloat(bLngInput)
                }
            } : null
        };

        // const res = await fetch("http://127.0.0.1:5000/generate_report", {
        const res = await fetch("/generate_report", {
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
      <div style={{ height: "20px", width: "100%" }}></div>

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
          </div>
        </section>

        {/* LOCATION A */}
        {/* <section className="control-group compact-group">
          <h3>📍 Location A: {locationAName}</h3>
          <form onSubmit={handleSubmit}>
            <div className="compact-row">
              <div className="field">
                <label>Lat</label>
                <input value={lat} onChange={(e) => setLat(e.target.value)} className="highlighted-box" />
              </div>
              <div className="field">
                <label>Lng</label>
                <input value={lng} onChange={(e) => setLng(e.target.value)} className="highlighted-box" />
              </div>
            </div>
            <div className="compact-row" style={{ marginTop: "6px", gap: "4px" }}>
              <button type="button" onClick={handleMyLocation} className="btn-save" style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}>📍 My Loc</button>
              <button type="button" onClick={handleSavePlace} className="btn-save" style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}>⭐ Save</button>
            </div>
            <div className="compact-row" style={{ marginTop: "4px", gap: "4px" }}>
              <button type="submit" className="btn-analyze" disabled={loading} style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}>
                {loading ? "..." : "Analyze"}
              </button>
              <button type="button" onClick={handleNearbyPlaces} disabled={!result || nearbyLoading} className="btn-analyze" style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }}>
                {nearbyLoading ? "..." : "🏘️ NearBy Places"}
              </button>
            </div>
          </form>
        </section> */}
        <section className="control-group compact-group">
  <h3>📍 Location A: {locationAName}</h3>
  <form onSubmit={handleSubmit}>
    {/* ROW 1: Lat, Lng, and Analyze button in one compact line */}
    <div className="geo-unified-logic-row">
      <div className="field"><label>Lat</label><input value={lat} onChange={(e) => setLat(e.target.value)} className="highlighted-box" /></div>
      <div className="field"><label>Lng</label><input value={lng} onChange={(e) => setLng(e.target.value)} className="highlighted-box" /></div>
      <button type="submit" className="btn-analyze" disabled={loading}>{loading ? "..." : "Analyze"}</button>
    </div>

    {/* ROW 2: My Loc, Save, and Nearby in one compact line */}
    <div className="geo-tools-row-triple">
      <button type="button" onClick={handleMyLocation} className="btn-mono-tool">📍 My Loc</button>
      <button type="button" onClick={handleSavePlace} className="btn-mono-tool">⭐ Save</button>
      <button type="button" onClick={handleNearbyPlaces} disabled={!result || nearbyLoading} className="btn-mono-tool">🏘️ Nearby</button>
    </div>
  </form>
</section>

        
        <section
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

          {/* REDESIGNED COMPACT ROW: LAT, LNG, GO, EXIT */}
          {/* <div className="compact-row" style={{ marginTop: "6px", gap: "3px", alignItems: "flex-end" }}>
            <div className="field" style={{ flex: 0.8 }}>
              <label className="input-label" style={{ fontSize: "9px" }}>Lat B</label>
              <input
                type="text"
                value={bLatInput}
                onChange={(e) => setBLatInput(e.target.value)}
                className="highlighted-box"
                style={{ padding: "4px", fontSize: "10px" }}
              />
            </div>
            <div className="field" style={{ flex: 0.8 }}>
              <label className="input-label" style={{ fontSize: "9px" }}>Lng B</label>
              <input
                type="text"
                value={bLngInput}
                onChange={(e) => setBLngInput(e.target.value)}
                className="highlighted-box"
                style={{ padding: "4px", fontSize: "10px" }}
              />
            </div>
            <button
              type="button"
              onClick={() => bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
              disabled={!bLatInput || !bLngInput || compareLoading}
              className="btn-analyze"
              style={{
                padding: "4px 6px",
                fontSize: "10px",
                flex: 0.4,
                height: "22px",
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              }}
            >
              {compareLoading ? "..." : "Go"}
            </button>
            {isCompareMode && (
              <button 
                onClick={() => setIsCompareMode(false)} 
                className="btn-cross" 
                title="Exit Compare"
                style={{ 
                  flex: 0.3, 
                  height: "22px", 
                  fontSize: "10px", 
                  backgroundColor: "#ef4444",
                  borderRadius: "4px",
                  color: "white" 
                }}
              >
                ✕
              </button>
            )}
          </div> */}
          {/* ROW 1: Lat, Lng, Go, X */}
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
  
  {/* Go and X are now inside the same flex row as inputs */}
  <button
    type="button"
    onClick={() => bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
    className="btn-analyze"
  >
    {compareLoading ? "..." : "Go"}
  </button>
  
  {/* {isCompareMode && (
    <button 
      onClick={() => setIsCompareMode(false)} 
      className="btn-cross"
    >
      ✕
    </button>
  )} */}
  {isCompareMode && (
  <button 
    onClick={() => {
      setIsCompareMode(false);      // Exit compare mode
      setBLatInput("");             // Clear Lat B input
      setBLngInput("");             // Clear Lng B input
      setCompareResult(null);       // Remove analysis data for B
      setSnapshotDataB(null);       // Clear Site B snapshot
      setLocationBName("Site B");   // Reset name fallback
    }} 
    className="btn-cross" 
    title="Exit Compare"
  >
    ✕
  </button>
)}
</div>

          <div className="compact-row" style={{ marginTop: "6px", gap: "4px" }}>
            {/* <button type="button" onClick={handleMyLocationB} className="btn-save" style={{ flex: 0.7, padding: '4px', fontSize: '10px' }}>📍</button>
            <button type="button" onClick={handleSavePlaceB} disabled={isBFromSavedPlace} className="btn-save" style={{ flex: 0.7, padding: '4px', fontSize: '10px', opacity: isBFromSavedPlace ? 0.5 : 1 }}>⭐</button>
            <button 
              type="button" 
              onClick={handleNearbyPlacesB} 
              disabled={!analyzedCoordsB?.lat || nearbyLoadingB}
              className="btn-analyze"
              style={{ flex: 1, padding: '4px 6px', fontSize: '10px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
            >
              {nearbyLoadingB ? "..." : "🏘️"}
            </button> */}
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

        {/* 🔄 TOGGLE BUTTON FOR LOCATION B */}
        <button
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
                  <button className="btn-cross" onClick={(e) => {
                    e.stopPropagation();
                    setSavedPlaces(savedPlaces.filter((_, idx) => idx !== i));
                  }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <div className="sidebar-resizer" onMouseDown={startResizingSide} />
    </aside>
  );
}