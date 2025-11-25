#!/usr/bin/env node

/**
 * Migration script to generate waveform data for existing sounds
 *
 * Usage: node scripts/generate-waveforms.js
 *
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all sounds without waveform_data
 * 3. Generates waveform for each sound
 * 4. Updates the database with waveform_data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Sound = require('../src/sound-model');
const audioProcessor = require('../src/services/audio-processor');

// Configuration
const SAMPLES_PER_WAVEFORM = 100; // Number of waveform data points (reduced for better visual)
const BATCH_SIZE = 10; // Process sounds in batches to avoid memory issues
const DRY_RUN = process.argv.includes('--dry-run'); // Test mode without saving

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.gray}→${colors.reset} ${msg}`)
};

/**
 * Check if audio file exists
 */
function audioFileExists(audioFile) {
  if (!audioFile) return false;

  const possiblePaths = [
    path.join(__dirname, '../public/uploads/sounds', audioFile),
    path.join(__dirname, '../public/uploads', audioFile),
    path.join(__dirname, '../public', audioFile)
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

/**
 * Process a single sound and generate waveform + duration
 */
async function processSoundWaveform(sound) {
  try {
    const audioPath = audioFileExists(sound.audio_file);

    if (!audioPath) {
      log.warning(`Audio file not found: ${sound.audio_file} (${sound.title})`);
      return { success: false, reason: 'file_not_found' };
    }

    log.debug(`Processing: ${sound.title}`);

    let updated = false;
    const updates = [];

    // Check if duration/sound_length is missing or invalid
    if (!sound.sound_length || sound.sound_length === '0:00' || sound.sound_length === '') {
      try {
        // Get audio metadata including duration
        const metadata = await audioProcessor.getAudioMetadata(audioPath);

        if (metadata && metadata.duration) {
          const formattedDuration = audioProcessor.formatDuration(metadata.duration);
          sound.sound_length = formattedDuration;
          updates.push(`duration: ${formattedDuration}`);
          updated = true;
        }
      } catch (metadataError) {
        log.warning(`Could not extract duration for ${sound.title}: ${metadataError.message}`);
      }
    }

    // Generate waveform peaks if missing
    if (!sound.waveform_data || sound.waveform_data === '' || sound.waveform_data === '[]') {
      try {
        const peaks = await audioProcessor.extractWaveformPeaks(audioPath, SAMPLES_PER_WAVEFORM);

        if (peaks && peaks.length > 0) {
          const waveformData = JSON.stringify(peaks);
          sound.waveform_data = waveformData;
          updates.push(`waveform: ${peaks.length} samples`);
          updated = true;
        } else {
          log.warning(`Failed to generate waveform for: ${sound.title}`);
        }
      } catch (waveformError) {
        log.warning(`Could not generate waveform for ${sound.title}: ${waveformError.message}`);
      }
    }

    // Save if any updates were made
    if (updated && !DRY_RUN) {
      await sound.save();
      log.success(`Updated ${sound.title}: ${updates.join(', ')}`);
    } else if (updated && DRY_RUN) {
      log.info(`[DRY RUN] Would update ${sound.title}: ${updates.join(', ')}`);
    } else {
      log.debug(`No updates needed for: ${sound.title}`);
      return { success: false, reason: 'no_updates_needed' };
    }

    return { success: true, updates: updates.length };

  } catch (error) {
    log.error(`Error processing ${sound.title}: ${error.message}`);
    return { success: false, reason: 'error', error: error.message };
  }
}

/**
 * Process sounds in batches
 */
async function processBatch(sounds, batchNumber, totalBatches) {
  log.info(`\nProcessing batch ${batchNumber}/${totalBatches} (${sounds.length} sounds)`);

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (const sound of sounds) {
    const result = await processSoundWaveform(sound);

    if (result.success) {
      results.success++;
    } else if (result.reason === 'file_not_found') {
      results.skipped++;
    } else if (result.reason === 'no_updates_needed') {
      // Sound already has all data, skip silently
      results.skipped++;
    } else {
      results.failed++;
      results.errors.push({
        title: sound.title,
        reason: result.reason,
        error: result.error
      });
    }

    // Small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log(`\n${colors.bright}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}║  🎵 Waveform Generation Migration Script  ║${colors.reset}`);
  console.log(`${colors.bright}╚════════════════════════════════════════════╝${colors.reset}\n`);

  if (DRY_RUN) {
    log.warning('Running in DRY RUN mode - no changes will be saved\n');
  }

  try {
    // Connect to MongoDB
    log.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soundboard');
    log.success('Connected to MongoDB\n');

    // Find sounds with missing waveform data or duration
    log.info('Searching for sounds with missing data...');
    const soundsNeedingUpdate = await Sound.find({
      $or: [
        // Missing waveform
        { waveform_data: { $exists: false } },
        { waveform_data: null },
        { waveform_data: '' },
        { waveform_data: '[]' },
        // Missing or invalid duration
        { sound_length: { $exists: false } },
        { sound_length: null },
        { sound_length: '' },
        { sound_length: '0:00' }
      ],
      active: 1 // Only process active sounds
    });

    if (soundsNeedingUpdate.length === 0) {
      log.success('All sounds have complete data!');
      return;
    }

    log.info(`Found ${soundsNeedingUpdate.length} sounds needing updates\n`);

    // Process in batches
    const batches = [];
    for (let i = 0; i < soundsNeedingUpdate.length; i += BATCH_SIZE) {
      batches.push(soundsNeedingUpdate.slice(i, i + BATCH_SIZE));
    }

    const totalResults = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await processBatch(batches[i], i + 1, batches.length);

      totalResults.success += batchResults.success;
      totalResults.failed += batchResults.failed;
      totalResults.skipped += batchResults.skipped;
      totalResults.errors.push(...batchResults.errors);
    }

    // Print summary
    console.log(`\n${colors.bright}╔════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}║              Migration Summary             ║${colors.reset}`);
    console.log(`${colors.bright}╚════════════════════════════════════════════╝${colors.reset}\n`);

    log.success(`Successfully processed: ${totalResults.success}`);
    if (totalResults.skipped > 0) {
      log.warning(`Skipped (file not found): ${totalResults.skipped}`);
    }
    if (totalResults.failed > 0) {
      log.error(`Failed: ${totalResults.failed}`);

      if (totalResults.errors.length > 0) {
        console.log(`\n${colors.bright}Errors:${colors.reset}`);
        totalResults.errors.forEach(err => {
          console.log(`  - ${err.title}: ${err.reason} ${err.error ? `(${err.error})` : ''}`);
        });
      }
    }

    if (DRY_RUN) {
      log.warning('\nNo changes were saved (dry run mode)');
      log.info('Run without --dry-run to save changes');
    }

  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('\nDatabase connection closed');
  }
}

// Run migration
migrate()
  .then(() => {
    log.success('\n✨ Migration completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    log.error(`\nFatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
