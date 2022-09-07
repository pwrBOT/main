const { EmbedBuilder } = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = {
  data: {
    name: "userReport",
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true,
      });
      const reporter = interaction.user.tag;
      const reason = interaction.fields.getTextInputValue("reportUserInput");
      let member = "";
      if (!interaction.targetUser){
        member = options.getMember("user");
        console.log(member)
      } else {
        member = interaction.targetUser;
        console.log(member)
      }

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
      await interaction.editReply({ content: newMessage });

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        interaction.guild,
        1
      );
      if (!guildSettings) {
        return resolve(null);
      }

      const modLogChannel = guildSettings.modLog;
      if (modLogChannel === undefined) {
        interaction.editReply(
          `Beschwerde kann nicht übermittelt werden. Bitte Admins per DM kontaktieren!`
        );
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
