import React, { useState, useEffect, useRef } from "react";
import "./TopNav.css";
import QRCode from "react-qr-code";

export default function TopNav({
  isDarkMode,
  setIsDarkMode,
  isAudioEnabled,
  setIsAudioEnabled,
  adaptiveWeather,
  setAdaptiveWeather,
  weatherOpacity,
  setWeatherOpacity,
  analysisHistory = [],
  compareResult,
  isCompareMode,
//   siteAPlaying,
//   setSiteAPlaying,
//   siteBPlaying,
//   setSiteBPlaying
// }) {
  siteAPlaying = false,
  setSiteAPlaying = () => {},

  siteBPlaying = false,
  setSiteBPlaying = () => {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navHideTimeoutRef = useRef(null);
  const [expandedQR, setExpandedQR] = useState(null);

  const handleNavMouseEnter = () => {
    if (navHideTimeoutRef.current) {
      clearTimeout(navHideTimeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleNavMouseLeave = () => {
    navHideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setShowTeam(false);
    }, 2000);
  };

  const hideTimeoutRef = useRef(null);

  const themes = [
    { name: "Purple", color: "#8b5cf6" },
    { name: "Cyan", color: "#06b6d4" },
    { name: "Emerald", color: "#10b981" },
    { name: "Rose", color: "#f43f5e" },
    { name: "Amber", color: "#f59e0b" },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const changeThemeColor = (color) => {
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-glow', `${color}44`);
  };

  const handleMouseEnterPalette = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    // Remove hover behavior - only show on click
    // setShowPalette(true);
  };

  const handleMouseLeavePalette = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowPalette(false);
    }, 3000);
  };

  const handlePaletteIconClick = (e) => {
    e.stopPropagation();
    if (showPalette) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setShowPalette(false);
    } else {
      setShowPalette(true);
    }
  };
   // ✅ If master audio is turned off → force both sites muted
  useEffect(() => {
    if (!isAudioEnabled) {
      setSiteAPlaying(false);
      setSiteBPlaying(false);
    }
  }, [isAudioEnabled, setSiteAPlaying, setSiteBPlaying]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      if (small) setIsVisible(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      clearInterval(timer);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (navHideTimeoutRef.current) clearTimeout(navHideTimeoutRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

   // Compare B speaker should only appear when compare is valid
     const showBSpeaker = isAudioEnabled && isCompareMode && !!compareResult;

  return (
    <>
      {isSmallScreen && <div className="nav-mobile-spacer" />}

      {!isSmallScreen && (
        <div className="nav-trigger-zone" onMouseEnter={() => setIsVisible(true)} />
      )}

      <nav className={`geo-navbar ${isVisible ? "is-visible" : ""} ${isSmallScreen ? "is-mobile" : "is-floating"}`}
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
      >
        <div className="nav-content-shell">
          <div className="nav-group left">

            <div className="nav-group right">
              {!isSmallScreen && (
                <div className="compact-sys">
                  <span className="date-val">{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  <span className="time-val">{currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              )}
              <div className="team-trigger-wrapper">
                <button className={`team-btn ${showTeam ? "active" : ""}`} onClick={() => setShowTeam(!showTeam)}>Team</button>
                <div className={`compact-team-pane ${showTeam ? "show" : ""}`}>
                  <div className="pane-inner">
                    <div className="pane-header">
                      <h4 className="project-title">Project Development Team</h4>
                      <p className="guide-text">Guided by: <span>Dr. G. Naga Chandrika</span></p>
                      <div className="header-divider"></div>
                    </div>
                    <div className="team-grid">
                      <div className="member-card">Adepu Vaishnavi</div>
                      <div className="member-card">Chinni Jyothika</div>
                      <div className="member-card">Harsha vardhan Botlagunta</div>
                      <div className="member-card">Maganti Pranathi</div>
                    </div>
                  </div>
                </div>
              </div>


              <button className={`icon-btn ${showHistoryTable ? "active" : ""}`} onClick={() => setShowHistoryTable(true)}>🕒</button>
              <a href="/wild-facts" target="_blank" rel="noopener noreferrer" className="icon-btn" title="Wild World Facts" style={{ textDecoration: 'none', color: 'inherit' }}>🌍</a>
            </div>

            <div className="nav-group center">
              <div className="brand-wrap">
                <div className="status-dot" />
                <h1 className="logo">Geo<span>AI</span></h1>
              </div>
            </div>



  {/* {isAudioEnabled && (
    <button 
      className={`icon-btn audio-toggle ${siteAPlaying ? "active" : "muted"}`} 
      onClick={() => setSiteAPlaying(!siteAPlaying)}
      title={siteAPlaying ? "Mute Site A" : "Unmute Site A"}
    >
      {siteAPlaying ? "🔊" : "🔇"}
      <span className="audio-label">A</span>
    </button>
  )}


  {isAudioEnabled && isCompareMode && compareResult && (
    <button 
      className={`icon-btn audio-toggle-b ${siteBPlaying ? "active" : "muted"}`} 
      onClick={() => setSiteBPlaying(!siteBPlaying)}
      title={siteBPlaying ? "Mute Site B" : "Unmute Site B"}
    >
      {siteBPlaying ? "🔊" : "🔇"}
      <span className="audio-label">B</span>
    </button>
  )} */}
  
            {/* 🔊 SITE A SPEAKER */}
            {isAudioEnabled && (
              <button
                className={`icon-btn audio-toggle ${siteAPlaying ? "active" : "muted"}`}
                onClick={() => setSiteAPlaying((p) => !p)}
                title={siteAPlaying ? "Mute Site A" : "Unmute Site A"}
              >
                {siteAPlaying ? "🔊" : "🔇"}
                <span className="audio-label">A</span>
              </button>
            )}

            {/* 🔊 SITE B SPEAKER */}
            {showBSpeaker && (
              <button
                className={`icon-btn audio-toggle-b ${siteBPlaying ? "active" : "muted"}`}
                onClick={() => setSiteBPlaying((p) => !p)}
                title={siteBPlaying ? "Mute Site B" : "Unmute Site B"}
              >
                {siteBPlaying ? "🔊" : "🔇"}
                <span className="audio-label">B</span>
              </button>
            )}
            
            <div className="palette-wrapper"
              onMouseEnter={handleMouseEnterPalette}
              onMouseLeave={handleMouseLeavePalette}>
              <button
                className={`icon-btn palette-trigger ${showPalette ? "active" : ""}`}
                onClick={handlePaletteIconClick}
              >
                🎨
              </button>

              <div className={`palette-dropdown ${showPalette ? "expanded" : ""}`}>
                {themes.map((t) => (
                  <div
                    key={t.name}
                    className="color-dot"
                    style={{ backgroundColor: t.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeThemeColor(t.color);
                      setShowPalette(false);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="nav-group right">
            <button className="icon-btn fs-toggle" onClick={toggleFullscreen}>⛶</button>
            <button 
              className={`weather-toggle ${adaptiveWeather ? 'active' : ''}`} 
              onClick={() => setAdaptiveWeather(!adaptiveWeather)}
              title={adaptiveWeather ? "Disable Adaptive Weather" : "Enable Adaptive Weather"}
            >
              {adaptiveWeather ? "🌦️" : "🌤️"}
            </button>
            {adaptiveWeather && (
              <div className="weather-controls">
                <span className="opacity-label">Intensity</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weatherOpacity}
                  onChange={(e) => {
                    const newOpacity = parseInt(e.target.value);
                    setWeatherOpacity(newOpacity);
                    // Update CSS variable immediately
                    document.documentElement.style.setProperty('--weather-opacity', newOpacity / 100);
                  }}
                  className="opacity-slider"
                  title="Adjust weather effects intensity"
                />
                <span className="opacity-value">{weatherOpacity}%</span>
              </div>
            )}
            <button className="mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
        </div>
      </nav>

      {showHistoryTable && (
        <div className="modal-overlay" onClick={() => setShowHistoryTable(false)}>
          <div className="history-table-card glass-morphic" onClick={(e) => e.stopPropagation()}>
            {expandedQR && (
              <div className="qr-expanded-overlay" onClick={() => setExpandedQR(null)}>
                <div className="qr-expanded-card" onClick={(e) => e.stopPropagation()}>
                  <div className="qr-container">
                    <QRCode
                      value={expandedQR.link}
                      size={240}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>

                  <div className="qr-info">
                    {expandedQR.name.includes("vs") ? (
                      <div className="comparison-title-wrap">
                        <span className="analysis-tag">Comparison Analysis</span>
                        <h4>{expandedQR.name}</h4>
                      </div>
                    ) : (
                      <h4>{expandedQR.name} Report</h4>
                    )}
                    <p>Scan to view this geospatial report on mobile</p>
                  </div>

                  <button className="qr-close-btn" onClick={() => setExpandedQR(null)}>Close</button>
                </div>
              </div>
            )}

            <div className="modal-header" style={{ borderBottomColor: 'var(--accent-color)' }}>
              <h3>🛰️ Analysis History</h3>
              <button className="modal-close" onClick={() => setShowHistoryTable(false)}>✖</button>
            </div>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Lat , Lng</th>
                    <th>Score</th>
                    <th>Date & Time</th>
                    <th>Scan</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.length > 0 ? (
                    analysisHistory.map((item, index) => {
                      const isComparison =
                        item.isCompareMode ||
                        (item.bLat && item.bLng) ||
                        (item.nameB && item.nameB !== "Site B");

                      const baseUrl = `${window.location.origin}${window.location.pathname}`;
                      let dynamicLink = `${baseUrl}?lat=${item.lat}&lng=${item.lng}&nameA=${encodeURIComponent(item.name || "Location A")}`;

                      if (isComparison) {
                        dynamicLink += `&bLat=${encodeURIComponent(item.bLat)}&bLng=${encodeURIComponent(item.bLng)}&nameB=${encodeURIComponent(item.nameB || "Location B")}&compare=true`;
                      }

                      const getScoreColor = (s) => (s < 40 ? '#ef4444' : s < 70 ? '#f59e0b' : '#10b981');
                      const analysisDate = item.timestamp ? new Date(item.timestamp) : null;
                      const formattedTime = analysisDate
                        ? analysisDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
                        analysisDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "N/A";

                      return (
                        <tr key={index} className={isComparison ? "history-row-comp" : ""}>
                          <td className="site-name">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{item.name}</span>
                              {isComparison && (
                                <span style={{ fontSize: '10px', color: 'var(--accent-color)', opacity: 0.8 }}>
                                  vs {item.nameB}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>A:</span> {parseFloat(item.lat).toFixed(4)}, {parseFloat(item.lng).toFixed(4)}
                              {isComparison && (
                                <div style={{ marginTop: '4px', opacity: 0.7 }}>
                                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>B:</span> {parseFloat(item.bLat).toFixed(4)}, {parseFloat(item.bLng).toFixed(4)}
                                </div>
                              )}
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                              <span className="score-badge" style={{ backgroundColor: getScoreColor(item.score), minWidth: '60px' }}>
                                {isComparison && <small style={{ fontSize: '9px', marginRight: '4px', opacity: 0.8 }}>A:</small>}
                                {item.score.toFixed(1)}%
                              </span>

                              {isComparison && item.scoreB !== undefined && (
                                <span className="score-badge" style={{ backgroundColor: getScoreColor(item.scoreB), minWidth: '60px' }}>
                                  <small style={{ fontSize: '9px', marginRight: '4px', opacity: 0.8 }}>B:</small>
                                  {item.scoreB.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </td>

                          <td style={{ fontSize: '11px', whiteSpace: 'nowrap', opacity: 0.8 }}>
                            {formattedTime}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <div
                              className="qr-mini-wrapper"
                              onClick={() => {
                                const displayName = isComparison
                                  ? `${item.name} vs ${item.nameB}`
                                  : item.name;

                                setExpandedQR({
                                  link: dynamicLink,
                                  name: displayName
                                });
                              }}
                              style={{ cursor: 'zoom-in', background: '#fff', padding: '3px', borderRadius: '4px', display: 'inline-block' }}
                            >
                              <QRCode value={dynamicLink} size={28} bordered={isDarkMode ? "true" : undefined} />
                            </div>
                          </td>

                          <td>
                            <a
                              href={dynamicLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="history-direct-link"
                              style={{
                                fontSize: '11px',
                                textDecoration: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--accent-color)',
                                display: 'inline-block'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isComparison ? "View Compare 🔗" : "View 🔗"}
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="4" className="empty-row" style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
