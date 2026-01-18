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