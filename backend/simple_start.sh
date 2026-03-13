#!/bin/bash
# Simplified production startup - focus on getting server running

echo "🚀 Starting GeoAI Backend - Simplified Production Mode"

# Set environment
export RENDER=true
export RENDER_SAFE_MODE=true
export USE_FAST_ANALYSIS=true
export FORCE_FAST_MODE_RENDER=true
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
export MALLOC_ARENA_MAX=2
export MAX_WORKERS_RENDER=8
export TIMEOUT_RENDER=15

# Quick validation
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY required"
    exit 1
fi

echo "✅ Environment OK"
echo "🔧 Fast Analysis Mode: ENABLED (memory optimized)"

# Start via gunicorn for production stability on Render.
echo "🌐 Starting gunicorn on port ${PORT:-10000}"
exec gunicorn app:app \
  --workers 1 \
  --threads 2 \
  --worker-class gthread \
  --timeout 120 \
  --bind 0.0.0.0:${PORT:-10000}
