// import React, { useState } from 'react';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';

// export default function HistoryView({ data, locationName, onClose }) {
//   const [timeRange, setTimeRange] = useState('10Y');

//   // Mock historical data logic (In production, this comes from your backend)
//   const historicalFactors = {
//     rainfall: (data.factors.rainfall || 50) + 15,
//     soil: (data.factors.soil || 50) - 5,
//     water: (data.factors.water || 50) + 20,
//     landuse: (data.factors.landuse || 50) + 10,
//   };

//   return (
//     <div className="history-page-overlay glass-morphic">
//       <div className="history-content-wrapper">
//         <header className="history-top-nav">
//           <button className="back-link" onClick={onClose}>← EXIT TO MAP</button>
//           <div className="location-title">
//             <h1>{locationName}</h1>
//             <p>Environmental Intelligence Report • 2016 - 2026</p>
//           </div>
//           <div className="range-picker">
//             {['1W', '1M', '1Y', '10Y'].map(range => (
//               <button 
//                 key={range} 
//                 className={timeRange === range ? 'active' : ''} 
//                 onClick={() => setTimeRange(range)}
//               >{range}</button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-grid">
//           {/* Section 1: Vegetation & Water Indices */}
//           <section className="insight-card satellite-indices">
//             <h3>Remote Sensing Indices</h3>
//             <div className="indices-flex">
//               <div className="index-box">
//                 <span className="label">NDVI (Vegetation)</span>
//                 <div className="comparison">
//                   <span className="old">0.72</span>
//                   <span className="arrow">→</span>
//                   <span className="new">0.45</span>
//                 </div>
//                 <div className="status-note down">Heavy Urbanization Detected</div>
//               </div>
//               <div className="index-box">
//                 <span className="label">NDWI (Water Table)</span>
//                 <div className="comparison">
//                   <span className="old">0.30</span>
//                   <span className="arrow">→</span>
//                   <span className="new">0.28</span>
//                 </div>
//                 <div className="status-note stable">Stable Ground Water</div>
//               </div>
//             </div>
//           </section>

//           {/* Section 2: Detailed Factor Comparison */}
//           <section className="insight-card factor-timeline">
//             <h3>Terrain Evolution Details</h3>
//             <div className="factors-list-history">
//               {Object.keys(data.factors).map(key => (
//                 <FactorBar 
//                   key={key} 
//                   label={key} 
//                   value={data.factors[key]} 
//                   previousValue={historicalFactors[key]} 
//                 />
//               ))}
//             </div>
//           </section>

//           {/* Section 3: AI Summary */}
//           <section className="insight-card gpt-summary">
//             <h3>GeoGPT Historical Analysis</h3>
//             <div className="gpt-text-block">
//               <p>Over the last decade, <strong>{locationName}</strong> has transitioned from a primarily vegetated landscape to a suburban environment. </p>
//               <ul>
//                 <li><strong>Flood Risk:</strong> Increased by 12% due to concrete surface expansion.</li>
//                 <li><strong>Landslide Stability:</strong> Remained consistent despite soil moisture fluctuations.</li>
//                 <li><strong>Recommendation:</strong> Prioritize permeable pavement systems for any new construction.</li>
//               </ul>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }
// import React, { useState } from 'react';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';

// export default function HistoryView({ data, locationName, onClose }) {
//   const [timeRange, setTimeRange] = useState('10Y');

//   // Mock historical data logic - calculates a "past" state based on current data
//   // In a real environment, this could be fetched from your backend timeline
//   const getHistoricalFactors = () => {
//     const historical = {};
//     Object.keys(data.factors).forEach(key => {
//       // Logic: simulate that 10 years ago, environmental factors were generally 15% "better"
//       // (e.g., less pollution, more vegetation, less flood risk)
//       historical[key] = Math.max(0, Math.min(100, (data.factors[key] || 50) + 15));
//     });
//     return historical;
//   };

//   const historicalFactors = getHistoricalFactors();

//   return (
//     <div className="history-page-overlay">
//       <div className="history-content-wrapper">
//         <header className="history-top-nav">
//           <button className="back-link-glass" onClick={onClose}>
//             <span className="back-icon">←</span> EXIT TO MAP
//           </button>
          
//           <div className="location-info-center">
//             <h1>{locationName}</h1>
//             <p className="subtitle">Environmental Intelligence Timeline • 2016 — 2026</p>
//           </div>

//           <div className="range-picker-container">
//             {['1W', '1M', '1Y', '10Y'].map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn ${timeRange === range ? 'active' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//               >
//                 {range}
//               </button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-grid">
//           {/* Section 1: Satellite Indices Comparison */}
//           <section className="insight-card satellite-indices">
//             <div className="card-header">
//               <span className="card-icon">🛰️</span>
//               <h3>Remote Sensing Indices</h3>
//             </div>
//             <div className="indices-flex">
//               <div className="index-box">
//                 <span className="label">NDVI (Vegetation Density)</span>
//                 <div className="comparison-display">
//                   <span className="old-val">0.72</span>
//                   <span className="arrow-icon">→</span>
//                   <span className="new-val">0.45</span>
//                 </div>
//                 <div className="status-tag trend-down">Significant Urban Encroachment</div>
//               </div>
              
//               <div className="index-box">
//                 <span className="label">NDWI (Water Content)</span>
//                 <div className="comparison-display">
//                   <span className="old-val">0.30</span>
//                   <span className="arrow-icon">→</span>
//                   <span className="new-val">0.28</span>
//                 </div>
//                 <div className="status-tag trend-stable">Hydrological Stability Maintained</div>
//               </div>
//             </div>
//           </section>

//           {/* Section 2: Factor Evolution List */}
//           <section className="insight-card factor-timeline">
//             <div className="card-header">
//               <span className="card-icon">📊</span>
//               <h3>Terrain Evolution Details</h3>
//             </div>
//             <div className="factors-list-scrollable">
//               {Object.keys(data.factors).map(key => (
//                 <FactorBar 
//                   key={key} 
//                   label={key.replace('_', ' ')} 
//                   value={data.factors[key]} 
//                   previousValue={historicalFactors[key]} 
//                 />
//               ))}
//             </div>
//           </section>

//           {/* Section 3: GeoGPT Summary */}
//           <section className="insight-card gpt-summary">
//             <div className="card-header">
//               <span className="card-icon">✨</span>
//               <h3>GeoGPT Historical Analysis</h3>
//             </div>
//             <div className="gpt-content">
//               <p>
//                 In the span of a decade, <strong>{locationName}</strong> has undergone a 
//                 detectable transition from a natural vegetated state toward an 
//                 engineered urban landscape.
//               </p>
//               <ul className="analysis-points">
//                 <li>
//                   <strong>Flood Risk:</strong> The 12% increase is directly correlated to the loss of pervious surfaces.
//                 </li>
//                 <li>
//                   <strong>Soil Integrity:</strong> Remaining stable, though moisture retention has decreased by 8.4%.
//                 </li>
//                 <li>
//                   <strong>Strategic Advice:</strong> Implementation of "Sponge City" architecture is highly recommended to mitigate runoff.
//                 </li>
//               </ul>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';

// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y');
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Live Clock Effect
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Mock Trend Data - In a real app, you'd fetch this from backend based on 'timeRange'
//   const trendData = [
//     { name: '2018', score: 85 },
//     { name: '2020', score: 78 },
//     { name: '2022', score: 72 },
//     { name: '2024', score: 68 },
//     { name: '2026', score: data.suitability_score },
//   ];

//   return (
//     <div className="history-page-overlay">
//       <div className="history-content-wrapper">
        
//         {/* TOP HEADER: Clock, Location, and Coords */}
//         <header className="history-top-nav">
//           <div className="nav-left">
//             <button className="back-link-glass" onClick={onClose}>← EXIT</button>
//             <div className="live-clock">
//               {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
//             </div>
//           </div>

//           <div className="location-info-center">
//             <h1 className="glitch-text">{locationName}</h1>
//             <div className="coord-badge">
//               <span>LAT: {parseFloat(lat).toFixed(4)}</span>
//               <span className="separator">|</span>
//               <span>LNG: {parseFloat(lng).toFixed(4)}</span>
//             </div>
//           </div>

//           <div className="range-picker-container">
//             {['1W', '1M', '1Y', '10Y'].map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn ${timeRange === range ? 'active' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//               >{range}</button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-grid">
//           {/* NEW: Comparison Graph */}
//           <section className="insight-card full-width-card">
//             <div className="card-header">
//               <h3>Suitability Trend Analysis</h3>
//             </div>
//             <div className="chart-container" style={{ width: '100%', height: 250 }}>
//               <ResponsiveContainer>
//                 <AreaChart data={trendData}>
//                   <defs>
//                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//                   <XAxis dataKey="name" stroke="#888" fontSize={12} />
//                   <YAxis stroke="#888" fontSize={12} />
//                   <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
//                   <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </section>

//           {/* Detailed Factors with accurate data mapping */}
//           <section className="insight-card factor-timeline">
//             <h3>Factor Drift (Now vs Past)</h3>
//             <div className="factors-list-scrollable">
//               {Object.keys(data.factors).map(key => (
//                 <FactorBar 
//                   key={key} 
//                   label={key.replace('_', ' ')} 
//                   value={data.factors[key]} 
//                   // Generating past data based on current to show "drift"
//                   previousValue={data.factors[key] + (timeRange === '10Y' ? 12 : 3)} 
//                 />
//               ))}
//             </div>
//           </section>

//           <section className="insight-card gpt-summary">
//             <h3>AI Environmental Forecast</h3>
//             <div className="gpt-content">
//               <p>Analysis of <strong>{timeRange}</strong> data indicates a steady {data.factors.landuse < 50 ? 'decrease' : 'increase'} in ecosystem stability.</p>
//               <ul className="analysis-points">
//                 <li><strong>Observation:</strong> Urban heat signature has intensified.</li>
//                 <li><strong>Prediction:</strong> Surface runoff likely to increase by 5% by 2028.</li>
//               </ul>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';

// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y');
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Dynamic Offset Logic: Changes how much "drift" we see based on the button clicked
//   const getOffset = () => {
//     switch(timeRange) {
//       case '1W': return 0.5;  // Tiny change
//       case '1M': return 2.0;  // Small change
//       case '1Y': return 8.0;  // Moderate change
//       case '10Y': return 18.0; // Large historical change
//       default: return 0;
//     }
//   };

//   const offset = getOffset();

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Professional Trend Graph Data
//   const trendData = [
//     { name: 'Start', score: data.suitability_score + offset },
//     { name: 'Mid', score: data.suitability_score + (offset / 2) },
//     { name: 'Current', score: data.suitability_score },
//   ];

//   return (
//     <div className="history-page-overlay">
//       <div className="history-content-wrapper">
//         <header className="history-top-nav">
//           <div className="nav-left">
//             <button className="back-link-glass" onClick={onClose}>← EXIT</button>
//             <div className="live-clock">
//               {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
//             </div>
//           </div>

//           <div className="location-info-center">
//             <h1>{locationName}</h1>
//             <div className="coord-badge">
//               <span>LAT: {parseFloat(lat).toFixed(4)}</span>
//               <span className="separator">|</span>
//               <span>LNG: {parseFloat(lng).toFixed(4)}</span>
//             </div>
//           </div>

//           <div className="range-picker-container">
//             {['1W', '1M', '1Y', '10Y'].map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn ${timeRange === range ? 'active' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//               >{range}</button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-grid">
//           <section className="insight-card full-width-card">
//             <h3>Suitability Trend ({timeRange})</h3>
//             <div style={{ width: '100%', height: 220, marginTop: '20px' }}>
//               <ResponsiveContainer>
//                 <AreaChart data={trendData}>
//                   <defs>
//                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <XAxis dataKey="name" hide />
//                   <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
//                   <Tooltip contentStyle={{ borderRadius: '12px', background: '#111', border: 'none' }} />
//                   <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={4} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </section>

//           <section className="insight-card factor-timeline">
//             <h3>Factor Drift Details</h3>
//             <div className="factors-list-scrollable">
//               {Object.keys(data.factors).map(key => (
//                 <FactorBar 
//                   key={key} 
//                   label={key} 
//                   value={data.factors[key]} 
//                   previousValue={data.factors[key] + offset} 
//                 />
//               ))}
//             </div>
//           </section>

//           <section className="insight-card gpt-summary">
//             <h3>GeoGPT {timeRange} Analysis</h3>
//             <div className="gpt-content">
//               <p>The terrain shows a <strong>{offset}% drift</strong> over the selected <strong>{timeRange}</strong> period.</p>
//               <ul className="analysis-points">
//                 <li>Stability index shifted from {(data.suitability_score + offset).toFixed(1)} to {data.suitability_score.toFixed(1)}.</li>
//                 <li>Detected variations in {offset > 10 ? 'Long-term environmental cycles' : 'Short-term seasonal patterns'}.</li>
//               </ul>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FactorBar from '../FactorBar/FactorBar';
import './HistoryView.css';

export default function HistoryView({ data, locationName, onClose, lat, lng }) {
  const [timeRange, setTimeRange] = useState('10Y');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyDrift, setHistoryDrift] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Temporal Drift from Backend
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/history_analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            range: timeRange
          }),
        });
        const result = await response.json();
        setHistoryDrift(result);
      } catch (err) {
        console.error("Failed to fetch historical drift:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [timeRange, lat, lng]);

  // Map backend drift keys to your factor keys
  const getPreviousValue = (key, currentVal) => {
    if (!historyDrift) return currentVal;
    const driftKey = `${key}_drift`;
    const drift = historyDrift[driftKey] || 0;
    return Math.max(0, Math.min(100, currentVal + drift));
  };

  // Professional Trend Graph Data (Calculated from Drift)
  const trendData = [
    { name: 'Historical', score: data.suitability_score + (historyDrift?.total_drift || 10) },
    { name: 'Midpoint', score: data.suitability_score + ((historyDrift?.total_drift || 10) / 2) },
    { name: 'Current', score: data.suitability_score },
  ];

  return (
    <div className="history-page-overlay">
      <div className="history-content-wrapper">
        <header className="history-top-nav">
          <div className="nav-left">
            <button className="back-link-glass" onClick={onClose}>← EXIT</button>
            <div className="live-clock">
              {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="location-info-center">
            <h1 className="glitch-text">{locationName}</h1>
            <div className="coord-badge">
              <span>LAT: {parseFloat(lat).toFixed(4)}</span>
              <span className="separator">|</span>
              <span>LNG: {parseFloat(lng).toFixed(4)}</span>
            </div>
          </div>

          <div className="range-picker-container">
            {['1W', '1M', '1Y', '10Y'].map(range => (
              <button 
                key={range} 
                className={`range-btn ${timeRange === range ? 'active' : ''}`} 
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
              >{range}</button>
            ))}
          </div>
        </header>

        <main className="history-main-grid">
          <section className="insight-card full-width-card">
            <div className="card-header">
              <h3>Suitability Trend ({timeRange})</h3>
              {isLoading && <span className="loading-text-small">Syncing...</span>}
            </div>
            <div style={{ width: '100%', height: 220, marginTop: '20px' }}>
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: '#111', border: 'none' }} />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="insight-card factor-timeline">
            <h3>Factor Drift Details</h3>
            <div className="factors-list-scrollable">
              {Object.keys(data.factors).map(key => (
                <FactorBar 
                  key={key} 
                  label={key.replace('_', ' ')} 
                  value={data.factors[key]} 
                  previousValue={getPreviousValue(key, data.factors[key])} 
                />
              ))}
            </div>
          </section>

          <section className="insight-card gpt-summary">
            <h3>GeoGPT {timeRange} Analysis</h3>
            <div className="gpt-content">
              <p>Temporal analysis indicates a <strong>{historyDrift?.total_drift?.toFixed(1) || '...'}%</strong> net suitability shift.</p>
              <ul className="analysis-points">
                <li>Historical Baseline: {(data.suitability_score + (historyDrift?.total_drift || 0)).toFixed(1)}</li>
                <li>Climate Factor Variance: {Math.abs(historyDrift?.rainfall_drift || 0).toFixed(1)}%</li>
                <li>Land Use Change: {Math.abs(historyDrift?.landuse_drift || 0).toFixed(1)}%</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}