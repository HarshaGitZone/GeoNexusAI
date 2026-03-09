import React from 'react';
import './FactorBar.css';

function FactorBar({ label, value, previousValue }) {
  const current = Math.max(0, Math.min(100, Number(value || 0)));
  const historical = previousValue !== undefined ? Math.max(0, Math.min(100, Number(previousValue))) : null;
  
  const diff = historical !== null ? current - historical : 0;
  
  let bg;
  if (current < 40) bg = 'linear-gradient(90deg, #ef4444, #f87171)';
  else if (current < 70) bg = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  else bg = 'linear-gradient(90deg, #10b981, #34d399)';

  return (
    <div className="factor-item">
      <div className="factor-info">
        <span className="factor-label">{label}</span>
        <div className="factor-stats">
          <span className="current-val">{current.toFixed(1)}%</span>
          {historical !== null && (
            <span className={`trend-indicator ${diff >= 0 ? 'up' : 'down'}`}>
              {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${current}%`, background: bg }} />
        {historical !== null && (
          <div className="history-ghost-marker" style={{ left: `${historical}%` }} title={`Historical: ${historical}%`} />
        )}
      </div>
    </div>
  );
}

export default FactorBar;