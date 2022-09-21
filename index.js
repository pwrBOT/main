const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const getXp = require("./src/events/messageCreate/getXp");
const levelSystemGiveRole = require("./src/events/messageCreate/levelSystemGiveRole");
const tempUnbanUser = require("./src/events/tempCommands/tempUnbanUser");

// Discord Bot SetUp
const TOKEN = config.powerbot_token;

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.GuildVoiceStats,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.voiceGenerator = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./src/functions/${folder}/${file}`)(client);
}

// BOT HANDLER
client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(TOKEN);

// CLIENT ON EVENTS


client.on("messageCreate", async (message) => {
  getXp(message);
  levelSystemGiveRole(message);
});

client.on("ready", async () => {
  tempUnbanUser.init(client);
});



// Discord Together
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
