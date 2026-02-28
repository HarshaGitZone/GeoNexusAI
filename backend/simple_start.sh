#!/bin/bash
# Simplified production startup - focus on getting server running

echo "🚀 Starting GeoAI Backend - Simplified Production Mode"

# Set environment
export RENDER=true
export RENDER_SAFE_MODE=true
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Quick validation
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY required"
    exit 1
fi

echo "✅ Environment OK"

# Start server directly with minimal configuration
echo "🌐 Starting server on port ${PORT:-10000}"
exec python app.py
