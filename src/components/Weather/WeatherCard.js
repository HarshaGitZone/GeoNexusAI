import React from 'react';
import './WeatherCard.css';

const WeatherCard = ({ weather }) => {
  const tempC = weather?.temp_c ?? weather?.temperature_c ?? weather?.temperature ?? weather?.temp;
  const feelsLikeC = weather?.feels_like_c ?? weather?.apparent_temp_c ?? weather?.feels_like;
  const humidity = weather?.humidity;
  const windSpeed = weather?.wind_speed_kmh ?? weather?.wind_speed;
  const pressure = weather?.pressure_hpa ?? weather?.pressure;
  const visibility = weather?.visibility_km ?? weather?.visibility;

  if (!weather || tempC == null || Number.isNaN(Number(tempC))) {
    return (
      <div className="card weather-card glass-morphic">
        <div className="weather-header">
          <h3>Live Atmospheric Intelligence</h3>
        </div>
        <div className="loading-weather">
          <span className="weather-spinner"></span>
          <p>Awaiting Satellite Data...</p>
        </div>
      </div>
    );
  }

  const getLocationTime = () => {
    try {
      if (weather.timezone && weather.timezone !== 'auto') {
        return new Intl.DateTimeFormat([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: weather.timezone
        }).format(new Date());
      }

      if (typeof weather.local_time === 'string') {
        const m = weather.local_time.match(/T(\d{2}:\d{2})/);
        if (m?.[1]) {
          return m[1];
        }
      }

      if (weather.local_time || weather.timestamp) {
        const dt = new Date(weather.local_time || weather.timestamp);
        if (!Number.isNaN(dt.getTime())) {
          return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
      }
    } catch (_) {
      // Fall through to system time
    }

    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getLocationHour = () => {
    try {
      if (weather.timezone && weather.timezone !== 'auto') {
        const hourText = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: weather.timezone
        }).format(new Date());
        const hour = Number(hourText);
        if (!Number.isNaN(hour)) return hour;
      }

      if (typeof weather.local_time === 'string') {
        const m = weather.local_time.match(/T(\d{2}):\d{2}/);
        if (m?.[1]) {
          const hour = Number(m[1]);
          if (!Number.isNaN(hour)) return hour;
        }
      }
    } catch (_) {
      // Fallback below
    }

    return new Date().getHours();
  };

  const localTimeStr = getLocationTime();
  const localHour = getLocationHour();
  const isDay = typeof weather.is_day === 'boolean'
    ? weather.is_day
    : weather.is_day === 1
      ? true
      : weather.is_day === 0
        ? false
        : (localHour >= 6 && localHour < 18);

  const getUVLevel = (uvIndex) => {
    if (!uvIndex) return { level: 'Low', color: '#10b981' };
    if (uvIndex <= 2) return { level: 'Low', color: '#10b981' };
    if (uvIndex <= 5) return { level: 'Moderate', color: '#f59e0b' };
    if (uvIndex <= 7) return { level: 'High', color: '#ef4444' };
    if (uvIndex <= 10) return { level: 'Very High', color: '#dc2626' };
    return { level: 'Extreme', color: '#991b1b' };
  };

  const getAQILevel = (aqi) => {
    if (!aqi) return { level: 'N/A', color: '#6b7280' };
    if (aqi <= 50) return { level: 'Good', color: '#10b981' };
    if (aqi <= 100) return { level: 'Moderate', color: '#f59e0b' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#ef4444' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#dc2626' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#991b1b' };
    return { level: 'Hazardous', color: '#7f1d1d' };
  };

  const uvInfo = getUVLevel(weather.uv_index);
  const aqiInfo = getAQILevel(weather.air_quality?.aqi);

  return (
    <div className="card weather-card glass-morphic compact">
      <div className="weather-header">
        <div className="title-stack">
          <h3>Atmospheric</h3>
          <p className="subtitle">{weather.timezone || 'Tracking'} • {localTimeStr}</p>
        </div>
        <div className="weather-icon-main">{weather.icon || 'N/A'}</div>
      </div>

      <div className="weather-grid-compact">
        <div className="weather-item-primary">
          <span className="w-label">TEMP</span>
          <span className="w-value-primary">{Number(tempC).toFixed(1)}°C</span>
          <span className="w-subtitle">Feels {feelsLikeC != null ? `${Number(feelsLikeC).toFixed(1)}°C` : 'N/A'}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">CONDITIONS</span>
          <span className="w-value">{weather.description || 'Localized'}</span>
          <span className="w-subtitle">{weather.weather_severity || 'Mild'}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">HUMIDITY</span>
          <span className="w-value">{humidity != null ? `${humidity}%` : 'N/A'}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">WIND</span>
          <span className="w-value">{windSpeed != null ? `${windSpeed} km/h` : 'N/A'}</span>
          <span className="w-subtitle">{weather.wind_direction_cardinal || 'N/A'}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">PRESSURE</span>
          <span className="w-value">{pressure != null ? `${pressure} hPa` : 'N/A'}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">UV INDEX</span>
          <span className="w-value" style={{ color: uvInfo.color }}>
            {weather.uv_index || 0}
          </span>
          <span className="w-subtitle">{uvInfo.level}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">AIR QUALITY</span>
          <span className="w-value" style={{ color: aqiInfo.color }}>
            {weather.air_quality?.aqi || 'N/A'}
          </span>
          <span className="w-subtitle">{aqiInfo.level}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">PM2.5</span>
          <span className="w-value" style={{ color: aqiInfo.color }}>
            {weather.air_quality?.pm25 || 'N/A'}
          </span>
          <span className="w-subtitle">ug/m3</span>
        </div>
        <div className="weather-item">
          <span className="w-label">TOP POLLUTANT</span>
          <span className="w-value">
            {weather.air_quality?.dominant_pollutant || 'N/A'}
          </span>
          <span className="w-subtitle">
            {weather.air_quality?.pollutant_level || 'N/A'}
          </span>
        </div>
        <div className="weather-item">
          <span className="w-label">VISIBILITY</span>
          <span className="w-value">{visibility != null ? `${visibility} km` : 'N/A'}</span>
        </div>
      </div>

      <div className="weather-footer compact">
        <span className="live-pulse"></span>
        <span className="live-text">
          LIVE • {isDay ? 'DAY' : 'NIGHT'} • {localTimeStr}
        </span>
      </div>
    </div>
  );
};

export default WeatherCard;
