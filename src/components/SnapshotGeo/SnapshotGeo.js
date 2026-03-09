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

  const { 
    identity, 
    coordinates, 
    global_position, 
    political_identity, 
    administrative_nesting, 
    border_analysis, 
    nearby_features, 
    urban_characteristics, 
    environmental_context, 
    infrastructure_context, 
    population_analysis,
    air_quality_analysis,
    terrain_context 
  } = data;

  return (
    <div className="card snapshot-geo-card glass-morphic enhanced-geospatial">
      <div className="snapshot-inner">
        <div className="snapshot-side-strip">
          <span>🌍 GEOSPATIAL PASSPORT</span>
        </div>
        
        <div className="snapshot-content enhanced">
          {/* Header Section */}
          <div className="snap-header">
            <div className="main-identity">
              <h3>{identity?.name || "Unknown Territory"}</h3>
              <div className="identity-meta">
                <span className="iso-code">{political_identity?.iso_code}</span>
                {political_identity?.is_capital && <span className="capital-badge">🏛️ CAPITAL</span>}
              </div>
            </div>
            <div className="coordinates-display">
              <div className="coord-item">
                <span className="coord-label">Lat:</span>
                <span className="coord-value">{coordinates?.lat}</span>
              </div>
              <div className="coord-item">
                <span className="coord-label">Lng:</span>
                <span className="coord-value">{coordinates?.lng}</span>
              </div>
              <div className="coord-item">
                <span className="coord-label">UTM:</span>
                <span className="coord-value">{coordinates?.zone}</span>
              </div>
            </div>
          </div>

          {/* Administrative Hierarchy */}
          <div className="section administrative-section">
            <h4>📍 Administrative Hierarchy</h4>
            <div className="admin-grid">
              <div className="admin-item">
                <label>Continent</label>
                <span>{global_position?.continent || "Global"}</span>
              </div>
              <div className="admin-item">
                <label>Country</label>
                <span>{political_identity?.country}</span>
              </div>
              <div className="admin-item">
                <label>State/Province</label>
                <span>{administrative_nesting?.state || "N/A"}</span>
              </div>
              <div className="admin-item">
                <label>District/County</label>
                <span>{administrative_nesting?.district || "N/A"}</span>
              </div>
              <div className="admin-item">
                <label>City/Town</label>
                <span>{identity?.name}</span>
              </div>
              <div className="admin-item">
                <label>Postal Code</label>
                <span>{identity?.postal_code || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Global Position */}
          <div className="section global-section">
            <h4>🌐 Global Position</h4>
            <div className="global-grid">
              <div className="global-item">
                <label>Hemisphere</label>
                <span>{global_position?.hemisphere || "N/A"}</span>
              </div>
              <div className="global-item">
                <label>Distance to Equator</label>
                <span>{global_position?.distance_to_equator_km || "N/A"} km</span>
              </div>
              <div className="global-item">
                <label>Distance to Pole</label>
                <span>{global_position?.distance_to_pole_km || "N/A"} km</span>
              </div>
              <div className="global-item">
                <label>Distance to Greenwich</label>
                <span>{global_position?.distance_to_greenwich_km || "N/A"} km</span>
              </div>
              <div className="global-item">
                <label>Timezone</label>
                <span>{coordinates?.timezone || "N/A"}</span>
              </div>
              <div className="global-item">
                <label>UTC Offset</label>
                <span>{coordinates?.utc_offset || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Border Analysis */}
          {border_analysis && !border_analysis.error && (
            <div className="section border-section">
              <h4>🗺️ Border Analysis</h4>
              <div className="border-grid">
                <div className="border-item">
                  <label>Border Region</label>
                  <span className={border_analysis?.is_border_region ? "border-yes" : "border-no"}>
                    {border_analysis?.is_border_region ? "Yes" : "No"}
                  </span>
                </div>
                <div className="border-item">
                  <label>Nearest Border</label>
                  <span>{border_analysis?.distance_to_nearest_border_km || "N/A"} km {border_analysis?.border_direction || ""}</span>
                </div>
                <div className="border-item">
                  <label>Neighboring Countries</label>
                  <span>{border_analysis?.estimated_neighbors?.join(", ") || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Nearby Features */}
          {nearby_features && !nearby_features.error && (
            <div className="section nearby-section enhanced-nearby">
              <div className="section-header">
                <h4 className="section-title">🏙️ Nearby Features</h4>
                <div className="section-indicator"></div>
              </div>
              
              {nearby_features?.nearby_cities && nearby_features.nearby_cities.length > 0 && (
                <div className="nearby-subsection enhanced-subsection">
                  <div className="subsection-header">
                    <label className="subsection-title">🏙️ Nearby Cities</label>
                    <span className="count-badge">{nearby_features.nearby_cities.length}</span>
                  </div>
                  <div className="nearby-list enhanced-list">
                    {nearby_features.nearby_cities.slice(0, 3).map((city, index) => (
                      <div key={index} className="nearby-item enhanced-item">
                        <div className="place-info">
                          <span className="place-name">{city.name}</span>
                          <span className="place-detail">{city.distance_km} km {city.direction}</span>
                        </div>
                        <div className="place-icon">🏙️</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {nearby_features?.nearby_landmarks && nearby_features.nearby_landmarks.length > 0 && (
                <div className="nearby-subsection enhanced-subsection">
                  <div className="subsection-header">
                    <label className="subsection-title">🏛️ Nearby Landmarks</label>
                    <span className="count-badge">{nearby_features.nearby_landmarks.length}</span>
                  </div>
                  <div className="nearby-list enhanced-list">
                    {nearby_features.nearby_landmarks.slice(0, 2).map((landmark, index) => (
                      <div key={index} className="nearby-item enhanced-item">
                        <div className="place-info">
                          <span className="place-name">{landmark.name}</span>
                          <span className="place-detail">{landmark.distance_km} km {landmark.direction}</span>
                        </div>
                        <div className="place-icon">🏛️</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Urban Characteristics */}
          {urban_characteristics && !urban_characteristics.error && (
            <div className="section urban-section">
              <h4>🏘️ Urban Characteristics</h4>
              <div className="urban-grid">
                <div className="urban-item">
                  <label>Urban Type</label>
                  <span>{urban_characteristics?.urban_type || "N/A"}</span>
                </div>
                <div className="urban-item">
                  <label>Population Density</label>
                  <span>{urban_characteristics?.population_density || "N/A"}</span>
                </div>
                <div className="urban-item">
                  <label>Development Level</label>
                  <span>{urban_characteristics?.development_level || "N/A"}</span>
                </div>
                <div className="urban-item">
                  <label>Land Use Type</label>
                  <span>{urban_characteristics?.land_use_type || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Context */}
          {environmental_context && !environmental_context.error && (
            <div className="section environmental-section">
              <h4>🌿 Environmental Context</h4>
              <div className="env-grid">
                <div className="env-item">
                  <label>Climate Zone</label>
                  <span>{environmental_context?.climate_zone || "N/A"}</span>
                </div>
                <div className="env-item">
                  <label>Elevation Context</label>
                  <span>{environmental_context?.elevation_context || "N/A"}</span>
                </div>
                <div className="env-item">
                  <label>Environmental Challenges</label>
                  <span>{environmental_context?.environmental_challenges?.join(", ") || "N/A"}</span>
                </div>
                <div className="env-item">
                  <label>Natural Hazards</label>
                  <span>{environmental_context?.natural_hazards?.join(", ") || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Population Analysis */}
          {population_analysis && !population_analysis.error && (
            <div className="section population-section">
              <h4>👥 Population Analysis</h4>
              <div className="population-grid">
                <div className="population-item">
                  <label>Population Density</label>
                  <span>{population_analysis?.population_density_per_km2?.toLocaleString() || "N/A"} people/km²</span>
                </div>
                <div className="population-item">
                  <label>Density Category</label>
                  <span className={`density-${population_analysis?.density_category?.toLowerCase()}`}>
                    {population_analysis?.density_category || "N/A"}
                  </span>
                </div>
                <div className="population-item">
                  <label>Data Source</label>
                  <span>{population_analysis?.source || "N/A"}</span>
                </div>
                <div className="population-item">
                  <label>Confidence</label>
                  <span>{population_analysis?.confidence || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Air Quality Analysis */}
          {air_quality_analysis && !air_quality_analysis.error && (
            <div className="section air-quality-section">
              <h4>🌬️ Air Quality Analysis</h4>
              <div className="air-quality-grid">
                <div className="air-quality-item">
                  <label>AQI Value</label>
                  <span className={`aqi-${air_quality_analysis?.aqi_category?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {air_quality_analysis?.aqi_value || "N/A"}
                  </span>
                </div>
                <div className="air-quality-item">
                  <label>AQI Category</label>
                  <span className={`aqi-${air_quality_analysis?.aqi_category?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {air_quality_analysis?.aqi_category || "N/A"}
                  </span>
                </div>
                <div className="air-quality-item">
                  <label>Primary Pollutants</label>
                  <span>{air_quality_analysis?.primary_pollutants?.join(", ") || "N/A"}</span>
                </div>
                <div className="air-quality-item">
                  <label>Health Implications</label>
                  <span className="health-text">{air_quality_analysis?.health_implications || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Infrastructure Context */}
          {infrastructure_context && !infrastructure_context.error && (
            <div className="section infrastructure-section">
              <h4>🛣️ Infrastructure</h4>
              <div className="infra-grid">
                <div className="infra-item">
                  <label>Connectivity Level</label>
                  <span>{infrastructure_context?.connectivity_level || "N/A"}</span>
                </div>
                <div className="infra-item">
                  <label>Accessibility</label>
                  <span>{infrastructure_context?.accessibility_rating || "N/A"}</span>
                </div>
                <div className="infra-item">
                  <label>Transportation Modes</label>
                  <span>{infrastructure_context?.transportation_modes?.join(", ") || "N/A"}</span>
                </div>
                <div className="infra-item">
                  <label>Available Infrastructure</label>
                  <span>{infrastructure_context?.available_infrastructure?.join(", ") || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="snap-footer">
            <div className="terrain-tag">
              <span className="dot"></span> {terrain_context}
            </div>
            <div className="political-info">
              <span className="admin-level">{political_identity?.administrative_level || "Local"}</span>
              <span className="sovereignty">{political_identity?.sovereignty_status || "Territory"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotGeo;