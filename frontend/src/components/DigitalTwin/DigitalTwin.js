import React, { useState, useEffect, useCallback } from 'react';
// import { API_BASE } from '../../config/api';
import './DigitalTwin.css';

const DigitalTwin = ({ location, onImpactUpdate }) => {
  // const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [selectedDevelopment, setSelectedDevelopment] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  // const [placedDevelopments, setPlacedDevelopments] = useState([]);
  const [locationAnalysis, setLocationAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('development');
  const [environmentalMetrics, setEnvironmentalMetrics] = useState(null);

  // Enhanced development types with location-specific adaptations
  const developmentTypes = [
    {
      id: 'residential',
      name: 'Smart Residential Complex',
      icon: '🏘️',
      description: 'Sustainable multi-family housing with green infrastructure',
      impacts: { pollution: 2, traffic: 6, infrastructure: 10, population: 15, sustainability: 8 },
      color: '#3b82f6',
      features: ['Solar Panels', 'Rainwater Harvesting', 'Green Roofs', 'EV Charging'],
      suitability: ['urban', 'suburban', 'near-transit']
    },
    {
      id: 'commercial',
      name: 'Tech Innovation Hub',
      icon: '🏢',
      description: 'Modern office complex with smart building systems',
      impacts: { pollution: 3, traffic: 8, infrastructure: 7, population: 10, sustainability: 9 },
      color: '#8b5cf6',
      features: ['Smart HVAC', 'Energy Storage', 'Green Certification', 'IoT Systems'],
      suitability: ['urban', 'business-district', 'near-airport']
    },
    {
      id: 'industrial',
      name: 'Green Manufacturing Plant',
      icon: '🏭',
      description: 'Eco-friendly industrial facility with circular economy principles',
      impacts: { pollution: 8, traffic: 4, infrastructure: 6, population: 5, sustainability: 7 },
      color: '#ef4444',
      features: ['Waste Recycling', 'Clean Energy', 'Water Treatment', 'Automation'],
      suitability: ['industrial-zone', 'near-highway', 'away-residential']
    },
    {
      id: 'hospital',
      name: 'Advanced Medical Center',
      icon: '🏥',
      description: 'State-of-the-art healthcare facility with emergency services',
      impacts: { pollution: 2, traffic: 10, infrastructure: 12, population: 8, sustainability: 8 },
      color: '#10b981',
      features: ['Helipad', 'Solar Backup', 'Smart Beds', 'Telemedicine'],
      suitability: ['near-residential', 'major-road', 'accessible']
    },
    {
      id: 'school',
      name: 'Sustainable Educational Campus',
      icon: '🎓',
      description: 'Modern educational facility with environmental focus',
      impacts: { pollution: 1, traffic: 6, infrastructure: 8, population: 12, sustainability: 9 },
      color: '#f59e0b',
      features: ['Solar Power', 'Garden Classrooms', 'Water Recycling', 'Digital Learning'],
      suitability: ['residential', 'quiet-area', 'near-parks']
    },
    {
      id: 'mixed',
      name: 'Live-Work-Play Complex',
      icon: '🌆',
      description: 'Integrated development with residential, commercial, and recreational spaces',
      impacts: { pollution: 4, traffic: 7, infrastructure: 9, population: 18, sustainability: 8 },
      color: '#06b6d4',
      features: ['Mixed-Use Zoning', 'Public Spaces', 'Transit Hub', 'Community Services'],
      suitability: ['urban-center', 'transit-oriented', 'high-density']
    }
  ];


  const calculateEnvironmentalMetrics = useCallback((analysis) => {
    const metrics = {
      carbonFootprint: calculateCarbonFootprint(analysis),
      biodiversityImpact: assessBiodiversityImpact(analysis),
      waterUsage: estimateWaterUsage(analysis),
      energyEfficiency: calculateEnergyEfficiency(analysis),
      sustainabilityScore: calculateSustainabilityScore(analysis)
    };
    setEnvironmentalMetrics(metrics);
  }, []);
  const analyzeLocationCharacteristics = useCallback(() => {
    const factors = location.factors;
    const analysis = {
      terrain: {
        slope: factors.physical?.slope?.value || 0,
        elevation: factors.physical?.elevation?.value || 0,
        stability: factors.physical?.slope?.value < 8 ? 'stable' : 'challenging'
      },
      environment: {
        vegetation: factors.environmental?.vegetation?.value || 50,
        airQuality: factors.environmental?.pollution?.value || 50,
        waterProximity: factors.hydrology?.water?.value || 50
      },
      infrastructure: {
        connectivity: factors.socio_econ?.infrastructure?.value || 50,
        population: factors.socio_econ?.population?.value || 50,
        landUse: factors.socio_econ?.landuse?.value || 50
      }
    };
    setLocationAnalysis(analysis);
    
    // Calculate environmental metrics
    calculateEnvironmentalMetrics(analysis);
  }, [location, calculateEnvironmentalMetrics]);
  // Analyze location characteristics
  useEffect(() => {
    if (location && location.factors) {
      analyzeLocationCharacteristics();
    }
  }, [location, analyzeLocationCharacteristics]);


  const calculateCarbonFootprint = (analysis) => {
    // Location-specific carbon calculation
    const baseCarbon = 100; // kg CO2/m²/year baseline
    const terrainFactor = analysis.terrain.slope > 15 ? 1.3 : 1.0;
    const vegetationFactor = analysis.environment.vegetation > 70 ? 0.7 : 1.0;
    return Math.round(baseCarbon * terrainFactor * vegetationFactor);
  };

  const assessBiodiversityImpact = (analysis) => {
    const vegetationScore = analysis.environment.vegetation;
    if (vegetationScore > 80) return 'high';
    if (vegetationScore > 50) return 'medium';
    return 'low';
  };

  const estimateWaterUsage = (analysis) => {
    const baseUsage = 150; // liters/m²/year
    const vegetationFactor = analysis.environment.vegetation > 60 ? 0.8 : 1.2;
    return Math.round(baseUsage * vegetationFactor);
  };

  const calculateEnergyEfficiency = (analysis) => {
    // Based on terrain, vegetation, and infrastructure
    const terrainScore = analysis.terrain.slope < 5 ? 90 : analysis.terrain.slope < 15 ? 70 : 50;
    const vegetationScore = analysis.environment.vegetation > 60 ? 85 : 70;
    const infrastructureScore = analysis.infrastructure.connectivity;
    return Math.round((terrainScore + vegetationScore + infrastructureScore) / 3);
  };

  const calculateSustainabilityScore = (analysis) => {
    const factors = [
      analysis.environment.vegetation,
      100 - analysis.environment.airQuality,
      analysis.infrastructure.connectivity,
      100 - analysis.terrain.slope
    ];
    return Math.round(factors.reduce((a, b) => a + b, 0) / factors.length);
  };

  const runAdvancedSimulation = async () => {
    if (!selectedDevelopment || !locationAnalysis) return;
    
    setIsCalculating(true);
    
    // Simulate processing time for realistic experience
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Location-specific impact calculations
    const impacts = calculateLocationSpecificImpacts(selectedDevelopment, locationAnalysis);
    
    setSimulationResults({
      development: selectedDevelopment,
      impacts: impacts,
      location: locationAnalysis,
      environmental: environmentalMetrics,
      recommendations: generateLocationSpecificRecommendations(impacts, locationAnalysis, selectedDevelopment),
      feasibility: assessDevelopmentFeasibility(selectedDevelopment, locationAnalysis),
      timeline: generateDevelopmentTimeline(selectedDevelopment, locationAnalysis),
      roi: calculateReturnOnInvestment(selectedDevelopment, locationAnalysis)
    });
    
    setIsCalculating(false);
    onImpactUpdate(impacts);
  };

  const calculateLocationSpecificImpacts = (development, analysis) => {
    const baseImpacts = development.impacts;
    const locationMultipliers = {
      terrain: analysis.terrain.slope > 10 ? 1.2 : 1.0,
      vegetation: analysis.environment.vegetation > 70 ? 0.8 : 1.1,
      infrastructure: analysis.infrastructure.connectivity / 50,
      population: analysis.infrastructure.population / 50
    };
    
    return Object.keys(baseImpacts).reduce((acc, key) => {
      acc[key] = Math.round(baseImpacts[key] * (locationMultipliers[key] || 1.0));
      return acc;
    }, {});
  };

  const generateLocationSpecificRecommendations = (impacts, analysis, development) => {
    const recommendations = [];
    
    // Terrain-based recommendations with specific reasoning
    if (analysis.terrain.slope > 10) {
      recommendations.push(`TERRAIN: The ${analysis.terrain.slope.toFixed(1)}% slope requires terracing and specialized foundations. This increases construction costs by 15-20% but is manageable with modern engineering.`);
    } else if (analysis.terrain.slope < 3) {
      recommendations.push(`TERRAIN: Excellent flat terrain (${analysis.terrain.slope.toFixed(1)}% slope) reduces foundation costs by 25% and allows for flexible building layouts and efficient drainage systems.`);
    }
    
    // Environmental recommendations with quantitative reasoning
    if (analysis.environment.vegetation > 80) {
      recommendations.push(`ENVIRONMENT: High vegetation cover (${analysis.environment.vegetation}%) provides natural cooling and carbon sequestration. Preserve 60% of mature trees to maintain ecological benefits while reducing HVAC costs by 20%.`);
    } else if (analysis.environment.vegetation < 30) {
      recommendations.push(`ENVIRONMENT: Low vegetation (${analysis.environment.vegetation}%) requires strategic landscaping. Plant native shade trees to reduce cooling costs and improve air quality, targeting 40% green coverage within 5 years.`);
    }
    
    // Infrastructure recommendations with economic impact
    if (analysis.infrastructure.connectivity < 60) {
      recommendations.push(`INFRASTRUCTURE: Current connectivity score of ${analysis.infrastructure.connectivity}% limits accessibility. Invest $2-3M in road improvements to increase property values by 15-20% and reduce commute times by 25%.`);
    } else if (analysis.infrastructure.connectivity > 80) {
      recommendations.push(`INFRASTRUCTURE: Excellent connectivity (${analysis.infrastructure.connectivity}%) supports high-density development. Leverage existing transit access to reduce parking requirements by 30% and promote walkable design.`);
    }
    
    // Air quality recommendations with health impact
    if (analysis.environment.airQuality < 40) {
      recommendations.push(`AIR QUALITY: Current PM2.5 levels require advanced filtration systems. Invest $500K in green building materials and air purification to achieve 30% better indoor air quality and reduce respiratory health risks.`);
    }
    
    // Development-specific recommendations with ROI justification
    if (development.id === 'residential') {
      if (analysis.infrastructure.population > 70) {
        recommendations.push(`RESIDENTIAL: High population density (${analysis.infrastructure.population}%) supports multi-family housing. Expected ROI: ${calculateReturnOnInvestment(development, analysis)}% with 85% occupancy within 6 months due to strong rental demand.`);
      }
      if (analysis.infrastructure.connectivity > 70) {
        recommendations.push(`RESIDENTIAL: Proximity to transit (${analysis.infrastructure.connectivity}% connectivity) allows for reduced parking ratios. Save $1.2M in construction costs and qualify for transit-oriented development tax incentives.`);
      }
    }
    
    if (development.id === 'commercial') {
      if (analysis.infrastructure.population > 60 && analysis.infrastructure.connectivity > 70) {
        recommendations.push(`COMMERCIAL: Ideal location with ${analysis.infrastructure.population}% population density and ${analysis.infrastructure.connectivity}% transit access. Projected 12% ROI with 92% occupancy due to business demand and talent accessibility.`);
      }
      if (analysis.environment.airQuality > 60) {
        recommendations.push(`COMMERCIAL: Good air quality (${analysis.environment.airQuality}%) enhances worker productivity by 15% and reduces sick days. Market as premium wellness office space to command 20% higher rents.`);
      }
    }
    
    if (development.id === 'industrial') {
      if (analysis.terrain.slope < 5 && analysis.infrastructure.connectivity > 60) {
        recommendations.push(`INDUSTRIAL: Flat terrain (${analysis.terrain.slope.toFixed(1)}% slope) and highway access reduce logistics costs by 25%. Ideal for manufacturing with 10.5% ROI and expansion potential.`);
      }
      if (analysis.infrastructure.population < 40) {
        recommendations.push(`INDUSTRIAL: Low population density (${analysis.infrastructure.population}%) minimizes community conflicts and NIMBY issues. Fast-track permitting expected with 6-month approval timeline.`);
      }
    }
    
    if (development.id === 'hospital') {
      if (analysis.infrastructure.connectivity > 50) {
        recommendations.push(`HEALTHCARE: Excellent accessibility (${analysis.infrastructure.connectivity}% connectivity) critical for emergency services. 5-minute response time achievable, serving 50,000+ population within 10km radius.`);
      }
      if (analysis.terrain.slope < 8) {
        recommendations.push(`HEALTHCARE: Stable terrain (${analysis.terrain.slope.toFixed(1)}% slope) supports heavy medical equipment and reduces foundation costs by 18%. Essential for MRI and CT scanner installations.`);
      }
    }
    
    if (development.id === 'school') {
      if (analysis.infrastructure.population > 50 && analysis.environment.vegetation > 60) {
        recommendations.push(`EDUCATION: Strong demand with ${analysis.infrastructure.population}% population density and green environment. Natural setting improves learning outcomes by 12% and supports environmental education programs.`);
      }
      if (analysis.terrain.slope < 5) {
        recommendations.push(`EDUCATION: Flat terrain (${analysis.terrain.slope.toFixed(1)}% slope) ideal for sports facilities and accessibility. ADA compliance costs reduced by 30% with universal design integration.`);
      }
    }
    
    if (development.id === 'mixed') {
      if (analysis.infrastructure.population > 70 && analysis.infrastructure.connectivity > 70) {
        recommendations.push(`MIXED-USE: Perfect urban density (${analysis.infrastructure.population}%) with transit access (${analysis.infrastructure.connectivity}%). Creates 24/7 activity hub with 11% ROI and $50M economic impact over 10 years.`);
      }
      if (analysis.environment.vegetation > 50 && analysis.environment.airQuality > 50) {
        recommendations.push(`MIXED-USE: Healthy environment supports live-work-play lifestyle. Premium positioning achievable with 20% higher lease rates due to quality of life benefits.`);
      }
    }
    
    // Pollution impact recommendations with mitigation costs
    if (impacts.pollution > 8) {
      recommendations.push(`MITIGATION: Expected pollution impact (${impacts.pollution}/15) requires $750K investment in electrostatic precipitators and green walls. Achieve 90% emission reduction and qualify for green building certifications.`);
    }
    
    // Traffic impact with solutions
    if (impacts.traffic > 8) {
      recommendations.push(`TRAFFIC: High traffic impact (${impacts.traffic}/15) mitigated through $1.2M investment in dedicated turn lanes and signal synchronization. Reduces congestion by 40% and improves Level of Service rating from F to C.`);
    }
    
    return recommendations;
  };

  const assessDevelopmentFeasibility = (development, analysis) => {
    let score = 100;
    
    // Terrain suitability
    if (analysis.terrain.slope > 15) score -= 20;
    else if (analysis.terrain.slope > 10) score -= 10;
    
    // Infrastructure availability
    if (analysis.infrastructure.connectivity < 40) score -= 15;
    else if (analysis.infrastructure.connectivity < 60) score -= 5;
    
    // Environmental constraints
    if (analysis.environment.vegetation > 90) score -= 10;
    if (analysis.environment.airQuality < 30) score -= 10;
    
    // Development type specific factors
    if (development.id === 'industrial' && analysis.infrastructure.population > 70) score -= 15;
    if (development.id === 'hospital' && analysis.infrastructure.connectivity < 50) score -= 10;
    
    if (score > 80) return 'excellent';
    if (score > 60) return 'good';
    if (score > 40) return 'moderate';
    return 'challenging';
  };

  const generateDevelopmentTimeline = (development, analysis) => {
    const baseTimeline = {
      residential: 24, // months
      commercial: 30,
      industrial: 36,
      hospital: 48,
      school: 18,
      mixed: 42
    };
    
    let timeline = baseTimeline[development.id] || 24;
    
    // Adjust for location factors
    if (analysis.terrain.slope > 10) timeline *= 1.3;
    if (analysis.infrastructure.connectivity < 50) timeline *= 1.2;
    if (analysis.environment.vegetation > 80) timeline *= 1.1;
    
    return Math.round(timeline);
  };

  const calculateReturnOnInvestment = (development, analysis) => {
    const baseROI = {
      residential: 8.5,
      commercial: 12.0,
      industrial: 10.5,
      hospital: 6.5,
      school: 7.0,
      mixed: 11.0
    };
    
    let roi = baseROI[development.id] || 8.0;
    
    // Location adjustments
    if (analysis.infrastructure.connectivity > 70) roi *= 1.2;
    if (analysis.infrastructure.population > 70) roi *= 1.1;
    if (analysis.terrain.slope > 10) roi *= 0.9;
    
    return roi.toFixed(1);
  };

  return (
    <div className="digital-twin-enhanced">
      {/* Header with Location Analysis */}
      <div className="twin-header">
        <div className="twin-title">
          <h3>🌍 Location Intelligence Digital Twin</h3>
          <p className="twin-subtitle">Advanced Development Impact Simulation</p>
        </div>
        
        {locationAnalysis && (
          <div className="location-summary">
            <div className="location-metric">
              <span className="metric-label">Terrain</span>
              <span className={`metric-value ${locationAnalysis.terrain.stability}`}>
                {locationAnalysis.terrain.stability}
              </span>
            </div>
            <div className="location-metric">
              <span className="metric-label">Environment</span>
              <span className="metric-value">
                {environmentalMetrics?.sustainabilityScore || 0}%
              </span>
            </div>
            <div className="location-metric">
              <span className="metric-label">Infrastructure</span>
              <span className="metric-value">
                {locationAnalysis.infrastructure.connectivity}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="twin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'development' ? 'active' : ''}`}
          onClick={() => setActiveTab('development')}
        >
          🏗️ Development Types
        </button>
        <button 
          className={`tab-btn ${activeTab === 'environment' ? 'active' : ''}`}
          onClick={() => setActiveTab('environment')}
        >
          🌿 Environmental Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          📊 Impact Simulation
        </button>
      </div>

      {/* Tab Content */}
      <div className="twin-content">
        {activeTab === 'development' && (
          <div className="development-selection">
            <div className="dev-grid">
              {developmentTypes.map(dev => (
                <div 
                  key={dev.id}
                  className={`dev-card ${selectedDevelopment?.id === dev.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDevelopment(dev)}
                  style={{ borderColor: dev.color }}
                >
                  <div className="dev-icon">{dev.icon}</div>
                  <div className="dev-info">
                    <h4>{dev.name}</h4>
                    <p>{dev.description}</p>
                    <div className="dev-features">
                      {dev.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                    <div className="dev-suitability">
                      <span className="suitability-label">Best for:</span>
                      <div className="suitability-tags">
                        {dev.suitability.map((suit, idx) => (
                          <span key={idx} className="suitability-tag">{suit}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'environment' && environmentalMetrics && (
          <div className="environmental-dashboard">
            <div className="env-grid">
              <div className="env-card">
                <div className="env-header">
                  <span className="env-icon">🌡️</span>
                  <h4>Carbon Footprint</h4>
                </div>
                <div className="env-value">
                  {environmentalMetrics.carbonFootprint} kg CO₂/m²/year
                </div>
                <div className="env-bar">
                  <div className="env-fill" style={{ width: `${Math.min(environmentalMetrics.carbonFootprint / 2, 100)}%` }}></div>
                </div>
              </div>

              <div className="env-card">
                <div className="env-header">
                  <span className="env-icon">🦋</span>
                  <h4>Biodiversity Impact</h4>
                </div>
                <div className="env-value">
                  {environmentalMetrics.biodiversityImpact}
                </div>
                <div className={`env-indicator ${environmentalMetrics.biodiversityImpact}`}>
                  <div className="indicator-dot"></div>
                </div>
              </div>

              <div className="env-card">
                <div className="env-header">
                  <span className="env-icon">💧</span>
                  <h4>Water Usage</h4>
                </div>
                <div className="env-value">
                  {environmentalMetrics.waterUsage} L/m²/year
                </div>
                <div className="env-bar">
                  <div className="env-fill water" style={{ width: `${Math.min(environmentalMetrics.waterUsage / 3, 100)}%` }}></div>
                </div>
              </div>

              <div className="env-card">
                <div className="env-header">
                  <span className="env-icon">⚡</span>
                  <h4>Energy Efficiency</h4>
                </div>
                <div className="env-value">
                  {environmentalMetrics.energyEfficiency}%
                </div>
                <div className="env-bar">
                  <div className="env-fill energy" style={{ width: `${environmentalMetrics.energyEfficiency}%` }}></div>
                </div>
              </div>

              <div className="env-card">
                <div className="env-header">
                  <span className="env-icon">🌱</span>
                  <h4>Sustainability Score</h4>
                </div>
                <div className="env-value">
                  {environmentalMetrics.sustainabilityScore}%
                </div>
                <div className="env-bar">
                  <div className="env-fill sustainability" style={{ width: `${environmentalMetrics.sustainabilityScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulation' && (
          <div className="simulation-panel">
            {!selectedDevelopment ? (
              <div className="select-dev-prompt">
                <div className="prompt-icon">🏗️</div>
                <h3>Select a Development Type</h3>
                <p>Choose from the Development Types tab to begin simulation</p>
              </div>
            ) : (
              <div className="simulation-active">
                <div className="selected-dev-summary">
                  <div className="selected-dev-icon" style={{ backgroundColor: selectedDevelopment.color }}>
                    {selectedDevelopment.icon}
                  </div>
                  <div className="selected-dev-info">
                    <h4>{selectedDevelopment.name}</h4>
                    <p>{selectedDevelopment.description}</p>
                  </div>
                </div>

                <button 
                  className={`simulate-btn ${isCalculating ? 'calculating' : ''}`}
                  onClick={runAdvancedSimulation}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <div className="loading-spinner"></div>
                      Analyzing Location Impact...
                    </>
                  ) : (
                    <>
                      🚀 Run Advanced Simulation
                    </>
                  )}
                </button>

                {simulationResults && (
                  <div className="simulation-results">
                    <div className="results-header">
                      <h4>📊 Impact Analysis Results</h4>
                      <div className="feasibility-badge">
                        Feasibility: <span className={`feasibility-${simulationResults.feasibility}`}>
                          {simulationResults.feasibility}
                        </span>
                      </div>
                    </div>

                    <div className="results-grid">
                      <div className="result-card">
                        <h5>Environmental Impact</h5>
                        <div className="impact-metrics">
                          <div className="metric">
                            <span>Pollution</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${simulationResults.impacts.pollution * 4}%` }}></div>
                            </div>
                            <span>{simulationResults.impacts.pollution}</span>
                          </div>
                          <div className="metric">
                            <span>Traffic</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${simulationResults.impacts.traffic * 4}%` }}></div>
                            </div>
                            <span>{simulationResults.impacts.traffic}</span>
                          </div>
                          <div className="metric">
                            <span>Infrastructure</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${simulationResults.impacts.infrastructure * 4}%` }}></div>
                            </div>
                            <span>{simulationResults.impacts.infrastructure}</span>
                          </div>
                        </div>
                      </div>

                      <div className="result-card">
                        <h5>Economic Analysis</h5>
                        <div className="economic-metrics">
                          <div className="metric">
                            <span>ROI</span>
                            <span className="roi-value">{simulationResults.roi}%</span>
                          </div>
                          <div className="metric">
                            <span>Timeline</span>
                            <span>{simulationResults.timeline} months</span>
                          </div>
                          <div className="metric">
                            <span>Population Impact</span>
                            <span>{simulationResults.impacts.population}</span>
                          </div>
                        </div>
                      </div>

                      <div className="result-card full-width">
                        <h5>🎯 Location-Specific Recommendations</h5>
                        <ul className="recommendations">
                          {simulationResults.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalTwin;
