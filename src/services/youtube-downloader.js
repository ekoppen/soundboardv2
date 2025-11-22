// src/services/youtube-downloader.js
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');
const { uuid: uuidv4 } = require('uuidv4');
const sanitize = require('sanitize-filename');

class YouTubeDownloader {
  constructor() {
    this.tempDir = path.join(__dirname, '../../public/uploads/temp/youtube');
    this.ytDlp = new YTDlpWrap();
    this.MAX_DURATION = 300; // 5 minutes in seconds
    this.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  }

  /**
   * Validate YouTube URL
   * @param {string} url - YouTube URL
   * @returns {boolean}
   */
  isValidYouTubeURL(url) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
  }

  /**
   * Extract YouTube video ID from URL
   * @param {string} url - YouTube URL
   * @returns {string|null}
   */
  extractVideoID(url) {
    try {
      // Extract video ID from various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get video info (title, duration, etc.)
   * @param {string} url - YouTube URL
   * @returns {Promise<object>}
   */
  async getVideoInfo(url) {
    try {
      // Use yt-dlp to get video info
      const info = await this.ytDlp.getVideoInfo(url);

      return {
        title: info.title,
        duration: parseInt(info.duration),
        videoId: info.id,
        thumbnail: info.thumbnail
      };
    } catch (error) {
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  /**
   * Download YouTube audio
   * @param {string} url - YouTube URL
   * @param {Function} progressCallback - Progress callback (percent)
   * @returns {Promise<object>} - { filePath, videoInfo, sessionId }
   */
  async downloadAudio(url, progressCallback = null) {
    try {
      // Validate URL
      if (!this.isValidYouTubeURL(url)) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video info first
      const videoInfo = await this.getVideoInfo(url);

      // Check duration
      if (videoInfo.duration > this.MAX_DURATION) {
        throw new Error(`Video is too long (max ${this.MAX_DURATION / 60} minutes)`);
      }

      // Generate session ID and filename
      const sessionId = uuidv4();
      const sanitizedTitle = sanitize(videoInfo.title).substring(0, 50);
      const filename = `${sessionId}-${sanitizedTitle}.mp3`;
      const filePath = path.join(this.tempDir, filename);

      // Ensure temp directory exists
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }

      // Download audio using yt-dlp
      await this.ytDlp.execPromise([
        url,
        '-x', // Extract audio
        '--audio-format', 'mp3',
        '--audio-quality', '0', // Best quality
        '-o', filePath,
        '--no-playlist',
        '--max-filesize', `${this.MAX_FILE_SIZE}`,
        '--progress',
        '--newline'
      ]);

      // Check if file was created and get size
      if (!fs.existsSync(filePath)) {
        throw new Error('Download failed: File was not created');
      }

      const stats = fs.statSync(filePath);
      if (stats.size > this.MAX_FILE_SIZE) {
        fs.unlinkSync(filePath);
        throw new Error(`File is too large (max ${this.MAX_FILE_SIZE / (1024 * 1024)}MB)`);
      }

      return {
        filePath: filePath,
        filename: filename,
        videoInfo: videoInfo,
        sessionId: sessionId
      };
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Cleanup old temp files (older than 24 hours)
   */
  cleanupOldFiles() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        return;
      }

      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        try {
          const stats = fs.statSync(filePath);
          const age = now - stats.mtimeMs;

          if (age > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Cleaned up old temp file: ${file}`);
          }
        } catch (err) {
          // File might have been deleted already
          console.error(`Error cleaning up ${file}:`, err.message);
        }
      });
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Delete specific file
   * @param {string} filePath - Path to file
   */
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted file: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}

module.exports = new YouTubeDownloader();
