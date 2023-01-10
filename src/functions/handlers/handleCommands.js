const { REST, Routes } = require("discord.js");
const fs = require("fs");
const powerbotManagement = require("../../mysql/powerbotManagement");
const guildsRepository = require("../../mysql/guildsRepository");
const config = require("../../../config.json");
const clientId = config.powerbot_clientId;
const TOKEN = config.powerbot_token;
const rest = new REST({ version: "10" }).setToken(TOKEN);
const restPremium = new REST({ version: "10" }).setToken(TOKEN);

module.exports = client => {
  client.handleCommands = async () => {
    // ####################### MAIN COMMANDS ####################### \\
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        console.log(
          `\x1b[36mCommand: ${command.data
            .name} has been passed through the handler\x1b[0m`
        );
      }
    }

    // ####################### PREMIUM COMMANDS ####################### \\
    const commandPremiumFolders = fs.readdirSync("./src/commandsPremium");
    for (const folder of commandPremiumFolders) {
      const commandPremiumFiles = fs
        .readdirSync(`./src/commandsPremium/${folder}`)
        .filter(file => file.endsWith(".js"));

      const { premiumCommands, premiumCommandArray } = client;
      for (const file of commandPremiumFiles) {
        const commandPremium = require(`../../commandsPremium/${folder}/${file}`);
        premiumCommands.set(commandPremium.data.name, commandPremium);
        premiumCommandArray.push(commandPremium.data.toJSON());
        console.log(
          `\x1b[36mPremium Command: ${commandPremium.data
            .name} has been passed through the handler\x1b[0m`
        );
      }
    }
    // ################################################################# \\
    let commandPremiumArray = await client.commandArray.concat(
      client.premiumCommandArray
    );
    const whitelistGuilds = await powerbotManagement.getValues("whitelist");
    const premiumGuilds = await guildsRepository.getGuildSettingsByProperty("premium");

    try {
      whitelistGuilds.forEach(async guildId => {
        let whitelistGuild = guildId.value;
        const guild = await client.guilds.fetch(whitelistGuild);

        console.log(
          `\x1b[33mÜbertrage Slash-Commands zu Guild: ${guild.name} (${whitelistGuild})\x1b[0m`
        );

        premiumGuilds.forEach(premiumGuildId => {
          if (premiumGuildId.guildId == whitelistGuild) {
            console.log(
              `\x1b[33m>>>> PREMIUM GUILD: ${guild.name} (${whitelistGuild})\x1b[0m`
            );
            restPremium.put(
              Routes.applicationGuildCommands(clientId, whitelistGuild),
              {
                body: commandPremiumArray
              }
            );
          } else {
            rest.put(
              Routes.applicationGuildCommands(clientId, whitelistGuild),
              {
                body: client.commandArray
              }
            );
          }
        });
      });

      console.log("\x1b[32mSlash-Commands erfolgreich übertragen!\x1b[0m");
    } catch (error) {
      console.error(error);
    }
  };
};
