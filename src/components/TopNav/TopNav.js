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
  result,
  compareResult,
  isCompareMode,
  analysisHistory = [],
  siteAPlaying = false,
  setSiteAPlaying = () => {},
  siteBPlaying = false,
  setSiteBPlaying = () => {},
  siteAWeather = false,
  setSiteAWeather = () => {},
  siteBWeather = false,
  setSiteBWeather = () => {},
  siteAOpacity = 30,
  setSiteAOpacity = () => {},
  siteBOpacity = 30,
  setSiteBOpacity = () => {}
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [needsSecondRow, setNeedsSecondRow] = useState(false);
  const navHideTimeoutRef = useRef(null);
  const [expandedQR, setExpandedQR] = useState(null);
  const navContentRef = useRef(null);

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
    // Dark Unique Colors (8)
    { name: "Obsidian", color: "#303030" },
    { name: "Deep Violet", color: "#4B0082" },
    { name: "Midnight Teal", color: "#005555" },
    { name: "Burgundy Wine", color: "#722F37" },
    { name: "Forest Moss", color: "#556B2F" },
    { name: "Royal Indigo", color: "#4B5320" },
    { name: "Charcoal Gray", color: "#36454F" },
    { name: "Bronze Age", color: "#CD7F32" },
    // Light Unique Colors (8)
    { name: "Mint Julep", color: "#F0FFF0" },
    { name: "Peach Fuzz", color: "#FFE5B4" },
    { name: "Sky Blue", color: "#87CEEB" },
    { name: "Lavender Mist", color: "#E6E6FA" },
    { name: "Coral Reef", color: "#FF7F50" },
    { name: "Goldenrod", color: "#DAA520" },
    { name: "Turquoise", color: "#40E0D0" },
    { name: "Rose Quartz", color: "#F7CAC9" }
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
  const NavSeparator = () => (
  <span className="nav-divider" aria-hidden="true" />
);
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

  // Check for second row when relevant dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      checkIfNeedsSecondRow();
    }, 100); // Small delay to ensure DOM is rendered
    
    return () => clearTimeout(timer);
  }, [isAudioEnabled, isCompareMode, result, compareResult, showTeam, showPalette]);

  const checkIfNeedsSecondRow = () => {
    // eslint-disable-next-line no-unused-vars
    if (!navContentRef.current) return;
    
    const screenWidth = window.innerWidth;
    
    // Force two-row layout for all screens smaller than 1200px
    const shouldWrap = screenWidth < 1200;
    
    setNeedsSecondRow(shouldWrap);
  };

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      if (small) setIsVisible(true);
      checkIfNeedsSecondRow();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
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

      <nav className={`geo-navbar ${isVisible ? "is-visible" : ""} ${isSmallScreen ? "is-mobile" : "is-floating"} ${needsSecondRow ? "needs-second-row" : ""}`}
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
      >
        <div className="nav-content-shell" ref={navContentRef}>
          <div className="nav-group left">
              <button className={`icon-btn ${showHistoryTable ? "active" : ""}`} onClick={() => setShowHistoryTable(true)}>🕒</button>
              <a href="/wild-facts" target="_blank" rel="noopener noreferrer" className="icon-btn" title="Wild World Facts" style={{ textDecoration: 'none', color: 'inherit' }}>🌍</a>
               <NavSeparator />
             
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
              <NavSeparator />
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
          </div>
             <NavSeparator />
            <div className="nav-group center">
              <div className="brand-wrap">
                <div className="status-dot" />
                <h1 className="logo">Geo<span>AI</span></h1>
              </div>
            </div>
             <NavSeparator />
            <div className="nav-group right">
            {/* Site A Weather Adapter - Show when Site A analysis exists */}
            {result && (
              <div className="weather-controls-group">
                <button 
                  className={`weather-toggle ${siteAWeather ? 'active' : ''}`}
                  onClick={() => setSiteAWeather(!siteAWeather)}
                  title={siteAWeather ? "Disable Site A Adaptive Weather" : "Enable Site A Adaptive Weather"}
                >
                  {siteAWeather ? "🌦️" : "🌤️"}
                </button>
                {siteAWeather && (
                  <div className="weather-controls">
                    <span className="opacity-label">A: {siteAOpacity}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={siteAOpacity}
                      onChange={(e) => {
                        const newOpacity = parseInt(e.target.value);
                        setSiteAOpacity(newOpacity);
                        document.documentElement.style.setProperty('--weather-opacity-a', newOpacity / 100);
                      }}
                      className="opacity-slider"
                      title="Adjust Site A weather effects intensity"
                    />
                  </div>
                )}
              </div>
            )}
            {/* Site B Weather Adapter - Show when Site B analysis exists */}
            {compareResult && (
              <div className="weather-controls-group">
                <button 
                  className={`weather-toggle ${siteBWeather ? 'active' : ''}`}
                  onClick={() => setSiteBWeather(!siteBWeather)}
                  title={siteBWeather ? "Disable Site B Adaptive Weather" : "Enable Site B Adaptive Weather"}
                >
                  {siteBWeather ? "🌦️" : "🌤️"}
                </button>
                {siteBWeather && (
                  <div className="weather-controls">
                    <span className="opacity-label">B: {siteBOpacity}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={siteBOpacity}
                      onChange={(e) => {
                        const newOpacity = parseInt(e.target.value);
                        setSiteBOpacity(newOpacity);
                        document.documentElement.style.setProperty('--weather-opacity-b', newOpacity / 100);
                      }}
                      className="opacity-slider"
                      title="Adjust Site B weather effects intensity"
                    />
                  </div>
                )}
              </div>
            )}
             <NavSeparator />
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
                <div className="palette-row">
                  {themes.slice(0, 8).map((t, index) => (
                    <div
                      key={`dark-${index}`}
                      className="color-dot"
                      style={{ backgroundColor: t.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeThemeColor(t.color);
                        setShowPalette(false);
                      }}
                      title={t.name}
                    />
                  ))}
                </div>
                <div className="palette-row">
                  {themes.slice(8).map((t, index) => (
                    <div
                      key={`light-${index}`}
                      className="color-dot"
                      style={{ backgroundColor: t.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeThemeColor(t.color);
                        setShowPalette(false);
                      }}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button className="mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button className="icon-btn fs-toggle" onClick={toggleFullscreen}>⛶</button>
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
