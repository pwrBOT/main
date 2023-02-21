const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(oldMessage, newMessage) {
    return new Promise(async (resolve) => {
      if (!oldMessage || !newMessage) {
        return resolve(null);
      }

      if (!oldMessage.guild) {
        return resolve(null);
      }

      if (!oldMessage.author || !newMessage.author) {
        return resolve(null);
      } else if (oldMessage.author.bot == true) {
        return resolve(null);
      }

      if (!oldMessage.content || !newMessage.content) {
        return resolve(null);
      }

      if (oldMessage.content == newMessage.content) {
        return resolve(null);
      }

      if (oldMessage.guild || newMessage.guild) {
        const oldMessageContent = oldMessage.content ?? "-";
        const newMessageContent = newMessage.content ?? "-";
        await userlogRepository.addLog(
          newMessage.guild.id,
          newMessage.author.id,
          "UPDATE",
          "MESSAGE",
          oldMessage.id,
          `BEFORE: ${oldMessageContent}`,
          newMessage.id,
          `AFTER: ${newMessageContent}`
        );
      }
    });
  }
};
