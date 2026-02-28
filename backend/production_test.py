#!/usr/bin/env python3
"""
Lightweight production startup test for Render
Tests critical imports without loading heavy ML models
"""

import os
import sys

def test_critical_imports():
    """Test only essential imports for production"""
    try:
        # Core web framework
        import flask
        from flask_cors import CORS
        import gunicorn
        
        # Database and basic services
        import pymongo
        import requests
        import numpy as np
        
        # AI services (without heavy models)
        from groq import Groq
        
        print("✅ Critical imports successful")
        return True
    except ImportError as e:
        print(f"❌ Critical import failed: {e}")
        return False

def test_env_vars():
    """Test required environment variables"""
    required_vars = ['GROQ_API_KEY', 'FRONTEND_URL']
    missing = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"❌ Missing env vars: {missing}")
        return False
    
    print("✅ Environment variables OK")
    return True

def test_app_import():
    """Test app can be imported in production mode"""
    try:
        # Set production mode
        os.environ['RENDER'] = 'true'
        os.environ['RENDER_SAFE_MODE'] = 'true'
        
        # Import without starting the app
        import app
        print("✅ App import successful")
        return True
    except Exception as e:
        print(f"❌ App import failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Running Render Production Test...")
    
    tests = [
        test_critical_imports,
        test_env_vars, 
        test_app_import
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        else:
            print("❌ Test failed, exiting")
            sys.exit(1)
    
    print(f"🎉 All {passed} tests passed! Ready for production.")
