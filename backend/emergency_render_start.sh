#!/bin/bash
# Emergency startup script for Render - Ultra lightweight

echo "🚨 EMERGENCY STARTUP - MINIMAL MEMORY MODE"

# Set environment for emergency mode
export RENDER=true
export RENDER_SAFE_MODE=true
export USE_FAST_ANALYSIS=false
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
export MALLOC_ARENA_MAX=1  # Maximum memory reduction

# Emergency environment check (minimal)
echo "🔍 Emergency environment check..."
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY required for emergency mode"
    exit 1
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  FRONTEND_URL not set, using default"
    export FRONTEND_URL="https://geo-nexus-ai.vercel.app"
fi

echo "✅ Emergency env check passed"

# Emergency startup test
echo "🔍 Emergency startup test..."
python emergency_start.py

if [ $? -ne 0 ]; then
    echo "❌ Emergency startup failed"
    exit 1
fi

echo "🎉 Starting emergency server..."
exec gunicorn --config gunicorn_config.py app:app
