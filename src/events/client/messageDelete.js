const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const guildSettings = require("../../mysql/guildsRepository");
const loggingHandler = require("../../functions/fileLogging/loggingHandler");

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
        let ignoredChannels = await guildSettings.getGuildSetting(
          message.guild,
          "ignoredChannels"
        );

        if (!ignoredChannels) {
        } else {
          let channelId = "";
          if (message.channel.type == 11 || message.channel.type == 12) {
            channelId = message.channel.parentId;
          } else {
            channelId = message.channelId;
          }

          if (ignoredChannels.value.includes(channelId)) {
            return resolve(null);
          }
        }
      }

      let embedMessage = "";

      if (message.author == null) {
        return resolve(null);
      } else if (message.content == null) {
        return resolve(null);
      } else if (message.content.length === 0) {
        return resolve(null);
      } else {
        embedMessage = `Nachricht von ${message.author} in ${message.channel} gelöscht!\n\nNachricht: ${message.content}\nID: ${message.id}`;
      }

      const delMessageEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Logging ⚡️`)
        .setDescription(`${embedMessage}`)
        .setColor(0x00dcff)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: message.client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        });

      const logText = `GUILD: ${message.guild.name} (${message.guild
        .id}) | Nachricht (ID: ${message.id}) von ${message.author
        .username} (${message.author.id}) in ${message.channel
        .name} gelöscht!\n----> Nachricht: ${message.content}`;
      loggingHandler.log(logText, "messageDelete");

      try {
        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(message.guild, "botLog", delMessageEmbed);
      } catch (error) {}
    });
  }
};
