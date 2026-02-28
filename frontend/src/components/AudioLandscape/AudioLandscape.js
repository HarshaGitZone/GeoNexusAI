  import { useEffect, useRef, useCallback } from "react";
  import { Howl, Howler } from "howler";

  const getAudioSources = (biome) => {
    const sounds = {
      // Water
      ocean: ["/sounds/ocean.mp3"],
      river: ["/sounds/river.mp3"],
      flood: ["/sounds/flood.mp3"],

      // Nature
      forest: ["/sounds/forest.mp3"],
      mountain: ["/sounds/mountain.webm"],
      rural: ["/sounds/rural.mp3"],

      // Human / City
      urban: ["/sounds/urban.mp3"],
      traffic: ["/sounds/traffic.mp3"],
      industrial: ["/sounds/industrial.mp3"],

      // Environment risk
      pollution: ["/sounds/pollution.mp3"],
      heat: ["/sounds/heat.mp3"],
      hazard: ["/sounds/hazard.mp3"],

      // Default + events
      ambient: ["/sounds/ambient.mp3"],
      success: ["/sounds/success.mp3"],
    };

    return sounds[biome] || sounds.ambient;
  };

  // ============================================================
  // HELPER: safe nested factor score extraction (0-100)
  // ============================================================
  const getFactorScore = (factors, category, key) => {
    try {
      const obj = factors?.[category]?.[key];
      if (obj == null) return null;

      // Your factor objects usually have:
      // { value, scaled_score, evidence, ... }
      const v =
        obj?.scaled_score ??
        obj?.scaledScore ??
        obj?.score ??
        obj?.value ??
        null;

      if (v == null) return null;

      const n = Number(v);
      if (Number.isNaN(n)) return null;

      // clamp
      return Math.max(0, Math.min(100, n));
    } catch (e) {
      return null;
    }
  };

  const AudioLandscape = ({
    activeFactors,
    isEnabled,
    resultLabel,

    compareFactors,
    compareResultLabel,

    siteAPlaying = true,
    siteBPlaying = true,

    // IMPORTANT: must be passed from LandSuitabilityChecker
    analysisComplete = false,
  }) => {
    const siteASoundRef = useRef(null);
    const siteBSoundRef = useRef(null);
    const hasUserInteracted = useRef(false);

    // ============================================================
    // SUCCESS SOUND (ONCE PER COMPLETION)
    // ============================================================
    const lastAnalysisComplete = useRef(false);

    const playSuccessSound = useCallback(() => {
      if (!isEnabled) return;

      const sound = new Howl({
        src: getAudioSources("success"),
        volume: 0.8, // 🔊 boosted
        html5: false,
      });

      sound.play();
    }, [isEnabled]);

    useEffect(() => {
      if (analysisComplete && !lastAnalysisComplete.current) {
        playSuccessSound();
        lastAnalysisComplete.current = true;
      }

      if (!analysisComplete) {
        lastAnalysisComplete.current = false;
      }
    }, [analysisComplete, playSuccessSound]);

    // ============================================================
    // HARD KILL SOUND (absolute stop)
    // ============================================================
    const killSound = useCallback((ref, siteName) => {
      if (!ref.current) return;

      try {
        console.log(
          `%c🛑 [AUDIO] KILL ${siteName}`,
          "color:#ef4444;font-weight:bold;"
        );
        ref.current.stop();
        ref.current.unload();
      } catch (e) {
        console.warn(`⚠️ Kill error (${siteName}):`, e);
      } finally {
        ref.current = null;
      }
    }, []);

    const killAll = useCallback(() => {
      killSound(siteASoundRef, "SITE A");
      killSound(siteBSoundRef, "SITE B");

      // extra safety
      try {
        Howler.stop();
      } catch (e) {}
    }, [killSound]);

    // ============================================================
    // BIOME DETECTION
    // IMPORTANT: in your system higher score = safer/better
    // So RISK SOUNDS must trigger on LOW scores
    // ============================================================
    // const detectBiome = useCallback((factors, label) => {
    //   if (!factors && !label) return "ambient";

    //   const textLabel = (label || "").toLowerCase();

    //   // ------------------------------------------------------------
    //   // 1) Text overrides (rare but useful)
    //   // ------------------------------------------------------------
    //   if (
    //     textLabel.includes("ocean") ||
    //     textLabel.includes("sea") ||
    //     textLabel.includes("water body") ||
    //     textLabel.includes("coastal") ||
    //     textLabel.includes("beach")
    //   )
    //     return "ocean";

    //   if (textLabel.includes("forest")) return "forest";
    //   if (textLabel.includes("mountain") || textLabel.includes("hills"))
    //     return "mountain";
    //   if (textLabel.includes("urban") || textLabel.includes("city")) return "urban";
    //   if (textLabel.includes("traffic")) return "traffic";
    //   if (textLabel.includes("river")) return "river";
    //   if (textLabel.includes("rural") || textLabel.includes("village"))
    //     return "rural";

    //   // ------------------------------------------------------------
    //   // 2) Extract your 23 factor scores (0-100)
    //   // ------------------------------------------------------------

    //   // HYDROLOGY
    //   const flood = getFactorScore(factors, "hydrology", "flood");
    //   const water = getFactorScore(factors, "hydrology", "water");
    //   const drainage = getFactorScore(factors, "hydrology", "drainage");
    //   const groundwater = getFactorScore(factors, "hydrology", "groundwater");

    //   // ENVIRONMENTAL
    //   const pollution = getFactorScore(factors, "environmental", "pollution");
    //   const vegetation = getFactorScore(factors, "environmental", "vegetation");
    //   const biodiversity = getFactorScore(factors, "environmental", "biodiversity");
    //   const heatIsland = getFactorScore(factors, "environmental", "heat_island");

    //   // CLIMATIC
    //   const rainfall = getFactorScore(factors, "climatic", "rainfall");
    //   const heatStress = getFactorScore(factors, "climatic", "intensity");

    //   // PHYSICAL
    //   const elevation = getFactorScore(factors, "physical", "elevation");
    //   const ruggedness = getFactorScore(factors, "physical", "ruggedness");
    //   const slope = getFactorScore(factors, "physical", "slope");

    //   // SOCIO ECON
    //   const infrastructure = getFactorScore(factors, "socio_econ", "infrastructure");
    //   const landuse = getFactorScore(factors, "socio_econ", "landuse");
    //   const population = getFactorScore(factors, "socio_econ", "population");

    //   // RISK
    //   const multiHazard = getFactorScore(factors, "risk_resilience", "multi_hazard");

    //   // ------------------------------------------------------------
    //   // 3) PRIORITY RULES
    //   // NOTE: LOW SCORE = BAD = danger sound
    //   // ------------------------------------------------------------

    //   // 🛑 Multi-hazard danger zone (LOW score = high hazard)
    //   if (multiHazard !== null && multiHazard <= 35) return "hazard";

    //   // 🌊 Flood danger (LOW score = flood risk high)
    //   if (flood !== null && flood <= 35) return "flood";

    //   // 🌫️ Pollution danger (LOW score = bad air)
    //   if (pollution !== null && pollution <= 35) return "pollution";

    //   // 🔥 Heat danger (LOW score = uncomfortable / risky)
    //   if (
    //     (heatStress !== null && heatStress <= 35) ||
    //     (heatIsland !== null && heatIsland <= 35)
    //   )
    //     return "heat";

    //   // ------------------------------------------------------------
    //   // 4) POSITIVE BIOME / LANDSCAPE SOUNDS (HIGH score = good)
    //   // ------------------------------------------------------------

    //   // 🌊 Strong water presence (good)
    //   if (water !== null && water >= 75) return "ocean";

    //   // 🏞️ River-like: moderate water + decent groundwater/drainage
    //   if (
    //     water !== null &&
    //     water >= 55 &&
    //     water < 75 &&
    //     ((groundwater !== null && groundwater >= 55) ||
    //       (drainage !== null && drainage >= 55))
    //   )
    //     return "river";

    //   // 🌲 Forest: vegetation + rainfall + biodiversity
    //   if (
    //     vegetation !== null &&
    //     vegetation >= 60 &&
    //     rainfall !== null &&
    //     rainfall >= 55
    //   )
    //     return "forest";

    //   if (
    //     biodiversity !== null &&
    //     biodiversity >= 70 &&
    //     vegetation !== null &&
    //     vegetation >= 50
    //   )
    //     return "forest";

    //   // 🏔️ Mountain: elevation + ruggedness + slope
    //   if (
    //     (elevation !== null && elevation >= 75) ||
    //     (ruggedness !== null && ruggedness >= 70) ||
    //     (slope !== null && slope >= 75)
    //   )
    //     return "mountain";

    //   // 🏙️ Urban: infra + population + landuse
    //   if (
    //     infrastructure !== null &&
    //     infrastructure >= 70 &&
    //     population !== null &&
    //     population >= 60 &&
    //     landuse !== null &&
    //     landuse >= 55
    //   )
    //     return "urban";

    //   // 🚗 Traffic: urban + slightly weak pollution score
    //   if (
    //     infrastructure !== null &&
    //     infrastructure >= 75 &&
    //     pollution !== null &&
    //     pollution <= 55 &&
    //     pollution > 35
    //   )
    //     return "traffic";

    //   // 🏭 Industrial: infra + landuse strong but pollution not great
    //   if (
    //     infrastructure !== null &&
    //     infrastructure >= 80 &&
    //     landuse !== null &&
    //     landuse >= 70 &&
    //     pollution !== null &&
    //     pollution <= 50
    //   )
    //     return "industrial";

    //   // 🌾 Rural: low infra + low population + vegetation moderate
    //   if (
    //     infrastructure !== null &&
    //     infrastructure <= 40 &&
    //     population !== null &&
    //     population <= 45 &&
    //     vegetation !== null &&
    //     vegetation >= 45
    //   )
    //     return "rural";

    //   // ------------------------------------------------------------
    //   // 5) Fallback
    //   // ------------------------------------------------------------
    //   return "ambient";
    // }, []);
    const detectBiome = useCallback((factors, label) => {
      if (!factors && !label) return "ambient";

      const textLabel = (label || "").toLowerCase();

      // 1) PHYSICAL OVERRIDES (Strict detection for Water/Forest)
      // If suitability is near 0 for these, we are ACTUALLY in them
      const waterSuitability = getFactorScore(factors, "hydrology", "water");
      const vegetationSuitability = getFactorScore(factors, "environmental", "vegetation");

      if (waterSuitability !== null && waterSuitability <= 10) return "ocean";
      if (vegetationSuitability !== null && vegetationSuitability <= 10) return "forest";

      // 2) Text overrides
      if (textLabel.includes("ocean") || textLabel.includes("sea")) return "ocean";
      if (textLabel.includes("urban") || textLabel.includes("strategic hub")) return "urban";

      // 3) Extract Factor Scores
      const flood = getFactorScore(factors, "hydrology", "flood");
      const infrastructure = getFactorScore(factors, "socio_econ", "infrastructure");
      // const population = getFactorScore(factors, "socio_econ", "population");
      const pollution = getFactorScore(factors, "environmental", "pollution");

      // ------------------------------------------------------------
      // 4) DANGER PRIORITY (Low Score = High Danger)
      // ------------------------------------------------------------
      if (flood !== null && flood <= 30) return "flood";
      if (pollution !== null && pollution <= 30) return "pollution";

      // ------------------------------------------------------------
      // 5) LANDSCAPE LOGIC (Based on your specific data)
      // ------------------------------------------------------------

      // 🏙️ URBAN (Matches your current site: Hub 100, Pop 70)
      if (infrastructure !== null && infrastructure >= 85) return "urban";
      
      // 🚗 TRAFFIC (Urban but high pollution)
      if (infrastructure >= 70 && pollution <= 50) return "traffic";

      // 🌊 WATER BODIES (Only if close! distance < 0.5km)
      // We check if proximity is GOOD but score is low (meaning it's a burden)
      if (textLabel.includes("water body") && waterSuitability < 40) return "river";

      // 🏔️ MOUNTAIN / HILLS
      const elevation = getFactorScore(factors, "physical", "elevation");
      const slope = getFactorScore(factors, "physical", "slope");
      if (elevation >= 80 && slope <= 40) return "mountain";

      // 🌲 NATURE / RURAL Fallback
      if (vegetationSuitability >= 60) return "forest";
      if (infrastructure <= 40) return "rural";

      return "ambient";
    }, []);

    // ============================================================
    // AUTOPLAY UNLOCK
    // ============================================================
    useEffect(() => {
      const unlock = () => {
        hasUserInteracted.current = true;

        if (Howler.ctx && Howler.ctx.state === "suspended") {
          Howler.ctx.resume().then(() => console.log("🔊 AudioContext resumed"))
            .catch(err => console.log("🔊 AudioContext resume failed (expected)"));
        }
      };

      window.addEventListener("click", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });

      return () => {
        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
      };
    }, []);

    // ============================================================
    // NORMALIZE "HAS DATA" CHECKS
    // ============================================================
    const hasSiteAData =
      !!resultLabel ||
      (activeFactors &&
        typeof activeFactors === "object" &&
        Object.keys(activeFactors).length > 0);

    const hasSiteBData =
      !!compareResultLabel ||
      (compareFactors &&
        typeof compareFactors === "object" &&
        Object.keys(compareFactors).length > 0);

    // ============================================================
    // MASTER SILENCE MODE
    // ============================================================
    useEffect(() => {
      if (!isEnabled) {
        console.log(
          "%c🔇 MASTER AUDIO OFF -> SILENCE",
          "color:#f59e0b;font-weight:bold;"
        );
        killAll();
      }
    }, [isEnabled, killAll]);

    // ============================================================
    // SITE A CONTROLLER
    // ============================================================
    useEffect(() => {
      if (!isEnabled || !hasSiteAData || !siteAPlaying) {
        killSound(siteASoundRef, "SITE A");
        return;
      }

      const biomeA = detectBiome(activeFactors, resultLabel);
      const sourceA = getAudioSources(biomeA)[0];

      if (siteASoundRef.current && siteASoundRef.current._src === sourceA) return;

      killSound(siteASoundRef, "SITE A");

      console.log(
        `%c🎵 START SITE A: ${biomeA}`,
        "color:#10b981;font-weight:bold;"
      );

      const sound = new Howl({
        src: [sourceA],
        loop: true,
        volume: 0.6, // 🔊 boosted
        html5: false,
      });

      siteASoundRef.current = sound;

      if (hasUserInteracted.current) sound.play();
    }, [
      isEnabled,
      hasSiteAData,
      siteAPlaying,
      activeFactors,
      resultLabel,
      detectBiome,
      killSound,
    ]);

    // ============================================================
    // SITE B CONTROLLER
    // ============================================================
    useEffect(() => {
      if (!isEnabled || !hasSiteBData || !siteBPlaying) {
        killSound(siteBSoundRef, "SITE B");
        return;
      }

      const biomeB = detectBiome(compareFactors, compareResultLabel);
      const sourceB = getAudioSources(biomeB)[0];

      if (siteBSoundRef.current && siteBSoundRef.current._src === sourceB) return;

      killSound(siteBSoundRef, "SITE B");

      console.log(
        `%c🎵 START SITE B: ${biomeB}`,
        "color:#10b981;font-weight:bold;"
      );

      const sound = new Howl({
        src: [sourceB],
        loop: true,
        volume: 0.6, // 🔊 boosted
        html5: false,
      });

      siteBSoundRef.current = sound;

      if (hasUserInteracted.current) sound.play();
    }, [
      isEnabled,
      hasSiteBData,
      siteBPlaying,
      compareFactors,
      compareResultLabel,
      detectBiome,
      killSound,
    ]);

    // ============================================================
    // ABSOLUTE SILENCE WHEN BOTH MUTED
    // ============================================================
    useEffect(() => {
      if (!siteAPlaying && !siteBPlaying) {
        console.log(
          "%c🔇 BOTH SITES MUTED -> FULL SILENCE",
          "color:#ef4444;font-weight:bold;"
        );
        killAll();
      }
    }, [siteAPlaying, siteBPlaying, killAll]);

    // ============================================================
    // UNMOUNT CLEANUP
    // ============================================================
    useEffect(() => {
      return () => {
        console.log(
          "%c🧹 AUDIO UNMOUNT CLEANUP",
          "color:orange;font-weight:bold;"
        );
        killAll();
      };
    }, [killAll]);

    return null;
  };

  export default AudioLandscape;
