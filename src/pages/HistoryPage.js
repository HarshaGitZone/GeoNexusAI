import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav/TopNav';
import HistoryView from '../components/HistoryView/HistoryView';
import { API_BASE } from '../config/api';
import '../components/LandSuitabilityChecker/LandSuitabilityChecker.css';
import '../components/TopNav/TopNav.css';
import '../components/HistoryView/HistoryView.css';

export default function HistoryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lat = searchParams.get('lat') || '';
  const lng = searchParams.get('lng') || '';
  const name = searchParams.get('name') || 'Site A';

  const [isDarkMode, setIsDarkMode] = useState(() =>
    JSON.parse(localStorage.getItem('geo_theme') ?? 'true')
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync theme to body (same as main app)
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('geo_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const fetchSuitability = useCallback(async () => {
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);
    if (!lat || !lng || isNaN(nLat) || isNaN(nLng)) {
      setLoading(false);
      setError('Missing or invalid lat/lng.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/suitability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          latitude: nLat,
          longitude: nLng,
          debug: false,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('History page suitability fetch failed:', err);
      setError(err.message || 'Failed to load suitability data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchSuitability();
  }, [fetchSuitability]);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="app-shell">
      <TopNav
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isAudioEnabled={false}
        setIsAudioEnabled={() => {}}
        analysisHistory={[]}
      />
      <div className="history-page-standalone-wrap">
        {loading && (
          <div className="history-loading-full">
            <div className="spinner" />
            <p>Loading suitability &amp; history…</p>
          </div>
        )}
        {error && !loading && (
          <div className="history-error-full">
            <p>{error}</p>
            <button type="button" className="back-link-glass" onClick={handleClose}>
              ← Back to Map
            </button>
          </div>
        )}
        {data && !loading && (
          <HistoryView
            data={data}
            locationName={name}
            onClose={handleClose}
            lat={lat}
            lng={lng}
            isDarkMode={isDarkMode}
            standalone
          />
        )}
      </div>
    </div>
  );
}
