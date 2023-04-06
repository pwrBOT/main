const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const guildSettings = require("../../mysql/guildsRepository");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message) {
    return new Promise(async (resolve) => {

      if (!message) return resolve(null);

      if (!message.guild) return resolve(null);

      if (!message.author) return resolve(null);

      if (message.author.bot == true) return resolve(null);

      if (message.guild) {
        const fetchedLogs = await message.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MessageDelete
        });
        const deletionLog = fetchedLogs.entries.first();
        if (!deletionLog) return resolve(null);

        const { executor, target } = deletionLog;

        let deletedBy = "";

        if (target?.id === message?.author?.id) {
          deletedBy = `DELETED BY ${executor.tag}`;
        } else {
          deletedBy = `DELETED`;
        }

        const messageContent = message.content ?? "-";
        await userlogRepository.addLog(
          message.guild.id,
          message.author.id,
          deletedBy,
          "MESSAGE",
          message.id,
          messageContent,
          "-",
          "-"
        );

        // #### SEND MESSAGE TO BOT-LOG
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

        let embedMessage = `Nachricht von ${message?.author} in ${message?.channel} gelöscht!\n\nNachricht: ${message?.content}\nID: ${message?.id}`;

        if (message.embeds[0]) {
          const embed = message.embeds[0];
          const embedText = `\n\nEMBED:\n${embed.title}\n${embed.description}`;
          embedMessage += embedText;
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

        try {
          const logChannel = require("../../mysql/loggingChannelsRepository");
          await logChannel.logChannel(message.guild, "botLog", delMessageEmbed);
        } catch (error) {}
      }
    });
  }
};
