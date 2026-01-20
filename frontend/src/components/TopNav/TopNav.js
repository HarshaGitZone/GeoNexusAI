import React, { useState, useEffect, useRef } from "react";
import "./TopNav.css";

export default function TopNav({ isDarkMode, setIsDarkMode, analysisHistory = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [currentTime, setCurrentTime] = useState(new Date());
const navHideTimeoutRef = useRef(null);
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
  }, 2000); // ⏱️ 2 seconds delay
};

  // Ref to handle the 3-second disappear timer
  const hideTimeoutRef = useRef(null);

  // Professional Palette Options
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

  // --- PALETTE TIMER LOGIC ---
  const handleMouseEnterPalette = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowPalette(true);
  };

  const handleMouseLeavePalette = () => {
    // Start countdown when mouse leaves the palette area
    hideTimeoutRef.current = setTimeout(() => {
      setShowPalette(false);
    }, 3000); // 3 Seconds
  };

  const handlePaletteIconClick = (e) => {
    e.stopPropagation();
    // Toggle logic: if we click it, we override the timer and flip the state
    if (showPalette) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setShowPalette(false);
    } else {
      setShowPalette(true);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      if (small) setIsVisible(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // return () => {
    //   clearInterval(timer);
    //   if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    //   window.removeEventListener("resize", handleResize);
    // };
    return () => {
  clearInterval(timer);
  if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  if (navHideTimeoutRef.current) clearTimeout(navHideTimeoutRef.current);
  window.removeEventListener("resize", handleResize);
};

  }, []);

  return (
    <>
      {/* Spacer only for mobile to push content down below the fixed nav */}
      {isSmallScreen && <div className="nav-mobile-spacer" />}

      {!isSmallScreen && (
        <div className="nav-trigger-zone" onMouseEnter={() => setIsVisible(true)} />
      )}

      <nav className={`geo-navbar ${isVisible ? "is-visible" : ""} ${isSmallScreen ? "is-mobile" : "is-floating"}`}
      onMouseEnter={handleNavMouseEnter}
  onMouseLeave={handleNavMouseLeave}
        
      >
        <div className="nav-content-shell">
          {/* LEFT: History & DateTime (Hidden on Mobile) */}
          <div className="nav-group left">
            {!isSmallScreen && (
              <div className="compact-sys">
                <span className="date-val">{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                <span className="time-val">{currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' , second: '2-digit' })}</span>
              </div>
            )}
            <button className={`icon-btn ${showHistoryTable ? "active" : ""}`} onClick={() => setShowHistoryTable(true)}>🕒</button>
          </div>

          {/* CENTER: Logo */}
          <div className="nav-group center">
            <div className="brand-wrap">
              <div className="status-dot" />
              <h1 className="logo">Geo<span>AI</span></h1>
            </div>
          </div>

          {/* RIGHT: Palette, Team & Tools */}
          <div className="nav-group right">
            
            {/* Horizontal Dropping Palette with Timer Logic */}
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
                      setShowPalette(false); // Close immediately on selection
                    }}
                  />
                ))}
              </div>
            </div>

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

            <button className="icon-btn fs-toggle" onClick={toggleFullscreen}>⛶</button>
            <button className="mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* --- COORDINATES HISTORY MODAL --- */}
      {/* {showHistoryTable && (
        <div className="modal-overlay" onClick={() => setShowHistoryTable(false)}>
          <div className="history-table-card glass-morphic" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🛰️ Analysis History</h3>
              <button className="modal-close" onClick={() => setShowHistoryTable(false)}>✖</button>
            </div>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Site Name</th>
                    <th>Lat / Lng</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.length > 0 ? (
                    analysisHistory.map((item, index) => (
                      <tr key={index}>
                        <td className="site-name">{item.name}</td>
                        <td>{parseFloat(item.lat).toFixed(4)}, {parseFloat(item.lng).toFixed(4)}</td>
                        <td>
                          <span className="score-badge" style={{ backgroundColor: item.score < 70 ? '#f59e0b' : '#10b981' }}>
                            {item.score.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="empty-row">No history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )} */}

{/* --- COORDINATES HISTORY MODAL --- */}
{showHistoryTable && (
  <div className="modal-overlay" onClick={() => setShowHistoryTable(false)}>
    <div className="history-table-card glass-morphic" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header" style={{ borderBottomColor: 'var(--accent-color)' }}>
        <h3>🛰️ Analysis History</h3>
        <button className="modal-close" onClick={() => setShowHistoryTable(false)}>✖</button>
      </div>
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Lat / Lng</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          {/* Inside TopNav.js Analysis History Table */}
<tbody>
  {analysisHistory.length > 0 ? (
    analysisHistory.map((item, index) => (
      <tr key={index}>
        <td className="site-name">{item.name}</td>
        <td>{parseFloat(item.lat).toFixed(4)}, {parseFloat(item.lng).toFixed(4)}</td>
        <td>
          <span className="score-badge" style={{ 
              backgroundColor: item.score < 40 ? '#ef4444' : item.score < 70 ? '#f59e0b' : '#10b981' 
          }}>
            {item.score.toFixed(1)}%
          </span>
        </td>
        <td>
          <a 
            href={item.shareLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="history-direct-link"
            onClick={(e) => e.stopPropagation()}
          >
            View Link 🔗
          </a>
        </td>
      </tr>
    ))
  ) : (
    <tr><td colSpan="4" className="empty-row">No history found.</td></tr>
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