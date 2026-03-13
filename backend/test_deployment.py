#!/usr/bin/env python3
"""
Deployment Verification Script
Tests the 502 error fixes and memory optimizations
"""

import os
import sys
import requests
import json
import time
from typing import Dict, Any

# Test configuration
API_BASE = os.environ.get("API_BASE", "http://localhost:5000")
TEST_COORDS = [
    (17.3850, 78.4867),  # Hyderabad
    (28.6139, 77.2090),  # Delhi  
    (19.0760, 72.8777),  # Mumbai
    (12.9716, 77.5946),  # Bangalore
]

def test_suitability_endpoint(lat: float, lng: float) -> Dict[str, Any]:
    """Test the suitability endpoint with error handling"""
    try:
        print(f"\n🧪 Testing coordinates: {lat}, {lng}")
        
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE}/suitability",
            json={"latitude": lat, "longitude": lng, "debug": False},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"⏱️  Response time: {elapsed_time:.2f}s")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Score: {data.get('suitability_score', 'N/A')}")
            print(f"🏷️  Label: {data.get('label', 'N/A')}")
            
            # Check for emergency fallback
            if data.get('emergency_fallback'):
                print("⚠️  Emergency fallback mode used")
            
            # Check performance info
            perf = data.get('performance', {})
            if perf:
                print(f"🚀 Performance mode: {perf.get('mode', 'unknown')}")
            
            return {"success": True, "data": data, "time": elapsed_time}
            
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"🔍 Error details: {error_data}")
            except:
                print(f"🔍 Raw response: {response.text[:200]}")
            
            return {"success": False, "status": response.status_code, "response": response.text[:200]}
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout (30s)")
        return {"success": False, "error": "timeout"}
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - server likely down")
        return {"success": False, "error": "connection_error"}
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {"success": False, "error": str(e)}

def check_environment():
    """Check deployment environment settings"""
    print("🔍 Environment Check:")
    print(f"   API_BASE: {API_BASE}")
    print(f"   RENDER: {os.environ.get('RENDER', 'false')}")
    print(f"   RENDER_SAFE_MODE: {os.environ.get('RENDER_SAFE_MODE', 'false')}")
    print(f"   USE_FAST_ANALYSIS: {os.environ.get('USE_FAST_ANALYSIS', 'false')}")
    print(f"   FORCE_FAST_MODE_RENDER: {os.environ.get('FORCE_FAST_MODE_RENDER', 'false')}")

def main():
    """Run deployment verification tests"""
    print("🚀 GeoNexusAI Deployment Verification")
    print("=" * 50)
    
    check_environment()
    
    results = []
    
    for lat, lng in TEST_COORDS:
        result = test_suitability_endpoint(lat, lng)
        results.append(result)
        
        # Small delay between requests
        time.sleep(1)
    
    # Summary
    print("\n" + "=" * 50)
    print("📈 TEST SUMMARY")
    print("=" * 50)
    
    successful = sum(1 for r in results if r.get("success"))
    total = len(results)
    
    print(f"✅ Successful: {successful}/{total}")
    print(f"❌ Failed: {total - successful}/{total}")
    
    if successful > 0:
        avg_time = sum(r.get("time", 0) for r in results if r.get("success")) / successful
        print(f"⏱️  Average response time: {avg_time:.2f}s")
    
    # Performance analysis
    print("\n🔍 PERFORMANCE ANALYSIS:")
    for i, (lat, lng) in enumerate(TEST_COORDS):
        result = results[i]
        status = "✅" if result.get("success") else "❌"
        time_info = f"{result.get('time', 0):.2f}s" if result.get("success") else "N/A"
        print(f"   {status} ({lat}, {lng}): {time_info}")
    
    print(f"\n🎯 DEPLOYMENT STATUS: {'✅ READY' if successful >= 3 else '⚠️  NEEDS ATTENTION'}")
    
    return successful >= 3

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
