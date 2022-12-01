const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");

module.exports = {
  data: {
    name: "userReport_closing"
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });
      const reportModMessage = interaction.fields.getTextInputValue("reportModMessage");

      const reportId = await interaction.message.embeds[0].description.split(
        "#"
      )[1];
      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.getReport(
        interaction.guild.id,
        reportId
      );

      // LOCK AND ARCHIVE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (!modThreadAreaId.value) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`
        });
        return resolve(null);
      }

      const reportErledigtEmbed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Reporting-System ⚡️`)
        .setDescription(
          `Hallo ${interaction.guild.members.cache.get(
            reportData.reporterId
          )}!\n\nDein Report wurde soeben bearbeitet und abgeschlossen.\n\nDanke für Deine Meldung!`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
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
            name: `Beschwerdemeldung:`,
            value: `${reportData.reportReason}`,
            inline: false
          },
          {
            name: `Moderator Abschlussmeldung:`,
            value: `${reportModMessage}`,
            inline: false
          },
        ]);

      try {
        await interaction.guild.members.cache
          .get(reportData.reporterId)
          .send({ embeds: [reportErledigtEmbed] });
      } catch (error) {}

      const modThreadArea = await interaction.guild.channels.cache.get(
        modThreadAreaId.value
      );
      const threadName = `Report ${reportId} | Mod ${interaction.member.user.username}`;
      const thread = modThreadArea.threads.cache.find(
        (x) => x.name === threadName
      );

      if (!thread) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`
        });
        return resolve(null);
      }
      await thread.setLocked(true); // locked
      await thread.setArchived(true); // archived
      await interaction.editReply({
        ephemeral: true,
        content: `✅ Du hast den Report erfolgreich erledigt!`
      });

      // LOCK AND ARCHIVE PRIVATE THREAD END \\

      return resolve(null);
    });
  }
};
