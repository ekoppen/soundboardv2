# 🐳 Docker Quick Start Guide

Deze guide helpt je om de Soundboard app snel te draaien met Docker Compose.

## 📋 Vereisten

- Docker Engine 20.10+
- Docker Compose v2.0+
- 2GB vrije disk space

## 🚀 Installatie in 3 Stappen

### Stap 1: Clone & Configureer

```bash
git clone <repository-url>
cd soundboardv2
cp .env.example .env
```

### Stap 2: Custom Poorten (Optioneel)

Open `.env` en wijzig de poorten indien nodig:

```env
# Webapp poort (standaard: 3030)
APP_PORT=3030

# MongoDB poort (standaard: 27017)  
MONGODB_PORT=27017
```

**Voorbeelden:**
- Andere webapp poort: `APP_PORT=8080`
- Andere MongoDB poort: `MONGODB_PORT=27018`

### Stap 3: Start de Stack

```bash
docker compose up -d
```

Of met oudere Docker versie:
```bash
docker-compose up -d
```

**Eerste keer duurt 2-5 minuten** (Node.js + FFmpeg installatie)

### ✅ Check Status

```bash
# Bekijk container status
docker compose ps

# Bekijk logs
docker compose logs -f

# Alleen soundboard logs
docker compose logs -f soundboard
```

### 🌐 Open de App

```
http://localhost:3030
```

Of met custom poort: `http://localhost:APP_PORT`

## 🎮 Discord Integration (Optioneel)

### Quick Setup

1. Maak een Discord Bot aan: https://discord.com/developers/applications
2. Krijg Bot Token, Server ID en Voice Channel ID
3. Voeg toe aan `.env`:

```env
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id
DISCORD_VOICE_CHANNEL_ID=your_channel_id
DISCORD_AUTO_JOIN=true
```

4. Herstart:
```bash
docker compose restart soundboard
```

Zie README.md voor gedetailleerde Discord setup instructies.

## 📦 Handige Commando's

```bash
# Stop (data blijft bewaard)
docker compose down

# Stop en verwijder data (⚠️ permanent!)
docker compose down -v

# Herstart na code wijzigingen
docker compose up -d --build

# Bekijk resource gebruik
docker stats

# Shell in container
docker compose exec soundboard sh
docker compose exec mongodb mongosh
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check welke poorten in gebruik zijn
sudo lsof -i :3030
sudo lsof -i :27017

# Wijzig poort in .env
APP_PORT=8080 docker compose up -d
```

### MongoDB Connection Failed

```bash
# Check MongoDB status
docker compose ps mongodb
docker compose logs mongodb

# Test MongoDB connectie
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Container Crash / Exit

```bash
# Bekijk gedetailleerde logs
docker compose logs soundboard

# Bekijk laatste 100 regels
docker compose logs --tail=100 soundboard

# Health check status
docker inspect soundboard-app | grep -A 10 Health
```

### Reset Everything

```bash
# Volledige reset (verwijdert alle data!)
docker compose down -v
rm -rf public/upload/*
rm .env
cp .env.example .env
docker compose up -d
```

## 💾 Data Backup

### Backup

```bash
# Stop services
docker compose down

# Backup MongoDB
docker run --rm \
  -v soundboardv2_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongodb-backup.tar.gz -C /data .

# Backup uploads
docker run --rm \
  -v soundboardv2_upload_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

### Restore

```bash
# Restore MongoDB
docker run --rm \
  -v soundboardv2_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mongodb-backup.tar.gz -C /data

# Restore uploads
docker run --rm \
  -v soundboardv2_upload_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data

# Start services
docker compose up -d
```

## 📊 Volume Management

```bash
# Lijst alle volumes
docker volume ls | grep soundboard

# Volume details
docker volume inspect soundboardv2_mongodb_data
docker volume inspect soundboardv2_upload_data

# Volume grootte
docker system df -v
```

## 🎯 Custom Poorten Voorbeelden

### Voorbeeld 1: Poort 8080
```bash
echo "APP_PORT=8080" >> .env
docker compose up -d
# Open: http://localhost:8080
```

### Voorbeeld 2: Beide poorten wijzigen
```bash
cat >> .env << EOF
APP_PORT=9000
MONGODB_PORT=27018
