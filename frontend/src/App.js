import React from 'react';
import './App.css';
import LandSuitabilityChecker from './components/LandSuitabilityChecker/LandSuitabilityChecker';

function App() {
  return (
    <div className="App">
      {/* 🔴 TEMP BUILD MARKER — REMOVE AFTER CONFIRMATION */}
      {/* <div
        style={{
          background: '#ffecec',
          color: '#b00020',
          padding: '6px',
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'center'
        }}
      >
        GeoAI Frontend Build — 01 Jan 2026 (cache test)
      </div> */}

      <LandSuitabilityChecker />
    </div>
  );
}

export default App;

