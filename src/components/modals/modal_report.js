const { EmbedBuilder } = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = {
  data: {
    name: "userReport",
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const member = interaction.fields.getTextInputValue("reportedUserInput");
      const reporter = interaction.user.tag;
      const reason = interaction.fields.getTextInputValue("reportUserInput");

      const reportembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot ⚡️ | User Report`)
        .setDescription(`User: ${member} wurde soeben gemeldet.`)
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`,
        })
        .addFields([
          {
            name: `Beschwerde:`,
            value: `${reason}`,
            inline: false,
          },
          {
            name: `Beschwerdeführer:`,
            value: `${reporter}`,
            inline: true,
          },
        ]);

      const newMessage = `User ${member} wurde gemeldet ✅`;
      await interaction.reply({ content: newMessage });
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        interaction.guild,
        1
      );
      if (!guildSettings) {
        return resolve(null);
      }

      const modLogChannel = guildSettings.modLog;
      if (modLogChannel === undefined) {
        interaction.reply(
          `Mod-Log Channel nicht gefunden! Bot Einrichtung abschließen`
        );
        setTimeout(function () {
          interaction.deleteReply();
        }, 3000);
      } else {
        client.channels.cache
          .get(modLogChannel)
          .send({ embeds: [reportembed] })
          .catch(console.error);
          return resolve(null);
      }
    });
  },
};
