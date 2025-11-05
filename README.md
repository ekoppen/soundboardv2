# Soundboard Web App

Een interactieve soundboard webapplicatie gebouwd met Node.js, Express, Socket.IO en MongoDB. Upload en speel geluidseffecten af met real-time updates voor alle gebruikers.

## Features

- 🎵 **Audio Playback** - Speel geluidsbestanden af direct in de browser
- 📤 **Upload Systeem** - Upload je eigen sounds met optionele afbeeldingen
- 🔄 **Real-time Updates** - Live speelteller updates via Socket.IO
- 🔍 **Zoek & Filter** - Vind snel sounds via naam of tags
- 📊 **Play Count Tracking** - Automatisch bijhouden van populariteit
- 🔗 **Share Links** - Deel directe links naar individuele sounds
- 🛡️ **Rate Limiting** - Bescherming tegen misbruik van API endpoints
- 🐳 **Docker Support** - Makkelijke deployment via Docker
- 🎮 **Discord Integration** - Speel sounds af in Discord voice channels

## Vereisten

- Node.js (versie 18 of hoger aanbevolen)
- MongoDB (lokaal of remote)
- npm of yarn package manager
- FFmpeg (optioneel, voor Discord audio playback)

## Installatie

### 1. Clone de repository

```bash
git clone <repository-url>
cd soundboardv2
```

### 2. Installeer dependencies

```bash
npm install
```

### 3. Configureer environment variables

Kopieer het `.env.example` bestand naar `.env` en pas de waardes aan:

```bash
cp .env.example .env
```

Bewerk `.env` met je eigen configuratie:

```env
# Server Configuration
PORT=3030
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/soundboard

# Rate Limiting
RATE_LIMIT_WINDOW_MS=30000
RATE_LIMIT_MAX_REQUESTS=10

# File Upload Configuration
MAX_FILE_SIZE=524288

# Session Configuration
SESSION_SECRET=change-this-to-a-random-secure-string
```

### 4. Start de applicatie

**Development mode (met auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

De applicatie is nu beschikbaar op `http://localhost:3030`

## 🎮 Discord Integration Setup (Optioneel)

De soundboard kan audio afspelen in Discord voice channels! Wanneer je een sound klikt op de webapp, wordt deze automatisch ook afgespeeld in Discord.

### Vereisten

- Discord account en een Discord server waar je admin bent
- FFmpeg geïnstalleerd op je systeem

### FFmpeg Installatie

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download van [ffmpeg.org](https://ffmpeg.org/download.html) en voeg toe aan PATH

### Discord Bot Aanmaken

#### 1. Maak een Discord Application

1. Ga naar [Discord Developer Portal](https://discord.com/developers/applications)
2. Klik op **"New Application"**
3. Geef je bot een naam (bijv. "Soundboard Bot")
4. Klik **"Create"**

#### 2. Maak een Bot User

1. Ga naar de **"Bot"** tab in het linker menu
2. Klik **"Add Bot"** → **"Yes, do it!"**
3. Onder **"TOKEN"** klik **"Reset Token"** en kopieer de token
   - ⚠️ **Belangrijk**: Deel deze token NOOIT publiekelijk!
   - Bewaar deze veilig, je hebt hem nodig voor `.env`

#### 3. Bot Permissions Configureren

In de **"Bot"** tab:
- Scroll naar **"Privileged Gateway Intents"**
- ✅ Zet **"SERVER MEMBERS INTENT"** aan (optioneel)
- ✅ Zet **"MESSAGE CONTENT INTENT"** aan (optioneel)

#### 4. Uitnodiging URL Genereren

1. Ga naar **"OAuth2"** → **"URL Generator"** tab
2. Selecteer **SCOPES**:
   - ✅ `bot`
   - ✅ `applications.commands` (optioneel)
3. Selecteer **BOT PERMISSIONS**:
   - ✅ `View Channels`
   - ✅ `Connect` (to voice channels)
   - ✅ `Speak` (play audio)
   - ✅ `Use Voice Activity`
4. Kopieer de **Generated URL** onderaan de pagina
5. Open deze URL in je browser
6. Selecteer je Discord server en klik **"Authorize"**

#### 5. Discord IDs Verzamelen

**Developer Mode aanzetten:**
1. Open Discord
2. User Settings (tandwiel) → **Advanced**
3. ✅ Zet **"Developer Mode"** AAN

**Server ID vinden:**
- Rechtermuisklik op je server icon (links) → **"Copy Server ID"**

**Voice Channel ID vinden:**
- Rechtermuisklik op het voice channel waar de bot moet joinen → **"Copy Channel ID"**

#### 6. .env Configureren

Voeg deze regels toe aan je `.env` file:

```env
# Discord Bot Configuration
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=jouw_bot_token_hier_van_stap_2
DISCORD_GUILD_ID=jouw_server_id_van_stap_5
DISCORD_VOICE_CHANNEL_ID=jouw_voice_channel_id_van_stap_5
DISCORD_AUTO_JOIN=true
```

#### 7. Server Herstarten

```bash
npm run dev
```

Je zou moeten zien:
```
🎮 Discord integration enabled
🤖 Initializing Discord bot...
✅ Discord bot logged in as YourBotName#1234
✅ Discord bot ready!
🔊 Joining voice channel: General
✅ Voice connection is ready
```

### Gebruik

1. Open de soundboard webapp in je browser
2. Je ziet een **Discord toggle button** rechts bovenaan (paarse knop)
3. Klik op de knop om Discord playback **AAN** te zetten (wordt groen)
4. Klik op een sound → speelt af in browser **EN** in Discord!
5. Klik nogmaals op de knop om Discord playback **UIT** te zetten

### API Endpoints

De Discord integratie biedt ook API endpoints:

- `GET /api/discord/status` - Bot status ophalen
- `POST /api/discord/toggle` - Playback aan/uit
- `POST /api/discord/join` - Voice channel joinen
- `POST /api/discord/leave` - Voice channel verlaten

### Troubleshooting

**Bot joint niet de voice channel:**
- Check of de `DISCORD_VOICE_CHANNEL_ID` correct is
- Check of de bot de juiste permissions heeft
- Kijk in de server console voor error messages

**Geen audio in Discord:**
- Check of FFmpeg correct geïnstalleerd is: `ffmpeg -version`
- Check of audio files in `public/uploads/sounds/` staan
- Kijk in console voor "Audio player error" messages

**Discord button niet zichtbaar:**
- Check of `DISCORD_ENABLED=true` in `.env`
- Check of bot token geldig is
- Herstart de server

## 🐳 Docker Deployment

Docker Compose maakt het eenvoudig om de hele stack (MongoDB + Soundboard) te draaien met slechts één commando. Alle data wordt automatisch bewaard in Docker volumes.

### Vereisten

- Docker Engine 20.10+
- Docker Compose v2.0+

### Quick Start

**1. Clone de repository**
```bash
git clone <repository-url>
cd soundboardv2
```

**2. Configureer environment variabelen**
```bash
cp .env.example .env
# Bewerk .env indien nodig (zie Custom Poorten hieronder)
```

**3. Start de stack**
```bash
docker-compose up -d
```

**4. Open in browser**
```
http://localhost:3030
```

### Custom Poorten Configureren

De `.env` file bevat poort configuratie variabelen die je naar wens kunt aanpassen:

```env
# Soundboard webapp poort (standaard: 3030)
APP_PORT=3030

# MongoDB poort (standaard: 27017)
MONGODB_PORT=27017
```

**Voorbeelden:**

```bash
# Gebruik poort 8080 voor de webapp
APP_PORT=8080 docker-compose up -d
# Toegang: http://localhost:8080

# Gebruik poort 27018 voor MongoDB (als 27017 al in gebruik is)
MONGODB_PORT=27018 docker-compose up -d
```

### Docker Compose Commando's

```bash
# Start alle services (detached mode)
docker-compose up -d

# Bekijk logs
docker-compose logs -f
docker-compose logs -f soundboard  # alleen soundboard logs
docker-compose logs -f mongodb     # alleen MongoDB logs

# Stop alle services (data blijft bewaard)
docker-compose down

# Stop en verwijder alle data (⚠️ PERMANENT!)
docker-compose down -v

# Rebuild na code wijzigingen
docker-compose up -d --build

# Check status van containers
docker-compose ps

# Herstart een specifieke service
docker-compose restart soundboard
```

### Data Persistence & Volumes

De Docker setup gebruikt named volumes voor data persistence:

| Volume | Doel | Data |
|--------|------|------|
| `mongodb_data` | MongoDB database | Alle sounds, play counts, metadata |
| `mongodb_config` | MongoDB configuratie | Database settings |
| `upload_data` | Geüploade bestanden | Audio files en afbeeldingen |

**Data backup maken:**

```bash
# Stop de services eerst
docker-compose down

# Backup MongoDB data
docker run --rm -v soundboardv2_mongodb_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mongodb-backup.tar.gz -C /data .

# Backup uploads
docker run --rm -v soundboardv2_upload_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

**Data restore:**

```bash
# Restore MongoDB data
docker run --rm -v soundboardv2_mongodb_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/mongodb-backup.tar.gz -C /data

# Restore uploads
docker run --rm -v soundboardv2_upload_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

### Discord Integration met Docker

Om Discord te gebruiken in Docker, voeg de volgende variabelen toe aan je `.env`:

```env
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id
DISCORD_VOICE_CHANNEL_ID=your_channel_id
DISCORD_AUTO_JOIN=true
DISCORD_VOLUME=0.5
```

Herstart de container om de wijzigingen toe te passen:
```bash
docker-compose restart soundboard
```

### Development met Docker

Voor development kun je de lokale `public/upload` directory mounten:

**Edit docker-compose.yml:**
```yaml
# Uncomment deze regel onder soundboard > volumes:
- ./public/upload:/app/public/upload
```

Dit zorgt ervoor dat uploads direct beschikbaar zijn op je lokale filesystem.

### Handmatige Docker Build (Zonder Compose)

Als je alleen de soundboard container wilt draaien zonder docker-compose:

```bash
# Build image
docker build -t soundboard-app .

# Run container (zorg dat MongoDB al draait!)
docker run -d \
  --name soundboard \
  -p 3030:3030 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/soundboard \
  -e NODE_ENV=production \
  -v soundboard-uploads:/app/public/upload \
  soundboard-app
```

### Troubleshooting

**Container start niet:**
```bash
docker-compose logs soundboard
```

**MongoDB connection errors:**
```bash
# Check of MongoDB container draait
docker-compose ps

# Test MongoDB connectie
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

**Port already in use:**
```bash
# Verander APP_PORT in .env of gebruik:
APP_PORT=8080 docker-compose up -d
```

**Reset alles (factory reset):**
```bash
docker-compose down -v
rm -rf public/upload/*
docker-compose up -d
```

## Project Structuur

```
soundboardv2/
├── server.js                 # Main Express server
├── src/
│   ├── connection.js         # MongoDB connection configuratie
│   ├── sound-model.js        # Sound database model
│   └── image-model.js        # Image database model
├── public/
│   ├── js/
│   │   ├── script.js         # Client-side logic
│   │   └── libs/             # Frontend libraries
│   ├── styles/
│   │   └── style.css         # Styling
│   └── uploads/
│       ├── sounds/           # Uploaded audio files
│       └── images/           # Uploaded images
├── views/
│   ├── start.ejs             # Homepage template
│   ├── upload.ejs            # Upload form
│   └── error.ejs             # Error page
├── .env                      # Environment configuratie (niet in git)
├── .env.example              # Environment template
├── package.json              # Dependencies
└── Dockerfile                # Docker configuratie
```

## API Endpoints

### GET Routes

- `GET /` - Homepage met soundboard
- `GET /upload` - Upload formulier
- `GET /:id` - Specifieke sound weergeven

### POST Routes (Rate Limited)

- `POST /uploadSound` - Upload een nieuwe sound (multipart/form-data)
- `POST /update` - Update play count van een sound
- `POST /message` - Verstuur notificatie naar alle clients

## Environment Variables

| Variabele | Beschrijving | Default |
|-----------|--------------|---------|
| `PORT` | Server poort | `3030` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/soundboard` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit tijdvenster (ms) | `30000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per tijdvenster | `10` |
| `MAX_FILE_SIZE` | Max upload grootte (bytes) | `524288` (0.5MB) |
| `SESSION_SECRET` | Secret key voor sessies | - |

## Security Features

- ✅ Rate limiting op gevoelige endpoints
- ✅ File type validatie voor uploads
- ✅ File size limiting (0.5MB default)
- ✅ Environment variable configuratie
- ✅ Geen hardcoded credentials in code
- ✅ Alle dependencies up-to-date zonder vulnerabilities

## Recente Verbeteringen (2024)

### Kritieke Bug Fixes
- ✅ Fixed file validation bug die alle bestandstypes accepteerde
- ✅ Fixed undefined variables in upload handler
- ✅ Fixed hardcoded database URL

### Security Improvements
- ✅ Rate limiting ingeschakeld op upload/update endpoints
- ✅ Environment variables voor gevoelige configuratie
- ✅ Alle NPM packages geupdate naar laatste versies
- ✅ 40+ security vulnerabilities opgelost

### Dependency Updates
- ✅ Mongoose 5.9 → 8.19 (latest)
- ✅ Socket.IO 2.3 → 4.8 (latest)
- ✅ Multer 1.4 → 2.0 (latest, CVE-2022-24434 fixed)
- ✅ Express-rate-limit 5.1 → 8.2 (latest)
- ✅ Alle andere packages naar laatste veilige versies

## Ontwikkeling

### Scripts

```bash
npm start      # Start server
npm run dev    # Start met nodemon (auto-reload)
npm test       # Run tests (nog te implementeren)
```

### Code Style

Het project gebruikt:
- ES6+ JavaScript features
- Async/await voor asynchrone operaties
- EJS templates voor server-side rendering
- jQuery voor client-side DOM manipulatie

## Toekomstige Verbeteringen

Zie het analyse document voor een compleet verbeterplan, inclusief:

- [ ] Migratie naar moderne frontend framework (React/Vue/Svelte)
- [ ] TypeScript voor type safety
- [ ] Unit en integration tests
- [ ] API documentatie (Swagger/OpenAPI)
- [ ] User authenticatie en autorisatie
- [ ] Database indexes voor betere performance
- [ ] Paginering voor lange sound lijsten
- [ ] CI/CD pipeline setup

## Troubleshooting

### "Cannot connect to MongoDB"

Zorg dat MongoDB draait en de `MONGODB_URI` in `.env` correct is:

```bash
# Check of MongoDB draait
mongosh

# Of start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
```

### "Port 3030 already in use"

Verander de `PORT` in `.env` naar een andere waarde:

```env
PORT=3031
```

### "Too many requests"

Rate limiting is actief. Wacht 30 seconden of pas de rate limit settings aan in `.env`.

## Licentie

ISC

## Contact & Support

Voor vragen of problemen, maak een issue aan in de repository.
