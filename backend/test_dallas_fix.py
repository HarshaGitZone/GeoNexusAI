#!/usr/bin/env python3
"""
Quick test to verify Dallas coordinates are now correctly classified
"""

from suitability_factors.hydrology.water_utility import get_water_utility

# Test Dallas coordinates
lat, lng = 32.7620, -96.7790

print("Testing Dallas coordinates after ocean bounds fix...")
print(f"Coordinates: ({lat}, {lng})")
print()

result = get_water_utility(lat, lng)

print("Water Utility Result:")
print(f"Value: {result.get('value')}")
print(f"Distance: {result.get('distance_km')}")
print(f"Water Type: {result.get('water_type')}")
print(f"Details: {result.get('details')}")

if result.get('value') == 0.0:
    print("\n❌ Dallas is still classified as water body!")
else:
    print(f"\n✅ Dallas is correctly classified as land with water score: {result.get('value')}")
