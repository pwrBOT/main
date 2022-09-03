const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  CommandInteractionOptionResolver,
} = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const addUser = require("./src/events/messageCreate/addUser");
const getXp = require("./src/events/messageCreate/getXp");
const guildCreate = require("./src/events/dashboard/guildCreate");
const tempUnbanUser = require("./src/events/tempCommands/tempUnbanUser");
const tempUnmuteUser = require("./src/events/tempCommands/tempUnmuteUser");

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
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
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
client.on("guildCreate", async (guild) => {
  guildCreate(guild);
});

client.on("messageCreate", async (message) => {
  addUser(message);
  getXp(message);
});

client.on("ready", async () => {
  tempUnbanUser.init(client);
  tempUnmuteUser.init(client);
});

// Discord Together
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
