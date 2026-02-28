#!/usr/bin/env python3
"""
Simple test for health endpoint
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Test the import first
    print("Testing import...")
    from datetime import datetime
    print("✅ datetime imported successfully")
    print("✅ Testing datetime.utcnow():", datetime.utcnow())
    
    from app import app
    print("✅ App imported successfully")
    
    # Create test client
    with app.test_client() as client:
        response = client.get('/health')
        print(f"✅ Health endpoint status: {response.status_code}")
        print(f"✅ Health response: {response.get_json()}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
