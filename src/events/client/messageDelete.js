const { EmbedBuilder, ActivityType } = require("discord.js");
const config = require(`../../../config.json`);
const chalk = require("chalk");

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message) {
    return new Promise(async (resolve) => {
      if (!message) {
        return resolve(null);
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
        .setTitle(`⚡️ PowerBot | Logging ⚡️`)
        .setDescription(`${embedMessage}`)
        .setColor(0x00dcff)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: message.client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        });

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(message.guild, "botLog", delMessageEmbed);
    });
  },
};
