#!/bin/bash
# Render deployment startup script

echo "🚀 Starting GeoAI Backend on Render..."

# Set environment variables for production
export RENDER=true
export PYTHONPATH="/app:$PYTHONPATH"

# Check critical environment variables
echo "🔍 Checking environment variables..."
if [ -z "$GEOAI_MONGO_URI" ]; then
    echo "❌ GEOAI_MONGO_URI not set"
    exit 1
fi

if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY not set"
    exit 1
fi

echo "✅ Environment variables OK"

# Test Python imports
echo "🔍 Testing Python imports..."
python -c "
import sys
print(f'Python: {sys.version}')
try:
    import flask, flask_cors, pymongo, numpy, sklearn, requests, xgboost
    print('✅ Core imports OK')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Import test failed"
    exit 1
fi

# Test app import
echo "🔍 Testing app import..."
python -c "
import os
os.environ['RENDER'] = 'true'
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

echo "🎉 All tests passed, starting server..."
exec gunicorn app:app --workers 1 --threads 1 --timeout 120 --worker-class gthread --bind 0.0.0.0:$PORT
