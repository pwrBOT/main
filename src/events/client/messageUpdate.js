const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const guildSettings = require("../../mysql/guildsRepository");
const loggingHandler = require("../../functions/fileLogging/loggingHandler");

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
        let ignoredChannels = await guildSettings.getGuildSetting(
          oldMessage.guild,
          "ignoredChannels"
        );

        if (!ignoredChannels) {
        } else {
          let channelId = "";
          if (oldMessage.channel.type == 11 || oldMessage.channel.type == 12) {
            channelId = oldMessage.channel.parentId;
          } else {
            channelId = oldMessage.channelId;
          }

          if (ignoredChannels.value.includes(channelId)) {
            return resolve(null);
          }
        }
      }

      if (
        oldMessage.content.length >= 1024 ||
        newMessage.content.length >= 1024
      ) {
        const logText = `GUILD: ${oldMessage.guild.name} (${oldMessage.guild.id}) | Nachricht (ID: ${oldMessage.id}) von ${oldMessage.author.username} (${oldMessage.author.id}) in ${oldMessage.channel.name} bearbeitet!\n----> Alte Nachricht: ${oldMessage.content}\n-----> Neue Nachricht: ${newMessage.content}\n`;
        loggingHandler.log(logText, "messageUpdate");
        return resolve(null);
      }

      let embedMessage = "";

      if (oldMessage.author == null || newMessage.author == null) {
        return resolve(null);
      } else if (oldMessage.content == null || newMessage.content == null) {
        return resolve(null);
      } else if (
        oldMessage.content.length === 0 ||
        newMessage.content.length === 0
      ) {
        return resolve(null);
      } else if (
        oldMessage.content.length >= 1024 ||
        newMessage.content.length >= 1024
      ) {
        return resolve(null);
      } else {
        embedMessage = `<@${newMessage.author.id}> hat seine Nachricht in ${newMessage.channel} bearbeitet!`;
      }

      const delMessageEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Logging ⚡️`)
        .setDescription(`${embedMessage}`)
        .setColor(0x00dcff)
        .setTimestamp(Date.now())
        .addFields(
          {
            name: "Originale Nachricht:",
            value: `${oldMessage.content}`
          },
          {
            name: "Bearbeitete Nachricht:",
            value: `${newMessage.content}\n\nID: ${newMessage.id}`
          }
        )
        .setFooter({
          iconURL: oldMessage.client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        });

      try {
        const logText = `GUILD: ${oldMessage.guild.name} (${oldMessage.guild.id}) | Nachricht (ID: ${oldMessage.id}) von ${oldMessage.author.username} (${oldMessage.author.id}) in ${oldMessage.channel.name} bearbeitet!\n----> Alte Nachricht: ${oldMessage.content}\n-----> Neue Nachricht: ${newMessage.content}\n`;
        loggingHandler.log(logText, "messageUpdate");
      } catch (error) {}

      try {
        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(
          oldMessage.guild,
          "botLog",
          delMessageEmbed
        );
      } catch (error) {}
    });
  }
};
