const { REST, Routes } = require('discord.js');
const fs = require("fs");
const config = require("../../../config.json");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        console.log(
          `\x1b[36mCommand: ${command.data.name} has been passed through the handler\x1b[0m`
        );
      }
    }

    const clientId = config.powerbot_clientId;
    const TOKEN = config.powerbot_token;
    const pwrguildID = config.powerbot_pwrguildID;
    const ldsguildID = config.powerbot_ldsguildID;
    const mbrguildID = config.powerbot_mbrguildID;

    const rest = new REST({ version: "10" }).setToken(TOKEN);
    try {
      console.log("\x1b[33mÜbertrage Slash-Commands zu Guilds.\x1b[0m");

      // DEPLOY COMMANDS GLOBAL TO ALL GUILDS (1h Refresh Time)
      await rest.put(Routes.applicationCommands(clientId), {
        body: [],
      });

      // DEPLOY COMMANDS TO SPECIFIC GUILDS --> ATTENTION! COMMANDS ARE DOUBLED --> ONLY FOR DEV
      const testGuilds = config.whitelist_Guilds;
      testGuilds.forEach(async (guildId) => {
        let testGuild = guildId;
        const guild = client.guilds.fetch(testGuild);

        console.log(
          `\x1b[33mÜbertrage Slash-Commands zu Test-Guild: ${testGuild}\x1b[0m`
        );
        await rest.put(Routes.applicationGuildCommands(clientId, testGuild), {
          body: client.commandArray,
        });
      });

      console.log("\x1b[32mAlle Slash-Commands erfolgreich übertragen!\x1b[0m");
    } catch (error) {
      console.error(error);
    }
  };
};
