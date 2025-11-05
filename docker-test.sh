#!/bin/bash

echo "🔍 Docker Setup Validatie Script"
echo "================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is niet geïnstalleerd"
    echo "   Installeer Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is geïnstalleerd"
docker --version

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is geïnstalleerd (standalone)"
    docker-compose --version
elif docker compose version &> /dev/null; then
    echo "✅ Docker Compose is geïnstalleerd (plugin)"
    docker compose version
else
    echo "❌ Docker Compose is niet geïnstalleerd"
    exit 1
fi

echo ""
echo "📋 Validatie docker-compose.yml..."

# Validate docker-compose.yml syntax
if docker compose config > /dev/null 2>&1 || docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml syntax is correct"
else
    echo "❌ docker-compose.yml heeft syntax errors"
    exit 1
fi

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env bestand gevonden"
else
    echo "⚠️  .env bestand niet gevonden"
    echo "   Run: cp .env.example .env"
fi

# Check required ports
echo ""
echo "🔌 Poort configuratie check..."

# Get ports from .env or use defaults
APP_PORT=$(grep "^APP_PORT=" .env 2>/dev/null | cut -d '=' -f2)
APP_PORT=${APP_PORT:-3030}

MONGODB_PORT=$(grep "^MONGODB_PORT=" .env 2>/dev/null | cut -d '=' -f2)
MONGODB_PORT=${MONGODB_PORT:-27017}

echo "   App poort: $APP_PORT"
echo "   MongoDB poort: $MONGODB_PORT"

# Check if ports are available
if lsof -Pi :$APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Poort $APP_PORT is al in gebruik"
    echo "   Wijzig APP_PORT in .env"
else
    echo "✅ Poort $APP_PORT is beschikbaar"
fi

if lsof -Pi :$MONGODB_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Poort $MONGODB_PORT is al in gebruik"
    echo "   Wijzig MONGODB_PORT in .env"
else
    echo "✅ Poort $MONGODB_PORT is beschikbaar"
fi

echo ""
echo "🚀 Klaar om te starten!"
echo ""
echo "Start de stack met:"
echo "   docker-compose up -d"
echo ""
echo "Of met docker compose (nieuwe syntax):"
echo "   docker compose up -d"
echo ""
echo "Bekijk logs:"
echo "   docker-compose logs -f"
echo ""
echo "Open de app:"
echo "   http://localhost:$APP_PORT"
