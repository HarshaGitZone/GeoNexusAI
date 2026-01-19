import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FactorBar from '../FactorBar/FactorBar';
import './HistoryView.css';

export default function HistoryView({ data, locationName, onClose, lat, lng }) {
  const [timeRange, setTimeRange] = useState('10Y');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyDrift, setHistoryDrift] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    if(lat && lng) fetchHistory();
  }, [timeRange, lat, lng]);

  const getPreviousValue = (key, currentVal) => {
    if (!historyDrift) return currentVal;
    const driftKey = `${key}_drift`;
    const drift = historyDrift[driftKey] || 0;
    return Math.max(0, Math.min(100, currentVal + drift));
  };

  const trendData = [
    { name: 'Historical', score: data.suitability_score + (historyDrift?.total_drift || 10) },
    { name: 'Midpoint', score: data.suitability_score + ((historyDrift?.total_drift || 10) / 2) },
    { name: 'Current', score: data.suitability_score },
  ];

  return (
    <div className="history-page-overlay">
      <div className="history-content-wrapper">
        <header className="history-header-responsive">
          <div className="header-top-row">
            <button className="back-link-glass" onClick={onClose}>← EXIT</button>
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

          <div className="range-picker-responsive">
            {['1W', '1M', '1Y', '10Y'].map(range => (
              <button 
                key={range} 
                className={`range-btn-new ${timeRange === range ? 'active' : ''}`} 
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
              >{range}</button>
            ))}
          </div>
        </header>

        <main className="history-main-layout">
          {/* Main Chart Section */}
          <section className="insight-card-new chart-section">
            <div className="card-header-flex">
              <h3>Suitability Trend ({timeRange})</h3>
              {isLoading && <span className="sync-pulse">Syncing...</span>}
            </div>
            <div className="chart-container-responsive">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333', fontSize: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Details Grid - Responsive Stacking */}
          <div className="details-grid-responsive">
            <section className="insight-card-new drift-details">
              <h3>Factor Drift Details</h3>
              <div className="factors-scroll-container">
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

            <section className="insight-card-new ai-analysis">
              <h3>GeoGPT {timeRange} Analysis</h3>
              <div className="gpt-body">
                <p className="summary-text">
                  Temporal analysis indicates a <span className="highlight">{(historyDrift?.total_drift || 0).toFixed(1)}%</span> net shift.
                </p>
                <div className="analysis-stats">
                  <div className="stat-row">
                    <span>Baseline Score</span>
                    <span>{(data.suitability_score + (historyDrift?.total_drift || 0)).toFixed(1)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Climate Variance</span>
                    <span>{Math.abs(historyDrift?.rainfall_drift || 0).toFixed(1)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>Land Use Change</span>
                    <span>{Math.abs(historyDrift?.landuse_drift || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}