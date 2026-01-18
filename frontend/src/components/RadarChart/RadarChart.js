import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Register components strictly outside the function
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ data, isDarkMode }) => {
  // Defensive check to prevent NaN or Null errors in ChartJS
  if (!data) return null;

  const chartData = {
    labels: ['Rainfall', 'Flood', 'Landslide', 'Soil', 'Proximity', 'Water', 'Pollution', 'Landuse'],
    datasets: [{
      label: 'Suitability Profile',
      data: [
        data.rainfall || 0, data.flood || 0, data.landslide || 0, 
        data.soil || 0, data.proximity || 0, data.water || 0, 
        data.pollution || 0, data.landuse || 0
      ],
      backgroundColor: 'rgba(45, 138, 138, 0.25)', 
      borderColor: '#2d8a8a',
      borderWidth: 2,
      pointBackgroundColor: '#2d8a8a',
    }],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        pointLabels: { 
          color: isDarkMode ? '#f8fafc' : '#0f172a', 
          font: { size: 10, weight: 'bold' } 
        },
        ticks: { display: false, max: 100, min: 0 }
      }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    responsive: true
  };

  return <Radar data={chartData} options={chartOptions} />;
};

// Use React.memo to prevent unnecessary re-renders that crash refs
export default React.memo(RadarChart);