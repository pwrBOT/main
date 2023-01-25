const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const tempUnbanUser = require("./src/events/cronjobs/tempUnbanUser");
const autoDeleteChannel = require("./src/events/cronjobs/autoDeleteChannel");
const autoDeleteWarns = require("./src/events/cronjobs/autoDeleteWarns");
const logFilesSizeCheck = require("./src/events/cronjobs/logFilesSizeCheck");
const eventCheck = require("./src/events/cronjobs/eventCheck");

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
    GatewayIntentBits.DirectMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.GuildVoiceStats,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User
  ]
});

client.commands = new Collection();
client.commandArray = [];
client.premiumCommands = new Collection();
client.premiumCommandArray = [];
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.voiceGenerator = new Collection();

const functionFolders = ["error", "handlers"];
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter(file => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./src/functions/${folder}/${file}`)(client);
}

console.log(
  `\x1b[33m
    #########################################################
                 PowerBot initialisation....
    #########################################################\x1b[0m`
);

// BOT HANDLER
client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(TOKEN);

// CLIENT ON EVENTS

client.on("messageCreate", async message => {});

client.on("ready", async () => {
  tempUnbanUser.init(client);
  autoDeleteChannel.init(client);
  autoDeleteWarns.init(client);
  logFilesSizeCheck.init(client);
  eventCheck.init(client);
});

// Discord Together
const { DiscordTogether } = require("discord-together");
client.discordTogether = new DiscordTogether(client);
