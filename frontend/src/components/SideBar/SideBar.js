import React from "react";

export default function SideBar({
  // Location A states and handlers
  lat,
  setLat,
  lng,
  setLng,
  locationAName,
  setLocationAName,
  loading,
  handleSubmit,
  handleMyLocation,
  handleSavePlace,
  handleNearbyPlaces,
  result,
  nearbyLoading,

  // Location B states and handlers
  showLocationB,
  setShowLocationB,
  locationBName,
  isSelectingB,
  setIsSelectingB,
  bLatInput,
  setBLatInput,
  bLngInput,
  setBLngInput,
  savedPlaces,
  handleCompareSelect,
  compareLoading,
  handleMyLocationB,
  isBFromSavedPlace,
  handleSavePlaceB,
  analyzedCoordsB,
  nearbyLoadingB,
  handleNearbyPlacesB,
  isCompareMode,
  setIsCompareMode,

  // Saved Places states and handlers
  editingIndex,
  setEditingIndex,
  editingName,
  setEditingName,
  setSavedPlaces,

  // Sidebar styling
  sidebarWidth,
  startResizingSide,
}) {
  return (
    <aside
      className="sidebar"
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

        {/* Location B Section */}
        <section
          className="control-group comparison-box compact"
          style={{ display: showLocationB ? "block" : "none" }}
        >
          <h3>📍 Location B: {locationBName} (Optional)</h3>
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
                handleCompareSelect(p.lat, p.lng, p.name);
              }}
              value=""
            >
              <option value="" disabled>
                Saved Places...
              </option>
              {savedPlaces.map((p, i) => (
                <option key={i} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="compact-row" style={{ marginTop: "6px" }}>
            <div className="field" style={{ marginBottom: "6px", flex: 1 }}>
              <label className="input-label" style={{ fontSize: "10px" }}>
                Lat B
              </label>
              <input
                type="text"
                value={bLatInput}
                onChange={(e) => setBLatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  bLatInput &&
                  bLngInput &&
                  handleCompareSelect(bLatInput, bLngInput)
                }
                className="highlighted-box"
                style={{ padding: "6px" }}
              />
            </div>
            <div className="field" style={{ marginBottom: "6px", flex: 1 }}>
              <label className="input-label" style={{ fontSize: "10px" }}>
                Lng B
              </label>
              <input
                type="text"
                value={bLngInput}
                onChange={(e) => setBLngInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  bLatInput &&
                  bLngInput &&
                  handleCompareSelect(bLatInput, bLngInput)
                }
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
            <button
              type="button"
              onClick={handleMyLocationB}
              className="btn-save"
              style={{ flex: 0.7, padding: "8px", fontSize: "12px" }}
            >
              📍
            </button>
            <button
              type="button"
              onClick={handleSavePlaceB}
              disabled={isBFromSavedPlace}
              className="btn-save"
              style={{
                flex: 0.7,
                padding: "8px",
                fontSize: "12px",
                opacity: isBFromSavedPlace ? 0.5 : 1,
              }}
            >
              ⭐
            </button>
            <button
              type="button"
              onClick={handleNearbyPlacesB}
              disabled={!analyzedCoordsB.lat || !analyzedCoordsB.lng || nearbyLoadingB}
              className="btn-analyze"
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "12px",
                background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              }}
            >
              {nearbyLoadingB ? "..." : "🏘️ Nearby"}
            </button>
          </div>
          {isCompareMode && (
            <button
              onClick={() => setIsCompareMode(false)}
              className="btn-delete-wide"
              style={{ marginTop: "6px", padding: "8px" }}
            >
              Exit Compare
            </button>
          )}
          
        </section>
        <button
              type="button"
              onClick={() => {
                if (showLocationB) {
                  setShowLocationB(false);
                } else {
                  setShowLocationB(true);
                }
              }}
              style={{
                width: "100%",
                marginTop: "6px",
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
                transition: "all 0.3s ease",
              }}
            >
              {showLocationB ? "✕ Close Comparing with B" : "🔄 Compare with B"}
            </button>


        {/* Saved Places Section */}
        <section
          className="saved-places-section"
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
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
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const updated = [...savedPlaces];
                          updated[i].name = editingName || p.name;
                          setSavedPlaces(updated);
                          setEditingIndex(null);
                        } else if (e.key === "Escape") {
                          setEditingIndex(null);
                        }
                      }}
                      className="highlighted-box"
                      style={{ padding: "4px", fontSize: "12px" }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <strong>{p.name}</strong>
                      <span>
                        {p.lat.toFixed(2)}, {p.lng.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {editingIndex !== i && (
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIndex(i);
                        setEditingName(p.name);
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "10px",
                        background: "#3b82f6",
                        border: "none",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✎
                    </button>
                  )}
                  <button
                    className="btn-cross"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = savedPlaces.filter((_, idx) => idx !== i);
                      setSavedPlaces(updated);
                      if (editingIndex === i) setEditingIndex(null);
                    }}
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
  );
}
