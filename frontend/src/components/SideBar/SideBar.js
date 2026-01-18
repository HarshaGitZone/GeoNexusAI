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
  // --- Internal State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  
  // Ref for click-outside detection
  const searchContainerRef = useRef(null);

  // Close suggestions when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Smart Search Logic ---
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
    // Restore description visibility
    setSelectedDescription(item.display_name);
    setSuggestions([]);
    setSearchQuery("");
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
      <div style={{ height: "50px", width: "100%" }}></div>

      <div
        className="sidebar-scrollable"
        style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* PROFESSIONAL SEARCH SECTION */}
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
                    <div className="suggestion-main">{item.display_name.split(',')[0]}</div>
                    <div className="suggestion-sub">{item.display_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RESTORED LOCATION DESCRIPTION */}
          {/* {selectedDescription && (
            <div className="search-result-description">
              <span className="desc-label">Selected:</span> {selectedDescription}
              <button className="clear-desc" onClick={() => setSelectedDescription("")}>✕</button>
            </div>
          )} */}
          {/* In SideBar.js inside the sidebar-search-section */}
          {selectedDescription && (
            <div className="search-result-description">
              <span className="desc-label">Selected Location</span>
              {selectedDescription}
              <button className="clear-desc" onClick={() => setSelectedDescription("")} title="Clear">
                ✕
              </button>
            </div>
          )}
        </section>

        {/* Location A Section */}
        <section className="control-group compact-group">
          <h3>📍 Location A: {locationAName}</h3>
          <form onSubmit={handleSubmit}>
            <div className="compact-row">
              <div className="field">
                <label className="input-label">Lat</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="highlighted-box"
                />
              </div>
              <div className="field">
                <label className="input-label">Lng</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="highlighted-box"
                />
              </div>
            </div>
            <div className="compact-row" style={{ marginTop: "8px" }}>
              <button type="button" onClick={handleMyLocation} className="btn-save same-size">
                📍 My Location
              </button>
              <button type="button" onClick={handleSavePlace} className="btn-save same-size">
                ⭐ Save Place
              </button>
            </div>
            <div className="compact-row" style={{ marginTop: "8px", gap: "6px" }}>
              <button
                type="submit"
                className="btn-analyze"
                disabled={loading}
                style={{ flex: 1, padding: "10px" }}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
              <button
                type="button"
                onClick={handleNearbyPlaces}
                disabled={!result || nearbyLoading}
                className="btn-analyze"
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
                }}
              >
                {nearbyLoading ? "Loading..." : "🏘️ Nearby"}
              </button>
            </div>
          </form>
        </section>

        {/* Comparison Section B */}
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
                padding: "8px",
              }}
            >
              {isSelectingB ? "Cancel" : "🗺️ Map"}
            </button>
            <select
              className="btn-save mini"
              style={{ flex: 1.5, padding: "8px" }}
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
          <div className="compact-row" style={{ marginTop: "6px" }}>
            <div className="field" style={{ marginBottom: "6px", flex: 1 }}>
              <label className="input-label" style={{ fontSize: "10px" }}>Lat B</label>
              <input
                type="text"
                value={bLatInput}
                onChange={(e) => setBLatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
                className="highlighted-box"
                style={{ padding: "6px" }}
              />
            </div>
            <div className="field" style={{ marginBottom: "6px", flex: 1 }}>
              <label className="input-label" style={{ fontSize: "10px" }}>Lng B</label>
              <input
                type="text"
                value={bLngInput}
                onChange={(e) => setBLngInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
                className="highlighted-box"
                style={{ padding: "6px" }}
              />
            </div>
            <button
              type="button"
              onClick={() => bLatInput && bLngInput && handleCompareSelect(bLatInput, bLngInput)}
              disabled={!bLatInput || !bLngInput || compareLoading}
              className="btn-analyze"
              style={{
                alignSelf: "flex-end",
                marginBottom: "6px",
                padding: "6px 10px",
                fontSize: "12px",
                flex: 0.4,
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              }}
            >
              {compareLoading ? "..." : "Go"}
            </button>
          </div>

          <div className="compact-row" style={{ marginTop: "6px", gap: "4px" }}>
            <button type="button" onClick={handleMyLocationB} className="btn-save" style={{flex: 0.7, padding: '8px', fontSize: '12px'}}>📍</button>
            <button type="button" onClick={handleSavePlaceB} disabled={isBFromSavedPlace} className="btn-save" style={{flex: 0.7, padding: '8px', fontSize: '12px', opacity: isBFromSavedPlace ? 0.5 : 1}}>⭐</button>
            <button 
              type="button" 
              onClick={handleNearbyPlacesB} 
              disabled={!analyzedCoordsB?.lat || nearbyLoadingB}
              className="btn-analyze"
              style={{flex: 1, padding: '8px', fontSize: '12px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)'}}
            >
              {nearbyLoadingB ? "..." : "🏘️ Nearby"}
            </button>
          </div>
          {isCompareMode && <button onClick={() => setIsCompareMode(false)} className="btn-delete-wide" style={{marginTop: '6px', padding: '8px'}}>Exit Compare</button>}
        </section>

        <button
          type="button"
          onClick={() => setShowLocationB(!showLocationB)}
          className="compare-toggle-btn"
          style={{
            width: "calc(100% - 20px)",
            margin: "6px 10px",
            padding: "8px",
            background: showLocationB
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #ec4899, #f43f5e)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {showLocationB ? "✕ Close Comparing with B" : "🔄 Compare with B"}
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