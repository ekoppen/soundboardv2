#!/bin/bash

# Unset Discord environment variables to allow .env file to be used
unset DISCORD_BOT_TOKEN
unset DISCORD_GUILD_ID
unset DISCORD_VOICE_CHANNEL_ID
unset DISCORD_AUTO_JOIN
unset DISCORD_VOLUME
unset DISCORD_ENABLED

# Start the development server
PORT=3031 npm run dev
