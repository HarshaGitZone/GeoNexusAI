#!/usr/bin/env python3
"""
Debug water detection for coordinates 27.5300, 78.0500
"""

import requests
from suitability_factors.hydrology.water_utility import _haversine_km, OVERPASS_URLS, _HEADERS

def debug_water_features():
    lat, lng = 27.5300, 78.0500
    
    major_query = f"""
[out:json][timeout:20];
(
  way["waterway"="river"](around:20000,{lat},{lng});
  way["natural"="water"](around:15000,{lat},{lng});
  relation["waterway"="river"](around:25000,{lat},{lng});
  node["place"="river"](around:20000,{lat},{lng});
  node["place"="lake"](around:15000,{lat},{lng});
);
out center 10;
"""

    print(f"Debugging water features near {lat}, {lng}")
    print("=" * 60)
    
    for overpass_url in OVERPASS_URLS:
        try:
            resp = requests.post(overpass_url, data={"data": major_query}, headers=_HEADERS, timeout=15)
            resp.raise_for_status()
            elements = (resp.json() or {}).get("elements")
            if elements:
                print(f"Found {len(elements)} water features:")
                for i, el in enumerate(elements[:5]):
                    e_lat = el.get("lat") or el.get("center", {}).get("lat")
                    e_lon = el.get("lon") or el.get("center", {}).get("lon")
                    if e_lat and e_lon:
                        dist_km = _haversine_km(lat, lng, e_lat, e_lon)
                        water_name = el.get("tags", {}).get("name", "Unnamed")
                        water_type = el.get("tags", {}).get("waterway", el.get("tags", {}).get("natural", "unknown"))
                        print(f"{i+1}. {water_name} ({water_type}) - {dist_km:.2f}km")
            else:
                print("No water features found")
            break
        except Exception as e:
            print(f"Error with {overpass_url}: {e}")
            continue

if __name__ == "__main__":
    debug_water_features()
