# Migration Scripts

Utility scripts voor het beheren en migreren van soundboard data.

## Waveform Generation Script

Genereert waveform data voor bestaande sounds die dit nog niet hebben.

### Gebruik

**Test mode (dry run) - geen wijzigingen opslaan:**
```bash
node scripts/generate-waveforms.js --dry-run
```

**Daadwerkelijk uitvoeren:**
```bash
node scripts/generate-waveforms.js
```

### Wat doet het script?

1. Maakt verbinding met MongoDB
2. Zoekt alle sounds zonder `waveform_data`
3. Genereert voor elke sound 1000 waveform samples
4. Slaat de waveform data op in de database

### Features

- ✅ Batch processing (10 sounds per batch)
- ✅ Dry run mode voor testen
- ✅ Gedetailleerde progress logging met kleuren
- ✅ Error handling en rapportage
- ✅ Automatische audio file detection
- ✅ Alleen actieve sounds (`active: 1`)

### Output

Het script toont tijdens het draaien:

```
╔════════════════════════════════════════════╗
║  🎵 Waveform Generation Migration Script  ║
╚════════════════════════════════════════════╝

ℹ Connecting to MongoDB...
✓ Connected to MongoDB

ℹ Searching for sounds without waveform data...
ℹ Found 45 sounds without waveform data

ℹ Processing batch 1/5 (10 sounds)
→ Generating waveform for: Sound Title 1
✓ Updated: Sound Title 1 (1000 samples)
...

╔════════════════════════════════════════════╗
║              Migration Summary             ║
╚════════════════════════════════════════════╝

✓ Successfully processed: 45
⚠ Skipped (file not found): 2
✗ Failed: 0

✨ Migration completed!
```

### Troubleshooting

**Audio files niet gevonden:**
- Controleer of de audio files in `public/uploads/sounds/` staan
- Het script zoekt ook in `public/uploads/` en `public/`

**FFmpeg errors:**
- Zorg dat FFmpeg geïnstalleerd is
- Check of de audio files valide zijn

**Database connectie problemen:**
- Controleer `.env` bestand voor `MONGODB_URI`
- Zorg dat MongoDB draait

### Configuratie aanpassen

In het script kun je de volgende constanten aanpassen:

```javascript
const SAMPLES_PER_WAVEFORM = 1000; // Aantal waveform punten
const BATCH_SIZE = 10;             // Sounds per batch
```
