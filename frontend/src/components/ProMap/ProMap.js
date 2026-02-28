// import React, { useEffect, useRef,  useCallback, useMemo} from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// const ProMap = ({ lat, lng, setLat, setLng, factors, isDarkMode, activeStyle,zoom, interactive = true }) => {
//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
  
//   const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';
//   const styles = useMemo(()=>({
//     satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
//     topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
//     dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
//     nature: 'https://api.maptiler.com/maps/voyager/style.json',
//     streets: 'https://api.maptiler.com/maps/streets-v2/style.json', // ✅ ADD THIS for Buildings
//   outdoor: 'https://api.maptiler.com/maps/outdoor-v2/style.json'
//   }),[]);


// const add3DLogic = useCallback((map) => {
//   if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

//   try {
//     if (!map.getSource('terrain')) {
//       map.addSource('terrain', {
//         type: 'raster-dem',
//         url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
//         tileSize: 512
//       });
//     }

//     map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

//     if (!map.getLayer('3d-buildings')) {
//       map.addLayer({
//         id: '3d-buildings',
//         source: 'openmaptiles',
//         'source-layer': 'building',
//         type: 'fill-extrusion',
//         minzoom: 13,
//         paint: {
//           'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
//           'fill-extrusion-height': ['get', 'render_height'],
//           'fill-extrusion-base': ['get', 'render_min_height'],
//           'fill-extrusion-opacity': 0.6,
//           'fill-extrusion-vertical-gradient': true
//         }
//       });
//     }

//     const pollution = factors?.pollution || 0;
//     // const atmosphereColor =
//     //   pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff');
//     // If 'outdoor' style is selected, use a realistic blue atmosphere
//     // Otherwise, use your tactical dark/pollution based colors
//     const atmosphereColor = activeStyle === 'outdoor' 
//       ? '#87CEEB' // Sky Blue
//       : (pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff'));

//     map.setSky({
//       'sky-color': atmosphereColor,
//       'sky-type': 'gradient',
//       'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
//       'horizon-fog-density': 0.4,
//       'fog-ground-blend': 0.6
//     });
//   } catch (e) {
//     console.warn("Syncing 3D...");
//   }
// }, [MAPTILER_KEY, activeStyle, factors, isDarkMode]);


// const attachClickHandler = useCallback((map) => {
//   if (!interactive || !setLat || !setLng) return;

//   let startPoint = null;

//   map.off('mousedown');
//   map.off('mouseup');

//   map.on('mousedown', (e) => {
//     startPoint = e.point;
//   });

//   map.on('mouseup', (e) => {
//     if (!startPoint) return;

//     const dx = Math.abs(e.point.x - startPoint.x);
//     const dy = Math.abs(e.point.y - startPoint.y);

//     if (dx < 5 && dy < 5) {
//       setLat(e.lngLat.lat.toString());
//       setLng(e.lngLat.lng.toString());
//     }

//     startPoint = null;
//   });
// }, [interactive, setLat, setLng]);



//   useEffect(() => {
//   let map;

//   if (!mapRef.current) {
//     map = new maplibregl.Map({
//       container: mapContainer.current,
//       style: `${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`,
//       center: [parseFloat(lng), parseFloat(lat)],
//       zoom: 15,
//       pitch: 65,
//       bearing: -15,
//       antialias: true,
//       interactive
//     });

//     mapRef.current = map;

//     attachClickHandler(map);

//     map.on('idle', () => add3DLogic(map));

//     const el = document.createElement('div');
//     el.className = 'pulse-marker-3d';
//     markerRef.current = new maplibregl.Marker(el)
//       .setLngLat([lng, lat])
//       .addTo(map);

//   } else {
//     map = mapRef.current;

//     map.setStyle(`${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`);

//     map.once('style.load', () => {
//       add3DLogic(map);
//       attachClickHandler(map); // ✅ REQUIRED after style change
//     });

//     // map.flyTo({
//     //   center: [parseFloat(lng), parseFloat(lat)],
//     //   duration: 1500,
//     //   essential: true
//     // });

//     map.easeTo({
//   center: [parseFloat(lng), parseFloat(lat)],
//   zoom: zoom,          // ✅ THIS is the missing link
//   duration: 600,
//   essential: true
// });

//     if (markerRef.current) {
//       markerRef.current.setLngLat([lng, lat]);
//     }
//   }
// }, [lat, lng, activeStyle, interactive,setLat, setLng, zoom, 
//     add3DLogic, attachClickHandler, styles]);

//   return <div ref={mapContainer} className="pro-map-view" style={{ width: '100%', height: '100%' }} />;
// };

// export default ProMap;
// import React, { useEffect, useRef, useCallback, useMemo } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// const ProMap = ({ 
//   lat, lng, setLat, setLng, factors, isDarkMode, activeStyle, zoom, 
//   interactive = true,
//   // 🚀 New Props for Tactical Sync
//   isTacticalMode, latA, lngA, latB, lngB 
// }) => {
//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
  
//   // Storage for persistent markers in 3D space
//   const markersRef = useRef({ live: null, a: null, b: null });

//   const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';
//   const styles = useMemo(() => ({
//     satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
//     topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
//     dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
//     nature: 'https://api.maptiler.com/maps/voyager/style.json',
//     streets: 'https://api.maptiler.com/maps/streets-v2/style.json',
//     outdoor: 'https://api.maptiler.com/maps/outdoor-v2/style.json'
//   }), []);

//   const add3DLogic = useCallback((map) => {
//     if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

//     try {
//       if (!map.getSource('terrain')) {
//         map.addSource('terrain', {
//           type: 'raster-dem',
//           url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
//           tileSize: 512
//         });
//       }

//       map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

//       if (!map.getLayer('3d-buildings')) {
//         map.addLayer({
//           id: '3d-buildings',
//           source: 'openmaptiles',
//           'source-layer': 'building',
//           type: 'fill-extrusion',
//           minzoom: 13,
//           paint: {
//             'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
//             'fill-extrusion-height': ['get', 'render_height'],
//             'fill-extrusion-base': ['get', 'render_min_height'],
//             'fill-extrusion-opacity': 0.6,
//             'fill-extrusion-vertical-gradient': true
//           }
//         });
//       }

//       const pollution = factors?.pollution || 0;
//       const atmosphereColor = activeStyle === 'outdoor' 
//         ? '#87CEEB' 
//         : (pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff'));

//       map.setSky({
//         'sky-color': atmosphereColor,
//         'sky-type': 'gradient',
//         'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
//         'horizon-fog-density': 0.4,
//         'fog-ground-blend': 0.6
//       });
//     } catch (e) {
//       console.warn("Syncing 3D...");
//     }
//   }, [MAPTILER_KEY, activeStyle, factors, isDarkMode]);

//   const attachClickHandler = useCallback((map) => {
//     if (!interactive || !setLat || !setLng) return;
//     let startPoint = null;
//     map.off('mousedown');
//     map.off('mouseup');
//     map.on('mousedown', (e) => { startPoint = e.point; });
//     map.on('mouseup', (e) => {
//       if (!startPoint) return;
//       const dx = Math.abs(e.point.x - startPoint.x);
//       const dy = Math.abs(e.point.y - startPoint.y);
//       if (dx < 5 && dy < 5) {
//         setLat(e.lngLat.lat.toString());
//         setLng(e.lngLat.lng.toString());
//       }
//       startPoint = null;
//     });
//   }, [interactive, setLat, setLng]);

//   useEffect(() => {
//     let map;
//     if (!mapRef.current) {
//       map = new maplibregl.Map({
//         container: mapContainer.current,
//         style: `${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`,
//         center: [parseFloat(lng), parseFloat(lat)],
//         zoom: 15,
//         pitch: 65,
//         bearing: -15,
//         antialias: true,
//         interactive
//       });
//       mapRef.current = map;
//       attachClickHandler(map);
//       map.on('idle', () => add3DLogic(map));

//       // 🟢 Live Pointer (Green Pulse)
//       const el = document.createElement('div');
//       el.className = 'pulse-marker-3d';
//       markersRef.current.live = new maplibregl.Marker(el)
//         .setLngLat([lng, lat])
//         .addTo(map);

//     } else {
//       map = mapRef.current;
//       map.setStyle(`${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`);
//       map.once('style.load', () => {
//         add3DLogic(map);
//         attachClickHandler(map);
//       });

//       map.easeTo({
//         center: [parseFloat(lng), parseFloat(lat)],
//         zoom: zoom,
//         duration: 600,
//         essential: true
//       });

//       // Update Live Pointer position
//       if (markersRef.current.live) {
//         markersRef.current.live.setLngLat([lng, lat]);
//       }
//     }

//     // 🔵 Site A Pointer (Blue)
//     if (isTacticalMode && latA && lngA) {
//       if (!markersRef.current.a) {
//         markersRef.current.a = new maplibregl.Marker({ color: "#3b82f6" })
//           .setLngLat([parseFloat(lngA), parseFloat(latA)])
//           .addTo(map);
//       } else {
//         markersRef.current.a.setLngLat([parseFloat(lngA), parseFloat(latA)]);
//       }
//     } else if (markersRef.current.a) {
//       markersRef.current.a.remove();
//       markersRef.current.a = null;
//     }

//     // 🔴 Site B Pointer (Red)
//     if (isTacticalMode && latB && lngB) {
//       if (!markersRef.current.b) {
//         markersRef.current.b = new maplibregl.Marker({ color: "#ef4444" })
//           .setLngLat([parseFloat(lngB), parseFloat(latB)])
//           .addTo(map);
//       } else {
//         markersRef.current.b.setLngLat([parseFloat(lngB), parseFloat(latB)]);
//       }
//     } else if (markersRef.current.b) {
//       markersRef.current.b.remove();
//       markersRef.current.b = null;
//     }

//   }, [lat, lng, latA, lngA, latB, lngB, isTacticalMode, activeStyle, interactive, setLat, setLng, zoom, add3DLogic, attachClickHandler, styles]);

//   return <div ref={mapContainer} className="pro-map-view" style={{ width: '100%', height: '100%' }} />;
// };

// export default ProMap;



// import React, { useEffect, useRef, useCallback, useMemo } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// const ProMap = ({ 
//   lat, lng, setLat, setLng, factors, isDarkMode, activeStyle, zoom, 
//   interactive = true,
//   // 🚀 Props for Tactical Sync
//   isTacticalMode, latA, lngA, latB, lngB 
// }) => {
//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
  
//   // Storage for persistent markers in 3D space
//   const markersRef = useRef({ live: null, a: null, b: null });

//   const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';
//   const styles = useMemo(() => ({
//     satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
//     topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
//     dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
//     nature: 'https://api.maptiler.com/maps/voyager/style.json',
//     streets: 'https://api.maptiler.com/maps/streets-v2/style.json',
//     outdoor: 'https://api.maptiler.com/maps/outdoor-v2/style.json'
//   }), []);

//   // ⚡ TACTICAL SNAP LOGIC FOR 3D
//   // Overwrites global snap functions to use MapLibre easeTo while 3D is active
//   useEffect(() => {
//     if (!mapRef.current) return;

//     window.snapToA = () => {
//       if (latA && lngA) {
//         mapRef.current.easeTo({ 
//           center: [parseFloat(lngA), parseFloat(latA)], 
//           zoom: 15, 
//           duration: 1000 
//         });
//       }
//     };

//     window.snapToB = () => {
//       if (latB && lngB) {
//         mapRef.current.easeTo({ 
//           center: [parseFloat(lngB), parseFloat(latB)], 
//           zoom: 15, 
//           duration: 1000 
//         });
//       }
//     };

//     window.snapToLive = () => {
//       mapRef.current.easeTo({ 
//         center: [parseFloat(lng), parseFloat(lat)], 
//         zoom: 15, 
//         duration: 1000 
//       });
//     };

//     return () => { 
//       delete window.snapToA; 
//       delete window.snapToB; 
//       delete window.snapToLive; 
//     };
//   }, [lat, lng, latA, lngA, latB, lngB]);

//   const add3DLogic = useCallback((map) => {
//     if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

//     try {
//       if (!map.getSource('terrain')) {
//         map.addSource('terrain', {
//           type: 'raster-dem',
//           url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
//           tileSize: 512
//         });
//       }

//       map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

//       if (!map.getLayer('3d-buildings')) {
//         map.addLayer({
//           id: '3d-buildings',
//           source: 'openmaptiles',
//           'source-layer': 'building',
//           type: 'fill-extrusion',
//           minzoom: 13,
//           paint: {
//             'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
//             'fill-extrusion-height': ['get', 'render_height'],
//             'fill-extrusion-base': ['get', 'render_min_height'],
//             'fill-extrusion-opacity': 0.6,
//             'fill-extrusion-vertical-gradient': true
//           }
//         });
//       }

//       const pollution = factors?.pollution || 0;
//       const atmosphereColor = activeStyle === 'outdoor' 
//         ? '#87CEEB' 
//         : (pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff'));

//       map.setSky({
//         'sky-color': atmosphereColor,
//         'sky-type': 'gradient',
//         'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
//         'horizon-fog-density': 0.4,
//         'fog-ground-blend': 0.6
//       });
//     } catch (e) {
//       console.warn("Syncing 3D...");
//     }
//   }, [MAPTILER_KEY, activeStyle, factors, isDarkMode]);

//   const attachClickHandler = useCallback((map) => {
//     if (!interactive || !setLat || !setLng) return;
//     let startPoint = null;
//     map.off('mousedown');
//     map.off('mouseup');
//     map.on('mousedown', (e) => { startPoint = e.point; });
//     map.on('mouseup', (e) => {
//       if (!startPoint) return;
//       const dx = Math.abs(e.point.x - startPoint.x);
//       const dy = Math.abs(e.point.y - startPoint.y);
//       if (dx < 5 && dy < 5) {
//         setLat(e.lngLat.lat.toString());
//         setLng(e.lngLat.lng.toString());
//       }
//       startPoint = null;
//     });
//   }, [interactive, setLat, setLng]);

//   useEffect(() => {
//     let map;
//     if (!mapRef.current) {
//       map = new maplibregl.Map({
//         container: mapContainer.current,
//         style: `${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`,
//         center: [parseFloat(lng), parseFloat(lat)],
//         zoom: 15,
//         pitch: 65,
//         bearing: -15,
//         antialias: true,
//         interactive
//       });
//       mapRef.current = map;
//       attachClickHandler(map);
//       map.on('idle', () => add3DLogic(map));

//       // 🟢 Live Pointer (Green Pulse)
//       const el = document.createElement('div');
//       el.className = 'pulse-marker-3d';
//       markersRef.current.live = new maplibregl.Marker(el)
//         .setLngLat([parseFloat(lng), parseFloat(lat)])
//         .addTo(map);

//     } else {
//       map = mapRef.current;
//       map.setStyle(`${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`);
//       map.once('style.load', () => {
//         add3DLogic(map);
//         attachClickHandler(map);
//       });

//       map.easeTo({
//         center: [parseFloat(lng), parseFloat(lat)],
//         zoom: zoom,
//         duration: 600,
//         essential: true
//       });

//       // Update Live Pointer position
//       if (markersRef.current.live) {
//         markersRef.current.live.setLngLat([parseFloat(lng), parseFloat(lat)]);
//       }
//     }

//     // 🔵 Site A Pointer (Blue)
//     if (isTacticalMode && latA && lngA) {
//       if (!markersRef.current.a) {
//         markersRef.current.a = new maplibregl.Marker({ color: "#3b82f6" })
//           .setLngLat([parseFloat(lngA), parseFloat(latA)])
//           .addTo(map);
//       } else {
//         markersRef.current.a.setLngLat([parseFloat(lngA), parseFloat(latA)]);
//       }
//     } else if (markersRef.current.a) {
//       markersRef.current.a.remove();
//       markersRef.current.a = null;
//     }

//     // 🔴 Site B Pointer (Red)
//     if (isTacticalMode && latB && lngB) {
//       if (!markersRef.current.b) {
//         markersRef.current.b = new maplibregl.Marker({ color: "#ef4444" })
//           .setLngLat([parseFloat(lngB), parseFloat(latB)])
//           .addTo(map);
//       } else {
//         markersRef.current.b.setLngLat([parseFloat(lngB), parseFloat(latB)]);
//       }
//     } else if (markersRef.current.b) {
//       markersRef.current.b.remove();
//       markersRef.current.b = null;
//     }

//   }, [lat, lng, latA, lngA, latB, lngB, isTacticalMode, activeStyle, interactive, setLat, setLng, zoom, add3DLogic, attachClickHandler, styles]);

//   return <div ref={mapContainer} className="pro-map-view" style={{ width: '100%', height: '100%' }} />;
// };

// export default ProMap;
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const ProMap = ({ 
  lat, lng, setLat, setLng, factors, isDarkMode, activeStyle, zoom, 
  interactive = true,
  isTacticalMode, latA, lngA, latB, lngB,
  onMapLocationSelect
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  
  // Storage for persistent markers in 3D space
  const markersRef = useRef({ live: null, a: null, b: null });

  const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';
  const styles = useMemo(() => ({
    satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
    topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
    dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
    nature: 'https://api.maptiler.com/maps/voyager/style.json',
    streets: 'https://api.maptiler.com/maps/streets-v2/style.json',
    outdoor: 'https://api.maptiler.com/maps/outdoor-v2/style.json'
  }), []);

  // Register global snap functions so A/B/Live buttons fly to the correct location in 3D (MapLibre: center is [lng, lat])
  const registerSnapHandlers = useCallback((mapInstance) => {
    if (!mapInstance || typeof mapInstance.easeTo !== 'function') return;
    const dur = 1200; // ms
    window.snapToA = () => {
      const lo = parseFloat(lngA);
      const la = parseFloat(latA);
      if (Number.isFinite(la) && Number.isFinite(lo)) {
        mapInstance.easeTo({ center: [lo, la], zoom: 16, pitch: 60, duration: dur, essential: true });
      }
    };
    window.snapToB = () => {
      const lo = parseFloat(lngB);
      const la = parseFloat(latB);
      if (Number.isFinite(la) && Number.isFinite(lo)) {
        mapInstance.easeTo({ center: [lo, la], zoom: 16, pitch: 60, duration: dur, essential: true });
      }
    };
    window.snapToLive = () => {
      const lo = parseFloat(lng);
      const la = parseFloat(lat);
      if (Number.isFinite(la) && Number.isFinite(lo)) {
        mapInstance.easeTo({ center: [lo, la], zoom: 16, pitch: 60, duration: dur, essential: true });
      }
    };
  }, [lat, lng, latA, lngA, latB, lngB]);

  const add3DLogic = useCallback((map) => {
    if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

    try {
      if (!map.getSource('terrain')) {
        map.addSource('terrain', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 512
        });
      }

      map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.6,
            'fill-extrusion-vertical-gradient': true
          }
        });
      }

      const pollution = factors?.pollution || 0;
      const atmosphereColor = activeStyle === 'outdoor' 
        ? '#87CEEB' 
        : (pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff'));

      map.setSky({
        'sky-color': atmosphereColor,
        'sky-type': 'gradient',
        'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
        'horizon-fog-density': 0.4,
        'fog-ground-blend': 0.6
      });
    } catch (e) {
      console.warn("Syncing 3D...");
    }
  }, [MAPTILER_KEY, activeStyle, factors, isDarkMode]);

  const attachClickHandler = useCallback((map) => {
    if (!interactive || !setLat || !setLng) return;
    let startPoint = null;
    map.off('mousedown');
    map.off('mouseup');
    map.on('mousedown', (e) => { startPoint = e.point; });
    map.on('mouseup', (e) => {
      if (!startPoint) return;
      const dx = Math.abs(e.point.x - startPoint.x);
      const dy = Math.abs(e.point.y - startPoint.y);
      if (dx < 5 && dy < 5) {
        setLat(e.lngLat.lat.toString());
        setLng(e.lngLat.lng.toString());
        if (onMapLocationSelect) onMapLocationSelect();
      }
      startPoint = null;
    });
  }, [interactive, setLat, setLng, onMapLocationSelect]);

  useEffect(() => {
    let map;
    if (!mapRef.current) {
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: `${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`,
        center: [parseFloat(lng), parseFloat(lat)],
        zoom: 15,
        pitch: 65,
        bearing: -15,
        antialias: true,
        interactive
      });
      mapRef.current = map;
      attachClickHandler(map);
      map.on('idle', () => add3DLogic(map));
      map.once('load', () => registerSnapHandlers(mapRef.current));

      // 🟢 Live Pointer (Green Pulse)
      const el = document.createElement('div');
      el.className = 'pulse-marker-3d';
      markersRef.current.live = new maplibregl.Marker(el)
        .setLngLat([parseFloat(lng), parseFloat(lat)])
        .addTo(map);

    } else {
      map = mapRef.current;
      map.setStyle(`${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`);
      map.once('style.load', () => {
        add3DLogic(map);
        attachClickHandler(map);
        registerSnapHandlers(mapRef.current); // Re-register after style load so A/B/Live work in 3D
      });

      map.easeTo({
        center: [parseFloat(lng), parseFloat(lat)],
        zoom: map.getZoom(),
        duration: 600,
        essential: true
      });

      if (markersRef.current.live) {
        markersRef.current.live.setLngLat([parseFloat(lng), parseFloat(lat)]);
      }
    }

    // 🔵 Site A Pointer (Blue)
    if (isTacticalMode && latA && lngA) {
      if (!markersRef.current.a) {
        markersRef.current.a = new maplibregl.Marker({ color: "#3b82f6" })
          .setLngLat([parseFloat(lngA), parseFloat(latA)])
          .addTo(map);
      } else {
        markersRef.current.a.setLngLat([parseFloat(lngA), parseFloat(latA)]);
      }
    } else if (markersRef.current.a) {
      markersRef.current.a.remove();
      markersRef.current.a = null;
    }

    // 🔴 Site B Pointer (Red)
    if (isTacticalMode && latB && lngB) {
      if (!markersRef.current.b) {
        markersRef.current.b = new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([parseFloat(lngB), parseFloat(latB)])
          .addTo(map);
      } else {
        markersRef.current.b.setLngLat([parseFloat(lngB), parseFloat(latB)]);
      }
    } else if (markersRef.current.b) {
      markersRef.current.b.remove();
      markersRef.current.b = null;
    }

    // Register A/B/Live snap so buttons work in 3D (run when map exists so handlers have latest coords)
    if (mapRef.current) registerSnapHandlers(mapRef.current);

    return () => {
      delete window.snapToA;
      delete window.snapToB;
      delete window.snapToLive;
    };
  }, [lat, lng, latA, lngA, latB, lngB, isTacticalMode, activeStyle, interactive, setLat, setLng, onMapLocationSelect, add3DLogic, attachClickHandler, registerSnapHandlers, styles]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof map.getCenter !== 'function') return;
    map.easeTo({
      center: map.getCenter(),
      zoom: zoom,
      duration: 400,
      essential: true
    });
  }, [zoom]);

  return <div ref={mapContainer} className="pro-map-view" style={{ width: '100%', height: '100%' }} />;
};

export default ProMap;