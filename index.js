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
const socialCheck = require("./src/events/cronjobs/socialMediaNews");
const uptimeCheck = require("./src/events/cronjobs/uptimeCheck");
const birthdayCheck = require("./src/events/cronjobs/birthdayCheck");
const DLU = require("@dbd-soft-ui/logs");

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
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.GuildVoiceStates,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User
  ]
});

client.commands = new Collection();
client.comandGlobalArray = [];
client.commandArray = [];
client.ldsCommandArray = [];
client.pwrCommandArray = [];

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
client.login(TOKEN);
client.pushCommands();
client.handleGuildCommands();
client.handleGlobalCommands();
client.handleEvents();
client.handleComponents();

// CLIENT ON EVENTS

client.on("ready", async () => {
  await tempUnbanUser.init(client);
  await autoDeleteChannel.init(client);
  await autoDeleteWarns.init(client);
  await logFilesSizeCheck.init(client);
  await eventCheck.init(client);
  await socialCheck.init(client);
  await uptimeCheck.init(client);
  await birthdayCheck.init(client);

  /**
  // Dashboard Logging
  await DLU.register(client, {
    dashboard_url: "https://dashboard.pwr.lol/",
    key: "34geJ6!aaASD12908!"
  });
});

process.on("unhandledRejection", (reason, p) => {
  DLU.send(client, {
    title: "Unhandled Rejection",
    description: reason
  }); 
  */
});
