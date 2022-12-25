const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");

module.exports = {
  data: {
    name: "userReport_rejected"
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });
      const adminMessage = interaction.fields.getTextInputValue("adminMessage");
      const reportId = await interaction.message.embeds[0].description.split(
        "#"
      )[1];
      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.getReport(
        interaction.guild.id,
        reportId
      );

      await reportRepository.updateReport(
        interaction.guild.id,
        reportId,
        `Rejected ${interaction.user.tag}`,
        interaction.user.id
      );

      const buttonAbgelehnt = new ButtonBuilder()
        .setCustomId("report_abgelehnt")
        .setLabel(`Report abgelehnt durch ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents(buttonAbgelehnt)]
      });

      await interaction.editReply({
        ephemeral: true,
        content: `✅ Du hast den Report abgelehnt!`
      });

      const reportAbgelehntEmbed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Reporting-System ⚡️`)
        .setDescription(
          `Hallo ${interaction.guild.members.cache.get(
            reportData.reporterId
          )}!\n\nDein Report wurde von einem Moderator abgelehnt!\n\nDies kann verschiedene Gründe haben. Zum Beispiel, dass deine Meldung nicht gegen die Regeln verstößt, oder die Moderatoren der Meinung sind, dass es ein privates Problem ist. Private Missverständnisse sollen persönlich geklärt werden.\n\nSolltest du anderer Meinung sein, kannst du das Moderatoren-Team gerne kontaktieren.\n\nDennoch bedanken wir uns für Deine Meldung und wünschen noch einen schönen Tag 😊\n\n`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Beschwerdemeldung:`,
            value: `${reportData.reportReason}`,
            inline: false
          },
          {
            name: `Gemeldeter User:`,
            value: `${interaction.guild.members.cache.get(
              reportData.reportedMemberId
            )}`,
            inline: true
          },
          {
            name: `Bearbeitender Moderator:`,
            value: `${interaction.member}`,
            inline: true
          },
          {
            name: `Anmerkung des Moderators:`,
            value: `${adminMessage}`,
            inline: false
          }
        ]);

      try {
        await interaction.guild.members.cache
          .get(reportData.reporterId)
          .send({ embeds: [reportAbgelehntEmbed] });
      } catch (error) {}

      return resolve(null);
    });
  }
};
