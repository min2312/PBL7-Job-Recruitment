#!/bin/bash
echo "🚀 Booting custom AI startup script..."
if [ ! -d "/home/site/wwwroot/venv" ]; then
    echo "📦 Creating persistent venv and installing packages..."
    python -m venv /home/site/wwwroot/venv
    /home/site/wwwroot/venv/bin/pip install --no-cache-dir -r /home/site/wwwroot/requirements.txt
fi
echo "⚡ Starting Gunicorn..."
exec /home/site/wwwroot/venv/bin/gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app
