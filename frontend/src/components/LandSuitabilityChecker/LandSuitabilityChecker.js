import React, { useState, useEffect, useCallback, useRef, memo, } from "react";
// import { Marker, useMap, useMapEvents } from "react-leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from "react-leaflet";
import FactorBar from "../FactorBar/FactorBar";
import SideBar from "../SideBar/SideBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ProMap from '../ProMap/ProMap';
import "./LandSuitabilityChecker.css";
import TopNav from "../TopNav/TopNav";
import RadarChart from "../RadarChart/RadarChart";
import WeatherCard from '../Weather/WeatherCard';
import HazardsCard from '../HazardsCard/HazardsCard';
import SnapshotGeo from '../SnapshotGeo/SnapshotGeo';
import DigitalTwin from '../DigitalTwin/DigitalTwin';
import WeatherEffects from '../WeatherEffects/WeatherEffects';
import GlobalSyncDock from "../GlobalSyncDock.js/GlobalSyncDock";
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import GeoGPT from '../GeoGPT/GeoGPT';
import AudioLandscape from "../AudioLandscape/AudioLandscape";
import { API_BASE } from '../../config/api';

// Audio Context for Global Audio Management


// Fix Leaflet marker icons with local fallback
delete L.Icon.Default.prototype._getIconUrl;

// Use jsdelivr CDN (less likely to be blocked by tracking prevention)
const iconUrls = {
  iconRetinaUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
};

L.Icon.Default.mergeOptions(iconUrls);

// const spectralLayers = {

//   standard: null,

//   ndvi: "https://services.sentinel-hub.com/ogc/wms/YOUR_API_KEY?LAYER=NDVI&...",

//   thermal: "https://services.sentinel-hub.com/ogc/wms/YOUR_API_KEY?LAYER=THERMAL&...",

//   hydrology: "https://your-backend-api.com/hydrology/{z}/{x}/{y}.png"

// };

const spectralLayers = {

  standard: null,



  ndvi: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",



  thermal: "https://tiles.maps.eox.at/wmts/1.0.0/terrain-light_3857/default/g/{z}/{y}/{x}.jpg",



  hydrology: "https://tiles.maps.eox.at/wmts/1.0.0/hydrography_3857/default/g/{z}/{y}/{x}.jpg"

};



const varieties = {

  streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

  satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",

  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",

  terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",

  roads: "https://mt1.google.com/vt/lyrs=h&x={x}/{y}&z={z}",

  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",

  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",

  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",

  topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",

  watercolor: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"

};



/** * UTILITY: Moved outside to avoid unnecessary dependency warnings 

 */

const isNearbyDevice = (lat1, lng1, deviceLoc) => {

  if (!deviceLoc || !deviceLoc.lat || !deviceLoc.lng) return false;

  return (

    parseFloat(lat1).toFixed(4) === deviceLoc.lat &&

    parseFloat(lng1).toFixed(4) === deviceLoc.lng

  );

};



const getSitePotential = (factors, activeSpectral) => {

  const potentials = [];



  if (!factors) return potentials;



  // --------------------------------------------------

  // NORMALIZE FACTORS (single source of truth)

  // --------------------------------------------------

  const f = {

    // Hydrology (4)

    flood: factors?.hydrology?.flood?.value ?? 50,

    water: factors?.hydrology?.water?.value ?? 50,

    drainage: factors?.hydrology?.drainage?.value ?? 50,

    groundwater: factors?.hydrology?.groundwater?.value ?? 50,

    // Environmental (5)

    pollution: factors?.environmental?.pollution?.value ?? 50,

    soil: factors?.environmental?.soil?.value ?? 50,

    vegetation: factors?.environmental?.vegetation?.value ?? 50,

    biodiversity: factors?.environmental?.biodiversity?.value ?? 50,

    heatIsland: factors?.environmental?.heat_island?.value ?? 50,

    // Climatic (3)

    rainfall: factors?.climatic?.rainfall?.value ?? 50,

    thermal: factors?.climatic?.thermal?.value ?? 50,

    heatIntensity: factors?.climatic?.intensity?.value ?? 50,

    // Socio-economic (3)

    infrastructure: factors?.socio_econ?.infrastructure?.value ?? 50,

    landuse: factors?.socio_econ?.landuse?.value ?? 50,

    population: factors?.socio_econ?.population?.value ?? 50,

    // Physical (4)

    slope: factors?.physical?.slope?.value ?? 50,

    elevation: factors?.physical?.elevation?.value ?? 50,

    ruggedness: factors?.physical?.ruggedness?.value ?? 50,

    stability: factors?.physical?.stability?.value ?? 50,

    // Risk & Resilience (4)

    multiHazard: factors?.risk_resilience?.multi_hazard?.value ?? 50,

    climateChange: factors?.risk_resilience?.climate_change?.value ?? 50,

    recovery: factors?.risk_resilience?.recovery?.value ?? 50,

    habitability: factors?.risk_resilience?.habitability?.value ?? 50,

  };



  // --------------------------------------------------

  // 1) HARD RISK DETECTION (RESTRICTION ZONE)

  // --------------------------------------------------

  const hazards = [];



  if (f.flood < 40) hazards.push("FLOOD RISK");

  if (f.pollution < 35) hazards.push("AIR QUALITY");

  if ((f.slope ?? 100) < 35) hazards.push("STEEP TERRAIN");



  if (f.drainage < 40) hazards.push("POOR DRAINAGE");

  if (f.heatIntensity > 70) hazards.push("HIGH HEAT STRESS");



  if (hazards.length > 0) {

    const detail = [];

    if (f.flood < 40) detail.push(`flood safety ${f.flood.toFixed(0)}/100`);

    if (f.pollution < 35) detail.push(`air quality ${f.pollution.toFixed(0)}/100`);

    if ((f.slope ?? 100) < 35) detail.push(`slope suitability ${(f.slope ?? 0).toFixed(0)}/100 (steep)`);

    if (f.drainage < 40) detail.push(`drainage ${f.drainage.toFixed(0)}/100`);

    if (f.heatIntensity > 70) detail.push(`heat stress ${f.heatIntensity.toFixed(0)}/100`);

    potentials.push({

      type: "Risk",

      label: "Development Constraints",

      class: "pot-red",

      icon: "⚠",

      reason: `Critical limitations: ${hazards.join(" & ")}. ${detail.length ? `Numericals: ${detail.join("; ")}. ` : ""}Construction may require advanced mitigation or be restricted to conservation or low-impact usage.`,

    });

  }



  // --------------------------------------------------

  // 2) RESIDENTIAL SUITABILITY

  // --------------------------------------------------

  if (

    f.flood > 55 &&

    f.pollution > 50 &&

    f.thermal > 55 &&

    f.infrastructure > 50 &&

    (f.slope ?? 50) > 70

  ) {

    const comfortDriver =

      f.pollution > 70

        ? "clean air quality"

        : f.thermal > 70

          ? "comfortable climate conditions"

          : "stable terrain conditions";



    potentials.push({

      type: "Residential",

      label: "Residential Development",

      class: "pot-green",

      icon: "🏠",

      reason: `Well-suited for housing due to ${comfortDriver}, manageable flood exposure, and good infrastructure accessibility.`,

    });

  }



  // --------------------------------------------------

  // 3) AGRICULTURAL POTENTIAL (only when vegetation supports it)

  // --------------------------------------------------

  const veg = f.vegetation ?? 50;

  if (

    veg >= 45 &&

    ((f.soil > 60 && f.rainfall > 50) || (f.soil > 55 && f.water > 60))

  ) {

    const agriDriver =

      f.soil > f.rainfall

        ? "high soil fertility"

        : "reliable rainfall and water availability";



    potentials.push({

      type: "Agricultural",

      label: "Agricultural Suitability",

      class: "pot-blue",

      icon: "🚜",

      reason: `Favorable for farming driven by ${agriDriver}. Vegetation index ${veg.toFixed(0)}/100 supports crop potential. Suitable for sustained crop cycles with moderate water management.`,

    });

  }



  // --------------------------------------------------

  // 4) INDUSTRIAL / LOGISTICS POTENTIAL

  // --------------------------------------------------

  if (

    f.infrastructure > 65 &&

    f.landuse > 45 &&

    f.flood > 50 &&

    f.pollution > 40

  ) {

    potentials.push({

      type: "Industrial",

      label: "Logistics & Industrial Use",

      class: "pot-purple",

      icon: "🏭",

      reason: `Strategically positioned: infrastructure ${f.infrastructure.toFixed(0)}/100, land-use ${f.landuse.toFixed(0)}/100, flood safety ${f.flood.toFixed(0)}/100, pollution ${f.pollution.toFixed(0)}/100. Compatible for logistics and industrial use.`,

    });

  }



  // --------------------------------------------------

  // 5) CONSERVATION / LOW-IMPACT ZONE (NEW, MEANINGFUL)

  // --------------------------------------------------

  if (

    f.vegetation > 70 &&

    f.landuse < 40 &&

    f.population < 40

  ) {

    potentials.push({

      type: "Conservation",

      label: "Ecological Conservation Value",

      class: "pot-green",

      icon: "🌳",

      reason:

        "High vegetation density and low human footprint indicate strong ecological value. Best suited for conservation, eco-tourism, or carbon-offset initiatives.",

    });

  }



  // --------------------------------------------------

  // 6) SPECTRAL-AWARE WARNINGS (CONTEXTUAL)

  // --------------------------------------------------

  if (activeSpectral === "hydrology" && f.flood < 50) {

    potentials.push({

      type: "Risk",

      label: "Hydrological Accumulation Zone",

      class: "pot-red",

      icon: "🌊",

      reason:

        "Hydrology overlay indicates water convergence and potential surface runoff accumulation during heavy rainfall events.",

    });

  }



  if (activeSpectral === "thermal" && f.heatIntensity > 65) {

    potentials.push({

      type: "Climate",

      label: "Urban Heat Stress",

      class: "pot-blue",

      icon: "🌡",

      reason:

        "Thermal overlay reveals elevated heat stress. Passive cooling, green roofing, and vegetation buffers are recommended.",

    });

  }



  return potentials;

};



// const PotentialSection = ({ factors, score }) => {

//   const recommendations = getSitePotential(factors);

//   const rating = score > 80 ? "A" : score > 60 ? "B" : score > 40 ? "C" : "F";



//   return (

//     <div className="card potential-card glass-morphic" style={{ marginBottom: '16px' }}>

//       <div className="potential-header">

//         <div className="title-stack">

//           <h3>Site Potential Analysis</h3>

//           <p className="subtitle">Algorithmic Terrain Synthesis</p>

//         </div>

//         <div className="rating-badge-container">

//             <span className="rating-label">Grade</span>

//             <span className={`rating-letter grade-${rating}`}>{rating}</span>

//         </div>

//       </div>

//       <div className="recommendations-list">

//         {recommendations.map((rec, idx) => (

//           <div key={idx} className={`potential-item ${rec.class}`}>

//             <div className="potential-tag-row">

//               <span className="potential-icon">{rec.icon}</span>

//               <span className="potential-label">{rec.label}</span>

//             </div>

//             <p className="potential-reason">{rec.reason}</p>

//           </div>

//         ))}

//       </div>

//     </div>

//   );

// };



const PotentialSection = ({ factors, score, scoreHidden }) => {

  const recommendations = getSitePotential(factors);

  const rating = scoreHidden ? "-" : (score > 80 ? "A" : score > 60 ? "B" : score > 40 ? "C" : "F");



  return (

    <div className="card potential-card glass-morphic" style={{ marginBottom: '16px' }}>

      <div className="potential-header enhanced-header">

        <div className="title-stack">

          <h3>Site Potential Analysis</h3>

          <p className="subtitle">Algorithmic Terrain Synthesis</p>

        </div>



        {/* Force these to be side-by-side with a new wrapper class */}

        <div className="geo-score-container">

          <div className="index-box">

            {/* <span className="geo-label">INDEX</span> */}

            <span className="geo-value">{scoreHidden ? "-" : `${score?.toFixed(0)}%`}</span>

          </div>

          <div className={`grade-box grade-${rating}`}>

            <span className="geo-label forced-white-label">GRADE</span>

            <span className="geo-value">{rating}</span>

          </div>

        </div>

      </div>



      <div className="recommendations-list">

        {recommendations.map((rec, idx) => (

          <div key={idx} className={`potential-item ${rec.class}`}>

            <div className="potential-tag-row">

              <span className="potential-icon">{rec.icon}</span>

              <span className="potential-label">{rec.label}</span>

            </div>

            <p className="potential-reason">{rec.reason}</p>

          </div>

        ))}

      </div>

    </div>

  );

};



const FactorsSection = memo(({



  data, latVal, lngVal, locationName, isDarkMode, viewMode, setViewMode,

  onOpenHistory, mapVariety, isCompareMode, activeSpectral, mapMode,

  active3DStyle, setLat, setLng, isSelectingB, handleCompareSelect,

  currentZoom, setCurrentZoom, zoom,lastAnalyzedTime// CLEAN NAMES

}) => {



  const nLat = parseFloat(latVal);

  const nLng = parseFloat(lngVal);

  const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

  const { factors, category_scores, suitability_score, raw_suitability_score, score_hidden } = data;
  const numericSuitabilityScore = Number.isFinite(raw_suitability_score) ? raw_suitability_score : suitability_score;
  const forcedHiddenByContext =
    /Not Suitable \(Water Body\)|Not Suitable \(Protected\/Forest Area\)/i.test(String(data?.label || "")) ||
    Boolean(data?.water_body_snippet) ||
    Boolean(data?.protected_snippet);
  const isScoreHidden = Boolean(score_hidden || data?.is_hard_unsuitable || forcedHiddenByContext);
  const suitabilityDisplay = isScoreHidden ? "-" : (Number.isFinite(numericSuitabilityScore) ? numericSuitabilityScore.toFixed(1) : "-");



  // Metadata for categorized headers

  const categoryConfig = {

    physical_terrain: { icon: "⛰", label: "Physical Terrain" },

    hydrology: { icon: "💧", label: "Hydrology" },

    environmental: { icon: "🌿", label: "Environmental" },

    climatic: { icon: "🌤", label: "Climatic" },

    socio_econ: { icon: "🏗️", label: "Socio-Economic" },

    risk_resilience: { icon: "🛡", label: "Risk & Resilience" }

  };



  const FactorCard = (

    <div className="card factors-card glass-morphic">

      <div className="factors-header">

        <div className="title-stack">

          <h3>Terrain Intelligence</h3>

          <p className="subtitle">23-Factor Geospatial Synthesis</p>

        </div>

        <button className="view-toggle" onClick={() => setViewMode(viewMode === "bars" ? "radar" : "bars")}>

          {viewMode === "bars" ? "🕸 Radar View" : "📊 Bar View"}

        </button>

      </div>



      {viewMode === "bars" ? (

        <div className="categories-wrapper">

          {/* Loop through each of the 6 Major Categories */}

          {Object.entries(factors).map(([catKey, catFactors]) => (

            <div key={catKey} className="factor-category-group animate-in">



              {/* MAJOR CATEGORY HEADER */}

              <div className="category-sub-header">

                <div className="cat-title">

                  <span className="cat-icon">{categoryConfig[catKey]?.icon || "📂"}</span>

                  <span className="cat-label">{categoryConfig[catKey]?.label || catKey}</span>

                </div>

                <span className="cat-score-badge">

                  {category_scores?.[catKey]?.toFixed(0) || 0}%

                </span>

              </div>



              {/* INDIVIDUAL SUB-FACTORS (The 23 Factors) */}

              <div className="bars-container categorized">

                {Object.entries(catFactors).map(([fKey, fData]) => {

                  const rawVal = typeof fData === 'object' ? (fData.scaled_score ?? fData.value) : fData;

                  const displayVal = Math.min(100, Math.max(0, Number(rawVal) || 0));

                  return (

                    <FactorBar

                      key={fKey}

                      label={fKey.replace(/_/g, ' ').toUpperCase()}

                      value={displayVal}

                    />

                  );
                })}

              </div>

            </div>

          ))}



          {/* TOTAL SUITABILITY SUMMARY */}

          <div className="suitability-summation-bar">

            <label>Aggregated Index</label>

            <div className="summation-value">

              <strong>{isScoreHidden ? suitabilityDisplay : `${suitabilityDisplay}%`}</strong>

            </div>

          </div>

        </div>

        // Inside FactorsSection memo, update the RadarChart component call:

      ) : (

        <div className="radar-container" style={{ height: '350px', width: '100%', position: 'relative' }}>

          <RadarChart

            key={`radar-${nLat}-${nLng}`}

            data={Object.values(factors).reduce((acc, cat) => ({ ...acc, ...cat }), {})}

            isDarkMode={isDarkMode}

            categoryScores={category_scores}

          />

        </div>

      )}

    </div>

  );

  return (

    <>

      <div className={`card hero-card glass-morphic ${!isScoreHidden && numericSuitabilityScore < 40 ? 'danger-glow' : ''}`}>



        <div className="mini-map-context">

          {isValidCoords ? (

            mapMode === "2D" ? (

              /* 2D Minimap */

              <MapContainer

                center={[nLat, nLng]}

                // zoom={15} 

                zoom={16}               // REQUIRED: Pass the state

                // key={`map-2d-${zoom}`}

                zoomControl={false}

                dragging={false}

                scrollWheelZoom={false}    // LOCK: Prevents zooming inside the mini-card

                doubleClickZoom={false}

                touchZoom={false}

                style={{ height: "100%", width: "100%" }}

                key={`minimap-${nLat}-${nLng}`}

              >

                {/* This watches lat/lng and moves the engine */}

                <TileLayer url={varieties[mapVariety] || varieties.hybrid} />

                {/* Restored for minimap */}

                {activeSpectral !== "standard" && spectralLayers[activeSpectral] && (

                  <TileLayer

                    key={activeSpectral}

                    url={spectralLayers[activeSpectral]}

                    opacity={0.7}

                    zIndex={100}

                  />

                )}



                {/* Use a simple Marker instead of LocationMarker to keep it static */}

                {isValidCoords && <Marker position={[nLat, nLng]} />}

              </MapContainer>

            ) : (

              /* 3D Minimap */

              <ProMap

                lat={nLat}

                lng={nLng}

                setLat={setLat} // Fixed: Passing setter to 3D

                setLng={setLng}

                // zoom={currentZoom}

                zoom={16}

                factors={data.factors}

                isDarkMode={isDarkMode}

                activeStyle={active3DStyle}

                interactive={false}

              />

            )

          ) : (

            <div className="empty-results" style={{ fontSize: '11px' }}>Awaiting Analysis...</div>

          )}

          <div className="mini-map-label">{mapMode} Tactical Preview</div>

        </div>







        <div className="card-coordinates">

          <span>LAT: {isValidCoords ? nLat.toFixed(4) : "0.0000"}</span>

          <span>LNG: {isValidCoords ? nLng.toFixed(4) : "0.0000"}</span>

        </div>



        <div className="suitability-header-row">

          <h3>Suitability Intelligence</h3>

        </div>



        <div className="score-value" style={{ "--score-color": isScoreHidden ? "#9ca3af" : (numericSuitabilityScore < 40 ? "#ef4444" : numericSuitabilityScore < 70 ? "#f59e0b" : "#10b981") }}>

          {suitabilityDisplay}

        </div>

        <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
        {isScoreHidden && data.score_hidden_reason && (
          <div className="suitability-snippet">
            <span className="snippet-protected">{data.score_hidden_reason}</span>
          </div>
        )}

        {(data.water_body_snippet || data.protected_snippet) && (

          <div className="suitability-snippet">

            {data.water_body_snippet && (

              <span className="snippet-water">Located on: <strong>{data.water_body_snippet}</strong></span>

            )}

            {data.protected_snippet && (

              <span className="snippet-protected">Protected / Forest: <strong>{data.protected_snippet}</strong></span>

            )}

          </div>

        )}
        {/* NEW: INDEPENDENT TIMESTAMP UI */}
{/* {lastAnalyzedTime && (
    <div className="card-timestamp-footer">
        <span className="ts-label">LAST ANALYZED:</span>
        <span className="ts-value">{lastAnalyzedTime}</span>
    </div>
)} */}
{/* Inside the hero-card div, right before .history-action-container */}
{lastAnalyzedTime && (
    <div className="tactical-timestamp-box">
        <div className="ts-indicator">
            <span className="ts-pulse"></span>
            <span className="ts-label">ANALYZED AT:</span>
        </div>
        <div className="ts-value-wrapper">
            <span className="ts-date">{lastAnalyzedTime.split(',')[0]}</span>
            <span className="ts-divider">|</span>
            <span className="ts-time">{lastAnalyzedTime.split(',')[1].split(' [')[0]}</span>
        </div>
    </div>
)}
        <div className="history-action-container">

          <button

            className="history-pro-btn"

            onClick={() => onOpenHistory(data, locationName, latVal, lngVal)}

            title="Execute Temporal Analysis"

          >

            <span className="pulse-dot"></span>

            <span className="btn-text">ANALYZE HISTORICAL TRENDS</span>

            <span className="btn-icon">→</span>

          </button>

        </div>

      </div>

      {/* 2. Factor Card: Terrain Factors (Charts/Bars) */}

      {FactorCard}





    </>

  );

});



/* --- Sync map center to state on pan (so zoom +/- uses current view) --- */

const MapCenterSync = ({ setViewCenter }) => {

  const map = useMap();

  useMapEvents({

    moveend() {

      const c = map.getCenter();

      if (c && setViewCenter) setViewCenter([c.lat, c.lng]);

    },

  });

  return null;

};



/* --- TACTICAL MAP CONTROLLER --- */

const TacticalMapController = ({

  latA, lngA, latB, lngB, currentLat, currentLng,

  setLat, setLng, isSelectingB, setBLatInput, setBLngInput,

  isTacticalMode, setViewCenter, setZoom

}) => {

  const map = useMap();



  useMapEvents({

    click(e) {

      const clickedLat = e.latlng.lat.toString();

      const clickedLng = e.latlng.lng.toString();

      const pt = [e.latlng.lat, e.latlng.lng];

      if (setViewCenter) setViewCenter(pt);

      if (isSelectingB) {

        setBLatInput(clickedLat);

        setBLngInput(clickedLng);

      } else {

        setLat(clickedLat);

        setLng(clickedLng);

      }

    },

  });



  useEffect(() => {

    const duration = 1.2;

    window.snapToA = () => {

      const nLat = parseFloat(latA);

      const nLng = parseFloat(lngA);

      if (Number.isFinite(nLat) && Number.isFinite(nLng)) {

        map.flyTo([nLat, nLng], 16, { animate: true, duration });

        if (setZoom) setZoom(16);

      }

    };

    window.snapToB = () => {

      const nLat = parseFloat(latB);

      const nLng = parseFloat(lngB);

      if (Number.isFinite(nLat) && Number.isFinite(nLng)) {

        map.flyTo([nLat, nLng], 16, { animate: true, duration });

        if (setZoom) setZoom(16);

      }

    };

    window.snapToLive = () => {

      // Check if map exists before proceeding

      if (!map) {

        console.warn('Map not initialized yet');

        return;

      }



      // Get actual device location using geolocation API

      if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

          (pos) => {

            const deviceLat = pos.coords.latitude;

            const deviceLng = pos.coords.longitude;

            if (Number.isFinite(deviceLat) && Number.isFinite(deviceLng)) {

              map.flyTo([deviceLat, deviceLng], 16, { animate: true, duration });

              if (setZoom) setZoom(16);

              // Also update the lat/lng state to reflect device location

              setLat(deviceLat.toString());

              setLng(deviceLng.toString());

            }

          },

          (error) => {

            console.error('Error getting device location:', error);

            // Fallback to currentLat/currentLng if geolocation fails

            const nLat = parseFloat(currentLat);

            const nLng = parseFloat(currentLng);

            if (Number.isFinite(nLat) && Number.isFinite(nLng)) {

              map.flyTo([nLat, nLng], 16, { animate: true, duration });

              if (setZoom) setZoom(16);

            }

          }

        );

      } else {

        // Fallback to currentLat/currentLng if geolocation not available

        const nLat = parseFloat(currentLat);

        const nLng = parseFloat(currentLng);

        if (Number.isFinite(nLat) && Number.isFinite(nLng)) {

          map.flyTo([nLat, nLng], 16, { animate: true, duration });

          if (setZoom) setZoom(16);

        }

      }

    };

    return () => {

      delete window.snapToA;

      delete window.snapToB;

      delete window.snapToLive;

    };

  }, [map, latA, lngA, latB, lngB, currentLat, currentLng, setZoom, setLat, setLng]);



  // ðŸŽ¨ Icon Factory

  const createIcon = (color) => new L.Icon({
    iconUrl: `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
  });



  // Convert inputs to numbers safely for rendering

  const posA = [parseFloat(latA), parseFloat(lngA)];

  const posB = [parseFloat(latB), parseFloat(lngB)];

  const posLive = [parseFloat(currentLat), parseFloat(currentLng)];

  // Helper function to validate coordinates

  const isValidPosition = (pos) => Number.isFinite(pos[0]) && Number.isFinite(pos[1]);



  // ðŸš€ THE FIXED RETURN: Properly contained within the function braces

  return (

    <>

      {/* 🔵 SITE A: Visible only if Tactical Mode is ON */}
      {isTacticalMode && isValidPosition(posA) && (
        <Marker position={posA} icon={createIcon('blue')}>
          <Popup>Site A: Analyzed Target</Popup>
        </Marker>
      )}



      {/* 🔴 SITE B: Visible only if Tactical Mode is ON */}
      {isTacticalMode && isValidPosition(posB) && (
        <Marker position={posB} icon={createIcon('red')}>
          <Popup>Site B: Comparison Target</Popup>
        </Marker>
      )}



      {/* 🟢 LIVE POINTER: Always visible */}
      {isValidPosition(posLive) && (
        <Marker position={posLive} icon={createIcon('green')}>
          <Popup>Current Selection (Neutral)</Popup>
        </Marker>
      )}

    </>

  );

};



export default function LandSuitabilityChecker() {
  // Change the existing analysisTime to siteATime for clarity
const [siteATime, setSiteATime] = useState(() => localStorage.getItem("geo_last_analysis_time_a"));
const [siteBTime, setSiteBTime] = useState(() => localStorage.getItem("geo_last_analysis_time_b"));
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 1, 0));
  };

  const onProjectImport = (payload) => {
    // Restore Location A
    if (payload?.siteA?.lat != null) setLat(String(payload.siteA.lat));
    if (payload?.siteA?.lng != null) setLng(String(payload.siteA.lng));
    if (payload?.siteA?.name) setLocationAName(payload.siteA.name);

    // Restore Result A
    if (payload?.siteA?.result) {
      setResult(payload.siteA.result);
      setAnalyzedCoords({ lat: payload.siteA.lat, lng: payload.siteA.lng });
    }

    // Restore Compare Mode
    if (payload?.compare?.enabled && payload?.siteB?.lat && payload?.siteB?.lng) {
      setShowLocationB(true);
      setIsCompareMode(true);
      if (payload?.siteB?.lat != null) setBLatInput(String(payload.siteB.lat));
      if (payload?.siteB?.lng != null) setBLngInput(String(payload.siteB.lng));
      if (payload?.siteB?.name) setLocationBName(payload.siteB.name);
      if (payload?.siteB?.result) setCompareResult(payload.siteB.result);
      if (payload?.siteB?.lat != null && payload?.siteB?.lng != null) {
        setAnalyzedCoordsB({ lat: payload.siteB.lat, lng: payload.siteB.lng });
      }
    } else {
      setShowLocationB(false);
      setIsCompareMode(false);
      setCompareResult(null);
      setSnapshotDataB(null);
      localStorage.removeItem("geo_snapshot_data_b"); // Clear localStorage
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("geoai_restore_project_payload");
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);

      // --- Restore Location A
      if (payload?.siteA?.lat != null) setLat(String(payload.siteA.lat));
      if (payload?.siteA?.lng != null) setLng(String(payload.siteA.lng));
      if (payload?.siteA?.name) setLocationAName(payload.siteA.name);

      // --- Restore Result A
      if (payload?.siteA?.result) setResult(payload.siteA.result);

      // --- Restore Compare mode
      if (payload?.compare?.enabled) {
        setShowLocationB(true);
        setIsCompareMode(true);

        if (payload?.siteB?.lat != null) setBLatInput(String(payload.siteB.lat));
        if (payload?.siteB?.lng != null) setBLngInput(String(payload.siteB.lng));
        if (payload?.siteB?.name) setLocationBName(payload.siteB.name);

        if (payload?.siteB?.result) setCompareResult(payload.siteB.result);

        if (payload?.siteB?.lat != null && payload?.siteB?.lng != null) {
          setAnalyzedCoordsB({ lat: payload.siteB.lat, lng: payload.siteB.lng });
        }
      } else {
        setShowLocationB(false);
        setIsCompareMode(false);
      }

    } catch (e) {
      console.error("Restore project failed:", e);
    } finally {
      localStorage.removeItem("geoai_restore_project_payload");
      localStorage.removeItem("geoai_restore_project_name");
    }
  }, []);


  // 3. FULLSCREEN FIX: Add a null check to avoid the error you saw

  const toggleFullScreen = () => {

    const mapElement = mapViewportRef.current;

    if (!mapElement) return;



    if (!document.fullscreenElement) {

      mapElement.requestFullscreen().catch(err => {

        console.error("Fullscreen failed:", err);

      });

    } else {

      document.exitFullscreen();

    }

  };

  const [isTacticalMode, setIsTacticalMode] = useState(false);

  const [mapMode, setMapMode] = useState("2D"); // "2D" or "3D"

  const [active3DStyle, setActive3DStyle] = useState("satellite");

  const [areControlsCollapsed, setAreControlsCollapsed] = useState(false); // Controls collapse state

  const initialAnalysisRef = useRef(false); // Flag to prevent double execution on mount

  const [mobileCompareSite, setMobileCompareSite] = useState("A");

  const [deviceLocation, setDeviceLocation] = useState({ lat: null, lng: null });

  const [analysisHistory, setAnalysisHistory] = useState(() =>

    JSON.parse(localStorage.getItem("analysis_history")) || []

  );

  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Default ON
  const [siteAPlaying, setSiteAPlaying] = useState(true); // Default ON
  const [siteBPlaying, setSiteBPlaying] = useState(true); // Default ON when available




  const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");

  const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");

  const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);

  const [viewCenter, setViewCenter] = useState(() => {

    const slat = localStorage.getItem("geo_lat") || "17.385";

    const slng = localStorage.getItem("geo_lng") || "78.4867";

    return [parseFloat(slat) || 17.385, parseFloat(slng) || 78.4867];

  });

  const [mapVariety, setMapVariety] = useState(() => localStorage.getItem("geo_map_style") || "streets");

  const [activeTab, setActiveTab] = useState("suitability");

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const rawTheme = localStorage.getItem("geo_theme");
    return rawTheme === null ? true : JSON.parse(rawTheme);
  });

  const [adaptiveWeather, setAdaptiveWeather] = useState(() => JSON.parse(localStorage.getItem("geo_adaptive_weather")) || false);

  const [weatherOpacity, setWeatherOpacity] = useState(() => JSON.parse(localStorage.getItem("geo_weather_opacity")) || 30);

  // Separate weather adapters for Site A and Site B
  const [siteAWeather, setSiteAWeather] = useState(() => JSON.parse(localStorage.getItem("geo_site_a_weather")) || false);
  const [siteBWeather, setSiteBWeather] = useState(() => JSON.parse(localStorage.getItem("geo_site_b_weather")) || false);
  const [siteAOpacity, setSiteAOpacity] = useState(() => JSON.parse(localStorage.getItem("geo_site_a_opacity")) || 30);
  const [siteBOpacity, setSiteBOpacity] = useState(() => JSON.parse(localStorage.getItem("geo_site_b_opacity")) || 30);

  const [result, setResult] = useState(() => JSON.parse(localStorage.getItem("geo_last_result")) || null);
  const [closeSiteA, setCloseSiteA] = useState(false);

  // Handle Site A close action
  useEffect(() => {
    if (closeSiteA) {
      setResult(null);
      setAnalyzedCoords({ lat: null, lng: null });
      setCloseSiteA(false);
    }
  }, [closeSiteA]);

  // const [analysisTime, setAnalysisTime] = useState(() => {
  //   return localStorage.getItem("geo_last_analysis_time");
  // });

  const [compareResult, setCompareResult] = useState(() => JSON.parse(localStorage.getItem("geo_last_compare_result")) || null);

  const [isCompareMode, setIsCompareMode] = useState(() => JSON.parse(localStorage.getItem("geo_is_compare")) || false);

  const [showLocationB, setShowLocationB] = useState(() => JSON.parse(localStorage.getItem("geo_show_b")) || false);

  const [locationAName, setLocationAName] = useState(() => localStorage.getItem("geo_name_a") || "Site A");

  const [locationBName, setLocationBName] = useState(() => localStorage.getItem("geo_name_b") || "Site B");

  const SIDEBAR_MIN_WIDTH = 64;
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("sidebar_collapsed")) || false
  );
  const previousSidebarWidthRef = useRef(
    Number(localStorage.getItem("sidebar_width_expanded")) || Number(localStorage.getItem("sidebar_width")) || 320
  );

  const [bottomHeight, setBottomHeight] = useState(() => {
    const saved = Number(localStorage.getItem("bottom_height"));
    return saved > 0 ? saved : window.innerHeight * 0.5; // Default to 50% of viewport height
  });

  // LandSuitabilityChecker.js - At the top of the component



  const isResizingSide = useRef(false);

  const isResizingBottom = useRef(false);

  useEffect(() => {
    if (!isCompareMode) {
      setSiteBPlaying(false);
    }
  }, [isCompareMode, setSiteBPlaying]);

  // const [isCompareMode, setIsCompareMode] = useState(false);

  // const [compareResult, setCompareResult] = useState(null);

  const [compareName, setCompareName] = useState("");

  const [isSelectingB, setIsSelectingB] = useState(false);

  const [compareLoading, setCompareLoading] = useState(false);

  const [bLatInput, setBLatInput] = useState("");

  const [bLngInput, setBLngInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [debug] = useState(false);

  const [viewMode, setViewMode] = useState("bars");

  // Add these near your other useState calls

  const [analyzedCoords, setAnalyzedCoords] = useState(() => ({

    lat: localStorage.getItem("geo_lat_analyzed") || null,

    lng: localStorage.getItem("geo_lng_analyzed") || null

  }));



  const [analyzedCoordsB, setAnalyzedCoordsB] = useState(() => ({

    lat: localStorage.getItem("geo_lat_b_analyzed") || null,

    lng: localStorage.getItem("geo_lng_b_analyzed") || null

  }));

  const [editingIndex, setEditingIndex] = useState(null);

  const [editingName, setEditingName] = useState("");

  const [savedPlaces, setSavedPlaces] = useState(() => JSON.parse(localStorage.getItem("savedPlaces")) || []);

  // const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });

  // const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });

  // const [locationAName, setLocationAName] = useState("Site A");

  // const [locationBName, setLocationBName] = useState("Site B");

  // const [showLocationB, setShowLocationB] = useState(false);

  const [isBFromSavedPlace] = useState(false);



  const [showNearby, setShowNearby] = useState(false);

  const [nearbyData, setNearbyData] = useState(null);

  const [nearbyLoading, setNearbyLoading] = useState(false);

  const [nearbyDataB, setNearbyDataB] = useState(null);

  const [nearbyLoadingB, setNearbyLoadingB] = useState(false);

  const [showNearbyB, setShowNearbyB] = useState(false);

  const [snapshotData, setSnapshotData] = useState(() => JSON.parse(localStorage.getItem("geo_snapshot_data")) || null);
  const [snapshotDataB, setSnapshotDataB] = useState(() => JSON.parse(localStorage.getItem("geo_snapshot_data_b")) || null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  // Persist snapshot data to localStorage
  useEffect(() => {
    if (snapshotData) {
      localStorage.setItem("geo_snapshot_data", JSON.stringify(snapshotData));
    } else {
      localStorage.removeItem("geo_snapshot_data");
    }
  }, [snapshotData]);

  useEffect(() => {
    if (snapshotDataB) {
      localStorage.setItem("geo_snapshot_data_b", JSON.stringify(snapshotDataB));
    } else {
      localStorage.removeItem("geo_snapshot_data_b");
    }
  }, [snapshotDataB]);



  const [isGptOpen, setIsGptOpen] = useState(false);

  const [isAnalysisFullscreen, setIsAnalysisFullscreen] = useState(false);



  // State variables needed for Digital Twin functionality
  const [isDigitalTwinDragging, setIsDigitalTwinDragging] = useState(false);
  const [digitalTwinPosition, setDigitalTwinPosition] = useState({ x: 0, y: 0 });
  const [digitalTwinStart, setDigitalTwinStart] = useState({ x: 0, y: 0 });

  // Digital twin event handlers (moved here to fix variable scope)
  const handleDigitalTwinMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDigitalTwinDragging(true);
    setDigitalTwinStart({
      x: e.clientX - digitalTwinPosition.x,
      y: e.clientY - digitalTwinPosition.y,
    });
  }, [digitalTwinPosition]);

  const handleDigitalTwinMouseMove = useCallback((e) => {
    if (!isDigitalTwinDragging) return;

    const newX = e.clientX - digitalTwinStart.x;
    const newY = e.clientY - digitalTwinStart.y;

    setDigitalTwinPosition({ x: newX, y: newY });
  }, [isDigitalTwinDragging, digitalTwinStart]);

  const handleDigitalTwinMouseUp = useCallback(() => {
    setIsDigitalTwinDragging(false);
  }, []);

  // Manage digital twin event listeners
  useEffect(() => {
    if (isDigitalTwinDragging) {
      document.addEventListener("mousemove", handleDigitalTwinMouseMove);
      document.addEventListener("mouseup", handleDigitalTwinMouseUp);
      document.body.style.cursor = "grabbing";
    } else {
      document.removeEventListener("mousemove", handleDigitalTwinMouseMove);
      document.removeEventListener("mouseup", handleDigitalTwinMouseUp);
      document.body.style.cursor = "default";
    }

    return () => {
      document.removeEventListener("mousemove", handleDigitalTwinMouseMove);
      document.removeEventListener("mouseup", handleDigitalTwinMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isDigitalTwinDragging, handleDigitalTwinMouseMove, handleDigitalTwinMouseUp]);

  const [chatHistory] = useState([{ role: 'assistant', content: 'Hello! I\'m GeoGPT Intelligence. What would you like to know about our geospatial analysis?' }]);
  const chatEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [chatHistory, scrollToBottom]);

  const isVercelDeployed =
    typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");

  const fetchSnapshot = useCallback(async (tLat, tLng) => {
    const fallbackSnapshot = {
      identity: {
        name: "Location Snapshot",
        hierarchy: "Fallback",
        continent: "Global",
        full_address: "Address resolution unavailable",
        postal_code: "N/A"
      },
      hazards_analysis: {},
      terrain_context: "Inland/Unknown",
      professional_summary: "Snapshot temporarily unavailable. Fallback data returned.",
      fallback: true
    };

    const maxAttempts = isVercelDeployed ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/snapshot_identity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng) })
        });
        const text = await res.text();

        if (!res.ok) {
          const isTransient = [502, 503, 504].includes(res.status);
          if (isTransient && attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 600));
            continue;
          }
          console.warn(`Snapshot request failed (HTTP ${res.status}). Using fallback snapshot.`);
          return fallbackSnapshot;
        }

        try {
          return JSON.parse(text);
        } catch {
          return { ...fallbackSnapshot, error: "Invalid snapshot response" };
        }
      } catch (err) {
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        console.warn("Snapshot request failed due network/upstream issue. Using fallback snapshot.");
        return fallbackSnapshot;
      }
    }

    return fallbackSnapshot;
  }, [isVercelDeployed]);



  const performAnalysis = useCallback(async (tLat, tLng) => {

    try {

      const response = await fetch(`${API_BASE}/suitability`, {



        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "Accept": "application/json"

        },

        body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),

      });

      // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.ok) {
  const txt = await response.text();
  console.error("Backend error body:", txt);
  throw new Error(`HTTP ${response.status}: ${txt}`);
}


      return await response.json();

    } catch (error) {

      console.error("Analysis Request Failed:", error);

      throw error;

    }

  }, [debug]);



  const resolveLocationName = useCallback((targetLat, targetLng, defaultFallback) => {

    const curLat = parseFloat(targetLat).toFixed(4);

    const curLng = parseFloat(targetLng).toFixed(4);



    // Condition 1: Check Saved Places

    const matchedPlace = savedPlaces.find(p =>

      p.lat.toFixed(4) === curLat && p.lng.toFixed(4) === curLng

    );

    if (matchedPlace) return matchedPlace.name;



    // Condition 2: Check if it's the User's current physical device location

    if (isNearbyDevice(targetLat, targetLng, deviceLocation)) {

      return "My Location";

    }



    // Condition 3: Prompt for new name because coordinates changed

    const userName = prompt(`New location detected at ${curLat}, ${curLng}. Enter a name:`);

    return userName || defaultFallback;

  }, [savedPlaces, deviceLocation]);





  const handleCompareSelect = useCallback(async (tLat, tLng, existingName = null) => {

    setIsSelectingB(false);

    setBLatInput(tLat.toString());

    setBLngInput(tLng.toString());



    let resolvedNameB = resolveLocationName(tLat, tLng, "Site B");
    let name = existingName || resolvedNameB;
    
    setCompareName(name);
    // Update locationBName to reflect current location (preserve custom names, update resolved names)
    if (locationBName === "Site B" || locationBName !== resolvedNameB) {
      setLocationBName(name);
    }

    setCompareLoading(true);

    setIsCompareMode(true);

    setCompareResult(null);
    



    try {

      // Deployed path: run snapshot after suitability to reduce concurrent backend pressure.
      const siteBSuitabilityPromise = performAnalysis(tLat, tLng);
      const siteBSnapshotPromise = isVercelDeployed
        ? siteBSuitabilityPromise.then(() => fetchSnapshot(tLat, tLng))
        : fetchSnapshot(tLat, tLng);

      const [suitResult, snapData] = await Promise.all([
        siteBSuitabilityPromise,
        siteBSnapshotPromise
      ]);



      setCompareResult(suitResult);
      const nowB = new Date().toLocaleString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

setSiteBTime(nowB);
localStorage.setItem("geo_last_analysis_time_b", nowB);


      setSnapshotDataB(snapData); // Now snapData is correctly defined from the fetch

      // setAnalyzedCoordsB({ lat: tLat.toString(), lng: tLng.toString() });

      //  PERSISTENCE FIX: Save analyzed coords so the Red marker stays

      const coordsB = { lat: tLat.toString(), lng: tLng.toString() };

      setAnalyzedCoordsB(coordsB);

      localStorage.setItem("geo_lat_b_analyzed", tLat.toString());

      localStorage.setItem("geo_lng_b_analyzed", tLng.toString());

    } catch (err) {

      console.error(err);

    } finally {

      setCompareLoading(false);

    }

  }, [resolveLocationName, performAnalysis, fetchSnapshot, locationBName, isVercelDeployed]);



  useEffect(() => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition((pos) => {

        setDeviceLocation({

          lat: pos.coords.latitude.toFixed(4),

          lng: pos.coords.longitude.toFixed(4)

        });

      });

    }

  }, []);


  const restoreFromProjectPayload = useCallback((payload) => {
    if (!payload) return;

    // ---- Site A
    if (payload?.siteA?.lat != null) {
      const v = String(payload.siteA.lat);
      setLat(v);
      localStorage.setItem("geo_lat", v);
    }

    if (payload?.siteA?.lng != null) {
      const v = String(payload.siteA.lng);
      setLng(v);
      localStorage.setItem("geo_lng", v);
    }

    if (payload?.siteA?.name) {
      setLocationAName(payload.siteA.name);
      localStorage.setItem("geo_name_a", payload.siteA.name);
    }

    if (payload?.siteA?.result) {
      setResult(payload.siteA.result);
      localStorage.setItem("geo_last_result", JSON.stringify(payload.siteA.result));
    }

    if (payload?.siteA?.lat != null && payload?.siteA?.lng != null) {
      const coordsA = { lat: String(payload.siteA.lat), lng: String(payload.siteA.lng) };
      setAnalyzedCoords(coordsA);
      localStorage.setItem("geo_lat_analyzed", coordsA.lat);
      localStorage.setItem("geo_lng_analyzed", coordsA.lng);
    localStorage.setItem("geo_is_compare", "true");
    localStorage.setItem("geo_show_b", "true");

    // ---- Site B
    if (payload?.siteB?.lat != null) {
      const v = String(payload.siteB.lat);
      setBLatInput(v);
      localStorage.setItem("geo_lat_b", v);
    }

    if (payload?.siteB?.lng != null) {
      const v = String(payload.siteB.lng);
      setBLngInput(v);
      localStorage.setItem("geo_lng_b", v);
    }

    if (payload?.siteB?.name) {
      setLocationBName(payload.siteB.name);
      setCompareName(payload.siteB.name);
      localStorage.setItem("geo_name_b", payload.siteB.name);
    }

    if (payload?.siteB?.result) {
      setCompareResult(payload.siteB.result);
      localStorage.setItem("geo_last_compare_result", JSON.stringify(payload.siteB.result));
    }

    if (payload?.siteB?.lat != null && payload?.siteB?.lng != null) {
      const coordsB = { lat: String(payload.siteB.lat), lng: String(payload.siteB.lng) };
      setAnalyzedCoordsB(coordsB);
      localStorage.setItem("geo_lat_b_analyzed", coordsB.lat);
      localStorage.setItem("geo_lng_b_analyzed", coordsB.lng);
    }
  }
  }, [
    setLat, setLng,
    setLocationAName,
    setResult,
    setAnalyzedCoords,
    setBLatInput, setBLngInput,
    setLocationBName,
    setCompareName,
    setCompareResult,
    setAnalyzedCoordsB
  ]);





  const handleSubmit = useCallback(async (e) => {
//     const now = new Date().toLocaleString('en-GB', {
//     day: '2-digit', month: '2-digit', year: 'numeric',
//     hour: '2-digit', minute: '2-digit', second: '2-digit',
//     hour12: false
// });
if (e && e.preventDefault) e.preventDefault();
  const getNowTimestamp = (locationId = '') => {
  const now = new Date();
  const timestamp = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
  
  // Add location identifier and random component to ensure uniqueness
  const uniqueId = locationId + Math.random().toString(36).substr(2, 3);
  const finalTimestamp = timestamp + ' [' + uniqueId + ']';
  
  console.log('🔍 getNowTimestamp called for', locationId, ':', finalTimestamp, 'raw time:', now.toISOString());
  return finalTimestamp;
};
    // Safe check for automatic calls from useEffect (where 'e' might be undefined)

    



    // Check if coordinates have changed since last analysis

    const hasAChanged = analyzedCoords.lat !== lat || analyzedCoords.lng !== lng;



    // 1. Determine Name A: 

    // Use existing state if set, otherwise use resolver (Saved Places > My Loc > Prompt)

    // Logic preserves your requirement to re-prompt if coordinates moved

    let nameA = locationAName;

    if (locationAName === "Site A" || hasAChanged) {

      nameA = resolveLocationName(lat, lng, "Site A");

      setLocationAName(nameA);

    } else {

      setLocationAName(nameA);

    }



    // Reset results and start loading states
    // But keep snapshot data persistent until analysis is closed
    
    setResult(null);
    
    // Only clear compare result if we're not in compare mode or if B location is empty
    // This prevents B from disappearing when A is re-analyzed
    const shouldClearCompareResult = !showLocationB || !bLatInput || !bLngInput;
    if (shouldClearCompareResult) {
      setCompareResult(null);
    }
    
    // setAnalysisTime(null);
    // Removed shared localStorage key to prevent timestamp interference between locations
    // localStorage.removeItem("geo_last_analysis_time");


    // Don't clear snapshot data - keep cards persistent
    // setSnapshotData(null);
    // if (setSnapshotDataB) setSnapshotDataB(null);
    setAnalysisComplete(false);
    setLoading(true);

    setSnapshotLoading(true);



    // Capture current state of comparison for this specific submission

    const activeCompareMode = showLocationB && bLatInput && bLngInput;



    if (activeCompareMode) {

      setIsCompareMode(true);

      // Update locationBName to preserve user's custom name during analysis
      const resolvedNameB = resolveLocationName(bLatInput, bLngInput, "Site B");
      const nameB = (locationBName && locationBName !== "Site B" && locationBName !== resolvedNameB)
        ? locationBName  // Keep user's custom name
        : resolvedNameB; // Use resolved name for new location or if no custom name
      setCompareName(nameB);
      // Always update locationBName to reflect current location
      setLocationBName(nameB);

    }



    // Keep local behavior unchanged; deploy path delays snapshot until suitability resolves per site.
    const siteASuitabilityPromise = performAnalysis(lat, lng);
    const siteASnapshotPromise = isVercelDeployed
      ? siteASuitabilityPromise.then(() => fetchSnapshot(lat, lng))
      : fetchSnapshot(lat, lng);

    const tasks = [
      siteASuitabilityPromise,
      siteASnapshotPromise
    ];



    if (activeCompareMode) {

      const siteBSuitabilityPromise = performAnalysis(bLatInput, bLngInput);
      const siteBSnapshotPromise = isVercelDeployed
        ? siteBSuitabilityPromise.then(() => fetchSnapshot(bLatInput, bLngInput))
        : fetchSnapshot(bLatInput, bLngInput);

      tasks.push(siteBSuitabilityPromise);
      tasks.push(siteBSnapshotPromise);

    }



    try {

      const results = await Promise.allSettled(tasks);



      // --- SITE A RESULTS & UNIFIED HISTORY ---

      if (results[0].status === 'fulfilled') {

        const analysisData = results[0].value;
        const completedAtA = getNowTimestamp('A');
        console.log('🔍 Site A timestamp generated:', completedAtA, 'at:', new Date().toISOString());

        setResult(analysisData);
        setAnalysisComplete(true);
      //  setAnalysisTime(now);
    setSiteATime(completedAtA);
    console.log('🔍 Set Site A time to:', completedAtA);
    localStorage.setItem("geo_last_analysis_time_a", completedAtA);
    
    setAnalyzedCoords({ lat, lng });

        // setAnalysisTime(now);
        // Removed shared localStorage key to prevent timestamp interference between locations
        // localStorage.setItem("geo_last_analysis_time", completedAtA);
        // const coordsA = { lat, lng };

        setAnalyzedCoords({ lat, lng });

        localStorage.setItem("geo_lat_analyzed", lat);

        localStorage.setItem("geo_lng_analyzed", lng);

        // Identify Score B from the task results (index 2) directly to ensure history accuracy

        const scoreBVal = (activeCompareMode && results[2]?.status === 'fulfilled')

          ? (results[2].value.raw_suitability_score ?? results[2].value.suitability_score)

          : undefined;



        // Final check for nameB to ensure the history entry isn't saved as default "Site B" if a name exists

        const finalNameB = activeCompareMode

          ? (locationBName !== "Site B" ? locationBName : resolveLocationName(bLatInput, bLngInput, "Site B"))

          : null;



        // UNIFIED HISTORY ENTRY: Stores both sites in one row if comparing.

        const newHistoryEntry = {

          name: nameA,

          lat,

          lng,

          score: analysisData.raw_suitability_score ?? analysisData.suitability_score,

          timestamp: new Date().getTime(),

          // Comparison Data:

          isCompareMode: activeCompareMode,

          nameB: finalNameB,

          bLat: activeCompareMode ? bLatInput : null,

          bLng: activeCompareMode ? bLngInput : null,

          scoreB: scoreBVal

        };



        setAnalysisHistory(prev => {

          const updated = [newHistoryEntry, ...prev].slice(0, 20);

          localStorage.setItem("analysis_history", JSON.stringify(updated));

          return updated;

        });

      }



      if (results[1].status === 'fulfilled') {

        setSnapshotData(results[1].value);

      }



      // --- SITE B DATA PROCESSING (UI states only) ---

      if (activeCompareMode) {

        if (results[2] && results[2].status === 'fulfilled') {

          const compareData = results[2].value;
          const completedAtB = getNowTimestamp('B');
          console.log('🔍 Site B timestamp generated:', completedAtB, 'at:', new Date().toISOString());

          setCompareResult(compareData);
          // Set Site B Timestamp
        setSiteBTime(completedAtB);
          console.log('🔍 Set Site B time to:', completedAtB);
          localStorage.setItem("geo_last_analysis_time_b", completedAtB);
          setAnalyzedCoordsB({ lat: bLatInput.toString(), lng: bLngInput.toString() });

        }



        if (results[3] && results[3].status === 'fulfilled') {

          if (setSnapshotDataB) setSnapshotDataB(results[3].value);

        }

      }



    } catch (err) {

      console.error("Critical Analysis Error:", err);

    } finally {

      setLoading(false);

      setCompareLoading(false);

      setSnapshotLoading(false);

    }

  }, [

    lat,

    lng,

    locationAName,

    locationBName,

    bLatInput,

    bLngInput,

    showLocationB,

    resolveLocationName,

    performAnalysis,

    fetchSnapshot,

    setSnapshotDataB,

    setAnalysisHistory,

    analyzedCoords.lat,

    analyzedCoords.lng,
    isVercelDeployed,
    setSiteATime, setSiteBTime

  ]);





  const mapViewportRef = useRef(null); // Reference for Fullscreen targeting



  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    // 1. Skip logic if currently loading a shared link

    if (params.get("bLat")) return;



    const currentLatB = parseFloat(bLatInput).toFixed(4);

    const currentLngB = parseFloat(bLngInput).toFixed(4);



    // 2. Check if the new coordinates match a Saved Place

    const matchedB = savedPlaces.find(p =>

      parseFloat(p.lat).toFixed(4) === currentLatB &&

      parseFloat(p.lng).toFixed(4) === currentLngB

    );



    if (matchedB) {

      // 3. Adopt saved name

      setLocationBName(matchedB.name);

    } else if (analyzedCoordsB.lat && bLatInput !== analyzedCoordsB.lat.toString() && locationBName === "Site B") {

      // 4. Reset to "Site B" and clear old comparison data (only if still default name)

      setLocationBName("Site B");

      // setCompareResult(null);

    }

  }, [bLatInput, bLngInput, analyzedCoordsB.lat, savedPlaces, locationBName]);



  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    if (params.get("lat")) return; // Don't interfere with share links



    const currentLat = parseFloat(lat).toFixed(4);

    const currentLng = parseFloat(lng).toFixed(4);



    // 1. Check if the new coordinates match a Saved Place

    // const matched = savedPlaces.find(p =>

    //   p.lat.toFixed(4) === currentLat && p.lng.toFixed(4) === currentLng

    // );
    const matched = savedPlaces.find(p =>
  parseFloat(p.lat).toFixed(4) === currentLat &&
  parseFloat(p.lng).toFixed(4) === currentLng
);




    if (matched) {

      // Automatically adopt the saved name

      setLocationAName(matched.name);

    } else if (analyzedCoords.lat && lat !== analyzedCoords.lat.toString()) {

      // 2. Only reset to "Site A" if coordinates moved away from last analysis 

      // AND it's not a saved place

      setLocationAName("Site A");

      // setResult(null); 

    }

  }, [lat, lng, analyzedCoords, savedPlaces]); // Added savedPlaces to dependencies

  useEffect(() => {
    // Check if we already handled the URL analysis to prevent loops
    if (initialAnalysisRef.current) return;
    // const params = new URLSearchParams(window.location.search);
    // TODO: parse params here
  }, [handleCompareSelect, handleSubmit]);

  useEffect(() => {
    // 1) Restore from saved Project payload (from /project/:id loader page)
    const raw = localStorage.getItem("geoai_restore_project_payload");
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);

      // Prevent URL share logic from firing immediately
      initialAnalysisRef.current = true;

      restoreFromProjectPayload(payload);
//       const aTime = localStorage.getItem("geo_last_analysis_time_a");
// const bTime = localStorage.getItem("geo_last_analysis_time_b");

// if (aTime) setSiteATime(aTime);
// if (bTime) setSiteBTime(bTime);


      // Optional: mark analysis complete so AudioLandscape behaves correctly
      setAnalysisComplete(true);

    } catch (e) {
      console.error("Project restore failed:", e);
    } finally {
      localStorage.removeItem("geoai_restore_project_payload");
      localStorage.removeItem("geoai_restore_project_name");

      // Clean URL if it has old query params
      window.history.replaceState({}, "", window.location.pathname);
    }
  // }, [restoreFromProjectPayload]);
  }, [restoreFromProjectPayload]);

useEffect(() => {
  const aTime = localStorage.getItem("geo_last_analysis_time_a");
  const bTime = localStorage.getItem("geo_last_analysis_time_b");

  console.log('🔍 Loading timestamps from localStorage:');
  console.log('  - A time:', aTime);
  console.log('  - B time:', bTime);

  if (aTime) setSiteATime(aTime);
  if (bTime) setSiteBTime(bTime);
}, []);


  useEffect(() => {

    // Check if we already handled the URL analysis to prevent loops

    if (initialAnalysisRef.current) return;

    const params = new URLSearchParams(window.location.search);



    const sharedLat = params.get("lat");

    const sharedLng = params.get("lng");

    const sharedNameA = params.get("nameA");

    const sharedBLat = params.get("bLat");

    const sharedBLng = params.get("bLng");

    const sharedNameB = params.get("nameB");

    const isSharedCompare = params.get("compare") === "1" || params.get("compare") === "true";



    let shouldAnalyze = false;



    if (sharedLat && sharedLng) {

      // 1. Set main location state

      setLat(sharedLat);

      setLng(sharedLng);

      // 2. Persist to Local Storage immediately so other 

      // components don't default to 0.0000

      localStorage.setItem("geo_lat", sharedLat);

      localStorage.setItem("geo_lng", sharedLng);

      // if (sharedNameA) {

      //   // Decode name here so handleSubmit sees a set name and skips the prompt

      //   setLocationAName(decodeURIComponent(sharedNameA));

      // }

      if (sharedNameA) {

        const decodedName = decodeURIComponent(sharedNameA);

        setLocationAName(decodedName);

        localStorage.setItem("geo_name_a", decodedName);

      }

      shouldAnalyze = true;

    }



    if (isSharedCompare && sharedBLat && sharedBLng) {

      // 2. Set comparison inputs

      setBLatInput(sharedBLat);

      setBLngInput(sharedBLng);



      // Decode Site B name

      const decodedB = sharedNameB ? decodeURIComponent(sharedNameB) : "Site B";

      setLocationBName(decodedB);

      setCompareName(decodedB);



      // 3. Enable comparison UI modes

      setShowLocationB(true);

      setIsCompareMode(true);



      // 4. Trigger Site B analysis immediately using the decoded name to bypass prompts

      handleCompareSelect(sharedBLat, sharedBLng, decodedB);

    }



    // 5. Auto-trigger the main analysis for Site A

    if (shouldAnalyze) {



      initialAnalysisRef.current = true;

      const timer = setTimeout(() => {

        handleSubmit();

      }, 500);

      return () => clearTimeout(timer);

    }



    // handleSubmit is now included to satisfy the ESLint warning

  }, [handleCompareSelect, handleSubmit]);



  // âœ… FIX: Ensure comparison history is saved after URL-based analysis (DEPLOYED FIX)

  useEffect(() => {

    if (!result || !compareResult || !isCompareMode) return;



    setAnalysisHistory(prev => {

      const exists = prev.some(

        h =>

          h.lat === lat &&

          h.lng === lng &&

          h.bLat === bLatInput &&

          h.bLng === bLngInput

      );

      if (exists) return prev;



      const entry = {

        name: locationAName,

        lat,

        lng,

        score: result.raw_suitability_score ?? result.suitability_score,

        isCompareMode: true,

        nameB: locationBName,

        bLat: bLatInput,

        bLng: bLngInput,

        scoreB: compareResult.raw_suitability_score ?? compareResult.suitability_score,

        timestamp: Date.now()

      };



      const updated = [entry, ...prev].slice(0, 20);

      localStorage.setItem("analysis_history", JSON.stringify(updated));

      return updated;

    });

  }, [

    result,

    compareResult,

    isCompareMode,

    lat,

    lng,

    bLatInput,

    bLngInput,

    locationAName,

    locationBName

  ]);













  useEffect(() => {

    // --- Standard UI State ---

    localStorage.setItem("geo_lat", lat);

    localStorage.setItem("geo_lng", lng);

    localStorage.setItem("geo_name_a", locationAName); // Persist Name A

    localStorage.setItem("geo_name_b", locationBName); // Persistence

    localStorage.setItem("geo_is_compare", JSON.stringify(isCompareMode));

    localStorage.setItem("geo_show_b", JSON.stringify(showLocationB));

    localStorage.setItem("geo_zoom", zoom);

    localStorage.setItem("geo_theme", JSON.stringify(isDarkMode));

    localStorage.setItem("geo_adaptive_weather", JSON.stringify(adaptiveWeather));

    localStorage.setItem("geo_weather_opacity", JSON.stringify(weatherOpacity));

    localStorage.setItem("geo_site_a_weather", JSON.stringify(siteAWeather));

    localStorage.setItem("geo_site_b_weather", JSON.stringify(siteBWeather));

    localStorage.setItem("geo_site_a_opacity", JSON.stringify(siteAOpacity));

    localStorage.setItem("geo_site_b_opacity", JSON.stringify(siteBOpacity));

    localStorage.setItem("geo_map_style", mapVariety);

    localStorage.setItem("sidebar_width", sidebarWidth);

    localStorage.setItem("bottom_height", bottomHeight);

    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));



    // --- Analysis Results Persistence ---

    if (compareResult) localStorage.setItem("geo_last_compare_result", JSON.stringify(compareResult));

    if (result) {

      localStorage.setItem("geo_last_result", JSON.stringify(result));

    } else {

      localStorage.removeItem("geo_last_result");

    }



    // --- Comparison State Persistence ---

    localStorage.setItem("geo_is_compare", JSON.stringify(isCompareMode));

    localStorage.setItem("geo_show_b", JSON.stringify(showLocationB));



    if (showLocationB) {

      localStorage.setItem("geo_lat_b", bLatInput);

      localStorage.setItem("geo_lng_b", bLngInput);

      localStorage.setItem("geo_name_b", locationBName); // Persist Name B



      if (compareResult) {

        localStorage.setItem("geo_last_compare_result", JSON.stringify(compareResult));

      }

    }



    // --- Theme Application ---

    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");



  }, [
    lat, lng, locationAName, zoom, isDarkMode, sidebarWidth, bottomHeight, adaptiveWeather, weatherOpacity, siteAWeather, siteBWeather, siteAOpacity, siteBOpacity, result, savedPlaces, mapVariety, isCompareMode, showLocationB,
    bLatInput, bLngInput, locationBName, compareResult
  ]);









  const handleMouseMoveForResize = useCallback((e) => {

    if (isResizingSide.current && !isSidebarCollapsed) {

      const newWidth = e.clientX;

      if (newWidth > 260 && newWidth < 600) setSidebarWidth(newWidth);

    }

    if (isResizingBottom.current) {

      // Calculate height from bottom of viewport for proper stretching
      const viewportHeight = window.innerHeight;
      const distanceFromBottom = viewportHeight - e.clientY;

      // Convert to actual height (distance from bottom)
      const newHeight = Math.max(200, Math.min(viewportHeight * 0.8, distanceFromBottom));

      setBottomHeight(newHeight);

    }

  }, [isSidebarCollapsed]);



  const stopResizing = useCallback(() => {

    isResizingSide.current = false;

    isResizingBottom.current = false;

    document.removeEventListener("mousemove", handleMouseMoveForResize);

    document.removeEventListener("mouseup", stopResizing);

    document.body.style.cursor = "default";

  }, [handleMouseMoveForResize]);



  const startResizingSide = useCallback(() => {

    if (isSidebarCollapsed) return;

    isResizingSide.current = true;

    document.addEventListener("mousemove", handleMouseMoveForResize);

    document.addEventListener("mouseup", stopResizing);

    document.body.style.cursor = "col-resize";

  }, [handleMouseMoveForResize, stopResizing, isSidebarCollapsed]);

  const toggleSidebarCollapse = useCallback(() => {
    if (isSidebarCollapsed) {
      const restoredWidth =
        Number(localStorage.getItem("sidebar_width_expanded")) ||
        previousSidebarWidthRef.current ||
        320;
      const clampedWidth = Math.min(600, Math.max(260, restoredWidth));
      setSidebarWidth(clampedWidth);
      setIsSidebarCollapsed(false);
      return;
    }

    previousSidebarWidthRef.current = sidebarWidth;
    localStorage.setItem("sidebar_width_expanded", String(sidebarWidth));
    setSidebarWidth(SIDEBAR_MIN_WIDTH);
    setIsSidebarCollapsed(true);
  }, [isSidebarCollapsed, sidebarWidth, SIDEBAR_MIN_WIDTH]);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (isSidebarCollapsed && sidebarWidth !== SIDEBAR_MIN_WIDTH) {
      setSidebarWidth(SIDEBAR_MIN_WIDTH);
    }
  }, [isSidebarCollapsed, sidebarWidth, SIDEBAR_MIN_WIDTH]);

  useEffect(() => {
    if (isSidebarCollapsed) return;
    if (sidebarWidth >= 260) {
      previousSidebarWidthRef.current = sidebarWidth;
      localStorage.setItem("sidebar_width_expanded", String(sidebarWidth));
    }
  }, [sidebarWidth, isSidebarCollapsed]);



  const startResizingBottom = useCallback(() => {

    isResizingBottom.current = true;

    document.addEventListener("mousemove", handleMouseMoveForResize);

    document.addEventListener("mouseup", stopResizing);

    document.body.style.cursor = "row-resize";

  }, [handleMouseMoveForResize, stopResizing]);



  const handleNearbyPlaces = async () => {

    if (!lat || !lng) return;

    setNearbyLoading(true);

    try {

      const res = await fetch(`${API_BASE}/nearby_places`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),

      });

      if (!res.ok) throw new Error(res.status);

      const data = await res.json();

      setNearbyData(data);

      setShowNearby(true);

    } catch (err) { alert("Backend starting up, please retry in 10s"); } finally { setNearbyLoading(false); }

  };



  const handleNearbyPlacesB = async () => {

    const targetLat = analyzedCoordsB.lat || bLatInput;

    const targetLng = analyzedCoordsB.lng || bLngInput;

    if (!targetLat || !targetLng) return;

    setNearbyLoadingB(true);

    try {

      const res = await fetch(`${API_BASE}/nearby_places`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ latitude: parseFloat(targetLat), longitude: parseFloat(targetLng) }),

      });

      if (!res.ok) throw new Error(res.status);

      const data = await res.json();

      setNearbyDataB(data);

      setShowNearbyB(true);

    } catch (err) { alert("Backend starting up, please retry in 10s"); } finally { setNearbyLoadingB(false); }

  };





  const handleOpenHistory = useCallback((targetData, targetName, targetLat, targetLng) => {

    const base = `${window.location.origin}${(window.location.pathname || '/').replace(/\/?$/, '')}`;

    const url = `${base}/history?lat=${encodeURIComponent(targetLat)}&lng=${encodeURIComponent(targetLng)}&name=${encodeURIComponent(targetName || 'Site A')}`;

    window.open(url, '_blank', 'noopener,noreferrer');

  }, []);



  const handleMyLocation = () => {

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {

      const deviceLat = pos.coords.latitude;

      const deviceLng = pos.coords.longitude;

      setLat(deviceLat.toString());

      setLng(deviceLng.toString());



      // Also move the map view to the user's location

      setViewCenter([deviceLat, deviceLng]);

      setZoom(16);

    });

  };



  const handleSavePlace = () => {

    const name = prompt("Enter a name for this location:");

    if (!name) return;

    setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);

  };

  const [activeSpectral, setActiveSpectral] = useState("standard");

  const handleMyLocationB = () => {

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {

      setBLatInput(pos.coords.latitude.toString());

      setBLngInput(pos.coords.longitude.toString());

      handleCompareSelect(pos.coords.latitude, pos.coords.longitude);

    });

  };



  const handleSavePlaceB = () => {

    if (!compareName) return;

    setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);

  };



  const handleSearchResult = (searchLat, searchLng, searchName) => {

    setLat(searchLat.toString());

    setLng(searchLng.toString());

    setZoom(16);

  };


  const EvidenceSection = ({ data, filterCategories = null }) => {
    const meta = data?.explanation?.factors_meta || data?.factors_meta || {};
    const scoreProof = data?.score_proof || {};
    const proofCertainty = scoreProof?.certainty || {};
    const topPositiveDrivers = scoreProof?.top_positive_drivers || [];
    const topRiskDrivers = scoreProof?.top_risk_drivers || [];
    const contributionTable = scoreProof?.contribution_table || [];
    const sectionScopeKey = filterCategories ? filterCategories.join("_") : "all";
    const [expandedBlocks, setExpandedBlocks] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

    const isBlockExpanded = (key) => Boolean(expandedBlocks[key]);
    const toggleBlock = (key) => {
      setExpandedBlocks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isCategoryExpanded = (key) => Boolean(expandedCategories[key]);
    const toggleCategory = (key) => {
      setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (!meta || Object.keys(meta).length === 0) {
      return (
        <div className="card evidence-card">
          <h3 className="evidence-title">EVIDENCE DETAILS</h3>
          <p>No evidence metadata available.</p>
        </div>
      );
    }

    const factorLabels = {
      slope: "SLOPE",
      elevation: "ELEVATION",
      ruggedness: "RUGGEDNESS",
      stability: "STABILITY",
      flood: "FLOOD RISK",
      water: "WATER PROXIMITY",
      drainage: "DRAINAGE",
      groundwater: "GROUNDWATER",
      vegetation: "VEGETATION",
      soil: "SOIL QUALITY",
      pollution: "AIR POLLUTION",
      biodiversity: "BIODIVERSITY",
      heat_island: "HEAT ISLAND",
      rainfall: "RAINFALL",
      thermal: "THERMAL COMFORT",
      intensity: "HEAT STRESS",
      landuse: "LANDUSE",
      infrastructure: "PROXIMITY",
      population: "POPULATION",
      multi_hazard: "MULTI-HAZARD",
      climate_change: "CLIMATE CHANGE",
      recovery: "RECOVERY CAPACITY",
      habitability: "HABITABILITY"
    };

    const generateEvidence = (factorKey, factor) => {
      if (factor.evidence) return factor.evidence;
      const val = factor.value || 0;
      const raw = factor.raw || {};

      // Enhanced pollution evidence with detailed pollutant data
      if (factorKey === 'pollution') {
        const pm25 = raw.pm25_value || raw.pm25 || 'N/A';
        const pm10 = raw.pm10_value || 'N/A';
        const no2 = raw.no2_value || 'N/A';
        const so2 = raw.so2_value || 'N/A';
        const o3 = raw.o3_value || 'N/A';
        const co = raw.co_value || 'N/A';

        const healthRisk = raw.health_risk_level || 'Unknown';
        const aqiCategory = raw.aqi_category || 'Unknown';
        const dominantPollutant = raw.dominant_pollutant || 'Unknown';
        const location = raw.location || 'Unknown';
        const city = raw.city || 'Unknown';
        const lastUpdated = raw.last_updated || 'Unknown';
        const dataFreshness = raw.data_freshness || 'Unknown';

        // WHO Standards for comparison
        const pm25WhoAnnual = raw.pm25_who_standard_annual || 5;
        const pm25Who24hr = raw.pm25_who_standard_24hr || 15;
        const pm25EpaAnnual = raw.pm25_epa_standard_annual || 9;

        if (typeof pm25 === 'number' && pm25 > 0) {
          const pollutantBreakdown = [];
           if (pm10 !== 'N/A') pollutantBreakdown.push(`PM10: ${pm10} µg/m³`);
          if (no2 !== 'N/A') pollutantBreakdown.push(`NO2: ${no2} µg/m³`);
          if (so2 !== 'N/A') pollutantBreakdown.push(`SO2: ${so2} µg/m³`);
          if (o3 !== 'N/A') pollutantBreakdown.push(`O3: ${o3} µg/m³`);
          if (co !== 'N/A') pollutantBreakdown.push(`CO: ${co} µg/m³`);

          const additionalPollutants = pollutantBreakdown.length > 0 ? ` Additional pollutants: ${pollutantBreakdown.join(', ')}.` : '';
          const standardsInfo = ` WHO standards: Annual ${pm25WhoAnnual} µg/m³, 24hr ${pm25Who24hr} µg/m³. EPA annual: ${pm25EpaAnnual} µg/m³.`;

          if (pm25 <= 5) {
            return `Air Quality Index: ${val}/100. EXCELLENT air quality. PM2.5: ${pm25}µg/m³ (well below WHO annual standard of ${pm25WhoAnnual} µg/m³).${standardsInfo} Health risk: ${healthRisk}. AQI Category: ${aqiCategory}. Location: ${location}, ${city}. Data source: ${raw.dataset_source || 'OpenAQ'}. Last updated: ${lastUpdated} (${dataFreshness}). Dominant pollutant: ${dominantPollutant}.${additionalPollutants} Multi-pollutant impact: ${raw.multi_pollutant_impact || 'Normal'}.`;
          } else if (pm25 <= 12) {
            return `Air Quality Index: ${val}/100. GOOD air quality. PM2.5: ${pm25} µg/m³ (below WHO annual standard of ${pm25WhoAnnual} µg/m³.${standardsInfo} Health risk: ${healthRisk}. AQI Category: ${aqiCategory}. Location: ${location}, ${city}. Data source: ${raw.dataset_source || 'OpenAQ'}. Last updated: ${lastUpdated} (${dataFreshness}). Dominant pollutant: ${dominantPollutant}.${additionalPollutants} Multi-pollutant impact: ${raw.multi_pollutant_impact || 'Normal'}.`;
          } else if (pm25 <= 25) {
            return `Air Quality Index: ${val}/100. MODERATE air quality. PM2.5: ${pm25} µg/m³ (exceeding WHO annual standard of ${pm25WhoAnnual} µg/m³).${standardsInfo} Health risk: ${healthRisk}. AQI Category: ${aqiCategory}. Location: ${location}, ${city}. Data source: ${raw.dataset_source || 'OpenAQ'}. Last updated: ${lastUpdated} (${dataFreshness}). Dominant pollutant: ${dominantPollutant}.${additionalPollutants} Multi-pollutant impact: ${raw.multi_pollutant_impact || 'Normal'}.`;
          } else if (pm25 <= 50) {
            return `Air Quality Index: ${val}/100. POOR air quality. PM2.5: ${pm25} µg/m³ (significantly exceeding WHO standard of ${pm25WhoAnnual} µg/m³).${standardsInfo} Health risk: ${healthRisk}. AQI Category: ${aqiCategory}. Location: ${location}, ${city}. Data source: ${raw.dataset_source || 'OpenAQ'}. Last updated: ${lastUpdated} (${dataFreshness}). Dominant pollutant: ${dominantPollutant}.${additionalPollutants} Multi-pollutant impact: ${raw.multi_pollutant_impact || 'Normal'}.`;
          } else {
            return `Air Quality Index: ${val}/100. VERY POOR air quality. PM2.5: ${pm25} µg/m³ (dangerously exceeding WHO standard of ${pm25WhoAnnual} µg/m³).${standardsInfo} Health risk: ${healthRisk}. AQI Category: ${aqiCategory}. Location: ${location}, ${city}. Data source: ${raw.dataset_source || 'OpenAQ'}. Last updated: ${lastUpdated} (${dataFreshness}). Dominant pollutant: ${dominantPollutant}.${additionalPollutants} Multi-pollutant impact: ${raw.multi_pollutant_impact || 'Normal'}.`;
          }
        } else {
          return `Air Quality Index: ${val}/100. No real-time pollution data available. Using regional baseline estimate. Location: ${location || 'Unknown'}. More monitoring stations needed for accurate assessment.`;
        }
      }

      // Enhanced evidence for other factors can be added here too
      return `Score: ${val}/100. Analysis based on regional ${factorKey.replace(/_/g, ' ')} telemetry.`;
    };

    const categoryPriorityWeights = {
      physical: 21,
      environmental: 12,
      hydrology: 20,
      climatic: 12,
      socio_econ: 20,
      risk_resilience: 15
    };

    const factorPriorityWeights = {
      physical: { slope: 35, elevation: 20, ruggedness: 20, stability: 25 },
      environmental: { vegetation: 15, soil: 35, pollution: 30, biodiversity: 10, heat_island: 10 },
      hydrology: { flood: 35, water: 30, drainage: 20, groundwater: 15 },
      climatic: { thermal: 45, rainfall: 35, intensity: 20 },
      socio_econ: { infrastructure: 45, landuse: 30, population: 25 },
      risk_resilience: { multi_hazard: 35, climate_change: 25, recovery: 20, habitability: 20 }
    };

    const categoryDisplayLabels = {
      physical: "Physical",
      environmental: "Environmental",
      hydrology: "Hydrology",
      climatic: "Climatic",
      socio_econ: "Socio-Economic",
      risk_resilience: "Risk & Resilience"
    };

    const categoryDisplayOrder = ["physical", "hydrology", "socio_econ", "risk_resilience", "environmental", "climatic"];

    const getCategoryWeight = (category) => categoryPriorityWeights[category] || 0;
    const getCategoryLabel = (category) => categoryDisplayLabels[category] || category;

    const ledgerRows = contributionTable
      .filter((row) => !filterCategories || filterCategories.includes(row?.category))
      .sort((a, b) => {
        const gw = Number(b?.global_weight_pct || 0) - Number(a?.global_weight_pct || 0);
        if (gw !== 0) return gw;
        return Number(b?.contribution_points || 0) - Number(a?.contribution_points || 0);
      });

    const getFactorWeight = (category, factorKey) => {
      return factorPriorityWeights[category]?.[factorKey] || 0;
    };

    const calculateRoleBasedWeightedScore = (category, factors) => {
      let weightedSum = 0;
      let totalWeight = 0;
      Object.entries(factors).forEach(([factorKey, factor]) => {
        const weight = getFactorWeight(category, factorKey);
        const value = typeof factor.value === 'number' ? factor.value : 50;
        weightedSum += value * weight;
        totalWeight += weight;
      });
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    };

    const getFactorRole = (category, factorKey) => {
      const roles = {
        physical: { slope: "Primary construction constraint", stability: "Landslide/erosion safety", elevation: "Flood & climate baseline", ruggedness: "Construction difficulty" },
        hydrology: { flood: "Catastrophic failure driver", water: "Resource + flood modifier", drainage: "Surface runoff handling", groundwater: "Foundation durability" },
        environmental: { vegetation: "Surface cover indicator", soil: "Semi-permanent land constraint", pollution: "Human health impact", biodiversity: "Legal/ecological constraint", heat_island: "Urban stress indicator" },
        climatic: { rainfall: "Flood & water balance", thermal: "Human livability", intensity: "Peak stress risk" },
        socio_econ: { landuse: "Legal feasibility", infrastructure: "Development enabler", population: "Demand & pressure" },
        risk_resilience: { multi_hazard: "Compound disaster risk", climate_change: "Long-term exposure", recovery: "Post-event resilience", habitability: "Sustained livability" }
      };
      return roles[category]?.[factorKey] || "Supporting factor";
    };

    const getCategoryDescription = (category) => {
      const descriptions = {
        physical: "Physical terrain characteristics including slope, elevation, ruggedness, and ground stability.",
        environmental: "Environmental conditions covering vegetation, soil quality, air pollution, and biodiversity.",
        hydrology: "Water-related factors including flood risk, water proximity, and drainage capacity.",
        climatic: "Climate conditions such as rainfall patterns, thermal comfort, and heat stress.",
        socio_econ: "Socio-economic factors including land use, infrastructure, and population density.",
        risk_resilience: "Risk assessment and resilience factors covering hazards and climate change."
      };
      return descriptions[category] || "Category analysis and assessment.";
    };

    const factorOrder = {
      physical: ['elevation', 'ruggedness', 'slope', 'stability'],
      environmental: ['biodiversity', 'heat_island', 'pollution', 'soil', 'vegetation'],
      hydrology: ['drainage', 'flood', 'groundwater', 'water'],
      climatic: ['intensity', 'rainfall', 'thermal'],
      socio_econ: ['infrastructure', 'landuse', 'population'],
      risk_resilience: ['climate_change', 'habitability', 'multi_hazard', 'recovery']
    };

    return (
      <div className="evidence-section-container">
        {/* Hide the main section title if we are showing the "Extra" sections on the left */}
        {!filterCategories && <h3 className="evidence-title">EVIDENCE DETAILS</h3>}
        {!filterCategories && (
          <div className="evidence-collapsible-block">
            <button
              type="button"
              className="evidence-toggle-btn"
              onClick={() => toggleBlock("priority-profile")}
              aria-expanded={isBlockExpanded("priority-profile")}
            >
              <span>Human Suitability Priority Profile</span>
              <span className={`evidence-toggle-arrow ${isBlockExpanded("priority-profile") ? "open" : ""}`}>▸</span>
            </button>
            {isBlockExpanded("priority-profile") && (
              <div className="evidence-toggle-content evidence-priority-overview">
                <div className="evidence-priority-title">Global Category Weights</div>
                <div className="evidence-priority-list">
                  {categoryDisplayOrder
                    .filter((category) => Object.prototype.hasOwnProperty.call(meta, category))
                    .map((category) => (
                      <span key={`priority-${category}`} className="evidence-priority-pill">
                        {categoryDisplayLabels[category]}: {getCategoryWeight(category).toFixed(1)}%
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
        {!filterCategories && scoreProof?.model && (
          <div className="evidence-collapsible-block">
            <button
              type="button"
              className="evidence-toggle-btn"
              onClick={() => toggleBlock("score-proof-certainty")}
              aria-expanded={isBlockExpanded("score-proof-certainty")}
            >
              <span>Score Proof and Certainty</span>
              <span className={`evidence-toggle-arrow ${isBlockExpanded("score-proof-certainty") ? "open" : ""}`}>▸</span>
            </button>
            {isBlockExpanded("score-proof-certainty") && (
              <div className="evidence-toggle-content evidence-proof-overview">
                <div className="evidence-proof-title">Score Proof and Certainty</div>
                <div className="evidence-proof-metrics">
                  <span className="evidence-proof-metric">Reliability: {Number(proofCertainty?.weighted_data_reliability || 0).toFixed(1)}/100</span>
                  <span className="evidence-proof-metric">Confidence: {Number(proofCertainty?.weighted_model_confidence || 0).toFixed(1)}/100</span>
                  <span className="evidence-proof-metric">Freshness: {Number(proofCertainty?.weighted_data_freshness || 0).toFixed(1)}/100</span>
                  <span className="evidence-proof-metric">Freshest Obs: {proofCertainty?.freshest_observation_hours == null ? "N/A" : `${Number(proofCertainty.freshest_observation_hours).toFixed(1)}h`}</span>
                </div>
                <div className="evidence-driver-grid">
                  <div className="evidence-driver-col">
                    <div className="evidence-driver-heading">Top Positive Drivers</div>
                    {(topPositiveDrivers || []).slice(0, 5).map((d, i) => (
                      <div key={`pos-${i}`} className="evidence-driver-row">
                        {String(d.factor || "factor").replaceAll('_', ' ')} ({Number(d.global_weight_pct || 0).toFixed(2)}%) {'->'} +{Number(d.contribution_points || 0).toFixed(2)}
                      </div>
                    ))}
                  </div>
                  <div className="evidence-driver-col">
                    <div className="evidence-driver-heading">Top Risk Drivers</div>
                    {(topRiskDrivers || []).slice(0, 5).map((d, i) => (
                      <div key={`risk-${i}`} className="evidence-driver-row risk">
                        {String(d.factor || "factor").replaceAll('_', ' ')} ({Number(d.global_weight_pct || 0).toFixed(2)}%) value {Number(d.value || 0).toFixed(1)}/100
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {!filterCategories && ledgerRows.length > 0 && (
          <div className="evidence-collapsible-block">
            <button
              type="button"
              className="evidence-toggle-btn"
              onClick={() => toggleBlock("data-ledger")}
              aria-expanded={isBlockExpanded("data-ledger")}
            >
              <span>Data Source Ledger</span>
              <span className={`evidence-toggle-arrow ${isBlockExpanded("data-ledger") ? "open" : ""}`}>▸</span>
            </button>
            {isBlockExpanded("data-ledger") && (
              <div className="evidence-toggle-content evidence-ledger">
                <div className="evidence-ledger-title">Data Source Ledger (Factor-Level Proof)</div>
                <div className="evidence-ledger-table-wrap">
                  <table className="evidence-ledger-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Factor</th>
                        <th>Source</th>
                        <th>Mode</th>
                        <th>Confidence</th>
                        <th>Freshness</th>
                        <th>Reliability</th>
                        <th>Validation</th>
                        <th>Global Wt</th>
                        <th>Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRows.map((row, idx) => (
                        <tr key={`ledger-${idx}`}>
                          <td>{getCategoryLabel(row?.category)}</td>
                          <td>{factorLabels[row?.factor] || String(row?.factor || '').replaceAll('_', ' ').toUpperCase()}</td>
                          <td className="source-cell">{row?.source || "Unknown"}</td>
                          <td>{row?.data_mode || "N/A"}</td>
                          <td>{Number(row?.confidence_score || 0).toFixed(1)}</td>
                          <td>{row?.freshness_hours == null ? "N/A" : `${Number(row.freshness_hours).toFixed(1)}h`}</td>
                          <td>{Number(row?.reliability_score || 0).toFixed(1)}</td>
                          <td>{row?.validation_status ? `${String(row.validation_status).toUpperCase()} (${Number(row?.validation_score || 0).toFixed(1)})` : "N/A"}</td>
                          <td>{Number(row?.global_weight_pct || 0).toFixed(2)}%</td>
                          <td>{Number(row?.contribution_points || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="evidence-categories">
          {Object.entries(meta)
            .filter(([category]) => !filterCategories || filterCategories.includes(category))
            .map(([category, categoryGroupRaw]) => {
              const categoryGroup = categoryGroupRaw || {};
              const categoryScore = data?.category_scores?.[category] || data?.explanation?.category_scores?.[category] || 0;
              const weightedScore = calculateRoleBasedWeightedScore(category, categoryGroup);
              const categoryWeight = getCategoryWeight(category);
              const categoryColorClass = categoryScore < 40 ? "tone-red" : categoryScore < 70 ? "tone-yellow" : "tone-green";
              const orderedFactorKeys = factorOrder[category] ? factorOrder[category].filter(key => categoryGroup[key]) : Object.keys(categoryGroup);
              const categoryToggleKey = `${sectionScopeKey}:${category}`;
              const categoryExpanded = isCategoryExpanded(categoryToggleKey);

              return (
                <div key={category} className="evidence-category-container">
                  <div className={`evidence-category-header-container ${categoryColorClass}`}>
                    <div className="category-header-content">
                      <h4 className="evidence-category-title">
                        {category.replaceAll('_', ' ').toUpperCase()}
                        <span className="evidence-category-score">({categoryScore.toFixed(1)}/100)</span>
                        <span className="evidence-weighted-score">Priority: ({categoryWeight.toFixed(1)}% global)</span>
                        <span className="evidence-weighted-score">Weighted: ({weightedScore.toFixed(1)}/100)</span>
                      </h4>
                      <p className="evidence-category-description">{getCategoryDescription(category)}</p>
                    </div>
                    <button
                      type="button"
                      className="evidence-category-toggle-btn"
                      onClick={() => toggleCategory(categoryToggleKey)}
                      aria-expanded={categoryExpanded}
                    >
                      <span>{categoryExpanded ? "Hide" : "Show"}</span>
                      <span className={`evidence-toggle-arrow ${categoryExpanded ? "open" : ""}`}>▸</span>
                    </button>
                  </div>
                  {categoryExpanded && (
                  <div className="evidence-factors-sequential">
                    {orderedFactorKeys.map((factorKey) => {
                      const factor = categoryGroup[factorKey];
                      const numericValue = typeof factor.value === 'number' ? factor.value : 50;
                      const factorColor = numericValue < 40 ? "tone-red" : numericValue < 70 ? "tone-yellow" : "tone-green";
                      const evidenceText = factor.evidence || generateEvidence(factorKey, factor);
                      const factorWeight = getFactorWeight(category, factorKey);
                      const globalWeight = ((categoryWeight * factorWeight) / 100).toFixed(2);
                      const confValue = typeof factor?.confidence === 'number' ? `${factor.confidence.toFixed(0)}/100` : (factor?.confidence || 'N/A');
                      const freshnessTag = factor?.details?.data_freshness || (factor?.details?.last_updated ? 'Timestamped' : 'N/A');
                      const validationBadge = factor?.validation?.status ? `${String(factor.validation.status).toUpperCase()} ${Number(factor?.validation?.score || 0).toFixed(0)}` : 'N/A';
                      return (
                        <div key={`${category}-${factorKey}`} className={`evidence-factor-card ${factorColor}`}>
                          <div className="factor-card-header">
                            <div className="factor-header-left">
                              <h5 className="factor-name">{factorLabels[factorKey] || factorKey.replace(/_/g, ' ').toUpperCase()}</h5>
                              <div className="factor-weighting-info">
                                <span className="factor-score">{numericValue.toFixed(1)}/100</span>
                                <span className="weight-breakdown">{Number(factorWeight || 0).toFixed(1)}% of cat {'->'} {Number(globalWeight || 0).toFixed(2)}% global</span>
                              </div>
                            </div>
                            <div className={`factor-status-badge ${factorColor}`}>
                              {numericValue >= 70 ? 'HIGH' : numericValue >= 40 ? 'MID' : 'LOW'}
                            </div>
                          </div>
                          <div className="factor-card-content">
                            <div className="evidence-text">{evidenceText}</div>
                            <div className="factor-metadata-compact">
                              <div className="metadata-row">
                                <span className="metadata-item-compact"> {factor.source || 'Data Engine'}</span>
                                {factor.unit && <span className="metadata-item-compact"> {factor.unit}</span>}
                                <span className="metadata-item-compact">Mode: {factor?.data_mode || 'N/A'}</span>
                                <span className="metadata-item-compact">Confidence: {confValue}</span>
                                <span className="metadata-item-compact">Freshness: {freshnessTag}</span>
                                <span className="metadata-item-compact">Validation: {validationBadge}</span>
                                <span className="metadata-item-compact">Role: {getFactorRole(category, factorKey)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  };



  // const renderTabContent = (data, coords, name, isFullWidth) => {

  //   // If isFullWidth (Single Analysis), use your 'results-grid' class

  //   // If not (Compare Mode), use 'column-stack' to fit inside the narrow pane

  //   const containerClass = isFullWidth ? "results-grid" : "column-stack";



  //   const currentSnapshot = name === locationAName ? snapshotData : snapshotDataB;

  //   if (activeTab === "suitability") {

  //     return (

  //       <div className={containerClass}>

  //         <div className={isFullWidth ? "col-1" : ""}>



  //           <FactorsSection

  //             data={data}

  //             latVal={coords.lat}

  //             lngVal={coords.lng}

  //             locationName={name}

  //             isDarkMode={isDarkMode}

  //             viewMode={viewMode}

  //             setViewMode={setViewMode}

  //             onOpenHistory={handleOpenHistory}

  //             mapVariety={mapVariety}

  //             isCompareMode={!isFullWidth}

  //             activeSpectral={activeSpectral}

  //             mapMode={mapMode}           // PASS STATE HERE

  //             active3DStyle={active3DStyle}

  //             currentZoom={zoom}

  //             setZoom={setZoom}

  //             handleZoomIn={handleZoomIn}

  //             handleZoomOut={handleZoomOut}

  //             /* NEW PROPS BELOW */

  //             setLat={setLat}

  //             setLng={setLng}

  //             // currentZoom={zoom}           // Local state 'zoom' maps to 'currentZoom'

  //             setCurrentZoom={setZoom}

  //             onZoomIn={handleZoomIn}      // Local function maps to 'onZoomIn'

  //             onZoomOut={handleZoomOut}

  //             isSelectingB={isSelectingB}

  //             handleCompareSelect={handleCompareSelect}

  //           />

  //         </div>

  //         <div className={isFullWidth ? "col-2" : ""}>

  //           {/* <PotentialSection factors={data.factors} score={data.suitability_score} /> */}

  //           <EvidenceSection data={data} />

  //         </div>

  //       </div>

  //     );

  //   }
  // const renderTabContent = (data, coords, name, isFullWidth) => {
    const renderTabContent = (data, coords, name, isFullWidth, siteId = "A") => {

    const containerClass = isFullWidth ? "results-grid" : "column-stack";
    // const currentSnapshot = name === locationAName ? snapshotData : snapshotDataB;
    const currentSnapshot = siteId === "A" ? snapshotData : snapshotDataB;
    const rawScoreMaybe = Number(data?.raw_suitability_score);
    const shownScoreMaybe = Number(data?.suitability_score);
    const numericSuitabilityScore = Number.isFinite(rawScoreMaybe)
      ? rawScoreMaybe
      : (Number.isFinite(shownScoreMaybe) ? shownScoreMaybe : 0);
    const isScoreHidden = Boolean(data?.score_hidden);
    const suitabilityDisplay = isScoreHidden
      ? (data?.score_display || "-")
      : (Number.isFinite(numericSuitabilityScore) ? numericSuitabilityScore.toFixed(1) : "-");


    if (activeTab === "suitability") {
      return (
        <div className={containerClass}>
          {/* LEFT COLUMN: Factors (Radar/Bars) + Socio-Econ/Risk (if full width) */}
          <div className={isFullWidth ? "col-1" : ""}>
            <FactorsSection
              data={data}
              latVal={coords.lat}
              lngVal={coords.lng}
              locationName={name}
              isDarkMode={isDarkMode}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onOpenHistory={handleOpenHistory}
              mapVariety={mapVariety}
              isCompareMode={!isFullWidth}
              activeSpectral={activeSpectral}
              mapMode={mapMode}
              active3DStyle={active3DStyle}
              currentZoom={zoom}
              setZoom={setZoom}
              handleZoomIn={handleZoomIn}
              handleZoomOut={handleZoomOut}
              setLat={setLat}
              setLng={setLng}
              setCurrentZoom={setZoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              isSelectingB={isSelectingB}
              handleCompareSelect={handleCompareSelect}
              // lastAnalyzedTime={name === locationAName ? siteATime : siteBTime}
               lastAnalyzedTime={siteId === "A" ? siteATime : siteBTime}
  siteId={siteId}
              
            />

            {/* Render the lighter categories below the radar chart ONLY on full screen single mode */}
            {isFullWidth && (
              <div className="secondary-evidence-left" style={{ marginTop: '20px' }}>
                <EvidenceSection
                  data={data}
                  filterCategories={['socio_econ', 'risk_resilience']}
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Heavy Technical Evidence */}
          <div className={isFullWidth ? "col-2" : ""}>
            <EvidenceSection
              data={data}
              filterCategories={
                isFullWidth
                  ? ['physical', 'hydrology', 'environmental', 'climatic']
                  : null // Show all in compare mode or small screens
              }
            />
          </div>
        </div>
      );
    }

    if (activeTab === "environmental") {

      const cnn = data?.cnn_analysis;

      const confidence = cnn?.confidence || 0;



      // NEW: 3-Tier Tactical Color Logic

      const getCnnTheme = (conf) => {

        if (conf >= 70) return { color: "#10b981", label: "VERIFIED", note: "TARGET LOCKED", class: "high-conf", glow: "rgba(16, 185, 129, 0.2)" };

        if (conf >= 40) return { color: "#3b82f6", label: "PROBABLE", note: "PATTERN RECOGNIZED", class: "mid-conf", glow: "rgba(59, 130, 246, 0.2)" };

        return { color: "#ef4444", label: "UNCERTAIN", note: "SIGNAL INTERFERENCE", class: "low-conf", glow: "rgba(239, 68, 68, 0.2)" };

      };



      const cnnTheme = getCnnTheme(confidence);



      return (

        <div className="environmental-container">

          {/* Landscape Full-Width Cards Layout */}

          <div className="environmental-cards-grid">

            {/* CNN Intelligence Card */}

            <div

              className={`card cnn-tactical-card glass-morphic animate-in ${cnnTheme.class}`}

              style={{ "--status-color": cnnTheme.color, "--status-glow": cnnTheme.glow }}

            >

              <div className="cnn-tactical-header">

                <div className="cnn-title-group">

                  <span className="live-tag">LIVE TELEMETRY</span>

                  <h3>Visual Intelligence Scan</h3>

                </div>



                <div className="tactical-header-right">

                  <div className="model-id-badge">

                    <span className="model-label">ENGINE</span>

                    <span className="model-name">CNN-V2 / MOBILE-NET</span>

                  </div>



                  <div

                    className="status-indicator-pill"

                    style={{ backgroundColor: cnnTheme.color }}

                  >

                    {confidence < 40 && <span className="mini-warn">⚠</span>}

                    {cnnTheme.label}

                  </div>

                </div>

              </div>



              <div className="cnn-tactical-layout">

                <div className="cnn-visual-container">

                  <div

                    className="cnn-frame"

                    style={{ borderColor: cnnTheme.color }}

                  >

                    <div

                      className="cnn-image-feed"

                      style={{

                        backgroundImage: cnn?.image_sample

                          ? `url(${cnn.image_sample})`

                          : "none",

                        filter:

                          confidence < 40

                            ? "grayscale(0.4) contrast(1.1) brightness(0.9)"

                            : "none",

                      }}

                    >

                      {cnn?.image_sample && (

                        <div className="scan-telemetry-overlay" />

                      )}

                    </div>



                    <div className="corner-bit tl" />

                    <div className="corner-bit tr" />

                    <div className="corner-bit bl" />

                    <div className="corner-bit br" />

                  </div>

                </div>



                <div className="cnn-data-grid">

                  <div className="cnn-stat-item">

                    <label>TERRAIN CLASSIFICATION:</label>

                    <strong

                      className="cnn-class-text"

                      style={{ color: cnnTheme.color }}

                    >

                      {cnn?.class || "ANALYZING..."}

                    </strong>

                  </div>



                  <div className="cnn-stat-item">

                    <div className="label-row">

                      <label>SPECTRAL CONFIDENCE:</label>

                      <span

                        className="confidence-value"

                        style={{ color: cnnTheme.color }}

                      >

                        {confidence}%

                      </span>

                    </div>



                    <div className="tactical-progress-bg">

                      <div

                        className="tactical-progress-fill"

                        style={{

                          width: `${confidence}%`,

                          backgroundColor: cnnTheme.color,

                        }}

                      />

                    </div>

                  </div>



                  <div

                    className="cnn-alert-box"

                    style={{

                      borderLeftColor: cnnTheme.color,

                      background: `${cnnTheme.color}15`,

                    }}

                  >

                    <strong style={{ color: cnnTheme.color }}>

                      {cnnTheme.note}

                    </strong>

                    <p>

                      {confidence < 40

                        ? "Terrain complexity exceeding standard spectral resolution."

                        : `Visual markers confirm high correlation with ${cnn?.class} signatures.`}

                    </p>

                  </div>

                </div>

              </div>



              <div className="cnn-footer-telemetry">

                <span>

                  RES:{" "}

                  {cnn?.telemetry?.resolution_m_per_px != null

                    ? `${cnn.telemetry.resolution_m_per_px}m/px`

                    : "10m/px"}

                </span>

                <span>SENSOR: {cnn?.telemetry?.tile_url_source || "SENTINEL-2 L2A"}</span>

                <span>MODEL: {cnn?.telemetry?.model || "CNN-V2 / MOBILE-NET"}</span>

                <span>TS: {new Date().toLocaleTimeString()}</span>

                {cnn?.telemetry?.verified_by && (

                  <span>✓ {cnn.telemetry.verified_by}</span>

                )}

              </div>

            </div>



            {/* Weather Card */}

            <WeatherCard weather={data?.weather} />



            {/* Hazards Card */}

            <HazardsCard data={currentSnapshot?.hazards_analysis} loading={snapshotLoading} />



            {/* Snapshot Geo Card */}

            <SnapshotGeo data={currentSnapshot} loading={snapshotLoading} />

          </div>

        </div>

      );

    }





    if (activeTab === "infrastructure") {

      const intel = data.strategic_intelligence || {};

      // Use flat_factors (all 14) when available; else derive from nested data.factors

      const flatF = data.flat_factors || (() => {

        const f = data.factors || {};

        const get = (cat, key) => {

          const v = f[cat]?.[key];

          return typeof v === 'object' && v !== null ? v.value : v;

        };

        return {

          landuse: get('socio_econ', 'landuse') ?? 50,

          pollution: get('environmental', 'pollution') ?? 50,

          proximity: get('socio_econ', 'infrastructure') ?? 50,

          soil: get('environmental', 'soil') ?? 50,

          water: get('hydrology', 'water') ?? 50,

          vegetation: get('environmental', 'vegetation') ?? 50

        };

      })();

      const landuseVal = typeof flatF.landuse === 'number' ? flatF.landuse : 50;

      const pollutionVal = typeof flatF.pollution === 'number' ? flatF.pollution : 50;

      const proximityVal = typeof flatF.proximity === 'number' ? flatF.proximity : (typeof flatF.infrastructure === 'number' ? flatF.infrastructure : 50);

      const soilVal = typeof flatF.soil === 'number' ? flatF.soil : 50;

      const waterVal = typeof flatF.water === 'number' ? flatF.water : 50;

      // Carbon Intelligence: Potential based on vegetation/landuse

      const carbonIntelligence = (landuseVal * 0.75).toFixed(1);

      const liveFootprint = ((100 - pollutionVal + (100 - proximityVal)) / 15).toFixed(1);

      const esgScore = Math.round((soilVal + pollutionVal + waterVal) / 3);

      const esgColorClass = esgScore > 75 ? "grade-A" : esgScore > 50 ? "grade-B" : esgScore > 35 ? "grade-C" : "grade-F";





      return (

        <div className="infrastructure-container">

          <div className="infrastructure-cards-grid">

            {/* Site Potential Analysis Card */}

            <div className="card glass-morphic intel-card potential-card">

              <div className="intel-header">

                <div className="potential-score-badge">

                  {/* <span className="score-value">{data.suitability_score?.toFixed(0) || '---'}%</span>

                <span className="score-label">SCORE</span> */}

                </div>

              </div>



              <PotentialSection factors={data.factors} score={numericSuitabilityScore} scoreHidden={isScoreHidden} />



              <div className="potential-insights">

                <h4>Development Recommendations</h4>

                <div className="insights-grid">

                  <div className="insight-item">

                    <span className="insight-icon">🏗️</span>

                    <div className="insight-content">

                      <strong>Construction Viability</strong>

                      <span>{isScoreHidden ? 'Restricted' : (numericSuitabilityScore > 70 ? 'Excellent' : numericSuitabilityScore > 50 ? 'Good' : 'Limited')}</span>

                    </div>

                  </div>

                  <div className="insight-item">

                    <span className="insight-icon">🌱</span>

                    <div className="insight-content">

                      <strong>Agricultural Potential</strong>

                      <span>{data.factors?.environmental?.soil?.value > 60 ? 'High' : 'Moderate'}</span>

                    </div>

                  </div>

                  <div className="insight-item">

                    <span className="insight-icon">🏘️</span>

                    <div className="insight-content">

                      <strong>Residential Suitability</strong>

                      <span>{data.factors?.socio_econ?.infrastructure?.value > 60 ? 'Favorable' : 'Challenging'}</span>

                    </div>

                  </div>

                </div>

              </div>

            </div>



            {/* Sustainability Intelligence Card */}

            <div className="card glass-morphic intel-card sustainability-card">

              <div className="intel-header">

                <h3>🌳 Sustainability Intelligence</h3>

                <div className={`esg-score-circle ${esgColorClass}`}>

                  <span className="esg-val">{esgScore}</span>

                  <span className="esg-lab">ESG</span>

                </div>

              </div>

              <div className="carbon-analysis-zone">

                <div className="analysis-row">

                  <div className="analysis-item">

                    <label>Carbon Asset</label>

                    <span className="val-green">+{carbonIntelligence} <small>tCO2e/yr</small></span>

                    <div className="mini-progress-bg">

                      <div className="mini-progress-fill green" style={{ width: `${Math.min(carbonIntelligence * 2, 100)}%` }}></div>

                    </div>

                  </div>

                  <div className="analysis-item">

                    <label>Live Footprint</label>

                    <span className="val-red">-{liveFootprint} <small>tCO2e/yr</small></span>

                    <div className="mini-progress-bg">

                      <div className="mini-progress-fill red" style={{ width: `${Math.min(liveFootprint * 10, 100)}%` }}></div>

                    </div>

                  </div>

                </div>

                <div className="net-impact-summary">

                  <div className="impact-label">Net Ecosystem Impact</div>

                  <div className="impact-value">

                    {(carbonIntelligence - liveFootprint) > 0 ? "CARBON NEGATIVE" : "CARBON POSITIVE"}

                  </div>

                </div>

              </div>

              <div className="eligibility-drawer">

                <div className="drawer-item">

                  <span>🌿 Conservation Credit Match:</span>

                  <strong className={esgScore > 65 ? "status-ok" : "status-no"}>

                    {esgScore > 65 ? "HIGHLY ELIGIBLE" : "INELIGIBLE"}

                  </strong>

                </div>

                <div className="drawer-item">

                  <span>🛡 Biodiversity Buffer:</span>

                  <strong>{landuseVal > 60 ? "PREMIUM" : "STANDARD"}</strong>

                </div>

              </div>

              <p className="legal-disclaimer">Estimates based on biomass density and emission intensity.</p>

            </div>



            {/* Dynamic Improvement Roadmap Card */}

            <div className="card glass-morphic intel-card roadmap-card">

              <div className="intel-header">

                <h3>🚧 Dynamic Improvement Roadmap</h3>

                {intel.development_readiness && (

                  <div className="readiness-badge">

                    <span className={`status-${intel.development_readiness.status}`}>

                      {intel.development_readiness.status.toUpperCase()}

                    </span>

                  </div>

                )}

              </div>



              {intel.development_readiness && (

                <div className="readiness-summary">

                  <div className="readiness-metrics">

                    <div className="metric">

                      <span className="label">Total Investment:</span>

                      <span className="value">{intel.development_readiness.estimated_total_investment || 'Calculating...'}</span>

                    </div>

                    <div className="metric">

                      <span className="label">Time to Ready:</span>

                      <span className="value">{intel.development_readiness.time_to_readiness || 'Calculating...'}</span>

                    </div>

                  </div>

                </div>

              )}



              <div className="roadmap-list">

                {intel.roadmap?.length > 0 ? intel.roadmap.map((item, i) => (

                  <div key={i} className={`roadmap-item priority-${item.priority || 'medium'}`}>

                    <div className="roadmap-task-info">

                      <div className="task-header">

                        <span className="task-name">{item.task}</span>

                        <span className="impact-tag">{item.impact}</span>

                      </div>

                      <p className="tiny-note">{item.note}</p>

                      {item.estimated_cost && (

                        <div className="task-details">

                          <span className="cost">💰 {item.estimated_cost}</span>

                          <span className="timeline">⏱️ {item.timeline}</span>

                        </div>

                      )}

                    </div>

                  </div>

                )) : <div className="nearby-empty">Analyzing location for improvement opportunities...</div>}

              </div>

            </div>



            {/* AI-Driven Strategic Interventions Card */}

            <div className="card glass-morphic intel-card prevention-card">

              <div className="intel-header">

                <h3>💡 AI-Driven Strategic Interventions</h3>

                <p className="subtitle">Location-specific actionable intelligence</p>

              </div>



              <div className="interventions-list">

                {intel.interventions?.length > 0 ? intel.interventions.map((intervention, i) => (

                  <div key={i} className={`intervention-item urgency-${intervention.urgency || 'medium'}`}>

                    <div className="intervention-header">

                      <span className="intervention-action">{intervention.action || intervention}</span>

                      {intervention.urgency && (

                        <span className={`urgency-badge urgency-${intervention.urgency}`}>

                          {intervention.urgency}

                        </span>

                      )}

                    </div>

                    {intervention.rationale && (

                      <p className="intervention-rationale">{intervention.rationale}</p>

                    )}

                    {intervention.expected_impact && (

                      <div className="intervention-impact">

                        <span className="impact-label">Expected Impact:</span>

                        <span className="impact-value">{intervention.expected_impact}</span>

                      </div>

                    )}

                  </div>

                )) : <div className="nearby-empty">Generating AI-powered interventions...</div>}

              </div>

            </div>



            {/* Advanced AI Projection Card */}

            <div className="card glass-morphic intel-card prediction-card">

              <div className="intel-header">

                <h3>{"\uD83D\uDE80"} Advanced AI Projection (2036)</h3>

                <div className="future-score-wrap">

                  <span className="current-mini">{suitabilityDisplay}</span>

                  <span className="drift-arrow">→</span>

                  <span className="future-score">{intel.expected_score || 'Calculating...'}%</span>

                  {intel.projection_analysis && (

                    <span className={`trend-${intel.projection_analysis.trend_direction}`}>

                      {intel.projection_analysis.trend_direction}

                    </span>

                  )}

                </div>

              </div>



              {intel.projection_analysis && (

                <div className="projection-insights">

                  <div className="confidence-meter">

                    <span className="label">AI Confidence:</span>

                    <div className="confidence-bar">

                      <div

                        className={`confidence-fill confidence-${intel.projection_analysis.confidence_level}`}

                        style={{ width: intel.projection_analysis.confidence_level === 'high' ? '85%' : '60%' }}

                      ></div>

                    </div>

                    <span className="confidence-value">{intel.projection_analysis.confidence_level}</span>

                  </div>



                  {intel.projection_analysis.key_drivers?.length > 0 && (

                    <div className="key-drivers">

                      <span className="label">Key Change Drivers:</span>

                      <div className="drivers-list">

                        {intel.projection_analysis.key_drivers.map((driver, i) => (

                          <span key={i} className="driver-tag">{driver}</span>

                        ))}

                      </div>

                    </div>

                  )}



                  {intel.projection_analysis.mitigation_potential && (

                    <div className="mitigation-potential">

                      <span className="label">Mitigation Potential:</span>

                      <span className="potential-value">+{intel.projection_analysis.mitigation_potential}%</span>

                    </div>

                  )}

                </div>

              )}



              <div className="drift-metrics">

                <div className="drift-row">

                  <span>Urbanization Risk:</span>

                  <span className="val-red">{intel.metrics?.urban_sprawl || 'Calculating...'}</span>

                </div>

                <div className="drift-row">

                  <span>Vegetation Loss:</span>

                  <span className="val-red">{intel.metrics?.veg_loss || 'Calculating...'}</span>

                </div>

                {intel.metrics?.water_security_risk && (

                  <div className="drift-row">

                    <span>Water Security Risk:</span>

                    <span className="val-orange">{intel.metrics.water_security_risk}</span>

                  </div>

                )}

                {intel.metrics?.climate_resilience && (

                  <div className="drift-row">

                    <span>Climate Resilience:</span>

                    <span className="val-orange">{intel.metrics.climate_resilience}</span>

                  </div>

                )}

                {intel.metrics?.overall_risk_index && (

                  <div className="drift-row overall-risk">

                    <span>Overall Risk Index:</span>

                    <span className={`val-${intel.metrics.overall_risk_index > 20 ? 'red' : intel.metrics.overall_risk_index > 10 ? 'orange' : 'green'}`}>

                      {intel.metrics.overall_risk_index}%

                    </span>

                  </div>

                )}

              </div>

            </div>



            {/* Terrain & Slope Analysis Card - Compact Professional Design */}

            <div className="card glass-morphic intel-card terrain-card">

              <div className="intel-header">

                <div className="intel-title-section">

                  <h3>⛰️ Terrain & Slope Analysis</h3>

                  <p className="subtitle">Professional Assessment</p>

                </div>

                {/* <div className="terrain-score-badge">

                <span className="score-value">{data.factors?.physical?.slope?.value?.toFixed(1) || '---'}Â°</span>

                <span className="score-label">SLOPE</span>

              </div> */}

              </div>



              <div className="terrain-compact-grid">

                <div className="terrain-metric-row">

                  <div className="terrain-metric-item">

                    <div className="metric-icon">📐</div>

                    <div className="metric-info">

                      <strong>Slope</strong>

                      <span>{data.factors?.physical?.slope?.value?.toFixed(1) || '---'}°</span>

                    </div>

                    <div className="metric-status">

                      <span className={`status-badge ${(data.factors?.physical?.slope?.value || 0) < 8 ? 'good' : (data.factors?.physical?.slope?.value || 0) < 15 ? 'moderate' : (data.factors?.physical?.slope?.value || 0) < 30 ? 'poor' : 'critical'}`}>

                        {(data.factors?.physical?.slope?.value || 0) < 8 ? 'FLAT' :

                          (data.factors?.physical?.slope?.value || 0) < 15 ? 'MODERATE' :

                            (data.factors?.physical?.slope?.value || 0) < 30 ? 'STEEP' : 'VERY STEEP'}

                      </span>

                    </div>

                  </div>



                  <div className="terrain-metric-item">

                    <div className="metric-icon">🏔️</div>

                    <div className="metric-info">

                      <strong>Elevation</strong>

                      <span>{data.factors?.physical?.elevation?.value?.toFixed(0) || '---'}m</span>

                    </div>

                    <div className="metric-status">

                      <span className={`status-badge ${(data.factors?.physical?.elevation?.value || 0) < 100 ? 'low' : (data.factors?.physical?.elevation?.value || 0) < 500 ? 'medium' : (data.factors?.physical?.elevation?.value || 0) < 1500 ? 'high' : 'extreme'}`}>

                        {(data.factors?.physical?.elevation?.value || 0) < 100 ? 'LOWLAND' :

                          (data.factors?.physical?.elevation?.value || 0) < 500 ? 'PLAINS' :

                            (data.factors?.physical?.elevation?.value || 0) < 1500 ? 'HILLS' : 'MOUNTAINS'}

                      </span>

                    </div>

                  </div>



                  <div className="terrain-metric-item">

                    <div className="metric-icon">🚧</div>

                    <div className="metric-info">

                      <strong>Viability</strong>

                      <span>

                        {(data.factors?.physical?.slope?.value || 0) < 8 ? 'Excellent' :

                          (data.factors?.physical?.slope?.value || 0) < 15 ? 'Good' :

                            (data.factors?.physical?.slope?.value || 0) < 30 ? 'Challenging' : 'Limited'}

                      </span>

                    </div>

                    <div className="metric-status">

                      <span className={`status-badge ${(data.factors?.physical?.slope?.value || 0) < 8 ? 'excellent' : (data.factors?.physical?.slope?.value || 0) < 15 ? 'good' : (data.factors?.physical?.slope?.value || 0) < 30 ? 'challenging' : 'not-recommended'}`}>

                        {(data.factors?.physical?.slope?.value || 0) < 8 ? 'IDEAL' :

                          (data.factors?.physical?.slope?.value || 0) < 15 ? 'SUITABLE' :

                            (data.factors?.physical?.slope?.value || 0) < 30 ? 'DIFFICULT' : 'NOT RECOMMENDED'}

                      </span>

                    </div>

                  </div>

                </div>

              </div>



              <div className="terrain-quick-insights">

                <div className="insight-row">

                  <div className="insight-item">

                    <span className="insight-icon">⚡</span>

                    <div className="insight-content">

                      <strong>Earthwork</strong>

                      <span>

                        {(data.factors?.physical?.slope?.value || 0) < 5 ? 'Minimal' :

                          (data.factors?.physical?.slope?.value || 0) < 10 ? 'Low' :

                            (data.factors?.physical?.slope?.value || 0) < 20 ? 'Moderate' : 'High'}

                      </span>

                    </div>

                  </div>

                  <div className="insight-item">

                    <span className="insight-icon">🛡</span>

                    <div className="insight-content">

                      <strong>Walls</strong>

                      <span>

                        {(data.factors?.physical?.slope?.value || 0) < 8 ? 'Not Required' :

                          (data.factors?.physical?.slope?.value || 0) < 15 ? 'Partial' :

                            (data.factors?.physical?.slope?.value || 0) < 25 ? 'Extensive' : 'Major'}

                      </span>

                    </div>

                  </div>

                  <div className="insight-item">

                    <span className="insight-icon">💰</span>

                    <div className="insight-content">

                      <strong>Cost Impact</strong>

                      <span>

                        {(data.factors?.physical?.slope?.value || 0) < 8 ? 'Standard' :

                          (data.factors?.physical?.slope?.value || 0) < 15 ? 'Moderate' :

                            (data.factors?.physical?.slope?.value || 0) < 30 ? 'High' : 'Very High'}

                      </span>

                    </div>

                  </div>

                  <div className="insight-item">

                    <span className="insight-icon">⏱️</span>

                    <div className="insight-content">

                      <strong>Build Time</strong>

                      <span>

                        {(data.factors?.physical?.slope?.value || 0) < 8 ? 'Normal' :

                          (data.factors?.physical?.slope?.value || 0) < 15 ? '+2-4 weeks' :

                            (data.factors?.physical?.slope?.value || 0) < 30 ? '+1-3 months' : '+3+ months'}

                      </span>

                    </div>

                  </div>

                </div>

              </div>



              <div className="terrain-recommendation">

                <div className="recommendation-header">

                  <span className="rec-icon">

                    {(data.factors?.physical?.slope?.value || 0) < 8 ? '✅' :

                      (data.factors?.physical?.slope?.value || 0) < 15 ? '👍' :

                        (data.factors?.physical?.slope?.value || 0) < 30 ? '⚠' : '🚫'}

                  </span>

                  <span className="rec-title">

                    {(data.factors?.physical?.slope?.value || 0) < 8 ? 'Excellent for all development types' :

                      (data.factors?.physical?.slope?.value || 0) < 15 ? 'Suitable with minor planning' :

                        (data.factors?.physical?.slope?.value || 0) < 30 ? 'Requires extensive engineering' :

                          'Not recommended for standard construction'}

                  </span>

                </div>

              </div>

            </div>



            {/* Digital Twin Infrastructure Simulation Card - Moved to Analysis */}

            <div

              className={`card glass-morphic intel-card digital-twin-card draggable-digital-twin ${isDigitalTwinDragging ? 'dragging' : ''}`}

              style={{

                position: 'relative',

                transform: `translate(${digitalTwinPosition.x}px, ${digitalTwinPosition.y}px)`

              }}

            >

              <div className="intel-header">

                <h3>🏗️ Digital Twin Infrastructure Simulation</h3>

                <p className="subtitle">Interactive Development Impact Analysis & Planning</p>

                <div className="drag-handle" onMouseDown={handleDigitalTwinMouseDown}>⋮⋮</div>

              </div>

              <div className="impact-info">

                <p className="impact-description">

                  💡 <strong>Impact Simulation:</strong> This advanced digital twin allows you to simulate various development scenarios and their environmental impacts in real-time.

                  Try placing buildings, roads, or infrastructure to see immediate effects on the ecosystem.

                </p>

              </div>

              <DigitalTwin

                location={{ lat: lat, lng: lng, factors: data.factors }}

                onImpactUpdate={(impactData) => {

                  console.log('Development impact:', impactData);

                }}

              />

            </div>

          </div>

        </div>

      );

    }



    // // Fallback return to avoid "undefined" errors

    // return null;

  };

  return (
    <div className="app-shell">
      {/* <AudioLandscape

        activeFactors={isCompareMode
          ? (mobileCompareSite === "A" ? result?.factors : compareResult?.factors)
          : result?.factors
        }

        resultLabel={isCompareMode
          ? (mobileCompareSite === "A" ? result?.label : compareResult?.label)
          : result?.label
        }

        compareFactors={compareResult?.factors}
        compareResultLabel={compareResult?.label}
        isEnabled={isAudioEnabled}
        isLoading={loading || compareLoading}
        siteAPlaying={siteAPlaying}
        siteBPlaying={siteBPlaying}
      /> */}
      {/* <AudioLandscape
  // SITE A DATA
  activeFactors={result?.factors}
  resultLabel={result?.label}
  
  // SITE B DATA (Passing null when comparison is closed)
  compareFactors={isCompareMode ? compareResult?.factors : null}
  compareResultLabel={isCompareMode ? compareResult?.label : null}
  
  // MASTER TOGGLES
  isEnabled={isAudioEnabled}
  isLoading={loading || compareLoading}
  
  // INDIVIDUAL MUTES (Controlled by TopNav)
  siteAPlaying={siteAPlaying}
  siteBPlaying={siteBPlaying}
/> */}
      <AudioLandscape
        activeFactors={result?.factors}
        resultLabel={result?.label}

        compareFactors={isCompareMode ? compareResult?.factors : null}
        compareResultLabel={isCompareMode ? compareResult?.label : null}

        isEnabled={isAudioEnabled}

        siteAPlaying={siteAPlaying}
        siteBPlaying={siteBPlaying}
        analysisComplete={analysisComplete}
      />

      <TopNav
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isAudioEnabled={isAudioEnabled}
        setIsAudioEnabled={setIsAudioEnabled}
        adaptiveWeather={adaptiveWeather}
        setAdaptiveWeather={setAdaptiveWeather}
        weatherOpacity={weatherOpacity}
        setWeatherOpacity={setWeatherOpacity}
        result={result}
        compareResult={compareResult}
        isCompareMode={isCompareMode}
        siteAPlaying={siteAPlaying}
        setSiteAPlaying={setSiteAPlaying}
        siteBPlaying={siteBPlaying}
        setSiteBPlaying={setSiteBPlaying}
        siteAWeather={siteAWeather}
        setSiteAWeather={setSiteAWeather}
        siteBWeather={siteBWeather}
        setSiteBWeather={setSiteBWeather}
        siteAOpacity={siteAOpacity}
        setSiteAOpacity={setSiteAOpacity}
        siteBOpacity={siteBOpacity}
        setSiteBOpacity={setSiteBOpacity}
        analysisHistory={analysisHistory}
        onSearchResult={handleSearchResult}
      />


      <SideBar
        onSearchResult={handleSearchResult}

        lat={lat} setLat={setLat} lng={lng} setLng={setLng}

        locationAName={locationAName} setLocationAName={setLocationAName}

        loading={loading} handleSubmit={handleSubmit}

        handleMyLocation={handleMyLocation} handleSavePlace={handleSavePlace}

        handleNearbyPlaces={handleNearbyPlaces}

        nearbyLoading={nearbyLoading}

        nearbyData={nearbyData}

        result={result} showLocationB={showLocationB}

        setShowLocationB={setShowLocationB} locationBName={locationBName}

        isSelectingB={isSelectingB} setIsSelectingB={setIsSelectingB}

        bLatInput={bLatInput} setBLatInput={setBLatInput}

        bLngInput={bLngInput} setBLngInput={setBLngInput}

        savedPlaces={savedPlaces} handleCompareSelect={handleCompareSelect}

        compareLoading={compareLoading} isCompareMode={isCompareMode}

        setCompareResult={setCompareResult}       // <--- Add this

        setSnapshotDataB={setSnapshotDataB}       // <--- Add this

        setLocationBName={setLocationBName}

        setIsCompareMode={setIsCompareMode}

        handleMyLocationB={handleMyLocationB}

        handleSavePlaceB={handleSavePlaceB}

        isBFromSavedPlace={isBFromSavedPlace}

        setSavedPlaces={setSavedPlaces}

        sidebarWidth={sidebarWidth} startResizingSide={startResizingSide}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}

        analyzedCoordsB={analyzedCoordsB}

        analyzedCoords={analyzedCoords}

        closeSiteA={closeSiteA} setCloseSiteA={setCloseSiteA}

        setResult={setResult} setAnalyzedCoords={setAnalyzedCoords}

        onProjectImport={onProjectImport}

        nearbyLoadingB={nearbyLoadingB}

        handleNearbyPlacesB={handleNearbyPlacesB}

        showNearby={showNearby}

        setShowNearby={setShowNearby}

        compareResult={compareResult}

        editingIndex={editingIndex}

        setEditingIndex={setEditingIndex}

        editingName={editingName}

        setEditingName={setEditingName}

        setAnalyzedCoordsB={setAnalyzedCoordsB}

      />



      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <WeatherEffects
          weather={result?.weather}
          adaptiveWeather={siteAWeather}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          weatherOpacity={siteAOpacity}
          siteId="A"
          lat={parseFloat(lat)}
          lng={parseFloat(lng)}
        />
        <section className="map-container" style={{ flex: 1, position: 'relative' }}>
          {/* Add WeatherEffects for fullscreen map */}
          <WeatherEffects
            weather={result?.weather}
            adaptiveWeather={siteAWeather}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            weatherOpacity={siteAOpacity}
            siteId="A"
            lat={parseFloat(lat)}
            lng={parseFloat(lng)}
          />

          {/* MOVE THE REF TO WRAP EVERYTHING */}

          <div

            ref={mapViewportRef}

            className="map-viewport"

            style={{ height: "100%", width: "100%", position: "relative", background: "#000" }}

          >

            {/* TACTICAL ZOOM CONTROLS (Left side of map) */}

            <div className="tactical-zoom-hud">

              <button onClick={handleZoomIn}>+</button>

              <div className="zoom-divider" />

              <button onClick={handleZoomOut}>−</button>

            </div>
            {/* INSERT THE GLOBAL SYNC DOCK HERE */}
  <GlobalSyncDock />

            {/* TACTICAL ENGINE TOGGLE */}



            <div className={`engine-switch-container ${areControlsCollapsed ? 'collapsed' : ''}`}>

              <button

                className={`switch-btn ${mapMode === "2D" ? "active" : ""}`}

                onClick={() => setMapMode("2D")}

                title="Standard 2D"

              >

                2D

              </button>

              <button

                className={`switch-btn ${mapMode === "3D" ? "active" : ""}`}

                onClick={() => setMapMode("3D")}

                title="Tactical 3D"

              >

                3D

              </button>

              <div className="vertical-divider" />

              <button className="fullscreen-btn" onClick={toggleFullScreen} title="Map Focus Mode">⛶</button>

            </div>

            {/* Standalone toggle button that never collapses */}
            <div className="standalone-toggle-container">
              <button 
                className="collapse-controls-btn" 
                onClick={() => setAreControlsCollapsed(!areControlsCollapsed)}
                title={areControlsCollapsed ? "Show Controls" : "Hide Controls"}
              >
                {areControlsCollapsed ? "◀" : "▶"}
              </button>
            </div>



            <div className={`map-variety-picker ${areControlsCollapsed ? 'collapsed' : ''}`}>

              <label className="picker-header">🗺️ Map Variety</label>

              {mapMode === "2D" ? (

                <>

                  <select value={mapVariety} onChange={(e) => setMapVariety(e.target.value)} className="variety-select">

                    <optgroup label="Google Maps">

                      <option value="hybrid">Satellite Hybrid</option>

                      <option value="satellite">Pure Satellite</option>

                      <option value="terrain">Physical Terrain</option>

                    </optgroup>

                    <optgroup label="Analysis Themes">

                      <option value="dark">Dark Matter (Pro)</option>

                      <option value="topo">Topographic (Technical)</option>

                      <option value="streets">Standard Streets</option>

                      <option value="light">Minimalist Light</option>

                    </optgroup>

                  </select>



                  <div className="spectral-toggle-bar">

                    <button className={activeSpectral === "ndvi" ? "active" : ""} onClick={() => setActiveSpectral(activeSpectral === "ndvi" ? "standard" : "ndvi")}>🌿 NDVI</button>

                    <button className={activeSpectral === "thermal" ? "active" : ""} onClick={() => setActiveSpectral("thermal")}>🔥 Heat</button>

                    <button className={activeSpectral === "hydrology" ? "active" : ""} onClick={() => setActiveSpectral("hydrology")}>💧 Flow</button>

                  </div>

                </>

              ) : (

                <select value={active3DStyle} onChange={(e) => setActive3DStyle(e.target.value)} className="variety-select">
                  <option value="satellite">🛰 3D Satellite</option>
                  <option value="topo"> 3D Topographic</option>
                  <option value="dark">🕶 3D Stealth</option>
                  <option value="nature">🌱 3D Nature</option>
                  <option value="streets"> 3D Urban (Buildings)</option> {/* New */}
                  <option value="outdoor">⛅ 3D Atmospheric</option>
                </select>
              )}
            </div>
            <div className={`tactical-mode-toggle-container ${areControlsCollapsed ? 'collapsed' : ''}`}>
              <div className="toggle-row-content">
                <span className="toggle-label">Geo-Triad</span>
                <label className="switch-attractive">
                  <input
                    type="checkbox"
                    checked={isTacticalMode}
                    onChange={() => setIsTacticalMode(!isTacticalMode)}
                  />
                  <span className="slider-attractive"></span>
                </label>
              </div>

              {isTacticalMode && (
                <div className="tactical-snap-controls animate-slide-in">
                  <button className="snap-btn btn-a" onClick={() => window.snapToA?.()}>A</button>
                  <button className="snap-btn btn-b" onClick={() => window.snapToB?.()}>B</button>
                  <button className="snap-btn btn-live" onClick={() => window.snapToLive?.()}></button>
                </div>
              )}
            </div>
            {mapMode === "2D" ? (



              <MapContainer

                key={`map-${lat}-${lng}-${zoom}`}

                center={viewCenter}

                zoom={zoom}

                zoomControl={false}

                style={{ height: "100%", width: "100%" }}

              >

                <MapCenterSync setViewCenter={setViewCenter} />

                <TileLayer url={varieties[mapVariety]} />



                {activeSpectral !== "standard" && spectralLayers[activeSpectral] && (

                  <TileLayer url={spectralLayers[activeSpectral]} opacity={0.6} />

                )}



                <TacticalMapController

                  latA={analyzedCoords.lat}

                  lngA={analyzedCoords.lng}

                  latB={analyzedCoordsB.lat}

                  lngB={analyzedCoordsB.lng}

                  currentLat={lat}

                  currentLng={lng}

                  setLat={setLat}

                  setLng={setLng}

                  isSelectingB={isSelectingB}

                  setBLatInput={setBLatInput}

                  setBLngInput={setBLngInput}

                  isTacticalMode={isTacticalMode}

                  setViewCenter={setViewCenter}

                  setZoom={setZoom}

                />



              </MapContainer>



            ) : (

              <ProMap

                lat={lat}

                lng={lng}

                zoom={zoom}

                setLat={setLat}      // REQUIRED

                setLng={setLng}

                factors={result?.factors}

                isDarkMode={isDarkMode}

                activeStyle={active3DStyle}

                interactive={true}

                // ADD THESE PROPS TO SYNC WITH 3D

                isTacticalMode={isTacticalMode}

                latA={analyzedCoords.lat}

                lngA={analyzedCoords.lng}

                latB={analyzedCoordsB.lat}

                lngB={analyzedCoordsB.lng}

              />

            )}

          </div>

        </section>

        <div className="horizontal-resizer" onMouseDown={startResizingBottom} />



        <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>



          {/* The result check wraps everything below */}

          {/* {result ? ( */}

          {result || loading || compareLoading ? (

            <>



              <div className={`results-tab-bar glass-morphic ${isAnalysisFullscreen ? 'fullscreen' : ''}`}>
                {/* {analysisTime && result && (
                    <div className="analysis-timestamp-container">
                      <div className="timestamp-content">
                        
                        <div className="timestamp-text-stack">
                          <span className="timestamp-label">LAST ANALYZED AT:</span>
                          <div className="timestamp-value-group">
                           
                            <span className="ts-date">{analysisTime.split(',')[0]}</span>
                            <span className="ts-separator">/</span>
                            <span className="ts-time">{analysisTime.split(',')[1]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )} */}
                {/* Center Tabs */}
                <div className="tab-buttons-container">
                  
                  <button className={activeTab === "suitability" ? "active" : ""} onClick={() => setActiveTab("suitability")}>
                    <span className="tab-icon">🎯</span>
                    <span className="tab-text">Suitability</span>
                  </button>
                  <button className={activeTab === "environmental" ? "active" : ""} onClick={() => setActiveTab("environmental")}>
                    <span className="tab-icon">🌐</span>
                    <span className="tab-text">Locational Intelligence</span>
                  </button>
                  <button className={activeTab === "infrastructure" ? "active" : ""} onClick={() => setActiveTab("infrastructure")}>
                    <span className="tab-icon">🏗️</span>
                    <span className="tab-text">Strategic Utility</span>
                  </button>
                </div>

                {/* Right Controls */}
                <div className="analysis-header">
                  {/* <button className="fullscreen-tab-btn" onClick={() => setIsAnalysisFullscreen(!isAnalysisFullscreen)}>
      {isAnalysisFullscreen ? "âœ•" : "â›¶"}
    </button> */}
                  <button
                    className={`fullscreen-tab-btn ${isAnalysisFullscreen ? "close-btn" : ""}`}
                    onClick={() => setIsAnalysisFullscreen(!isAnalysisFullscreen)}
                  >
                    {isAnalysisFullscreen ? "✕" : "⛶"}
                  </button>

                  {/* {analysisTime && result && (
  <div className="analysis-timestamp-container">
    <div className="timestamp-content">
      <span className="timestamp-status-icon">● </span>
      <span className="timestamp-label">LAST ANALYZED:</span>
      <span className="timestamp-value">{analysisTime}</span>
    </div>
  </div>
)} */}
                  
                </div>
              </div>

              
              {(loading || compareLoading) && (

                <div className="loading-overlay">

                  <div className="spinner"></div>

                  <p>Analyzing Terrain Data...</p>

                </div>

              )}

              {/* 3. Data Viewport */}

              <div className={`tab-viewport ${isAnalysisFullscreen ? 'fullscreen' : ''}`}>

                {/* Add WeatherEffects for fullscreen analysis */}
                <WeatherEffects
                  weather={compareResult?.weather}
                  adaptiveWeather={siteBWeather}
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  weatherOpacity={siteBOpacity}
                  siteId="B"
                  lat={parseFloat(bLatInput)}
                  lng={parseFloat(bLngInput)}
                />

                {/* Floating Close Button for Fullscreen */}

                {isAnalysisFullscreen && (

                  <button

                    className="floating-close-btn"

                    onClick={() => setIsAnalysisFullscreen(false)}

                    title="Exit Fullscreen (ESC)"

                  >

                    ✕

                  </button>

                )}



                {/* SINGLE ANALYSIS VIEW */}

                {!isCompareMode && result && (

                  <div className="single-analysis-view">

                    <h4 className="pane-header">{locationAName.toUpperCase()} - FULL TERRAIN REPORT</h4>

                    {/* {renderTabContent(result, analyzedCoords, locationAName, true)} */}
                    {renderTabContent(result, analyzedCoords, locationAName, true, "A")}


                  </div>

                )}





                {isCompareMode && (

                  <div className="mobile-location-tabs glass-morphic only-mobile">

                    <button

                      className={mobileCompareSite === "A" ? "active" : ""}

                      onClick={() => setMobileCompareSite("A")}

                    >

                    📍{locationAName}

                    </button>

                    <button

                      className={mobileCompareSite === "B" ? "active" : ""}

                      onClick={() => setMobileCompareSite("B")}

                    >

                       📍{locationBName || "Site B"}

                    </button>

                  </div>

                )}

                {isCompareMode && (

                  <div className="compare-layout-ditto">

                    {/* Site A Pane */}

                    <div className={`compare-pane-ditto ${mobileCompareSite === "A" ? "show-mobile" : "hide-mobile"}`}>

                      <h4 className="pane-header only-desktop">{locationAName.toUpperCase()}</h4>

                      {result ? renderTabContent(result, analyzedCoords, locationAName, false, "A") : <div className="empty-results">Analyzing Site A...</div>}

                    </div>



                    {/* Site B Pane */}

                    <div className={`compare-pane-ditto ${mobileCompareSite === "B" ? "show-mobile" : "hide-mobile"}`}>

                      <h4 className="pane-header only-desktop">{locationBName.toUpperCase() || "SITE B"}</h4>

                      {compareResult ? renderTabContent(compareResult, analyzedCoordsB, locationBName, false , "B") : <div className="empty-results">Waiting for selection...</div>}

                    </div>

                  </div>

                )}

              </div>

            </>

          ) : (

            /* This displays when the page is freshly opened and no analysis has run */

            <div className="welcome-placeholder">

              <div className="placeholder-content">

                <span className="placeholder-icon">🌍</span>

                <h3>Ready for Analysis</h3>

                <p>Select a location on the map or search above to begin geospatial synthesis.</p>

              </div>

            </div>

          )}

        </section>



        {/* Enhanced GeoGPT Component */}

        <GeoGPT

          isOpen={isGptOpen}

          onClose={setIsGptOpen}

          currentData={result}

          locationName={locationAName}

          compareData={compareResult}

        />

      </main>



      {(showNearby || showNearbyB) && (

        <div className="modal-overlay" onClick={() => { setShowNearby(false); setShowNearbyB(false); }}>

          <div className="modal-card" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">

              <h3>Nearby Amenities ({showNearbyB ? locationBName : locationAName})</h3>

              <button className="modal-close" onClick={() => { setShowNearby(false); setShowNearbyB(false); }}>✖</button>

            </div>

            <div className="modal-body">

              {(() => {

                const data = showNearbyB ? nearbyDataB : nearbyData;

                if (!data?.places?.length) return <div className="nearby-empty">No mapped amenities within 1.5 km.</div>;



                const schools = data.places.filter(p => p.type === "school");

                const hospitals = data.places.filter(p => p.type === "hospital");

                const colleges = data.places.filter(p => p.type === "college" || p.type === "university");

                const markets = data.places.filter(p => p.type === "market");

                const petrolBunks = data.places.filter(p => p.type === "petrol_bunk");

                const accessCities = data.places.filter(p => p.type === "access_city");

                const transit = data.places.filter(p => p.type === "transit");



                // Display all categories including new ones

                const allCategories = [

                  { title: "🏫 Schools", items: schools },

                  { title: "🏥 Hospitals", items: hospitals },

                  { title: "🎓 Colleges & Universities", items: colleges },

                  { title: "🛒 Markets & Shopping", items: markets },

                  { title: "⛽ Petrol Bunks", items: petrolBunks },

                  { title: "🏙️ Access Cities", items: accessCities },

                  { title: "🚌 Transit", items: transit }

                ].filter(cat => cat.items.length > 0); // Only show categories with items



                const Section = ({ title, items }) => (

                  <div className="nearby-section">

                    <h4>{title} ({items.length})</h4>

                    {items.length ? (

                      items.map((p, i) => (

                        <div key={i} className="nearby-item">

                          <span className="nearby-name">{p.name}</span>

                          <span className="nearby-distance">{p.distance_km} km</span>

                        </div>

                      ))

                    ) : (

                      <div className="nearby-empty">No nearby {title.toLowerCase()} found.</div>

                    )}

                  </div>

                );



                return (

                  <>

                    {allCategories.map((category, index) => (

                      <Section key={index} title={category.title} items={category.items} />

                    ))}

                  </>

                );

              })()}

            </div>

          </div>

        </div>



      )}

    </div>

  );
}
