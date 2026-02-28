import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandSuitabilityChecker from './components/LandSuitabilityChecker/LandSuitabilityChecker';
import HistoryPage from './pages/HistoryPage';
import WildFactsPage from './components/WildFactsPage/WildFactsPage';
import ProjectLoaderPage from "./pages/ProjectLoaderPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandSuitabilityChecker />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/wild-facts" element={<WildFactsPage />} />
        <Route path="/project/:id" element={<ProjectLoaderPage />} />
      </Routes>
    </div>
  );
}

export default App;

