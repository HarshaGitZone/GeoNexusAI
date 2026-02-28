import React from 'react';
import './HazardsCard.css';

const HazardsCard = ({ data, loading }) => {
  if (loading) return (
    <div className="card hazards-loading glass-morphic">
      <div className="shimmer-line"></div>
      <p>Analyzing Hazards & Risks...</p>
    </div>
  );

  if (!data) return null;

  const { 
    seismic_risk, 
    weather_hazards, 
    geological_hazards, 
    climate_hazards, 
    hydrological_hazards,
    overall_risk_level 
  } = data;

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'very high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '✅';
      case 'medium': return '⚠️';
      case 'high': return '🔴';
      case 'very high': return '🚨';
      default: return '❓';
    }
  };

  return (
    <div className="card hazards-card glass-morphic">
      <div className="hazards-inner">
        <div className="hazards-side-strip">
          <span>⚡ RISKS & HAZARDS</span>
        </div>
        
        <div className="hazards-content">
          {/* Overall Risk Level */}
          <div className="hazards-header">
            <h3>Overall Risk Assessment</h3>
            <div className="overall-risk" style={{ color: getRiskColor(overall_risk_level) }}>
              <span className="risk-icon">{getRiskIcon(overall_risk_level)}</span>
              <span className="risk-level">{overall_risk_level || "Unknown"}</span>
            </div>
          </div>

          {/* Seismic Risk */}
          {seismic_risk && !seismic_risk.error && (
            <div className="hazard-section seismic-section">
              <h4>🌋 Tectonic & Seismic Risk</h4>
              <div className="hazard-grid">
                <div className="hazard-item">
                  <label>Risk Level</label>
                  <span className="risk-value" style={{ color: getRiskColor(seismic_risk.risk_level) }}>
                    {seismic_risk.risk_level || "N/A"}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Tectonic Plate</label>
                  <span className="plate-info">
                    {seismic_risk.tectonic_plates?.[0] || "Unknown"}
                    {seismic_risk.plate_description && (
                      <span className="plate-desc">{seismic_risk.plate_description}</span>
                    )}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Nearest Plate Boundary</label>
                  <span className="distance-info">
                    {seismic_risk.nearest_plate_distance_km ? `${seismic_risk.nearest_plate_distance_km} km` : "N/A"}
                    {seismic_risk.nearest_plate_distance_km < 200 && (
                      <span className="distance-warning">⚠️ Close to boundary</span>
                    )}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Nearest Fault Line</label>
                  <span className={`fault-info ${seismic_risk.near_fault_line ? "fault-yes" : "fault-no"}`}>
                    {seismic_risk.nearest_fault?.name || "None identified"}
                    {seismic_risk.distance_to_fault_km && (
                      <span className="fault-distance">
                        {seismic_risk.distance_to_fault_km} km away
                        {seismic_risk.fault_type && ` (${seismic_risk.fault_type})`}
                      </span>
                    )}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Expected Magnitude</label>
                  <span className="magnitude-info">
                    {seismic_risk.expected_magnitude_range || "N/A"}
                    {seismic_risk.risk_level === "Very High" && (
                      <span className="magnitude-warning">🔴 High magnitude possible</span>
                    )}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Building Standards</label>
                  <span className="building-info">
                    {seismic_risk.building_code_standards || "Local codes"}
                  </span>
                </div>
                <div className="hazard-item full-width">
                  <label>Seismic Assessment</label>
                  <div className="seismic-summary">
                    {seismic_risk.nearest_plate_distance_km > 500 ? (
                      <span className="seismic-safe">
                        ✅ Located far from major tectonic plate boundaries ({seismic_risk.nearest_plate_distance_km} km)
                        <br />
                        <span className="safe-desc">Low earthquake risk due to stable continental position</span>
                      </span>
                    ) : seismic_risk.nearest_plate_distance_km > 200 ? (
                      <span className="seismic-moderate">
                        ⚠️ Moderate distance from tectonic activity ({seismic_risk.nearest_plate_distance_km} km)
                        <br />
                        <span className="moderate-desc">Some seismic risk, monitor regional activity</span>
                      </span>
                    ) : (
                      <span className="seismic-high">
                        🚨 Close to tectonic plate boundary ({seismic_risk.nearest_plate_distance_km} km)
                        <br />
                        <span className="high-desc">High seismic risk, requires strict building codes</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weather Hazards */}
          {weather_hazards && !weather_hazards.error && (
            <div className="hazard-section weather-section">
              <h4>🌦️ Weather Hazards</h4>
              <div className="hazard-grid">
                <div className="hazard-item">
                  <label>Primary Hazards</label>
                  <span>{weather_hazards.primary_hazards?.join(", ") || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Seasonal Risks</label>
                  <span className="seasonal-text">{weather_hazards.seasonal_risks || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Extreme Temperature</label>
                  <span>{weather_hazards.extreme_temperature_risk || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Precipitation Extremes</label>
                  <span>{weather_hazards.precipitation_extremes || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Wind Hazards</label>
                  <span>{weather_hazards.wind_hazards?.join(", ") || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Warning Systems</label>
                  <span>{weather_hazards.warning_systems || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Geological Hazards */}
          {geological_hazards && !geological_hazards.error && (
            <div className="hazard-section geological-section">
              <h4>⛰️ Geological Hazards</h4>
              <div className="hazard-grid">
                <div className="hazard-item">
                  <label>Primary Risks</label>
                  <span>{geological_hazards.primary_geological_risks?.join(", ") || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Volcanic Activity</label>
                  <span className={geological_hazards.volcanic_activity?.near_volcanic_region ? "volcano-yes" : "volcano-no"}>
                    {geological_hazards.volcanic_activity?.risk_level || "N/A"}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Landslide Risk</label>
                  <span>{geological_hazards.landslide_risk?.risk_level || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Soil Stability</label>
                  <span>{geological_hazards.soil_stability || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Groundwater Risk</label>
                  <span>{geological_hazards.groundwater_risk || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Mining Activity</label>
                  <span>{geological_hazards.mining_activity || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Climate Hazards */}
          {climate_hazards && !climate_hazards.error && (
            <div className="hazard-section climate-section">
              <h4>🌍 Climate Hazards</h4>
              <div className="hazard-grid">
                <div className="hazard-item">
                  <label>Climate Change Risks</label>
                  <span>{climate_hazards.climate_change_risks?.join(", ") || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Sea Level Rise</label>
                  <span>{climate_hazards.sea_level_rise_vulnerability?.vulnerability || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Temperature Trends</label>
                  <span>{climate_hazards.temperature_trends || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Precipitation Changes</label>
                  <span>{climate_hazards.precipitation_changes || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Adaptation Measures</label>
                  <span>{climate_hazards.adaptation_measures || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hydrological Hazards */}
          {hydrological_hazards && !hydrological_hazards.error && (
            <div className="hazard-section hydrological-section">
              <h4>💧 Hydrological Hazards</h4>
              <div className="hazard-grid">
                <div className="hazard-item">
                  <label>Flood Risk</label>
                  <span className={`flood-${hydrological_hazards.flood_risk?.risk_level?.toLowerCase()}`}>
                    {hydrological_hazards.flood_risk?.risk_level || "N/A"}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Flood Causes</label>
                  <span>{hydrological_hazards.flood_risk?.causes?.join(", ") || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Drought Risk</label>
                  <span className={`drought-${hydrological_hazards.drought_risk?.risk_level?.toLowerCase()}`}>
                    {hydrological_hazards.drought_risk?.risk_level || "N/A"}
                  </span>
                </div>
                <div className="hazard-item">
                  <label>Drought Factors</label>
                  <span>{hydrological_hazards.drought_risk?.factors?.join(", ") || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Water Scarcity</label>
                  <span>{hydrological_hazards.water_scarcity || "N/A"}</span>
                </div>
                <div className="hazard-item">
                  <label>Groundwater Depletion</label>
                  <span>{hydrological_hazards.groundwater_depletion || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="hazards-footer">
            <div className="recommendations">
              <h5>🛡️ Safety Recommendations</h5>
              <ul>
                {seismic_risk?.recommendations && <li>{seismic_risk.recommendations}</li>}
                {overall_risk_level === 'High' && <li>Comprehensive insurance coverage recommended</li>}
                {overall_risk_level === 'High' && <li>Emergency preparedness plan essential</li>}
                {weather_hazards?.monitoring_systems && <li>Monitor {weather_hazards.monitoring_systems} alerts</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardsCard;
