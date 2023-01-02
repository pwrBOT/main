const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("../config.json");
const powerbotManagement = require("../src/mysql/powerbotManagement");

module.exports = client => {
  client.handlePremiumCommands = async () => {
    

    const clientId = config.powerbot_clientId;
    const TOKEN = config.powerbot_token;

    const restPremium = new REST({ version: "10" }).setToken(TOKEN);
    try {
      // DEPLOY COMMANDS TO SPECIFIC GUILDS --> ATTENTION! COMMANDS ARE DOUBLED --> ONLY FOR DEV
      const premiumGuilds = await powerbotManagement.getValues(
        "premium"
      );
      premiumGuilds.forEach(async guildId => {
        let premiumGuild = guildId.value;
        const guild = client.guilds.fetch(premiumGuild);

        console.log(
          `\x1b[33mÜbertrage Premium Slash-Commands zu Test-Guild: ${premiumGuild}\x1b[0m`
        );
        await restPremium.put(
          Routes.applicationGuildCommands(clientId, premiumGuild),
          {
            body: client.premiumCommandArray
          }
        );
      });

      console.log("\x1b[32mPremium Slash-Commands erfolgreich übertragen!\x1b[0m");
    } catch (error) {
      console.error(error);
    }
  };
};
