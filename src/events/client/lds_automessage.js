const { EmbedBuilder } = require("discord.js");
const autoMessageWaitMap = new Map();
/**
module.exports = {
  name: "messageCreate",
  async execute(message) {
    return new Promise(async (resolve) => {
      if (message == null || message.guild == null) {
        return resolve(null);
      }

      if (message.author.bot){
        return resolve(null);
      }

      const guildId = message.guildId;
      msg = message.content.toLowerCase();
      const TIMER = 60000;

      if (guildId != "396282694906150913") {
        return resolve(null);
      }

      // WIKI
      
      if (msg.includes("wiki") && !msg.includes("/wiki/")) {
        if (autoMessageWaitMap.has("wiki")) {
          return resolve(null);
        } else {
          message.reply({
            content: `Hab ich da Wiki gehört? 👀\nhttps://emergency-luedenscheid.de/wiki/`,
            ephemeral: false
          });
          autoMessageWaitMap.set("wiki");
          setTimeout(() => {
            autoMessageWaitMap.delete("wiki");
          }, TIMER);
        }
        return resolve(null);
      }
       

      // Launcher Problem
      if (msg.includes("instal") && message.channelId == "784417312655671306" || msg.includes("problem") && msg.includes("launcher")) {
        if (autoMessageWaitMap.has("launcherProblem")) {
          return resolve(null);
        } else {
          message.reply({
            content: `Probleme beim Installieren der Emergency Lüdenscheid Mod? 👀\nhttps://emergency-luedenscheid.de/wiki/lexicon/25-installation/`,
            ephemeral: false
          });
          autoMessageWaitMap.set("launcherProblem");
          setTimeout(() => {
            autoMessageWaitMap.delete("launcherProblem");
          }, TIMER);
        }
        return resolve(null);
      }

      return resolve(null);
    });
  }
};
*/
