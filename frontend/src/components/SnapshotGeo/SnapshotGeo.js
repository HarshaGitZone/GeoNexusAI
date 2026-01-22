import React from 'react';
import './SnapshotGeo.css';

const SnapshotGeo = ({ data, loading }) => {
  if (loading) return (
    <div className="card snapshot-loading glass-morphic">
      <div className="shimmer-line"></div>
      <p>Resolving Geospatial Identity...</p>
    </div>
  );

  if (!data) return null;

  const { political_identity, administrative_nesting, global_position, terrain_context } = data;

  return (
    <div className="card snapshot-geo-card glass-morphic">
      <div className="snapshot-inner">
        <div className="snapshot-side-strip">
          <span>GEOSPATIAL PASSPORT</span>
        </div>
        
        <div className="snapshot-content">
          <div className="snap-header">
            <h3>{political_identity?.country || "Unknown Territory"}</h3>
            <span className="iso-code">{political_identity?.iso_code}</span>
          </div>

          <div className="snap-grid">
            <div className="snap-item">
              <label>State / Province</label>
              <span>{administrative_nesting?.state || "N/A"}</span>
            </div>
            <div className="snap-item">
              <label>District / County</label>
              <span>{administrative_nesting?.district || "N/A"}</span>
            </div>
            <div className="snap-item">
              <label>Continent</label>
              <span>{global_position?.continent || "Global"}</span>
            </div>
            <div className="snap-item">
              <label>Hemisphere</label>
              <span>{global_position?.hemisphere || "N/A"}</span>
            </div>
          </div>

          <div className="snap-footer">
            <div className="terrain-tag">
              <span className="dot"></span> {terrain_context}
            </div>
            <p className="pro-summary">{data.professional_summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotGeo;