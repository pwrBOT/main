const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");
const { Generator } = require('randomly-id-generator');

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
      const memberName =
        interaction.fields.getTextInputValue("reportedUserInput");
      const memberId = interaction.fields.getTextInputValue("reportedUserId");
      const member = client.users.cache.get(memberId);
      const reporterId = interaction.member.id;
      const reporter = interaction.member;
      const reason = interaction.fields.getTextInputValue("reportUserInput");
      const reportId = new Generator().generate();

      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.addReport(interaction, reporterId, memberId, reason, "open", "-", reportId);

      const reportembedBase1 = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot ⚡️ | Report`)
        .setDescription(`User: ${member} wurde soeben gemeldet.\nReport ID: #${reportId}`)
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`,
        });

      const buttonUebernehmen = new ButtonBuilder()
        .setCustomId("report_uebernahme")
        .setLabel("Report übernehmen")
        .setStyle(ButtonStyle.Danger);
        

      await interaction.editReply(
        `Danke für Deine Meldung! User ${member} wurde den Moderatoren gemeldet ✅`
      );

      const data = await guildsRepository.getGuildSetting(
        interaction.guild,
        "modLog"
      );

      const modRole = await guildsRepository.getGuildSetting(
        interaction.guild,
        "modRole"
      );

      if (!data) {
        return resolve(null);
      } else {
        const logChannel = data.value;

        if (logChannel === undefined) {
          return resolve(null);
        } else {
          const reportembed = reportembedBase1.addFields([
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
          const message = await client.channels.cache
            .get(logChannel)
            .send({
              embeds: [reportembed],
              components: [
                new ActionRowBuilder().addComponents(buttonUebernehmen),
              ],
            })
            .catch(console.error);
        }
      }
      return resolve(null);
    });
  },
};
