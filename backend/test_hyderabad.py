#!/usr/bin/env python3
"""
Test Hyderabad location specifically
"""

from suitability_factors.hydrology.water_utility import get_water_utility

# Test Hyderabad coordinates
lat, lng = 17.5380, 78.3945
result = get_water_utility(lat, lng)

print("Hyderabad, India (17.5380, 78.3945):")
print(f"Water Type: {result.get('water_type')}")
print(f"Score: {result.get('value')}")
print(f"Distance: {result.get('distance_km')}")
print(f"Details: {result.get('details')}")

# Check if it's correctly classified as land
if result.get('value', 0) > 0 and result.get('water_type') not in ['ocean', 'major_water', 'local_water']:
    print("\n✅ CORRECTLY classified as LAND")
else:
    print("\n❌ INCORRECTLY classified as WATER")
