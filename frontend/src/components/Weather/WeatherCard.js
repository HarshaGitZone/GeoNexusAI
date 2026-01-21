import React from 'react';
import './WeatherCard.css';

const WeatherCard = ({ weather }) => {
  // 1. EARLY EXIT: If weather data is missing or incomplete, show the loading state.
  // This prevents the app from crashing by trying to read properties of null.
  if (!weather || !weather.temp_c) {
    return (
      <div className="card weather-card glass-morphic">
        <div className="weather-header">
          <h3>Atmospheric Intelligence</h3>
        </div>
        <div className="loading-weather">
          <span className="weather-spinner"></span>
          <p>Awaiting Live Satellite Data...</p>
        </div>
      </div>
    );
  }

  // 2. SUCCESS PATH: Logic for formatting data only runs if weather object exists.
  // This resolves the "localTimeStr is not defined" error by placing it in the correct scope.
  const localTimeStr = weather.local_time 
    ? new Date(weather.local_time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    : new Date().toLocaleTimeString(); 

  const tempF = ((weather.temp_c * 9/5) + 32).toFixed(1);

  return (
    <div className="card weather-card glass-morphic">
      <div className="weather-header">
        <div className="title-stack">
          <h3>Live Atmospheric Conditions</h3>
          {/* Displays the dynamic timezone and local time unique to the coordinates */}
          <p className="subtitle">{weather.timezone || "Tracking"} • {localTimeStr}</p>
        </div>
        <div className="weather-icon-main">{weather.icon || "🌡️"}</div>
      </div>
      
      <div className="weather-grid">
        <div className="w-item">
          <span className="w-label">TEMPERATURE</span>
          <span className="w-value">{weather.temp_c.toFixed(1)}°C / {tempF}°F</span>
        </div>
        <div className="w-item">
          <span className="w-label">PRECIPITATION</span>
          <span className="w-value">{weather.rain_mm || 0} mm</span>
        </div>
        <div className="w-item">
          <span className="w-label">HUMIDITY</span>
          <span className="w-value">{weather.humidity}%</span>
        </div>
        <div className="w-item">
          <span className="w-label">OUTLOOK</span>
          <span className="w-value">{weather.description || "Localized"}</span>
        </div>
      </div>

      {/* Visual indicator that this is a live feed based on the coordinate's solar cycle */}
      <div className="weather-footer">
        <span className="live-pulse"></span>
        LIVE SENSOR FEED • {weather.is_day ? "DAYLIGHT" : "NIGHT CYCLE"}
      </div>
    </div>
  );
};

export default WeatherCard;