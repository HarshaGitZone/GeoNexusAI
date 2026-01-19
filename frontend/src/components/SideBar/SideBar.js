import React, { useState, useEffect, useRef } from "react";

export default function SideBar({
  lat, setLat, lng, setLng,
  locationAName, setLocationAName,
  loading, handleSubmit,
  handleMyLocation, handleSavePlace,
  handleNearbyPlaces, result,
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
  onSearchResult
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
  

  /* ---------------- SHARE + PDF ---------------- */

  const generateShareLink = async () => {
    const link = `${window.location.origin}?lat=${lat}&lng=${lng}`;
    await navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
  };

  const downloadPDF = async () => {
    if (!result) {
      alert("Please analyze a location first");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/generate_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        alert("PDF generation failed");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Land_Suitability_Report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error generating PDF");
    }
  };

  /* ------------------------------------------------ */

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
      <div style={{ height: "50px", width: "100%" }}></div>

      <div className="sidebar-scrollable" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* SEARCH SECTION */}
        <section className="sidebar-search-section" ref={searchContainerRef}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="sidebar-search-input"
            />
            {isSearching && <div className="search-spinner-small" />}
          </div>

          {suggestions.length > 0 && (
            <div className="sidebar-suggestions-dropdown">
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
            <div className="search-result-description">
              <span className="desc-label">Selected Location</span>
              {selectedDescription}
              <button className="clear-desc" onClick={() => setSelectedDescription("")}>✕</button>
            </div>
          )}
        </section>

        {/* LOCATION A */}
        <section className="control-group compact-group">
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

            <div className="compact-row" style={{ marginTop: "8px" }}>
              <button type="button" onClick={handleMyLocation} className="btn-save">📍 My Location</button>
              <button type="button" onClick={handleSavePlace} className="btn-save">⭐ Save Place</button>
            </div>

            <div className="compact-row" style={{ marginTop: "8px" }}>
              <button type="submit" className="btn-analyze" disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </button>

              <button type="button" onClick={handleNearbyPlaces} disabled={!result || nearbyLoading} className="btn-analyze">
                {nearbyLoading ? "Loading..." : "🏘️ Nearby"}
              </button>
            </div>
          </form>
        </section>
        {/* 🔁 LOCATION B COMPARE SECTION */}
<section
  className="control-group comparison-box compact"
  style={{ display: showLocationB ? "block" : "none", marginTop: "10px" }}
>
  <h3>📍 Location B: {locationBName || "Not Selected"}</h3>

  <div className="compact-row">
    <button
      className="btn-save mini"
      onClick={() => setIsSelectingB(!isSelectingB)}
      style={{ flex: 1, border: isSelectingB ? "1px solid #ef4444" : "", padding: "8px" }}
    >
      {isSelectingB ? "Cancel" : "🗺️ Map"}
    </button>

    <select
      className="btn-save mini"
      style={{ flex: 1.5, padding: "8px" }}
      onChange={(e) => {
        const p = savedPlaces[e.target.value];
        if (p) handleCompareSelect(p.lat, p.lng, p.name);
      }}
      value=""
    >
      <option value="" disabled>Saved Places...</option>
      {savedPlaces.map((p, i) => (
        <option key={i} value={i}>{p.name}</option>
      ))}
    </select>
  </div>

  <div className="compact-row" style={{ marginTop: "6px" }}>
    <div className="field">
      <label>Lat B</label>
      <input value={bLatInput} onChange={(e) => setBLatInput(e.target.value)} className="highlighted-box" />
    </div>
    <div className="field">
      <label>Lng B</label>
      <input value={bLngInput} onChange={(e) => setBLngInput(e.target.value)} className="highlighted-box" />
    </div>

    <button
      onClick={() => bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
      disabled={!bLatInput || !bLngInput || compareLoading}
      className="btn-analyze"
    >
      {compareLoading ? "..." : "Compare"}
    </button>
  </div>

  <div className="compact-row" style={{ marginTop: "6px" }}>
    <button onClick={handleMyLocationB} className="btn-save">📍 My Location</button>
    <button onClick={handleSavePlaceB} disabled={isBFromSavedPlace} className="btn-save">⭐ Save</button>

    <button onClick={handleNearbyPlacesB} disabled={!analyzedCoordsB?.lat || nearbyLoadingB} className="btn-analyze">
      {nearbyLoadingB ? "Loading..." : "🏘️ Nearby"}
    </button>
  </div>
</section>

{/* 🔄 TOGGLE BUTTON FOR LOCATION B */}
<button
  onClick={() => setShowLocationB(!showLocationB)}
  className="compare-toggle-btn"
  style={{
    width: "calc(100% - 20px)",
    margin: "8px 10px",
    padding: "10px",
    background: showLocationB
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #ec4899, #f43f5e)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  {showLocationB ? "✕ Close Compare" : "🔄 Compare with B"}
</button>

        

        {/* 📄 REPORT ACTIONS */}
        <section className="control-group compact-group" style={{ marginTop: "10px" }}>
          <h3>📄 Report Actions</h3>

          <button type="button" className="btn-save" onClick={downloadPDF} disabled={!result}>
            ⬇️ Download Report
          </button>

          <button type="button" className="btn-save" onClick={generateShareLink}>
            🔗 Share Analysis
          </button>
        </section>

        {/* SAVED PLACES */}
        <section className="saved-places-section">
          <h3>Saved Places</h3>
          {savedPlaces.map((p, i) => (
            <div key={i} className="place-card-compact" onClick={() => { setLat(p.lat.toString()); setLng(p.lng.toString()); }}>
              {editingIndex === i ? (
                <input
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
                  autoFocus
                />
              ) : (
                <>
                  <strong>{p.name}</strong>
                  <span>{p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span>
                </>
              )}
              <button onClick={(e) => { e.stopPropagation(); setEditingIndex(i); setEditingName(p.name); }}>✎</button>
              <button onClick={(e) => { e.stopPropagation(); setSavedPlaces(savedPlaces.filter((_, idx) => idx !== i)); }}>✕</button>
            </div>
          ))}
        </section>

      </div>

      <div className="sidebar-resizer" onMouseDown={startResizingSide} />
    </aside>
  );
}
