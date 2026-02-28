#!/bin/bash
# Production-ready startup script for Render - Permanent solution

echo "🚀 Starting GeoAI Backend - Production Mode"

# Set production environment
export RENDER=true
export RENDER_SAFE_MODE=true
export USE_FAST_ANALYSIS=false
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
export MALLOC_ARENA_MAX=2

# Validate critical environment variables
echo "🔍 Validating environment..."
required_vars=("GROQ_API_KEY" "FRONTEND_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    exit 1
fi

echo "✅ Environment validation passed"

# Test critical imports only
echo "🔍 Testing critical imports..."
python -c "
import sys
try:
    import flask, flask_cors, requests, numpy, sklearn, xgboost
    print('✅ Critical imports OK')
except ImportError as e:
    print(f'❌ Import failed: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Import test failed"
    exit 1
fi

# Test app import in production mode
echo "🔍 Testing app import..."
python -c "
import os
os.environ['RENDER'] = 'true'
os.environ['RENDER_SAFE_MODE'] = 'true'
try:
    import app
    print('✅ App import OK')
except Exception as e:
    print(f'❌ App import failed: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ App import test failed"
    exit 1
fi

echo "🎉 Production startup complete - Starting server..."
exec gunicorn app:app --workers 1 --threads 1 --timeout 120 --worker-class gthread --bind 0.0.0.0:$PORT
