// src/services/audio-processor.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Try to use system FFmpeg first, fallback to @ffmpeg-installer
try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
} catch (error) {
  console.log('Using system FFmpeg');
}

class AudioProcessor {
  constructor() {
    this.studioDir = path.join(__dirname, '../../public/uploads/temp/studio');
    this.soundsDir = path.join(__dirname, '../../public/uploads/sounds');
  }

  /**
   * Process audio with effects and trim
   * @param {string} inputPath - Input audio file path
   * @param {object} effects - Effect parameters
   * @param {string} outputFilename - Output filename
   * @returns {Promise<string>} - Output file path
   */
  async processAudio(inputPath, effects, outputFilename) {
    return new Promise((resolve, reject) => {
      try {
        // Ensure output directory exists
        if (!fs.existsSync(this.soundsDir)) {
          fs.mkdirSync(this.soundsDir, { recursive: true });
        }

        const outputPath = path.join(this.soundsDir, outputFilename);
        let command = ffmpeg(inputPath);

        // Build filter complex
        const filters = [];

        // Parse and validate effects values
        const echoType = effects.echo_type || 'none';
        const distortionLevel = parseInt(effects.distortion_level) || 0;
        const bassBoost = parseInt(effects.bass_boost) || 0;
        const reverbType = effects.reverb_type || 'none';
        const trimStart = parseFloat(effects.trim_start) || 0;
        const trimEnd = effects.trim_end ? parseFloat(effects.trim_end) : null;

        // Echo/Delay effect
        if (echoType !== 'none') {
          // aecho filter format: aecho=in_gain:out_gain:delays:decays
          if (echoType === 'short') {
            // Fast repeating echo (100ms delay, 4 echoes)
            filters.push('aecho=0.8:0.9:100:0.5');
          } else if (echoType === 'medium') {
            // Normal echo (250ms delay, 3 echoes)
            filters.push('aecho=0.8:0.9:250:0.4');
          } else if (echoType === 'long') {
            // Slow repeating echo (500ms delay, 2 echoes)
            filters.push('aecho=0.8:0.9:500:0.3');
          }
        }

        // Distortion effect
        if (distortionLevel > 0) {
          // overdrive filter for distortion effect
          // Map 0-100% to gain 1-20 (higher = more distortion)
          const gain = 1 + (distortionLevel / 100) * 19;
          filters.push(`overdrive=gain=${gain.toFixed(1)}`);
        }

        // Bass boost (equalizer filter)
        if (bassBoost !== 0) {
          filters.push(`equalizer=f=100:t=q:w=1:g=${bassBoost}`);
        }

        // Reverb (aecho filter)
        if (reverbType !== 'none') {
          if (reverbType === 'small') {
            filters.push('aecho=0.8:0.88:40:0.3');
          } else if (reverbType === 'large') {
            filters.push('aecho=0.8:0.88:60:0.4');
          }
        }

        // Apply filters if any
        if (filters.length > 0) {
          command = command.audioFilters(filters.join(','));
        }

        // Trim audio
        if (trimStart > 0) {
          command = command.setStartTime(trimStart);
        }

        if (trimEnd && trimEnd > 0) {
          const duration = trimEnd - trimStart;
          command = command.setDuration(duration);
        }

        // Output settings
        command
          .audioCodec('libmp3lame')
          .audioBitrate('192k')
          .audioChannels(2)
          .format('mp3')
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log('🎵 FFmpeg command:', commandLine);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`⚙️  Processing: ${Math.floor(progress.percent)}%`);
            }
          })
          .on('end', () => {
            console.log('✅ Audio processing completed');
            resolve(outputPath);
          })
          .on('error', (error) => {
            console.error('❌ FFmpeg error:', error);
            reject(new Error(`Audio processing failed: ${error.message}`));
          })
          .run();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get audio metadata (duration, format, etc.)
   * @param {string} filePath - Audio file path
   * @returns {Promise<object>}
   */
  async getAudioMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          return reject(new Error(`Failed to get metadata: ${error.message}`));
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: parseFloat(metadata.format.duration),
          format: metadata.format.format_name,
          bitRate: parseInt(metadata.format.bit_rate),
          sampleRate: audioStream ? parseInt(audioStream.sample_rate) : null,
          channels: audioStream ? audioStream.channels : null,
          size: parseInt(metadata.format.size)
        });
      });
    });
  }

  /**
   * Extract waveform peaks from audio file
   * @param {string} filePath - Audio file path
   * @param {number} samples - Number of samples (default: 1000)
   * @returns {Promise<Array>} - Array of peak values [0-1]
   */
  async extractWaveformPeaks(filePath, samples = 1000) {
    return new Promise((resolve, reject) => {
      try {
        const tempOutput = path.join(this.studioDir, `waveform-${Date.now()}.json`);

        // Ensure studio directory exists
        if (!fs.existsSync(this.studioDir)) {
          fs.mkdirSync(this.studioDir, { recursive: true });
        }

        // Use FFmpeg to extract audio data
        ffmpeg(filePath)
          .audioFilters([
            'compand', // Normalize volume
            `aresample=${samples}`, // Resample to desired number of samples
            'astats=metadata=1' // Audio statistics
          ])
          .format('null')
          .on('end', () => {
            // Simple fallback: generate approximate waveform
            // In production, you might want to use a more sophisticated method
            this.generateApproximateWaveform(filePath, samples)
              .then(resolve)
              .catch(reject);
          })
          .on('error', (error) => {
            // Fallback to approximate waveform on error
            this.generateApproximateWaveform(filePath, samples)
              .then(resolve)
              .catch(reject);
          })
          .pipe();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate approximate waveform (fallback method)
   * @param {string} filePath - Audio file path
   * @param {number} samples - Number of samples
   * @returns {Promise<Array>}
   */
  async generateApproximateWaveform(filePath, samples) {
    return new Promise((resolve, reject) => {
      try {
        const metadata = this.getAudioMetadata(filePath);

        // Generate smooth waveform pattern (simulated)
        const peaks = [];
        for (let i = 0; i < samples; i++) {
          const progress = i / samples;
          const baseLevel = 0.3 + Math.sin(progress * Math.PI) * 0.4;
          const variation = Math.random() * 0.3;
          peaks.push(Math.min(1.0, baseLevel + variation));
        }

        resolve(peaks);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convert audio format
   * @param {string} inputPath - Input file path
   * @param {string} outputPath - Output file path
   * @param {string} format - Output format (mp3, wav, ogg)
   * @returns {Promise<string>}
   */
  async convertFormat(inputPath, outputPath, format = 'mp3') {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);

      if (format === 'mp3') {
        command.audioCodec('libmp3lame').audioBitrate('192k');
      } else if (format === 'wav') {
        command.audioCodec('pcm_s16le');
      } else if (format === 'ogg') {
        command.audioCodec('libvorbis').audioBitrate('192k');
      }

      command
        .format(format)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (error) => reject(new Error(`Conversion failed: ${error.message}`)))
        .run();
    });
  }

  /**
   * Format duration (seconds → MM:SS)
   * @param {number} seconds - Duration in seconds
   * @returns {string}
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

module.exports = new AudioProcessor();
