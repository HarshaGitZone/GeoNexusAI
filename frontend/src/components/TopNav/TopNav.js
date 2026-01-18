import React, { useState, useEffect } from "react";
import "./TopNav.css";

export default function TopNav({ isDarkMode, setIsDarkMode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTeam, setShowTeam] = useState(false); // State for the team dropdown
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      if (small) setIsVisible(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {!isSmallScreen && (
        <div className="nav-trigger-zone" onMouseEnter={() => setIsVisible(true)} />
      )}

      <nav
        className={`top-nav-floating ${isVisible ? "visible" : ""} ${isSmallScreen ? "mobile-fixed" : ""}`}
        onMouseLeave={() => {
          if (!isSmallScreen) setIsVisible(false);
          setShowTeam(false); // Close dropdown when mouse leaves the nav
        }}
      >
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-dot" />
            <span className="brand-text">GeoAI</span>
          </div>

          <div className="nav-center-actions desktop-only">
            {/* New Team Toggle Button */}
            <button 
              className={`nav-btn team-toggle ${showTeam ? "active" : ""}`} 
              onClick={() => setShowTeam(!showTeam)}
            >
              👥 Team
            </button>
            <button className="nav-btn">Export as pdf</button>
          </div>

          <div className="nav-right">
            <div className="nav-divider desktop-only"></div>
            <button
              className="theme-toggle-nav"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Team Dropdown Overlay */}
        <div className={`team-dropdown ${showTeam ? "show" : ""}`}>
          <div className="team-header">
            <h4>Project Development Team</h4>
            <p>Guided by: <strong>Dr. G. Naga Chandrika</strong></p>
          </div>
          <div className="team-grid-nav">
            <span>Adepu Vaishnavi</span>
            <span>Chinni Jyothika</span>
            <span>Harsha vardhan Botlagunta</span>
            <span>Maganti Pranathi</span>
          </div>
        </div>
      </nav>
    </>
  );
}