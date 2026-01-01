
import time
import requests
from typing import Optional, Tuple

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

_DEFAULT_HEADERS = {
    "User-Agent": "GeoAI/1.0 (contact: support@example.com)",
    "Accept": "application/json",
}

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

def _build_overpass_query(lat: float, lon: float, radius_m: int) -> str:
    return f"""
    [out:json][timeout:50];
    (
      node["natural"="water"](around:{radius_m},{lat},{lon});
      way["natural"="water"](around:{radius_m},{lat},{lon});
      relation["natural"="water"](around:{radius_m},{lat},{lon});

      node["natural"="wetland"](around:{radius_m},{lat},{lon});
      way["natural"="wetland"](around:{radius_m},{lat},{lon});

      node["landuse"="reservoir"](around:{radius_m},{lat},{lon});
      way["landuse"="reservoir"](around:{radius_m},{lat},{lon});

      node["water"](around:{radius_m},{lat},{lon});
      way["water"](around:{radius_m},{lat},{lon});

      node["waterway"~"^(river|stream|canal|drain|ditch)$"](around:{radius_m},{lat},{lon});
      way["waterway"~"^(river|stream|canal|drain|ditch)$"](around:{radius_m},{lat},{lon});
    );
    out center 60;
    """

def _query_overpass(lat: float, lon: float, radius_m: int) -> Optional[dict]:
    """
    Query Overpass with retries across mirrors and backoff.
    """
    query = _build_overpass_query(lat, lon, radius_m)
    last_err: Optional[Exception] = None
    for attempt in range(3):  
        for base_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    base_url,
                    data={"data": query},
                    headers=_DEFAULT_HEADERS,
                    timeout=15,
                )
                if resp.status_code == 429:
                    last_err = Exception("429 Too Many Requests")
                    continue
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                last_err = e
                continue

        time.sleep(0.8 * (attempt + 1))
    print(f"Overpass query failed after retries: {last_err}")
    return None

def _reverse_check_on_water(lat: float, lon: float):
    """
    Fallback: use Nominatim reverse geocoding to see if point lies on water.
    Returns True if strong indication of water feature at the point.
    """
    try:
        params = {
            "format": "jsonv2",
            "lat": lat,
            "lon": lon,
            "zoom": 18,
            "addressdetails": 1,
            "extratags": 1,
        }
        resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_DEFAULT_HEADERS, timeout=12)
        resp.raise_for_status()
        data = resp.json() or {}
        extra = data.get("extratags") or {}
        cls = (data.get("class") or "").lower()
        typ = (data.get("type") or "").lower()
        addr = data.get("address", {})

        # name/type hints
        name = data.get("display_name") or data.get("name") or None

        waterish_values = set(
            str(extra.get(k, "")).lower() for k in ("natural", "water", "waterway", "wetland", "landuse", "place")
        )
        water_types = {"water", "river", "stream", "reservoir", "pond", "lake", "lagoon", "basin", "canal", "riverbank", "wetland", "ocean", "sea", "bay", "coastline"}
        if any(v in water_types for v in waterish_values):
            return True, {"source": "nominatim", "name": name, "class": cls, "type": typ}
        if cls in ("waterway", "natural", "place") and typ in water_types:
            return True, {"source": "nominatim", "name": name, "class": cls, "type": typ}
        display_name = str(data.get("display_name", "")).lower()
        if any(word in display_name for word in ["ocean", "sea", "bay", "gulf", "sound", "strait", "coast"]):
            return True, {"source": "nominatim", "name": name, "class": cls, "type": typ}
        if addr:
            for key, value in addr.items():
                val_lower = str(value).lower()
                if any(word in val_lower for word in ["ocean", "sea", "bay", "gulf", "sound", "strait", "coast"]):
                    return True, {"source": "nominatim", "name": name, "class": cls, "type": typ}
    except Exception:
        return False, None
    return False, None

def estimate_water_proximity_score(latitude: float, longitude: float) -> Tuple[float, Optional[float], Optional[dict]]:
    """
    Estimate distance (km) to nearest water body and map to a suitability score.
    Returns (score_0_100, distance_km). Closer to water is riskier for construction.
    Uses adaptive radius so we find water features if they are reasonably close.
    """
    elements = None
    detection_source = None
    # start with very small radii to catch exact-match nodes/ways at the point
    for radius_m in (50, 200, 1000, 3000, 7000, 12000):
        data = _query_overpass(latitude, longitude, radius_m)
        if data and data.get("elements"):
            elements = data["elements"]
            detection_source = f"overpass_{radius_m}m"
            break

    if not elements:
        on_water, details = _reverse_check_on_water(latitude, longitude)
        if on_water:
            # Nominatim reported a water feature at the point
            return 0.0, 0.0, details
        # No mapped water found within search radii and reverse lookup negative
        return 50.0, None, {"source": "overpass+nominatim", "reason": "no mapped water features found within search radii; reverse geocode did not indicate water"}

    from math import radians, sin, cos, sqrt, atan2
    def haversine_km(lat1, lon1, lat2, lon2):
        R = 6371.0
        phi1, phi2 = radians(lat1), radians(lat2)
        dphi = radians(lat2 - lat1)
        dlambda = radians(lon2 - lon1)
        a = (sin(dphi / 2) ** 2) + cos(phi1) * cos(phi2) * (sin(dlambda / 2) ** 2)
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c

    # Quick exact-match checks to ensure points exactly on mapped water are detected as on-water
    try:
        # nodes with exact coordinates
        for el in elements:
            if el.get("type") == "node" and el.get("lat") is not None and el.get("lon") is not None:
                if abs(el.get("lat") - latitude) < 1e-6 and abs(el.get("lon") - longitude) < 1e-6:
                    tags = el.get("tags") or {}
                    name = tags.get("name")
                    return 0.0, 0.0, {"source": detection_source, "name": name, "tags": tags}

        # ways/relations that only have a center provided by Overpass: if tags indicate water and center is extremely close
        water_types = {"water", "river", "stream", "reservoir", "pond", "lake", "lagoon", "basin", "canal", "riverbank", "wetland", "ocean", "sea", "bay", "coastline"}
        for el in elements:
            tags = el.get("tags") or {}
            is_water_tag = False
            for k in ("natural", "water", "waterway", "landuse", "place"):
                v = tags.get(k)
                if v and str(v).lower() in water_types:
                    is_water_tag = True
                    break
            if is_water_tag and el.get("center"):
                c = el.get("center")
                try:
                    d = haversine_km(latitude, longitude, float(c.get("lat")), float(c.get("lon")))
                    if d < 0.02:
                        name = tags.get("name")
                        return 0.0, 0.0, {"source": detection_source, "name": name, "tags": tags}
                except Exception:
                    pass
    except Exception:
        pass

    # --- helper geometry utilities (simple planar approximation for short distances) ---
    def _point_in_poly(pt_lat, pt_lon, poly_coords):
        # Ray casting algorithm for point-in-polygon
        x = pt_lon
        y = pt_lat
        inside = False
        n = len(poly_coords)
        j = n - 1
        for i in range(n):
            xi, yi = poly_coords[i][1], poly_coords[i][0]
            xj, yj = poly_coords[j][1], poly_coords[j][0]
            intersect = ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi)
            if intersect:
                inside = not inside
            j = i
        return inside

    def _dist_point_to_segment_km(lat0, lon0, lat1, lon1, lat2, lon2):
        # Use equirectangular projection centered at lat0 for short distances
        R = 6371000.0
        lat0r = radians(lat0)
        x0 = radians(lon0) * cos(lat0r) * R
        y0 = radians(lat0) * R
        x1 = radians(lon1) * cos(lat0r) * R
        y1 = radians(lat1) * R
        x2 = radians(lon2) * cos(lat0r) * R
        y2 = radians(lat2) * R
        dx = x2 - x1
        dy = y2 - y1
        if dx == 0 and dy == 0:
            d = sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)
            return d / 1000.0
        t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)
        t = max(0.0, min(1.0, t))
        px = x1 + t * dx
        py = y1 + t * dy
        d = sqrt((x0 - px) ** 2 + (y0 - py) ** 2)
        return d / 1000.0

    def _min_distance_to_polygon_km(lat, lon, poly_coords):
        # poly_coords: list of (lat, lon)
        best = None
        n = len(poly_coords)
        for i in range(n):
            a = poly_coords[i]
            b = poly_coords[(i + 1) % n]
            d = _dist_point_to_segment_km(lat, lon, a[0], a[1], b[0], b[1])
            if best is None or d < best:
                best = d
        return best

    min_km = None
    for el in elements:
        # If element has explicit geometry (way with nodes), use polygon/line geometry
        geom = el.get("geometry") or el.get("geometry_coords") or None
        if geom and isinstance(geom, list) and len(geom) > 0:
            # geometry entries are dicts with lat/lon
            poly = [(p.get("lat"), p.get("lon")) for p in geom if p.get("lat") is not None]
            if not poly:
                continue
            # If polygon contains the point, treat as on-water
            try:
                if _point_in_poly(latitude, longitude, poly):
                    min_km = 0.0 if min_km is None else min(min_km, 0.0)
                    # record details and break if exact water
                    min_km = 0.0
                    break
                else:
                    d = _min_distance_to_polygon_km(latitude, longitude, poly)
                    if d is not None:
                        min_km = d if min_km is None else min(min_km, d)
                    continue
            except Exception:
                pass

        if "lat" in el and "lon" in el:
            d = haversine_km(latitude, longitude, el["lat"], el["lon"])
        elif "center" in el and "lat" in el["center"] and "lon" in el["center"]:
            d = haversine_km(latitude, longitude, el["center"]["lat"], el["center"]["lon"])
        else:
            continue
        min_km = d if min_km is None else min(min_km, d)


    if min_km is None:
        # fallback to reverse geocode check
        on_water, details = _reverse_check_on_water(latitude, longitude)
        if on_water:
            return 0.0, 0.0, details
        return 50.0, None, {"source": "overpass+nominatim", "reason": "no mapped water features found; reverse geocode negative"}


    if min_km < 0.02:         # ~20m: effectively on water
        # Attempt to extract name/type from element
        name = None
        for el in elements:
            tags = el.get("tags") or {}
            if tags.get("name"):
                name = tags.get("name")
                break
        details = {"source": detection_source, "name": name, "notes": "point lies on or extremely close to a mapped water feature"}
        score = 0.0           # on-water → unsuitable
    elif min_km < 0.05:       # 20–50m: extremely close
        score = 15.0
    elif min_km < 0.2:        # 50–200m: very close
        score = 30.0
    elif min_km < 0.5:        # 200–500m: moderate proximity
        score = 50.0
    elif min_km < 1.5:        # 0.5–1.5km: generally safe
        score = 70.0
    elif min_km < 3.0:        # 1.5–3km: safe distance
        score = 85.0
    else:                      # Far away
        score = 92.0

    return score, round(min_km, 3), {"source": detection_source}