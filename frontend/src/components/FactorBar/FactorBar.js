import React from 'react';
import '../../App.css'

function FactorBar({ label, value, impact }) {
  const width = Math.max(0, Math.min(100, Number(value || 0)));
  const impactNum = impact == null ? 0 : Number(impact);
  // color by impact: positive -> green, negative -> red, near-zero -> yellow
  const neutralThreshold = 0.5;
  let bg;
  if (impactNum > neutralThreshold) bg = 'linear-gradient(90deg,#6be7a9,#2fbf73)';
  else if (impactNum < -neutralThreshold) bg = 'linear-gradient(90deg,#ff6b6b,#d94a4a)';
  else bg = 'linear-gradient(90deg,#fff3b0,#ffd54d)';
  const fillStyle = { width: `${width}%`, background: bg };
  return (
    <div className="factor">
      <div className="factor-header">
        <span>{label}</span>
        <span className="factor-value">{width.toFixed(1)}</span>
      </div>
      <div className="bar" title={impact != null ? `Impact: ${impactNum}` : ''}>
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
