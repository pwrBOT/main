const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("../../../config.json");
const clientId = config.powerbot_clientId;
const TOKEN = config.powerbot_token;
const rest = new REST({ version: "10" }).setToken(TOKEN);

module.exports = (client) => {
  client.pushCommands = async () => {
    let { commands } = client;
    const commandFoldersGlobal = fs.readdirSync("./src/commands");
    const commandFoldersLds = fs.readdirSync("./src/commandsLds");
    const commandFoldersPwr = fs.readdirSync("./src/commandsPwr");
    const commandFoldersGgn = fs.readdirSync("./src/commandsGgn");

    for (const folder of commandFoldersGlobal) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        console.log(
          `\x1b[36mCommand: ${command.data.name} has been passed through the handler\x1b[0m`
        );
      }
    }

    for (const folder of commandFoldersLds) {
      const commandFiles = fs
        .readdirSync(`./src/commandsLds/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commandsLds/${folder}/${file}`);
        commands.set(command.data.name, command);
        console.log(
          `\x1b[36mLDS Command: ${command.data.name} has been passed through the handler\x1b[0m`
        );
      }
    }

    for (const folder of commandFoldersPwr) {
      const commandFiles = fs
        .readdirSync(`./src/commandsPwr/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commandsPwr/${folder}/${file}`);
        commands.set(command.data.name, command);
        console.log(
          `\x1b[36mPWR Command: ${command.data.name} has been passed through the handler\x1b[0m`
        );
      }
    }

    for (const folder of commandFoldersGgn) {
      const commandFiles = fs
        .readdirSync(`./src/commandsGgn/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commandsGgn/${folder}/${file}`);
        commands.set(command.data.name, command);
        console.log(
          `\x1b[36mGGN Command: ${command.data.name} has been passed through the handler\x1b[0m`
        );
      }
    }
  };

  client.handleGlobalCommands = async () => {
    // ####################### GLOBAL COMMANDS ####################### \\
    let { comandGlobalArray } = client;
    const commandFolders = fs.readdirSync("./src/commands");

    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        comandGlobalArray.push(command.data.toJSON());
      }
    }
    console.log(`\x1b[33mAktualisiere Global Slash-Commands...\x1b[0m`);

    await rest.put(Routes.applicationCommands(clientId), {
      body: comandGlobalArray
    });
    console.log(
      `\x1b[32mGlobal Slash-Commands erfolgreich aktualisiert!\x1b[0m`
    );
  };

  client.handleGuildCommands = async () => {
    // ####################### LDS COMMANDS ####################### \\
    let { ldsCommandArray } = client;
    const commandLDSFolders = fs.readdirSync("./src/commandsLds");

    for (const folder of commandLDSFolders) {
      const commandLDSFiles = fs
        .readdirSync(`./src/commandsLds/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandLDSFiles) {
        const commandLds = require(`../../commandsLds/${folder}/${file}`);
        // commands.set(commandLds.data.name, commandLds);
        ldsCommandArray.push(commandLds.data.toJSON());
      }
    }

    const guildLDS = "396282694906150913";
    const ldsCommandArrayFull = client.ldsCommandArray.concat(
      client.commandArray
    );
    console.log(`\x1b[33mÜbertrage Lüdenscheid Slash-Commands\x1b[0m`);

    rest.put(Routes.applicationGuildCommands(clientId, guildLDS), {
      body: ldsCommandArrayFull
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
        .filter((file) => file.endsWith(".js"));

      for (const file of commandPWRFiles) {
        const commandPwr = require(`../../commandsPwr/${folder}/${file}`);
        // commands.set(commandPwr.data.name, commandPwr);
        pwrCommandArray.push(commandPwr.data.toJSON());
      }
    }

    const guildPWR = "994975619521712219";
    const pwrBotCommandArrayFull = client.pwrCommandArray.concat(
      client.commandArray
    );
    console.log(`\x1b[33mÜbertrage PowerBot-Dev Slash-Commands\x1b[0m`);

    rest.put(Routes.applicationGuildCommands(clientId, guildPWR), {
      body: pwrBotCommandArrayFull
    });
    console.log(
      `\x1b[32mPowerBot-Dev Slash-Commands erfolgreich übertragen!\x1b[0m`
    );
    // ################################################################# \\
    // ####################### GGN COMMANDS ####################### \\
    let { ggnCommandArray } = client;
    const commandGGNFolders = fs.readdirSync("./src/commandsGgn");
    for (const folder of commandGGNFolders) {
      const commandGGNFiles = fs
        .readdirSync(`./src/commandsGgn/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandGGNFiles) {
        const commandGgn = require(`../../commandsGgn/${folder}/${file}`);
        ggnCommandArray.push(commandGgn.data.toJSON());
      }
    }

    const guildGGN = "1135188214093729832";
    const ggnCommandArrayFull = client.ggnCommandArray.concat(
      client.commandArray
    );
    console.log(
      `\x1b[33mÜbertrage German Gaming Network Slash-Commands\x1b[0m`
    );

    rest.put(Routes.applicationGuildCommands(clientId, guildPWR), {
      body: ggnCommandArrayFull
    });
    console.log(
      `\x1b[32mGerman Gaming Network Slash-Commands erfolgreich übertragen!\x1b[0m`
    );
    // ################################################################# \\
  };
};
