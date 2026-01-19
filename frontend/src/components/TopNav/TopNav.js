// import React, { useState, useEffect } from "react";
// import "./TopNav.css";

// export default function TopNav({ isDarkMode, setIsDarkMode, searchHistory = [] }) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [showTeam, setShowTeam] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       const small = window.innerWidth < 768;
//       setIsSmallScreen(small);
//       if (small) setIsVisible(true);
//     };
//     window.addEventListener("resize", handleResize);
//     handleResize();
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen();
//     } else {
//       if (document.exitFullscreen) document.exitFullscreen();
//     }
//   };

//   return (
//     <>
//       {!isSmallScreen && (
//         <div className="nav-trigger-zone" onMouseEnter={() => setIsVisible(true)} />
//       )}

//       <nav 
//         className={`geo-navbar ${isVisible ? "is-visible" : ""} ${isSmallScreen ? "is-mobile" : ""}`}
//         onMouseLeave={() => {
//           if (!isSmallScreen) {
//             setIsVisible(false);
//             setShowTeam(false);
//             setShowHistory(false);
//           }
//         }}
//       >
//         <div className="nav-content-shell">
          
//           {/* LEFT: History (Date/Time hidden on mobile to save space) */}
//           <div className="nav-group left">
//             {!isSmallScreen && (
//               <div className="compact-sys">
//                 <span className="date-val">{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
//                 <span className="time-val">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
//               </div>
//             )}
//             <button className="icon-btn" onClick={() => setShowHistory(!showHistory)}>🕒</button>
//           </div>

//           {/* CENTER: Logo */}
//           <div className="nav-group center">
//             <div className="brand-wrap">
//               <div className="status-dot" />
//               <h1 className="logo">Geo<span>AI</span></h1>
//             </div>
//           </div>

//           {/* RIGHT: Tools */}
//           <div className="nav-group right">
//             <div className="team-trigger-wrapper" 
//               onMouseEnter={() => !isSmallScreen && setShowTeam(true)}
//               onMouseLeave={() => !isSmallScreen && setShowTeam(false)}>
//             <button className={`team-btn ${showTeam ? "active" : ""}`} onClick={() => setShowTeam(!showTeam)}>
//               Team
//             </button>
  
//   {/* EXACT TEAM PANEL DESIGN */}
//               <div className={`compact-team-pane ${showTeam ? "show" : ""}`}>
//                 <div className="pane-inner">
//                   <div className="pane-header">
//                       <h4 className="project-title">Project Development Team</h4>
//                       <p className="guide-text">Guided by: <span>Dr. G. Naga Chandrika</span></p>
//                       <div className="header-divider"></div>
//                   </div>
//                   <div className="team-grid">
//                       <div className="member-card">Adepu Vaishnavi</div>
//                       <div className="member-card">Chinni Jyothika</div>
//                       <div className="member-card">Harsha vardhan Botlagunta</div>
//                       <div className="member-card">Maganti Pranathi</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <button className="icon-btn fs-toggle" onClick={toggleFullscreen}>⛶</button>
//             <button className="mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
//               {isDarkMode ? "☀️" : "🌙"}
//             </button>
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }
import React, { useState, useEffect } from "react";
import "./TopNav.css";

export default function TopNav({ isDarkMode, setIsDarkMode, analysisHistory = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  return (
    <>
      {!isSmallScreen && (
        <div className="nav-trigger-zone" onMouseEnter={() => setIsVisible(true)} />
      )}

      <nav className={`geo-navbar ${isVisible ? "is-visible" : ""} ${isSmallScreen ? "is-mobile" : ""}`}
        onMouseLeave={() => { if (!isSmallScreen) setIsVisible(false); setShowTeam(false); }}
      >
        <div className="nav-content-shell">
          {/* LEFT: History Button & DateTime */}
          <div className="nav-group left">
            {!isSmallScreen && (
              <div className="compact-sys">
                <span className="date-val">{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                <span className="time-val">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
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

          {/* RIGHT: Team & Tools */}
          <div className="nav-group right">
            <div className="team-trigger-wrapper" 
                 onMouseEnter={() => !isSmallScreen && setShowTeam(true)}
                 onMouseLeave={() => !isSmallScreen && setShowTeam(false)}>
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
      {showHistoryTable && (
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
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Suitability Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.length > 0 ? (
                    analysisHistory.map((item, index) => (
                      <tr key={index}>
                        <td className="site-name">{item.name}</td>
                        <td>{parseFloat(item.lat).toFixed(6)}</td>
                        <td>{parseFloat(item.lng).toFixed(6)}</td>
                        <td>
                          <span className="score-badge" style={{
                            backgroundColor: item.score < 40 ? '#ef4444' : item.score < 70 ? '#f59e0b' : '#10b981'
                          }}>
                            {item.score.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="empty-row">No analysis history found.</td></tr>
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