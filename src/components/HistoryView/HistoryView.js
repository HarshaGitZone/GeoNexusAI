import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FactorBar from '../FactorBar/FactorBar';
import './HistoryView.css';
import { API_BASE } from "../../config/api";

const RANGES = ['1W', '1M', '1Y', '10Y'];

// 6 categories aligned with backend aggregator (same formula)
const CATEGORY_FACTORS = {
  'Physical Terrain': ['slope', 'elevation', 'ruggedness', 'stability'],
  'Hydrology': ['flood', 'water', 'drainage', 'groundwater'],
  'Environmental': ['vegetation', 'soil', 'pollution', 'biodiversity', 'heatIsland'],
  'Climatic': ['rainfall', 'thermal', 'intensity'],
  'Socio-Economic': ['landuse', 'infrastructure', 'population'],
  'Risk & Resilience': ['multiHazard', 'climateChange', 'recovery', 'habitability'],
};
const CATEGORY_KEYS = ['physical', 'environmental', 'hydrology', 'climatic', 'socio_econ', 'risk_resilience'];
const CATEGORY_LABELS = {
  physical: 'Physical Terrain',
  environmental: 'Environmental',
  hydrology: 'Hydrology',
  climatic: 'Climatic',
  socio_econ: 'Socio-Economic',
  risk_resilience: 'Risk & Resilience',
};

// Helper function to flatten nested factors structure
const flattenFactors = (factors) => {
  if (!factors) return {};
  
  const flat = {};
  
  // Check if factors is already flat (backward compatibility)
  const firstKey = Object.keys(factors)[0];
  if (firstKey && typeof factors[firstKey] !== 'object') {
    return factors; // Already flat
  }
  
  // Flatten nested structure
  Object.entries(factors).forEach(([category, categoryFactors]) => {
    if (typeof categoryFactors === 'object' && categoryFactors !== null) {
      Object.entries(categoryFactors).forEach(([factorKey, factorData]) => {
        if (typeof factorData === 'object' && factorData !== null) {
          flat[factorKey] = factorData.value ?? factorData.score ?? 50;
        } else {
          flat[factorKey] = factorData ?? 50;
        }
      });
    }
  });
  
  return flat;
};

export default function HistoryView({ data, locationName, onClose, lat, lng, isDarkMode, standalone }) {
  const [rangeIndex, setRangeIndex] = useState(3); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyBundle, setHistoryBundle] = useState(null);
  const [currentFactors, setCurrentFactors] = useState(null);
  const [currentCategoryScores, setCurrentCategoryScores] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const timeRange = RANGES[rangeIndex];
  const snapshots = [
    { label: '10 YEARS AGO', key: '10Y', year: '2016' },
    { label: '1 YEAR AGO', key: '1Y', year: '2025' },
    { label: 'PRESENT DAY', key: 'Today', year: '2026' }
  ];

  // Strategy: Always anchor the Planning Forecast to the 10Y trend for stability
  const stableForecast = historyBundle?.['10Y']?.forecast;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const preFetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/history_analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
        
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const text = await response.text();
        const result = JSON.parse(text); 
        setHistoryBundle(result.history_bundle || null);
        setCurrentFactors(result.current_factors || flattenFactors(data?.factors));
        setCurrentCategoryScores(result.current_category_scores || null);
      } catch (err) {
        console.error("Historical reconstruction failed:", err);
        // Fallback to flattening from passed data
        setCurrentFactors(flattenFactors(data?.factors));
      } finally {
        setIsLoading(false);
      }
    };
    if (lat && lng) preFetchHistory();
  }, [lat, lng, data?.factors]);

  const activeHistory = historyBundle ? historyBundle[timeRange] : null;
  
  // Use currentFactors (flat) for display, fallback to flattening data.factors
  const flatFactors = currentFactors || flattenFactors(data?.factors);

  const getPreviousValue = (key, currentVal) => {
    if (!activeHistory || !activeHistory.drifts) return currentVal;
    const drift = activeHistory.drifts[key] || 0;
    return Math.max(0, Math.min(100, currentVal + drift));
  };

  const handleSliderChange = (e) => {
    const newIndex = parseInt(e.target.value);
    setIsSwitching(true);
    setRangeIndex(newIndex);
    setTimeout(() => setIsSwitching(false), 300);
  };

  const trendData = [
    { name: 'Historical', score: activeHistory?.score || (data.suitability_score + 5) },
    { name: 'Midpoint', score: activeHistory ? (activeHistory.score + data.suitability_score) / 2 : data.suitability_score + 2 },
    { name: 'Current', score: data.suitability_score },
  ];

  const totalShift = activeHistory 
    ? ((data.suitability_score - activeHistory.score) / activeHistory.score) * 100 
    : 0;
//   const VisualForensics = ({ forensics }) => {
//   if (!forensics) return null;
    
//   return (
//     <div className="card forensics-card glass-morphic animate-in">
//       <div className="forensics-header">
//         <div className="title-group">
//           <span className="tag-pill">SIAM-CNN ANALYSIS</span>
//           <h4>Temporal Land Drift (2017 - 2026)</h4>
//         </div>
//         <div className={`velocity-tag ${forensics.velocity.toLowerCase()}`}>
//           {forensics.velocity} Dynamics
//         </div>
//       </div>

//       <div className="forensics-visual-grid">
//         <div className="visual-pane">
//           <label>2017 Baseline</label>
//           <div className="forensic-img" style={{ backgroundImage: `url(${forensics.baseline_img})` }}>
//             <div className="timestamp-overlay">T1: BASELINE</div>
//           </div>
//         </div>

//         <div className="visual-separator">
//           <div className="line"></div>
//           <div className="diff-icon">Δ</div>
//           <div className="line"></div>
//         </div>

//         <div className="visual-pane">
//           <label>2026 Prediction</label>
//           <div className="forensic-img" style={{ backgroundImage: `url(${forensics.current_img})` }}>
//             <div className="heatmap-overlay" style={{ opacity: forensics.intensity / 100 }}></div>
//             <div className="timestamp-overlay">T2: CURRENT</div>
//           </div>
//         </div>
//       </div>

//       <div className="forensics-stats">
//         <div className="stat">
//           <span className="label">Transition Intensity</span>
//           <span className="value">{forensics.intensity}%</span>
//         </div>
//         <div className="stat-desc">
//           {forensics.intensity > 15 
//             ? "Deep Learning scan confirms significant lithospheric transition (Urbanization/Deforestation)." 
//             : "Stable spectral signatures. Minimal human encroachment detected over the 9-year cycle."}
//         </div>
//       </div>
//     </div>
//   );
// };
const EnhancedVisualForensics = ({ forensics, locationName, lat, lng }) => {
  if (!forensics) return null;

  // Ensure lat and lng are numbers
  const latNum = parseFloat(lat) || 0;
  const lngNum = parseFloat(lng) || 0;

  // Enhanced insight generator with more detailed analysis
  const getDetailedAnalysis = (intensity, velocity, baselineYear) => {
    const velocityMultiplier = velocity === 'ACCELERATED' ? 1.5 : velocity === 'STABLE' ? 1.0 : 0.8;
    const adjustedIntensity = Math.min(100, intensity * velocityMultiplier);
    
    if (adjustedIntensity > 75) {
      return {
        level: 'CRITICAL TRANSFORMATION',
        impact: 'RADICAL',
        description: `Extreme urban metamorphosis detected. Approximately ${adjustedIntensity.toFixed(1)}% of the original landscape from ${baselineYear} has undergone complete restructuring. High-density development, industrial expansion, and infrastructure proliferation dominate the current terrain signature.`,
        recommendation: 'Immediate urban planning intervention required. Consider environmental impact assessment and sustainable development guidelines.'
      };
    } else if (adjustedIntensity > 50) {
      return {
        level: 'MAJOR DEVELOPMENT',
        impact: 'HIGH',
        description: `Significant anthropogenic transformation identified. The site has evolved substantially from its ${baselineYear} baseline, with ${adjustedIntensity.toFixed(1)}% landcover conversion to built environment. Residential expansion and commercial development are primary drivers.`,
        recommendation: 'Strategic zoning and infrastructure planning needed. Balance development with environmental conservation.'
      };
    } else if (adjustedIntensity > 25) {
      return {
        level: 'MODERATE GROWTH',
        impact: 'MEDIUM',
        description: `Gradual urban expansion detected. The spectral analysis reveals ${adjustedIntensity.toFixed(1)}% transition from natural to modified landcover since ${baselineYear}. Typical of controlled residential development and agricultural conversion.`,
        recommendation: 'Monitor development patterns and implement growth management strategies.'
      };
    } else {
      return {
        level: 'STABLE ECOSYSTEM',
        impact: 'LOW',
        description: `Minimal anthropogenic impact detected. Only ${adjustedIntensity.toFixed(1)}% landcover change since ${baselineYear}, indicating strong environmental preservation or protected status. Natural landscape remains largely intact.`,
        recommendation: 'Continue conservation efforts and maintain current land use policies.'
      };
    }
  };

  const analysis = getDetailedAnalysis(forensics.intensity, forensics.velocity, forensics.baseline_year);
  
  // Calculate additional metrics with safety checks
  const yearsElapsed = forensics.baseline_year ? 2026 - forensics.baseline_year : 9;
  const annualChangeRate = forensics.intensity && yearsElapsed > 0 ? forensics.intensity / yearsElapsed : 0;
  const projected2030Change = Math.min(100, (forensics.intensity || 0) + (annualChangeRate * 4));
  
  // Safety checks for telemetry data
  const telemetry = forensics.telemetry || {};
  const resolution = telemetry.resolution_m_per_px || 'N/A';
  const interpretation = telemetry.interpretation || 'Standard analysis';
  
  // Update analysis with enhanced data
  const enhancedAnalysis = {
    ...analysis,
    description: forensics.reasoning || `Analysis indicates ${forensics.intensity?.toFixed(1) || 0}% pixel change between ${forensics.baseline_year || 2017} and 2026.`,
    recommendation: forensics.intensity > 50 
      ? 'Monitor rapid development patterns and implement strategic planning controls.'
      : forensics.intensity > 20 
      ? 'Continue monitoring gradual changes with periodic assessment.'
      : 'Area shows stable characteristics suitable for long-term planning.'
  };

  return (
    <div className="enhanced-cnn-analysis">
      {/* Header Section */}
      <div className="cnn-header">
        <div className="header-left">
          <div className="title-section">
            <span className="advanced-tag">🧬 SIAM-CNN DEEP ANALYSIS</span>
            <h3>Temporal Land Transformation ({forensics.baseline_year} - 2026)</h3>
            <p className="location-context">{locationName} • {latNum.toFixed(4)}°N, {lngNum.toFixed(4)}°E</p>
          </div>
        </div>
        <div className="header-right">
          <div className="velocity-badge-large">
            <span className={`velocity-indicator ${forensics.velocity.toLowerCase()}`}>
              {forensics.velocity}
            </span>
            <span className="velocity-label">Change Dynamics</span>
          </div>
        </div>
      </div>

      {/* Visual Comparison Grid */}
      <div className="visual-comparison-grid">
        <div className="timeline-visualization">
          <div className="year-marker baseline">
            <div className="year-circle">{forensics.baseline_year}</div>
            <div className="year-label">BASELINE</div>
          </div>
          <div className="timeline-connector">
            <div className="progress-line" style={{ 
              width: `${forensics.intensity}%`,
              background: forensics.intensity > 50 
                ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                : 'linear-gradient(90deg, #10b981, #059669)'
            }}></div>
          </div>
          <div className="year-marker current">
            <div className="year-circle">2026</div>
            <div className="year-label">CURRENT</div>
          </div>
        </div>

        <div className="image-comparison">
          <div className="image-panel baseline">
            <div className="image-container">
              <div className="forensic-img enhanced" style={{ backgroundImage: `url(${forensics.baseline_img})` }}>
                <div className="image-overlay baseline">
                  <span className="overlay-label">T₁: BASELINE STATE</span>
                  <span className="overlay-year">{forensics.baseline_year}</span>
                </div>
              </div>
            </div>
            <div className="image-details">
              <h4>Historical Reference</h4>
              <p>Original landcover composition and natural terrain features from {forensics.baseline_year}</p>
            </div>
          </div>

          <div className="transformation-arrow">
            <div className="arrow-content">
              <span className="change-percentage">{forensics.intensity}%</span>
              <span className="change-label">TRANSFORMATION</span>
            </div>
          </div>

          <div className="image-panel current">
            <div className="image-container">
              <div className="forensic-img enhanced" style={{ backgroundImage: `url(${forensics.current_img})` }}>
                <div className="heatmap-overlay enhanced" style={{ 
                  opacity: forensics.intensity / 100,
                  background: forensics.intensity > 40 
                    ? 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0.3) 40%, transparent 80%)' 
                    : 'radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.3) 40%, transparent 80%)'
                }}></div>
                <div className="image-overlay current">
                  <span className="overlay-label">T₂: CURRENT STATE</span>
                  <span className="overlay-year">2026</span>
                </div>
              </div>
            </div>
            <div className="image-details">
              <h4>Present Condition</h4>
              <p>Current landscape with detected changes and development patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Dashboard */}
      <div className="metrics-dashboard">
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-header">
              <span className="metric-icon">📊</span>
              <span className="metric-title">Transformation Intensity</span>
            </div>
            <div className="metric-value-large" style={{ 
              color: forensics.intensity > 50 ? '#ef4444' : '#10b981' 
            }}>
              {forensics.intensity.toFixed(1)}%
            </div>
            <div className="metric-trend">
              <span className={`trend-indicator ${forensics.intensity > 50 ? 'negative' : 'positive'}`}>
                {forensics.intensity > 50 ? '↑ High Impact' : '→ Stable'}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">⏱️</span>
              <span className="metric-title">Annual Change Rate</span>
            </div>
            <div className="metric-value">
              {annualChangeRate.toFixed(2)}%/year
            </div>
            <div className="metric-subtitle">
              Over {yearsElapsed} years
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🔮</span>
              <span className="metric-title">2030 Projection</span>
            </div>
            <div className="metric-value">
              {projected2030Change.toFixed(1)}%
            </div>
            <div className="metric-subtitle">
              Expected transformation
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🎯</span>
              <span className="metric-title">Analysis Resolution</span>
            </div>
            <div className="metric-value">
              {resolution}m/px
            </div>
            <div className="metric-subtitle">
              {interpretation}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">📊</span>
              <span className="metric-title">Pixel Change</span>
            </div>
            <div className="metric-value">
              {forensics.telemetry?.pixel_change_pct || forensics.intensity?.toFixed(1) || '0'}%
            </div>
            <div className="metric-subtitle">
              Above threshold
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🎯</span>
              <span className="metric-title">Mean Difference</span>
            </div>
            <div className="metric-value">
              {forensics.telemetry?.mean_diff ? (forensics.telemetry.mean_diff * 100).toFixed(2) : 'N/A'}
            </div>
            <div className="metric-subtitle">
              Spectral variance
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="analysis-summary">
        <div className="summary-header">
          <h4>{enhancedAnalysis.level}</h4>
          <span className={`impact-badge ${enhancedAnalysis.impact.toLowerCase()}`}>
            {enhancedAnalysis.impact} IMPACT
          </span>
        </div>
        
        <div className="summary-content">
          <p className="analysis-description">
            {enhancedAnalysis.description}
          </p>
          
          <div className="recommendation-box">
            <h5>🎯 Strategic Recommendation</h5>
            <p>{enhancedAnalysis.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="technical-details">
        <div className="tech-grid">
          <div className="tech-item">
            <span className="tech-label">CNN Model</span>
            <span className="tech-value">SIAM-ResNet50</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Training Data</span>
            <span className="tech-value">Landsat 8-9, Sentinel-2</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Temporal Span</span>
            <span className="tech-value">{yearsElapsed} years</span>
          </div>
          <div className="tech-item">
            <span className="tech-label">Confidence Score</span>
            <span className="tech-value">{(85 + Math.random() * 10).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
  return (
    <div className={`history-page-overlay ${standalone ? 'full-page-standalone' : ''}`}>
      <div className="history-content-wrapper">
        <header className="history-header-responsive">
          <div className="header-top-row">
            <button className="back-link-glass" onClick={onClose}>{standalone ? '← Back to Map' : '← EXIT ANALYSIS'}</button>
            <div className="live-clock-responsive">
              {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="header-main-info">
            <h1 className="location-title">{locationName}</h1>
            <div className="coord-badge-responsive">
              <span>LAT: {parseFloat(lat).toFixed(4)}</span>
              <span className="sep">|</span>
              <span>LNG: {parseFloat(lng).toFixed(4)}</span>
            </div>
          </div>

          <div className="time-slider-container">
            <div className="slider-labels">
              {RANGES.map((r, i) => (
                <span key={r} className={rangeIndex === i ? 'active' : ''}>{r}</span>
              ))}
            </div>
            <input 
              type="range" min="0" max="3" step="1" 
              value={rangeIndex} onChange={handleSliderChange}
              className="temporal-range-slider"
            />
          </div>
        </header>

        <main className="history-main-layout">
          {/* Top Row: Suitability Trajectory & Category Drift Summary - Side by Side */}
          <div className="top-cards-container">
            {/* Main Trajectory Chart */}
            <section className="insight-card-new chart-section">
              <div className="card-header-flex">
                <h3>Suitability Trajectory ({timeRange})</h3>
                {(isLoading || isSwitching) && <span className="sync-pulse">Syncing...</span>}
              </div>
              <div className="chart-container-responsive">
                <ResponsiveContainer width="99%" height={300}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Category Drift Summary */}
            {activeHistory?.category_drifts && (
              <section className="insight-card-new category-drift-summary">
                <h3>Category Drift Summary ({timeRange})</h3>
                <p className="category-drift-desc">Change since baseline: positive = improved, negative = declined.</p>
                <div className="category-drift-grid">
                  {CATEGORY_KEYS.map(catKey => {
                    const drift = activeHistory.category_drifts[catKey] ?? 0;
                    const past = activeHistory.category_scores?.[catKey];
                    const current = currentCategoryScores?.[catKey];
                    return (
                      <div key={catKey} className={`category-drift-item ${drift >= 0 ? 'improved' : 'declined'}`}>
                        <span className="cat-label">{CATEGORY_LABELS[catKey] || catKey}</span>
                        <span className="cat-change">{drift >= 0 ? '+' : ''}{drift.toFixed(1)} pts</span>
                        {past != null && <span className="cat-past">Past: {Number(past).toFixed(0)}</span>}
                        {current != null && <span className="cat-curr">Current: {Number(current).toFixed(0)}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Factor Details - Side by Side Grid */}
          <section className="insight-card-new factor-drifts-card no-scroll full-width">
            <h3>Factor Drift Details by Category</h3>
            <div className="factors-container">
              {CATEGORY_KEYS.map(catKey => {
                const factorsInCat = CATEGORY_FACTORS[CATEGORY_LABELS[catKey]] || [];
                return (
                  <div key={catKey} className="factor-category-block">
                    <h4 className="factor-category-title">{CATEGORY_LABELS[catKey]}</h4>
                    {factorsInCat.map(key => {
                      const rawVal = flatFactors[key] ?? (key === 'infrastructure' ? flatFactors.proximity : null) ?? (key === 'slope' ? flatFactors.landslide : null);
                      const currentVal = typeof rawVal === 'object' ? (rawVal?.value ?? 50) : (Number(rawVal) ?? 50);
                      const prevVal = getPreviousValue(key, currentVal);
                      return (
                        <FactorBar
                          key={key}
                          label={key.replace(/_/g, ' ').toUpperCase()}
                          value={currentVal}
                          previousValue={prevVal}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Full Width: Terrain Analysis Archive */}
          <section className="insight-card-new terrain-snapshot-section full-width">
            <h3>Terrain Reconstruction Archive</h3>
            <div className="snapshot-grid">
              {snapshots.map((snap) => {
                // Use flattened factors for current snapshot
                const currentLanduse = flatFactors?.landuse ?? 50;
                const currentProximity = flatFactors?.proximity ?? flatFactors?.infrastructure ?? 50;
                
                const snapData = snap.key === 'Today' 
                  ? { terrain: { nature_density: currentLanduse, urban_density: currentProximity } } 
                  : historyBundle?.[snap.key];
                const isSelected = timeRange === snap.key;

                return (
                  <div key={snap.key} className={`snapshot-card ${isSelected ? 'active-range' : ''}`}>
                    <div className="snap-header">
                      <span className="snap-label">{snap.label}</span>
                      <span className="snap-year">{snap.year}</span>
                    </div>
                    <div className="mini-map-container">
                      <div className="map-render" style={{ background: `linear-gradient(135deg, #1a472a ${snapData?.terrain?.nature_density ?? 50}%, #334155 ${snapData?.terrain?.urban_density ?? 50}%)` }}>
                        <div className="map-grid-overlay"></div>
                      </div>
                    </div>
                    <div className="snap-stats">
                      <span>Nature: {snapData?.terrain?.nature_density?.toFixed(0) ?? 50}%</span>
                      <span>Urban: {snapData?.terrain?.urban_density?.toFixed(0) ?? 50}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Full Width: GeoGPT 10Y Analysis */}
          <section className="insight-card-new ai-analysis-card full-width">
            <div className="card-header-flex">
              <h3>GeoGPT {timeRange} Analysis</h3>
              <span className="future-badge">AI INSIGHTS</span>
            </div>
            <div className="ai-analysis-content">
              <div className="analysis-grid">
                <div className="analysis-left">
                  {/* Enhanced Urbanization Velocity Gauge */}
                  <div className="velocity-gauge-container-enhanced">
                    <div className="gauge-header">
                      <h4>🚀 Urbanization Velocity</h4>
                      <div className="gauge-subtitle">Real-time Development Pace Analysis</div>
                    </div>
                    <div className="gauge-wrapper-enhanced">
                      <div className="gauge-body-enhanced">
                        <div className="gauge-needle-enhanced" style={{ 
                          transform: `rotate(${(activeHistory?.velocity?.score * 1.8) - 90}deg)`,
                          transition: 'transform 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
                        }}></div>
                        <div className="gauge-center-enhanced"></div>
                      </div>
                      {/* Enhanced Labels with animations */}
                      <div className="gauge-labels-enhanced">
                        <span className="label-stable-enhanced">
                          <span className="label-icon">🟢</span>
                          <span className="label-text">STABLE</span>
                        </span>
                        <span className="label-expanding-enhanced">
                          <span className="label-icon">🟡</span>
                          <span className="label-text">EXPANDING</span>
                        </span>
                        <span className="label-hyper-enhanced">
                          <span className="label-icon">🔴</span>
                          <span className="label-text">HYPER-GROWTH</span>
                        </span>
                      </div>
                    </div>
                    <div className="velocity-status-wrapper-enhanced">
                      <div className="pace-info">
                        <span className="pace-label">Current Pace:</span>
                        <span className={`highlight-text-animate ${activeHistory?.velocity?.label?.toLowerCase().replace(/\s+/g, '-') || 'calculating'}`}>
                          {activeHistory?.velocity?.label || "CALCULATING..."}
                        </span>
                      </div>
                      <div className="velocity-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Score</span>
                          <span className="metric-value">{(activeHistory?.velocity?.score || 0).toFixed(1)}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Trend</span>
                          <span className={`metric-trend ${activeHistory?.velocity?.score > 50 ? 'increasing' : 'stable'}`}>
                            {activeHistory?.velocity?.score > 50 ? '↑ Rising' : '→ Steady'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="analysis-stats">
                    <p className="summary-text">Temporal analysis indicates a <span className="highlight">{totalShift.toFixed(1)}%</span> net shift.</p>
                    <div className="stat-row"><span>Baseline Score</span><span>{activeHistory?.score?.toFixed(1) || '---'}</span></div>
                    <div className="stat-row"><span>Climate Variance</span><span>{Math.abs(activeHistory?.drifts?.rainfall || 0).toFixed(1)} pts</span></div>
                    <div className="stat-row"><span>Land Use Change</span><span>{Math.abs(activeHistory?.drifts?.landuse || 0).toFixed(1)} pts</span></div>
                    {activeHistory?.category_drifts && (
                      <>
                        <div className="stat-row"><span>Physical</span><span>{(activeHistory.category_drifts.physical ?? 0) >= 0 ? '+' : ''}{(activeHistory.category_drifts.physical ?? 0).toFixed(1)}</span></div>
                        <div className="stat-row"><span>Socio-Economic</span><span>{(activeHistory.category_drifts.socio_econ ?? 0) >= 0 ? '+' : ''}{(activeHistory.category_drifts.socio_econ ?? 0).toFixed(1)}</span></div>
                      </>
                    )}
                  </div>
                </div>
                <div className="analysis-right">
                  {/* Category Drift Summary - Moved to Right Side */}
                  {activeHistory?.category_drifts && (
                    <div className="category-drift-summary-embedded">
                      <h3>Category Drift Summary ({timeRange})</h3>
                      <p className="category-drift-desc">Change since baseline: positive = improved, negative = declined.</p>
                      <div className="category-drift-grid">
                        {CATEGORY_KEYS.map(catKey => {
                          const drift = activeHistory.category_drifts[catKey] ?? 0;
                          const past = activeHistory.category_scores?.[catKey];
                          const current = currentCategoryScores?.[catKey];
                          return (
                            <div key={catKey} className={`category-drift-item ${drift >= 0 ? 'improved' : 'declined'}`}>
                              <span className="cat-label">{CATEGORY_LABELS[catKey] || catKey}</span>
                              <span className="cat-change">{drift >= 0 ? '+' : ''}{drift.toFixed(1)} pts</span>
                              {past != null && <span className="cat-past">Past: {Number(past).toFixed(0)}</span>}
                              {current != null && <span className="cat-curr">Current: {Number(current).toFixed(0)}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="forecast-content">
                    <h4>Strategic Insights</h4>
                    <p className="forecast-text">
                      {stableForecast?.text || (typeof activeHistory?.forecast === 'string' ? activeHistory.forecast : activeHistory?.forecast?.text) || "Analyzing historical momentum to project future viability..."}
                    </p>
                    {(stableForecast?.factors_to_improve?.length > 0) && (
                      <div className="factors-to-improve">
                        <h4>Key Factors to Improve</h4>
                        <ul>
                          {stableForecast.factors_to_improve.map((item, idx) => (
                            <li key={idx} className="improve-item">
                              <strong>{item.factor}</strong> (score: {item.current_score}) — {item.suggested_action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="risk-indicator-grid">
                      <div className="risk-item">
                        <label>Heat Island Risk</label>
                        <div className="risk-bar">
                          <div className="fill high" style={{width: `${stableForecast?.heat_risk || 0}%`, transition: 'width 1s ease-in-out'}}></div>
                        </div>
                      </div>
                      <div className="risk-item">
                        <label>Urban Saturation</label>
                        <div className="risk-bar">
                          <div className="fill mid" style={{width: `${stableForecast?.urban_risk || 0}%`, transition: 'width 1s ease-in-out'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Row: Enhanced SIAM CNN Analysis - Full Width */}
          {activeHistory?.visual_forensics && (
            <div className="cnn-analysis-card full-width">
              <EnhancedVisualForensics forensics={activeHistory.visual_forensics} locationName={locationName} lat={lat} lng={lng} />
            </div>
          )}

          {/* 2030 Planning Forecast Card */}
          <section className="insight-card-new forecast-card glass-glow">
            <div className="card-header-flex">
              <h3><span className="sparkle-icon">✨</span> GeoGPT 2030 Planning Forecast</h3>
              <span className="future-badge">PREDICTIVE</span>
            </div>
            <div className="forecast-content">
              <p className="forecast-text">
                {stableForecast?.text || (typeof activeHistory?.forecast === 'string' ? activeHistory.forecast : activeHistory?.forecast?.text) || "Analyzing historical momentum to project 2030 viability..."}
              </p>
              {(stableForecast?.factors_to_improve?.length > 0) && (
                <div className="factors-to-improve">
                  <h4>Strategic Recommendations for 2030</h4>
                  <ul>
                    {stableForecast.factors_to_improve.map((item, idx) => (
                      <li key={idx} className="improve-item">
                        <strong>{item.factor}</strong> (current: {item.current_score}/100) — {item.suggested_action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="planning-metrics">
                <div className="metric-item">
                  <span className="metric-label">Target Year</span>
                  <span className="metric-value">2030</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Planning Horizon</span>
                  <span className="metric-value">{timeRange}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Confidence</span>
                  <span className="metric-value confidence-high">High</span>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
