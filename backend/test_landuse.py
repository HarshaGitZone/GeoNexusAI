#!/usr/bin/env python3

from suitability_factors.socio_economic.landuse_status import infer_landuse_score
import json

# Test with different types of locations
test_coords = [
    (40.7128, -74.0060),  # New York City (Prime Urban)
    (51.5074, -0.1278),   # London (Prime Urban) 
    (37.7749, -122.4194), # San Francisco (Urban)
    (25.7617, -80.1918),  # Miami (Urban)
    (41.8781, -87.6298),  # Chicago (Urban)
    (33.4484, -112.0740), # Phoenix (Suburban)
    (39.7392, -104.9903), # Denver (Suburban)
    (30.2672, -97.7431),  # Austin (Developing)
    (47.6062, -122.3321), # Seattle (Urban)
    (42.3601, -71.0589),  # Boston (Urban)
]

print('=== TESTING IMPROVED LAND USE SCORING ===\n')

for i, (lat, lon) in enumerate(test_coords, 1):
    try:
        score, details = infer_landuse_score(lat, lon)
        print(f'{i}. Location ({lat:.4f}, {lon:.4f}):')
        print(f'   Score: {score:.1f}/100')
        print(f'   Classification: {details.get("classification", "Unknown")}')
        print(f'   Infrastructure: {details.get("infrastructure_score", 0):.1f}/100')
        print(f'   Reason: {details.get("reason", "No reason")[:80]}...')
        print()
    except Exception as e:
        print(f'{i}. Location ({lat:.4f}, {lon:.4f}): ERROR - {str(e)[:50]}')
        print()
