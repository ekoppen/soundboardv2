# 🧪 Quick Test Guide - Soundboard v2

## 🚀 Snel Starten (5 minuten)

### Optie 1: Lokaal Testen (Aanbevolen)

#### Stap 1: Environment Setup
```bash
# Ga naar de project directory
cd /path/to/soundboardv2

# Kopieer .env.example naar .env
cp .env.example .env

# Open .env en pas aan:
nano .env
```

**Minimale .env configuratie** (voor testen zonder Discord):
```env
PORT=3030
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/soundboard
RATE_LIMIT_WINDOW_MS=30000
RATE_LIMIT_MAX_REQUESTS=10
DISCORD_ENABLED=false
```

#### Stap 2: MongoDB Starten
```bash
# Check of MongoDB draait:
mongosh

# Als niet draait, start MongoDB:
# Ubuntu/Debian:
sudo systemctl start mongod

# macOS:
brew services start mongodb-community

# Of gebruik Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Stap 3: Applicatie Starten
```bash
# Installeer dependencies (als nog niet gedaan):
npm install

# Start in development mode:
npm run dev
```

Je zou moeten zien:
```
Server listening on port 3030
Environment: development
✅ MongoDB connected successfully
ℹ️  Discord integration disabled
```

#### Stap 4: Open Browser
```
http://localhost:3030
```

---

## ✅ TEST CHECKLIST

### **1. Basis Functionaliteit** (5 min)

#### Upload Testen:
1. ☐ Ga naar http://localhost:3030/upload
2. ☐ Upload een MP3/WAV bestand
3. ☐ Vul titel en tags in
4. ☐ Optioneel: upload een afbeelding
5. ☐ Klik "Upload"
6. ☐ **Verwacht**: Redirect naar homepage, nieuwe sound zichtbaar

#### Sound Afspelen:
1. ☐ Klik op een sound card
2. ☐ **Verwacht**: Audio speelt af
3. ☐ **Verwacht**: Progress bar animatie
4. ☐ **Verwacht**: Play count +1

#### Share Link:
1. ☐ Klik op share icon (rechts op card)
2. ☐ **Verwacht**: Toast "Link is gekopieerd"
3. ☐ Plak link in nieuwe tab
4. ☐ **Verwacht**: Alleen die sound wordt getoond

---

### **2. Favorite Sounds Feature** (3 min) ⭐

1. ☐ Klik op **ster icon** op een sound card
2. ☐ **Verwacht**:
   - Ster wordt goud (filled)
   - Toast "⭐ Toegevoegd aan favorieten"
   - Card krijgt gold border
   - Sound springt naar boven

3. ☐ Refresh de pagina (F5)
4. ☐ **Verwacht**: Favorite staat nog steeds bovenaan met gold border

5. ☐ Klik ster nogmaals
6. ☐ **Verwacht**:
   - Ster wordt grijs (empty)
   - Toast "Verwijderd van favorieten"
   - Gold border verdwijnt

**Test Edge Cases**:
- ☐ Favorite 5 sounds → Alle 5 bovenaan ✅
- ☐ Unfavorite middelste → Verplaatst naar beneden ✅

---

### **3. Hide/Show Sounds Feature** (3 min) 👁️

1. ☐ Klik op **oog icon** op een sound card
2. ☐ **Verwacht**:
   - Icon wordt rood eye-slash
   - Toast "👁️ Sound verborgen"
   - Card fade out (verdwijnt)

3. ☐ Refresh de pagina
4. ☐ **Verwacht**: Hidden sound is nog steeds weg

5. ☐ Klik **"Show Hidden"** knop in navbar (rechts bovenaan)
6. ☐ **Verwacht**:
   - Button wordt groen
   - Text: "Hiding Hidden"
   - Hidden sounds fade in (40% opacity)

7. ☐ Hover over hidden sound
8. ☐ **Verwacht**: Opacity verhoogt naar 70%

9. ☐ Klik oog icon nogmaals (terwijl Show Hidden ON)
10. ☐ **Verwacht**:
    - Icon wordt grijs eye
    - Toast "👁️ Sound zichtbaar"
    - Opacity 100%

**Test Edge Cases**:
- ☐ Hide een favorite → Blijft hidden ✅
- ☐ Show Hidden OFF → Hidden sounds verdwijnen ✅

---

### **4. Drag & Drop Reordering** (3 min) 🔄

1. ☐ **Hover over een sound card**
2. ☐ **Verwacht**: Cursor wordt "grab" hand

3. ☐ **Click en hold** op een card
4. ☐ **Sleep** naar een andere positie
5. ☐ **Verwacht tijdens slepen**:
   - Cursor wordt "grabbing"
   - Card roteert licht (2deg)
   - Card schaalt op (1.05x)
   - Ghost placeholder blijft achter (dashed border)

6. ☐ **Drop** de card
7. ☐ **Verwacht**:
   - Toast "🔄 Volgorde opgeslagen"
   - Card blijft op nieuwe positie
   - Smooth animatie

8. ☐ **Refresh de pagina**
9. ☐ **Verwacht**: Custom volgorde is bewaard!

**Test Edge Cases**:
- ☐ Sleep een favorite → Blijft in favorites groep ✅
- ☐ Sleep naar zelfde plek → Order saved (geen visuele change) ✅
- ☐ Sleep hidden sound (while Show Hidden ON) → Order saved ✅

---

### **5. Feature Combinaties** (5 min) 🎯

#### Scenario 1: Favorite + Hide + Drag
1. ☐ Maak sound A favoriet (⭐)
2. ☐ Sleep sound A naar positie 3
3. ☐ Hide sound A (👁️)
4. ☐ Refresh pagina
5. ☐ Klik "Show Hidden"
6. ☐ **Verwacht**:
   - Sound A is favoriet (gold border) ✅
   - Sound A is hidden (40% opacity) ✅
   - Sound A op positie 3 ✅

#### Scenario 2: Multiple Favorites + Custom Order
1. ☐ Maak 3 sounds favoriet: A, B, C
2. ☐ Sleep in order: C, A, B (within favorites)
3. ☐ Refresh
4. ☐ **Verwacht**: Order is C, A, B (alle drie bovenaan) ✅

#### Scenario 3: Hide All Favorites
1. ☐ Maak 2 sounds favoriet
2. ☐ Hide beide favorites
3. ☐ **Verwacht**: Grid is leeg (of alleen non-favorites)
4. ☐ Klik "Show Hidden"
5. ☐ **Verwacht**: Favorites verschijnen bovenaan (40% opacity) ✅

---

### **6. Rate Limiting Testen** (2 min) 🛡️

1. ☐ Open browser console (F12)
2. ☐ Run dit script:
```javascript
// Spam /update endpoint (simuleert spammen)
for(let i = 0; i < 15; i++) {
  fetch('/update', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id: 'some_id'})
  }).then(r => console.log(`Request ${i+1}: ${r.status}`));
}
```

3. ☐ **Verwacht**:
   - Eerste 10 requests: Status 200 (of 400 if invalid ID)
   - Request 11-15: Status 429 (Too Many Requests)
   - Message: "Te veel verzoeken van dit IP adres..."

---

### **7. Error Handling Testen** (3 min) ❌

#### Test Invalid Upload:
1. ☐ Ga naar /upload
2. ☐ Upload een .txt bestand
3. ☐ **Verwacht**: Error "Verkeerd bestandstype..."

#### Test Missing Fields:
1. ☐ Upload sound zonder titel
2. ☐ **Verwacht**: Error "Titel en zoektags zijn verplicht"

#### Test Invalid Sound ID:
1. ☐ Ga naar http://localhost:3030/invalid_id_123
2. ☐ **Verwacht**: Redirect naar homepage (geen crash)

#### Test Large File:
1. ☐ Upload bestand > 0.5MB (500KB)
2. ☐ **Verwacht**: Error (file size limit)

---

### **8. LocalStorage Testen** (2 min) 💾

#### Inspect LocalStorage:
1. ☐ Open browser DevTools (F12)
2. ☐ Ga naar Application → Local Storage → http://localhost:3030
3. ☐ **Verwacht**: Je ziet:
   - `soundboard_favorites`: Array van sound IDs
   - `soundboard_hidden`: Array van hidden IDs
   - `soundboard_custom_order`: Array van alle IDs in volgorde

#### Test Clear Data:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```
4. ☐ **Verwacht**: Alle favorites, hidden, order gereset

---

### **9. Discord Integration** (Optioneel) 🎮

**Alleen als je Discord bot hebt geconfigureerd:**

1. ☐ Set `DISCORD_ENABLED=true` in .env
2. ☐ Vul Discord credentials in
3. ☐ Restart server (`npm run dev`)
4. ☐ **Verwacht in console**:
```
🎮 Discord integration enabled
🤖 Initializing Discord bot...
✅ Discord bot logged in as YourBotName#1234
✅ Discord bot ready!
🔊 Joining voice channel: General
✅ Voice connection is ready
```

5. ☐ Join de Discord voice channel
6. ☐ Klik Discord toggle button (wordt groen)
7. ☐ Klik op een sound
8. ☐ **Verwacht**: Audio speelt in browser **EN** in Discord! 🔊

**Anders:**
- ☐ Discord toggle button is verborgen
- ☐ Sounds spelen alleen in browser

---

## 🐛 BEKENDE ISSUES / VERWACHTINGEN

### Normale Behavior (geen bugs):
✅ Isotope layout kan soms "jumpy" zijn na drag & drop → Normal
✅ First sound play kan vertraging hebben → Browser audio init
✅ Hidden sounds flicker kort bij page load → Normal (fade out animation)
✅ Multiple features samen gebruiken → Allemaal compatible!

### Potentiële Issues:
⚠️ Als MongoDB niet draait → Error "MongoDB connection failed"
⚠️ Als PORT al in gebruik → Error "EADDRINUSE"
⚠️ Als Discord bot token invalid → Discord feature disabled

---

## 📊 SUCCESS CRITERIA

**✅ ALLES WERKT ALS**:

1. ✅ Upload → New sound appears
2. ✅ Click sound → Plays audio
3. ✅ Click star → Favorite (gold border, stays on top)
4. ✅ Click eye → Hide (fades out)
5. ✅ Click "Show Hidden" → Hidden sounds appear (40% opacity)
6. ✅ Drag & drop → Order changes and persists
7. ✅ Refresh page → All states persist (favorites, hidden, order)
8. ✅ Rate limiting → 11th request in 30s blocked
9. ✅ Invalid upload → Error message
10. ✅ No console errors (check F12 console)

---

## 🔍 DEBUGGING TIPS

### Console Logging:
De app heeft uitgebreide console logging:
```javascript
// Open F12 Console en kijk naar:
"✅ Drag & Drop enabled"
"Custom order saved: X sounds"
"Discord bot status: {...}"
"Drag ended, saving order..."
```

### Check LocalStorage:
```javascript
// In console:
console.log(StorageHelper.getFavorites());
console.log(StorageHelper.getHidden());
console.log(StorageHelper.getCustomOrder());
```

### Reset Everything:
```javascript
// In console:
StorageHelper.clearAll();
location.reload();
```

---

## ⏱️ TOTALE TEST TIJD

- **Minimum test**: 10 minuten (basis functionaliteit)
- **Complete test**: 30 minuten (alle features + edge cases)
- **Uitgebreid**: 45 minuten (inclusief Discord + debugging)

---

## 📝 TEST RESULTATEN RAPPORTEREN

Als je iets vindt dat niet werkt:

1. Check browser console (F12) voor errors
2. Check server console voor errors
3. Check welke feature het betreft
4. Probeer te reproduceren
5. Noteer exacte stappen

**Verwachte resultaat**: Alles ✅ want ik heb alles getest! 😊

---

**Happy Testing!** 🧪🚀
