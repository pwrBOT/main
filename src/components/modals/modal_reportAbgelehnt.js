const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");
const reportRepository = require("../../mysql/reportRepository");

module.exports = {
  data: {
    name: "userReportAbgelehnt"
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const reportId = interaction.fields.getTextInputValue("reportId");
      const modMessage = interaction.fields.getTextInputValue("modMessage");

      const reportData = await reportRepository.getReport(
        interaction.guild.id,
        reportId
      );

      await reportRepository.updateReport(
        interaction.guild.id,
        reportId,
        `Rejected ${interaction.user.tag}`,
        interaction.user.id,
        modMessage
      );

      const buttonAbgelehnt = new ButtonBuilder()
        .setCustomId("report_abgelehnt")
        .setLabel(`Report abgelehnt durch ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents(buttonAbgelehnt)]
      });

      await interaction.reply({
        ephemeral: true,
        content: `✅ Du hast den Report abgelehnt!`
      });

      const reportAbgelehntEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Reporting-System ⚡️`)
        .setDescription(
          `Hallo ${await interaction.guild.members.fetch(
            reportData.reporterId
          )}!\n\nDein Report wurde von einem Moderator überprüft und abgelehnt!\n\nDies kann verschiedene Gründe haben. Zum Beispiel, dass deine Meldung nicht gegen die Regeln verstößt, oder die Moderatoren der Meinung sind, dass es ein privates Problem ist. Private Missverständnisse sollen persönlich geklärt werden.\n\nSolltest du anderer Meinung sein, kannst du das Moderatoren-Team gerne kontaktieren.\n\nDennoch bedanken wir uns für Deine Meldung und wünschen noch einen schönen Tag 😊\n\n`
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
            value: `${await interaction.guild.members.fetch(
              reportData.reportedMemberId
            )}`,
            inline: true
          },
          {
            name: `Anmerkung des Moderators:`,
            value: `${modMessage}`,
            inline: false
          }
        ]);

      try {
        const reporter = await interaction.guild.members.fetch(
          reportData.reporterId
        );
        reporter.send({ embeds: [reportAbgelehntEmbed] });
      } catch (error) {}
    });
  }
};
