const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message) {
    return new Promise(async resolve => {
      if (!message) {
        return resolve(null);
      }

      if (!message.guild) {
        return resolve(null);
      }

      if (!message.author) {
        return resolve(null);
      } else if (message.author.bot == true) {
        return resolve(null);
      }

      if (message.guild) {
        const messageContent = message.content ?? "-"
        await userlogRepository.addLog(message.guild.id, message.author.id, "DELETE", "MESSAGE", messageContent, "-")
      }
    });
  }
};
