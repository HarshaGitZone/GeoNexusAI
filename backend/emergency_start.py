#!/usr/bin/env python3
"""
Ultra-lightweight emergency startup for Render
Minimal memory usage, maximum stability
"""

import os
import sys

def emergency_startup():
    """Emergency startup with minimal imports"""
    print("🚨 EMERGENCY STARTUP - MINIMAL MEMORY MODE")
    
    # Set emergency environment
    os.environ['RENDER'] = 'true'
    os.environ['RENDER_SAFE_MODE'] = 'true'
    os.environ['USE_FAST_ANALYSIS'] = 'false'
    
    # Test only critical imports
    try:
        import flask
        from flask_cors import CORS
        print("✅ Flask + CORS OK")
    except ImportError as e:
        print(f"❌ Critical import failed: {e}")
        sys.exit(1)
    
    # Test app import with emergency mode
    try:
        # Disable heavy imports before app load
        sys.modules['torch'] = None
        sys.modules['torchvision'] = None
        sys.modules['matplotlib'] = None
        sys.modules['reportlab'] = None
        sys.modules['PIL'] = None
        
        import app
        print("✅ App import OK (emergency mode)")
    except Exception as e:
        print(f"❌ App import failed: {e}")
        sys.exit(1)
    
    print("🎉 Emergency startup complete!")

if __name__ == "__main__":
    emergency_startup()
