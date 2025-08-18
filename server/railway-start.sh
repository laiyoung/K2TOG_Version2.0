#!/bin/bash

echo "🚀 Railway starting YJ Child Care Plus Server..."
echo "📅 Start time: $(date)"
echo "🔧 Node version: $(node --version)"
echo "📁 Working directory: $(pwd)"

# Start the robust start script
exec node start.js
