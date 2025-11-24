# Migration Scripts

Utility scripts voor het beheren en migreren van soundboard data.

## Waveform Generation Script

Genereert waveform data en repareert ontbrekende duration voor bestaande sounds.

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
2. Zoekt alle sounds met ontbrekende data:
   - Sounds zonder `waveform_data`
   - Sounds zonder `sound_length` (duration)
   - Sounds met ongeldige duration (`0:00` of leeg)
3. Voor elke sound:
   - Genereert waveform (1000 samples) indien ontbreekt
   - Extraheert audio duration uit bestand indien ontbreekt
   - Formateert duration naar `MM:SS` formaat
4. Slaat alle updates op in de database

### Features

- ✅ **Dual repair**: Waveform én duration in één run
- ✅ **Smart detection**: Vindt alle sounds met ontbrekende data
- ✅ **Batch processing**: 10 sounds per batch
- ✅ **Dry run mode**: Test zonder opslaan
- ✅ **Detailed logging**: Progress met kleuren en emoji's
- ✅ **Error handling**: Graceful failures met rapportage
- ✅ **Auto file detection**: Zoekt in meerdere directories
- ✅ **Active only**: Alleen actieve sounds (`active: 1`)
- ✅ **FFmpeg metadata**: Accurate duration extraction

### Output

Het script toont tijdens het draaien:

```
╔════════════════════════════════════════════╗
║  🎵 Waveform Generation Migration Script  ║
╚════════════════════════════════════════════╝

ℹ Connecting to MongoDB...
✓ Connected to MongoDB

ℹ Searching for sounds with missing data...
ℹ Found 45 sounds needing updates

ℹ Processing batch 1/5 (10 sounds)
→ Processing: Sound Title 1
✓ Updated Sound Title 1: duration: 0:05, waveform: 1000 samples
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
