// Simple Discord token test script
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('🧪 Testing Discord Bot Token...\n');
console.log('Token from .env:', process.env.DISCORD_BOT_TOKEN);
console.log('Token length:', process.env.DISCORD_BOT_TOKEN?.length);
console.log('Token starts with:', process.env.DISCORD_BOT_TOKEN?.substring(0, 20) + '...');
console.log('\n🔌 Attempting to connect with ALL intents enabled...\n');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ]
});

client.once('ready', () => {
  console.log('✅ SUCCESS! Bot connected as:', client.user.tag);
  console.log('📊 Bot ID:', client.user.id);
  console.log('🔢 Guild count:', client.guilds.cache.size);

  client.guilds.cache.forEach(guild => {
    console.log(`  - Server: ${guild.name} (ID: ${guild.id})`);
  });

  console.log('\n✅ Token is VALID!');
  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
  process.exit(1);
});

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => {
    console.log('⏳ Login request sent, waiting for ready event...');
  })
  .catch((error) => {
    console.error('\n❌ FAILED TO LOGIN');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('\nFull error:', error);

    console.log('\n🔍 Troubleshooting suggestions:');
    console.log('1. Go to Discord Developer Portal > Bot section');
    console.log('2. Click "Reset Token" button');
    console.log('3. Copy the NEW token IMMEDIATELY (before refreshing the page)');
    console.log('4. Replace DISCORD_BOT_TOKEN in .env file');
    console.log('5. Make sure Privileged Gateway Intents are enabled');
    console.log('6. Save changes and run this test again');

    process.exit(1);
  });

// Timeout after 15 seconds
setTimeout(() => {
  console.error('\n⏱️  Timeout: No response from Discord after 15 seconds');
  process.exit(1);
}, 15000);
