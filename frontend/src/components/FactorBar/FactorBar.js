// import React from 'react';
// import '../../App.css'

// function FactorBar({ label, value, impact }) {
//   const width = Math.max(0, Math.min(100, Number(value || 0)));
//   const impactNum = impact == null ? 0 : Number(impact);

//   const neutralThreshold = 0.5;
//   let bg;
//   if (impactNum > neutralThreshold) bg = 'linear-gradient(90deg,#6be7a9,#2fbf73)';
//   else if (impactNum < -neutralThreshold) bg = 'linear-gradient(90deg,#ff6b6b,#d94a4a)';
//   else bg = 'linear-gradient(90deg,#fff3b0,#ffd54d)';
//   const fillStyle = { width: `${width}%`, background: bg };
//   return (
//     <div className="factor">
//       <div className="factor-header">
//         <span>{label}</span>
//         <span className="factor-value">{width.toFixed(1)}</span>
//       </div>
//       <div className="bar" title={impact != null ? `Impact: ${impactNum}` : ''}>
//         <div
//           className="bar-fill"
//           style={fillStyle}
//           role="progressbar"
//           aria-valuenow={Math.round(width)}
//           aria-valuemin={0}
//           aria-valuemax={100}
//         />
//       </div>
//     </div>
//   );
// }
// export default FactorBar;
import React from 'react';
import '../../App.css';

function FactorBar({ label, value, impact }) {
  // Ensure value is a number between 0 and 100
  const width = Math.max(0, Math.min(100, Number(value || 0)));
  
  /** * COLOR LOGIC SYNCED WITH EVIDENCE SECTION:
   * Red: 0 - 39.9
   * Yellow: 40 - 69.9
   * Green: 70 - 100
   */
  let bg;
  if (width < 40) {
    // Red Gradient
    bg = 'linear-gradient(90deg, #ef4444, #ff7b7b)';
  } else if (width < 70) {
    // Yellow/Teak-Gold Gradient
    bg = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  } else {
    // Green Gradient
    bg = 'linear-gradient(90deg, #10b981, #34d399)';
  }

  const fillStyle = { 
    width: `${width}%`, 
    background: bg,
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease' 
  };

  return (
    <div className="factor">
      <div className="factor-header">
        <span className="FactorBar-label">{label}</span>
        <span className="factor-value">{width.toFixed(1)}</span>
      </div>
      <div className="bar" title={impact != null ? `Impact: ${impact}` : ''}>
        <div
          className="bar-fill"
          style={fillStyle}
          role="progressbar"
          aria-valuenow={Math.round(width)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default FactorBar;