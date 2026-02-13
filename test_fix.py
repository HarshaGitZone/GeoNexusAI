#!/usr/bin/env python3
"""
Test script to verify the CORS and memory fixes
"""
import requests
import json

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Health Check Status: {response.status_code}")
        print(f"Health Check Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return False

def test_suitability_endpoint():
    """Test the suitability endpoint with minimal data"""
    try:
        test_data = {
            "latitude": 17.3850,
            "longitude": 78.4867
        }
        
        response = requests.post(
            'http://localhost:5000/suitability',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30  # 30 second timeout
        )
        
        print(f"Suitability Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Analysis successful! Score: {result.get('suitability_score', 'N/A')}")
            return True
        else:
            print(f"Error Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("Request timed out - possible memory issue")
        return False
    except Exception as e:
        print(f"Suitability Test Failed: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing Backend Fixes...")
    print("=" * 50)
    
    # Test health check first
    health_ok = test_health_check()
    print()
    
    if health_ok:
        print("✅ Health check passed, testing suitability endpoint...")
        suitability_ok = test_suitability_endpoint()
        
        if suitability_ok:
            print("\n🎉 All tests passed! Backend should work on Render now.")
        else:
            print("\n❌ Suitability endpoint failed - check logs for memory issues.")
    else:
        print("\n❌ Health check failed - backend may not be running.")
