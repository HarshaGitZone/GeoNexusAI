import sys
import os
import time
import asyncio
from pprint import pprint

# Make sure we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.suitability_factors.geo_data_service import GeoDataService

def run_tests():
    lat, lng = 17.5387, 78.3950
    print(f"Testing for Coordinates: {lat}, {lng}")
    
    # 1. Test Parallel
    print("\n--- Running Parallel ---")
    start = time.time()
    res_par = GeoDataService.get_land_intelligence_parallel(lat, lng)
    duration_par = time.time() - start
    print(f"Parallel took: {duration_par:.2f} seconds")

    # 2. Test Sequential
    print("\n--- Running Sequential ---")
    start = time.time()
    res_seq = GeoDataService.get_land_intelligence(lat, lng)
    duration_seq = time.time() - start
    print(f"Sequential took: {duration_seq:.2f} seconds")
    
    # Print results summary
    print(f"\nSpeedup: {duration_seq / duration_par:.2f}x")
    print("\nExtracting keys to confirm structure matches:")
    print("Sequential Keys:", list(res_seq.keys()))
    print("Parallel Keys:", list(res_par.keys()))

    print("\nSequential Categories:", list(res_seq['raw_factors'].keys()))
    print("Parallel Categories:", list(res_par['raw_factors'].keys()))
    
if __name__ == "__main__":
    run_tests()
