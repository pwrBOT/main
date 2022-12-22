const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
module.exports = {
  data: {
    name: `report_abgelehnt`,
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true,
      });

      const guildSettings = require("../../mysql/guildsRepository");
      const modRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modRole"
      );
      if (!modRoleId) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Keine Moderator-Rolle definiert! ❌",
        });
        return resolve(null);
      }

      let isModerator = false;

      const modRoleIds = JSON.parse(modRoleId.value);
      modRoleIds.forEach((modRoleId) => {
        if (interaction.member.roles.cache.has(modRoleId)) {
          isModerator = true;
        }
      });

      if (!isModerator) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Du bist kein Moderator! ❌",
        });
        return resolve(null);
      }

      const reportId = await interaction.message.embeds[0].description.split("#")[1]
      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.getReport(interaction.guild.id, reportId);

      await reportRepository.updateReport(interaction.guild.id, reportId, `Rejected ${interaction.user.tag}`, interaction.user.id);

      const buttonAbgelehnt = new ButtonBuilder()
        .setCustomId("report_abgelehnt")
        .setLabel(`Report abgelehnt durch ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents(buttonAbgelehnt)],
      });

      // LOCK AND ARCHIVE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (!modThreadAreaId.value) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report abgelehnt!`,
        });
        return resolve(null);
      }

      const reportAbgelehntEmbed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Reporting-System ⚡️`)
        .setDescription(`Hallo ${interaction.guild.members.cache.get(reportData.reporterId)}!\n\nDein Report wurde von einem Moderator abgelehnt!\n\nDies kann verschiedene Gründe haben. Zum Beispiel, dass deine Meldung nicht gegen die Regeln verstößt, oder die Moderatoren der Meinung sind, dass es ein privates Problem ist. Private Missverständnisse sollen persönlich geklärt werden.\n\nSolltest du anderer Meinung sein, kannst du das Moderatoren-Team gerne kontaktieren.\n\nDennoch bedanken wir uns für Deine Meldung und wünschen noch einen schönen Tag 😊\n\n`)
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
            value: `${interaction.guild.members.cache.get(reportData.reportedMemberId)}`,
            inline: true
          },
          {
            name: `Bearbeitender Moderator:`,
            value: `${interaction.member}`,
            inline: true
          }
        ]);

      try {
        await interaction.guild.members.cache.get(reportData.reporterId).send({ embeds: [reportAbgelehntEmbed] });
      } catch (error) {}

      const modThreadArea = await interaction.guild.channels.cache.get(
        modThreadAreaId.value
      );
      const threadName = `Report ${reportId}`;
      const thread = modThreadArea.threads.cache.find(
        (x) => x.name === threadName
      );

      if (!thread) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report abgelehnt!`,
        });
        return resolve(null);
      }
      await thread.setLocked(true); // locked
      await thread.setArchived(true); // archived
      await interaction.editReply({
        ephemeral: true,
        content: `✅ Du hast den Report abgelehnt!`,
      });

      // LOCK AND ARCHIVE PRIVATE THREAD END \\
      return resolve(null);
    });
  },
};
