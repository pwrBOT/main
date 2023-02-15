const { REST, Routes } = require("discord.js");
const fs = require("fs");
const powerbotManagement = require("../../mysql/powerbotManagement");
const config = require("../../../config.json");
const clientId = config.powerbot_clientId;
const TOKEN = config.powerbot_token;
const rest = new REST({ version: "10" }).setToken(TOKEN);

module.exports = client => {
  client.handleCommands = async () => {
    // ####################### MAIN COMMANDS ####################### \\
    let { commands, commandArray } = client;
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());

        console.log(
          `\x1b[36mGlobal Command: ${command.data
            .name} has been passed through the handler\x1b[0m`
        );
      }
    }

    console.log(`\x1b[33mÜbertrage Global Slash-Commands...\x1b[0m`);
    await rest.put(Routes.applicationCommands(clientId), {
      body: client.commandArray
    });
    console.log(`\x1b[32mGlobal Slash-Commands erfolgreich übertragen!\x1b[0m`);

    // ####################### LDS COMMANDS ####################### \\
    let { ldsCommandArray } = client;
    const commandLDSFolders = fs.readdirSync("./src/commandsLds");
    for (const folder of commandLDSFolders) {
      const commandLDSFiles = fs
        .readdirSync(`./src/commandsLds/${folder}`)
        .filter(file => file.endsWith(".js"));

      for (const file of commandLDSFiles) {
        const commandLds = require(`../../commandsLds/${folder}/${file}`);
        commands.set(commandLds.data.name, commandLds);
        ldsCommandArray.push(commandLds.data.toJSON());
        console.log(
          `\x1b[36mLDS specific Command: ${commandLds.data
            .name} has been passed through the handler\x1b[0m`
        );
      }
    }

    const guildLDS = "396282694906150913";
    console.log(`\x1b[33mÜbertrage Lüdenscheid Slash-Commands\x1b[0m`);

    await rest.put(Routes.applicationGuildCommands(clientId, guildLDS), {
      body: client.ldsCommandArray
    });
    console.log(
      `\x1b[32mLüdenscheid Slash-Commands erfolgreich übertragen!\x1b[0m`
    );
    // ################################################################# \\
    // ####################### PWR COMMANDS ####################### \\
    let { pwrCommandArray } = client;
    const commandPWRFolders = fs.readdirSync("./src/commandsPwr");
    for (const folder of commandPWRFolders) {
      const commandPWRFiles = fs
        .readdirSync(`./src/commandsPwr/${folder}`)
        .filter(file => file.endsWith(".js"));

      for (const file of commandPWRFiles) {
        const commandPwr = require(`../../commandsPwr/${folder}/${file}`);
        commands.set(commandPwr.data.name, commandPwr);
        ldsCommandArray.push(commandPwr.data.toJSON());
        console.log(
          `\x1b[36mLDS specific Command: ${commandPwr.data
            .name} has been passed through the handler\x1b[0m`
        );
      }
    }

    const guildPWR = "994975619521712219";
    console.log(`\x1b[33mÜbertrage PowerBot-Dev Slash-Commands\x1b[0m`);

    await rest.put(Routes.applicationGuildCommands(clientId, guildPWR), {
      body: client.pwrCommandArray
    });
    console.log(
      `\x1b[32mLPowerBot-Dev Slash-Commands erfolgreich übertragen!\x1b[0m`
    );
    // ################################################################# \\
  };
};
