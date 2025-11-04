// src/discord-bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');
const path = require('path');

class DiscordBot {
  constructor() {
    this.client = null;
    this.voiceConnection = null;
    this.audioPlayer = null;
    this.isReady = false;
    this.guildId = process.env.DISCORD_GUILD_ID;
    this.channelId = process.env.DISCORD_VOICE_CHANNEL_ID;
    this.playbackEnabled = true; // Can be toggled via webapp
  }

  /**
   * Initialize and connect the Discord bot
   */
  async connect() {
    try {
      if (!process.env.DISCORD_BOT_TOKEN) {
        console.log('⚠️  Discord bot token not provided, skipping Discord integration');
        return false;
      }

      console.log('🤖 Initializing Discord bot...');

      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates
        ]
      });

      this.audioPlayer = createAudioPlayer();

      // Setup event listeners
      this.setupEventListeners();

      // Login to Discord
      await this.client.login(process.env.DISCORD_BOT_TOKEN);

      return true;
    } catch (error) {
      console.error('❌ Failed to connect Discord bot:', error.message);
      return false;
    }
  }

  /**
   * Setup event listeners for bot and audio player
   */
  setupEventListeners() {
    // Bot ready event
    this.client.once('ready', async () => {
      console.log(`✅ Discord bot logged in as ${this.client.user.tag}`);
      this.isReady = true;

      // Auto-join voice channel if enabled
      if (process.env.DISCORD_AUTO_JOIN === 'true') {
        await this.joinVoiceChannel();
      }
    });

    // Handle bot errors
    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });

    // Audio player event listeners
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      console.log('🎵 Audio playback finished');
    });

    this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
      console.log('🎵 Audio playback started');
    });

    this.audioPlayer.on('error', (error) => {
      console.error('❌ Audio player error:', error);
    });
  }

  /**
   * Join the configured voice channel
   */
  async joinVoiceChannel() {
    try {
      if (!this.isReady) {
        console.log('⚠️  Bot not ready yet, cannot join voice channel');
        return false;
      }

      if (!this.guildId || !this.channelId) {
        console.log('⚠️  Guild ID or Channel ID not configured');
        return false;
      }

      const guild = this.client.guilds.cache.get(this.guildId);
      if (!guild) {
        console.error(`❌ Guild ${this.guildId} not found`);
        return false;
      }

      const channel = guild.channels.cache.get(this.channelId);
      if (!channel) {
        console.error(`❌ Voice channel ${this.channelId} not found`);
        return false;
      }

      console.log(`🔊 Joining voice channel: ${channel.name}`);

      this.voiceConnection = joinVoiceChannel({
        channelId: this.channelId,
        guildId: this.guildId,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false
      });

      // Subscribe the audio player to the voice connection
      this.voiceConnection.subscribe(this.audioPlayer);

      // Handle voice connection state changes
      this.voiceConnection.on(VoiceConnectionStatus.Ready, () => {
        console.log('✅ Voice connection is ready');
      });

      this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
        console.log('⚠️  Disconnected from voice channel, attempting to reconnect...');
        try {
          await Promise.race([
            entersState(this.voiceConnection, VoiceConnectionStatus.Signalling, 5000),
            entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5000)
          ]);
        } catch (error) {
          console.error('❌ Failed to reconnect, destroying connection');
          this.voiceConnection.destroy();
          this.voiceConnection = null;
        }
      });

      this.voiceConnection.on('error', (error) => {
        console.error('Voice connection error:', error);
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to join voice channel:', error.message);
      return false;
    }
  }

  /**
   * Leave the current voice channel
   */
  leaveVoiceChannel() {
    if (this.voiceConnection) {
      this.voiceConnection.destroy();
      this.voiceConnection = null;
      console.log('👋 Left voice channel');
      return true;
    }
    return false;
  }

  /**
   * Play a sound file in the voice channel
   * @param {string} audioFileName - Name of the audio file in uploads/sounds/
   */
  async playSound(audioFileName) {
    try {
      if (!this.playbackEnabled) {
        console.log('🔇 Discord playback is disabled');
        return false;
      }

      if (!this.voiceConnection) {
        console.log('⚠️  Not connected to voice channel');
        // Try to auto-join
        const joined = await this.joinVoiceChannel();
        if (!joined) {
          return false;
        }
      }

      const audioPath = path.join(__dirname, '../public/uploads/sounds', audioFileName);
      console.log(`🎵 Playing sound: ${audioFileName}`);

      const resource = createAudioResource(audioPath, {
        inlineVolume: true
      });

      // Set volume (0.5 = 50%)
      resource.volume?.setVolume(0.5);

      this.audioPlayer.play(resource);

      return true;
    } catch (error) {
      console.error('❌ Failed to play sound:', error.message);
      return false;
    }
  }

  /**
   * Toggle Discord playback on/off
   */
  togglePlayback(enabled) {
    this.playbackEnabled = enabled;
    console.log(`🔊 Discord playback ${enabled ? 'enabled' : 'disabled'}`);
    return this.playbackEnabled;
  }

  /**
   * Get current bot status
   */
  getStatus() {
    return {
      connected: this.isReady,
      inVoiceChannel: this.voiceConnection !== null,
      playbackEnabled: this.playbackEnabled,
      username: this.client?.user?.tag || 'Not connected'
    };
  }

  /**
   * Disconnect the bot
   */
  async disconnect() {
    if (this.voiceConnection) {
      this.voiceConnection.destroy();
    }
    if (this.client) {
      await this.client.destroy();
    }
    console.log('👋 Discord bot disconnected');
  }
}

module.exports = DiscordBot;
