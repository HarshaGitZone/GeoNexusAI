import React, { useEffect } from 'react';
import './WeatherEffects.css';

export default function WeatherEffects({ weather, adaptiveWeather, isDarkMode, setIsDarkMode, weatherOpacity }) {
  const getWeatherType = () => {
    if (!weather) return 'default';
    
    // Use the correct field names from the backend weather API
    const description = (weather.description || weather.conditions || '').toLowerCase();
    const main = (weather.weather_code !== undefined ? weather.weather_code.toString() : '').toLowerCase();
    const isDay = weather.is_day;
    
    // Debug logging
    console.log('Weather Effects Debug:', { description, main, isDay, weather });
    
    // Check for day/night first
    if (!isDay) {
      // Night time effects
      if (description.includes('rain') || description.includes('shower') || main.includes('rain')) {
        return 'night-rain';
      } else if (description.includes('snow') || main.includes('snow')) {
        return 'night-snow';
      } else if (description.includes('cloud') || description.includes('overcast') || main.includes('cloud')) {
        return 'night-cloudy';
      } else if (description.includes('clear') || description.includes('mainly clear') || main.includes('clear')) {
        return 'night-clear';
      } else if (description.includes('storm') || description.includes('thunder')) {
        return 'night-storm';
      } else if (description.includes('fog') || description.includes('mist')) {
        return 'night-foggy';
      } else {
        return 'night-clear'; // Default night
      }
    } else {
      // Day time effects
      if (description.includes('rain') || description.includes('shower') || main.includes('rain')) {
        return 'rain';
      } else if (description.includes('snow') || main.includes('snow')) {
        return 'snow';
      } else if (description.includes('cloud') || description.includes('overcast') || main.includes('cloud')) {
        return 'cloudy';
      } else if (description.includes('clear') || description.includes('mainly clear') || main.includes('clear')) {
        return 'sunny';
      } else if (description.includes('storm') || description.includes('thunder')) {
        return 'storm';
      } else if (description.includes('fog') || description.includes('mist')) {
        return 'foggy';
      } else if (description.includes('wind') || description.includes('breez')) {
        return 'windy';
      } else {
        return 'sunny'; // Default day
      }
    }
  };

  const weatherType = getWeatherType();

  // Auto-adjust theme based on weather - moved before early return
  useEffect(() => {
    if (adaptiveWeather && weather) {
      // Force dark mode for night time or stormy/rainy/foggy weather
      if (weatherType.includes('night') || weatherType === 'storm' || weatherType === 'rain' || weatherType === 'foggy') {
        setIsDarkMode(true);
        document.body.setAttribute('data-theme', 'dark');
      } else if (weatherType === 'sunny') {
        // Force light mode for sunny weather
        setIsDarkMode(false);
        document.body.setAttribute('data-theme', 'light');
      }
      // For cloudy/snow/windy, keep current theme
    }
  }, [weatherType, adaptiveWeather, weather, setIsDarkMode]);

  if (!adaptiveWeather || !weather) return null;

  const renderWeatherEffect = () => {
    switch (weatherType) {
      case 'rain':
        return <RainEffect />;
      case 'snow':
        return <SnowEffect />;
      case 'cloudy':
        return <CloudyEffect />;
      case 'sunny':
        return <SunnyEffect />;
      case 'storm':
        return <StormEffect />;
      case 'foggy':
        return <FoggyEffect />;
      case 'windy':
        return <WindyEffect />;
      // Night effects
      case 'night-rain':
        return <NightRainEffect />;
      case 'night-snow':
        return <NightSnowEffect />;
      case 'night-cloudy':
        return <NightCloudyEffect />;
      case 'night-clear':
        return <NightClearEffect />;
      case 'night-storm':
        return <NightStormEffect />;
      case 'night-foggy':
        return <NightFoggyEffect />;
      default:
        // For overcast or unknown conditions, show cloudy effect
        return <CloudyEffect />;
    }
  };

  return (
    <div 
      className="weather-effects-overlay"
      style={{ '--weather-opacity': weatherOpacity / 100 }}
    >
      {renderWeatherEffect()}
    </div>
  );
}

// Rain Effect Component
function RainEffect() {
  return (
    <div className="rain-container">
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.3 + Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

// Snow Effect Component
function SnowEffect() {
  return (
    <div className="snow-container">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${8 + Math.random() * 16}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

// Cloudy Effect Component
function CloudyEffect() {
  return (
    <div className="cloudy-container">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 60}%`,
            width: `${80 + Math.random() * 120}px`,
            height: `${40 + Math.random() * 60}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${20 + Math.random() * 20}s`,
          }}
        />
      ))}
    </div>
  );
}

// Sunny Effect Component
function SunnyEffect() {
  return (
    <div className="sunny-container">
      <div className="sun-rays">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="sun-ray"
            style={{
              transform: `rotate(${i * 45}deg)`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <div className="sun-glow" />
    </div>
  );
}

// Storm Effect Component
function StormEffect() {
  return (
    <div className="storm-container">
      <div className="storm-overlay" />
      <RainEffect />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="lightning"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            width: `${2 + Math.random() * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

// Foggy Effect Component
function FoggyEffect() {
  return (
    <div className="foggy-container">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="fog-layer"
          style={{
            animationDelay: `${i * 2}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            opacity: 0.1 + Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Night Clear Effect Component - Moon and stars
function NightClearEffect() {
  return (
    <div className="night-clear-container">
      <div className="moon">
        <div className="moon-crater-1" />
        <div className="moon-crater-2" />
        <div className="moon-crater-3" />
      </div>
      {[...Array(120)].map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 85}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${2 + Math.random() * 3}px`,
          }}
        >
          ✦
        </div>
      ))}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="small-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 95}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            fontSize: `${1 + Math.random() * 2}px`,
          }}
        >
          •
        </div>
      ))}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="tiny-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 90}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
            fontSize: `${0.5 + Math.random() * 1}px`,
          }}
        >
          ·
        </div>
      ))}
    </div>
  );
}

// Night Rain Effect Component
function NightRainEffect() {
  return (
    <div className="night-rain-container">
      <NightClearEffect />
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="night-raindrop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.3 + Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

// Night Snow Effect Component
function NightSnowEffect() {
  return (
    <div className="night-snow-container">
      <NightClearEffect />
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="night-snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${8 + Math.random() * 16}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

// Night Cloudy Effect Component
function NightCloudyEffect() {
  return (
    <div className="night-cloudy-container">
      <NightClearEffect />
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="night-cloud"
          style={{
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 40}%`,
            width: `${60 + Math.random() * 100}px`,
            height: `${30 + Math.random() * 50}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${25 + Math.random() * 15}s`,
          }}
        >
          <span className="cloud-puff-1" />
          <span className="cloud-puff-2" />
        </div>
      ))}
    </div>
  );
}

// Night Storm Effect Component
function NightStormEffect() {
  return (
    <div className="night-storm-container">
      <div className="night-storm-overlay" />
      <NightRainEffect />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="night-lightning"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            width: `${2 + Math.random() * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

// Night Foggy Effect Component
function NightFoggyEffect() {
  return (
    <div className="night-foggy-container">
      <NightClearEffect />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="night-fog-layer"
          style={{
            animationDelay: `${i * 2}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            opacity: 0.1 + Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Windy Effect Component
function WindyEffect() {
  return (
    <div className="windy-container">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="wind-line"
          style={{
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
