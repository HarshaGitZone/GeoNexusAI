// import React, { useState, useEffect } from 'react';
// import './GlobalSyncDock.css';

// const WORLD_HUBS = [
//   { city: "London", tz: "UTC", offset: 0, code: "LHR" },
//   { city: "New York", tz: "EST", offset: -5, code: "JFK" },
//   { city: "Tokyo", tz: "JST", offset: 9, code: "HND" },
//   { city: "Dubai", tz: "GST", offset: 4, code: "DXB" },
//   { city: "Hyderabad", tz: "IST", offset: 5.5, code: "HYD" },
//   { city: "Sydney", tz: "AEST", offset: 11, code: "SYD" }
// ];

// export default function GlobalSyncDock() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [now, setNow] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const getCityTime = (offset) => {
//     const d = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (offset * 3600000));
//     return d.toLocaleTimeString('en-GB', { hour12: false });
//   };

//   return (
//     <>
//       {/* 📡 THE SIGNAL (Trigger Icon) */}
//       <div 
//         className="telemetry-trigger-pulse" 
//         onClick={() => setIsOpen(true)}
//         title="Access Global Command Center"
//       >
//         <div className="pulse-core">🌐</div>
//         <div className="pulse-ring"></div>
//       </div>

//       {/* 🚀 THE COMMAND CENTER (Full-Screen Overlay) */}
//       {isOpen && (
//         <div className="global-command-overlay" onClick={() => setIsOpen(false)}>
//           <div className="command-inner" onClick={e => e.stopPropagation()}>
//             <div className="command-header">
//               <span className="geo-nexus-label">GEO NEXUS AI</span>
//               <h2>GLOBAL MISSION CONTROL</h2>
//               <button className="command-close" onClick={() => setIsOpen(false)}>✕</button>
//             </div>
            
//             <div className="clock-grid">
//               {WORLD_HUBS.map(hub => {
//                 const timeStr = getCityTime(hub.offset);
//                 const hour = parseInt(timeStr.split(':')[0]);
//                 const isNight = hour >= 19 || hour < 6;

//                 return (
//                   <div key={hub.city} className={`clock-card ${isNight ? 'is-night' : 'is-day'}`}>
//                     <div className="clock-hub-code">{hub.code}</div>
//                     <div className="clock-digital">{timeStr}</div>
//                     <div className="clock-meta">
//                       <span className="hub-name">{hub.city}</span>
//                       <span className="hub-tz">{hub.tz} (GMT{hub.offset >= 0 ? '+' : ''}{hub.offset})</span>
//                     </div>
//                     <div className="solar-indicator">{isNight ? "🌙 DARK PHASE" : "☀️ SOLAR PHASE"}</div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import React, { useState, useEffect } from 'react';
import './GlobalSyncDock.css';

const WORLD_HUBS = [
  // --- WESTERN HEMISPHERE (Slowest) ---
  { city: "San Francisco", tz: "PST", offset: -8, code: "SFO" },
  { city: "New Jersey", tz: "EST", offset: -5, code: "EWR" },
  { city: "Washington DC", tz: "EST", offset: -5, code: "IAD" },
  { city: "New York", tz: "EST", offset: -5, code: "JFK" },
  { city: "London", tz: "UTC", offset: 0, code: "LHR" },
  
  // --- MIDDLE EAST & SOUTH ASIA ---
  { city: "Dubai", tz: "GST", offset: 4, code: "DXB" },
  { city: "Karachi", tz: "PKT", offset: 5, code: "KHI" },
  { city: "Kolkata", tz: "IST", offset: 5.5, code: "CCU" },
  { city: "Chennai", tz: "IST", offset: 5.5, code: "MAA" },
  { city: "Hyderabad", tz: "IST", offset: 5.5, code: "HYD" },
  
  // --- SOUTH EAST ASIA & EAST ASIA ---
  { city: "Singapore", tz: "SGT", offset: 8, code: "SIN" },
  { city: "Kuala Lumpur", tz: "MYT", offset: 8, code: "KUL" },
  { city: "Beijing", tz: "CST", offset: 8, code: "PEK" },
  { city: "Shanghai", tz: "CST", offset: 8, code: "PVG" },
  { city: "Seoul", tz: "KST", offset: 9, code: "ICN" },
  { city: "Tokyo", tz: "JST", offset: 9, code: "HND" },
  
  // --- OCEANIA (Fastest) ---
  { city: "Sydney", tz: "AEDT", offset: 11, code: "SYD" },
  { city: "Auckland", tz: "NZDT", offset: 13, code: "AKL" }
];

export default function GlobalSyncDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCityTime = (offset) => {
    // Calculate precise time based on UTC offset
    const d = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (offset * 3600000));
    return d.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <div 
        className="telemetry-trigger-pulse" 
        onClick={() => setIsOpen(true)}
        title="Access Global Command Center"
      >
        <div className="pulse-core">🌐</div>
        <div className="pulse-ring"></div>
      </div>

      {isOpen && (
        <div className="global-command-overlay" onClick={() => setIsOpen(false)}>
          <div className="command-inner" onClick={e => e.stopPropagation()}>
            <div className="command-header">
              <div className="header-status-line">
                <span className="status-dot-active"></span>
                <span className="geo-nexus-label">GEO NEXUS AI SERVER CLUSTER</span>
              </div>
              <h2>GLOBAL MISSION CONTROL</h2>
              <p className="command-subtitle">REAL-TIME TEMPORAL SYNC OVER 18 STRATEGIC HUBS</p>
              <button className="command-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <div className="clock-grid">
              {WORLD_HUBS.map(hub => {
                const timeStr = getCityTime(hub.offset);
                const hour = parseInt(timeStr.split(':')[0]);
                const isNight = hour >= 19 || hour < 6;

                return (
                  <div key={hub.city} className={`clock-card ${isNight ? 'is-night' : 'is-day'}`}>
                    <div className="card-top">
                      <span className="hub-code-badge">{hub.code}</span>
                      <span className="hub-offset-badge">GMT {hub.offset >= 0 ? '+' : ''}{hub.offset}</span>
                    </div>
                    <div className="clock-digital">{timeStr}</div>
                    <div className="clock-meta">
                      <span className="hub-name">{hub.city.toUpperCase()}</span>
                      <span className="hub-tz-label">{hub.tz} NETWORK</span>
                    </div>
                    <div className="solar-status-bar">
                      <span className="solar-icon">{isNight ? "🌙" : "☀️"}</span>
                      <span className="solar-text">{isNight ? "NIGHT OPS" : "DAY OPS"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}