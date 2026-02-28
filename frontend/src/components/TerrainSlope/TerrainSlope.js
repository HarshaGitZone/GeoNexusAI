import React from "react";
import "./TerrainSlope.css";

const TerrainSlope = ({ terrain }) => {
  // Always display the terrain card, even if data is missing
  const slope = terrain?.slope_percent ?? 0;
  const angle = Math.min((slope / 30) * 180, 180); // map 0–30% → 0–180°

  let slopeClass = "safe";
  if (slope > 15) slopeClass = "danger";
  else if (slope > 5) slopeClass = "warning";

  // Fallback values when terrain data is missing
  const verdict = terrain?.verdict || "Terrain data not available";
  const confidence = terrain?.confidence || "N/A";
  const source = terrain?.source || "N/A";

  return (
    <div className="terrain-card">
      <h3>Terrain & Slope Analysis</h3>

      {/* Gauge */}
      <div className="slope-gauge">
        <div className="gauge-bg" />
        <div
          className={`gauge-needle ${slopeClass}`}
          style={{ transform: `rotate(${angle - 90}deg)` }}
        />
        <div className="gauge-center" />
      </div>

      <div className="slope-label">
        <span className={`slope-percent ${slopeClass}`}>
          {slope.toFixed(1)}%
        </span>
        <span className="slope-text">Terrain Gradient</span>
      </div>

      <p className={`terrain-verdict ${slopeClass}`}>
        {verdict}
      </p>

      <div className="terrain-meta">
        <span><b>Confidence:</b> {confidence}</span>
        <span><b>Source:</b> {source}</span>
      </div>
    </div>
  );
};

export default TerrainSlope;