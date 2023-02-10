const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ThreadAutoArchiveDuration } = require("discord.js");
module.exports = {
  data: {
    name: `report_erledigt`,
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

      if (interaction.user.id != reportData.modId) {
        await interaction.editReply({
          ephemeral: true,
          content: `❌ Du kannst den Report nicht abschließen. Du bearbeitest ihn nicht!`,
        });
        return resolve(null);
      }

      await reportRepository.updateReport(interaction.guild.id, reportId, `Resolved ${interaction.user.tag}`, interaction.user.id);

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report erledigt durch ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents(buttonErledigt)],
      });

      const reportErledigtEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Reporting-System ⚡️`)
        .setDescription(`Hallo ${interaction.guild.members.cache.get(reportData.reporterId)}!\n\nDein Report wurde soeben bearbeitet und abgeschlossen.\nDanke für Deine Meldung!`)
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
        await interaction.guild.members.cache.get(reportData.reporterId).send({ embeds: [reportErledigtEmbed] });
      } catch (error) {}

      // LOCK AND ARCHIVE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (modThreadAreaId) {
        if (!modThreadAreaId.value) {
          await interaction.editReply({
            ephemeral: true,
            content: `✅ Du hast den Report erfolgreich erledigt!`
          });
          return resolve(null);
        }
      } else {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`
        });
        return resolve(null);
      }

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
          content: `✅ Du hast den Report erfolgreich erledigt!`,
        });
        return resolve(null);
      }

      if (thread.archived === true) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`,
        });
        return resolve(null);
      }

      await thread.send({ content: `✅ Der Report wurde von ${interaction.member} als erledigt markiert! Der Thread wird in 24 Stunden archiviert.` });
      await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneDay)
      await interaction.editReply({
        ephemeral: true,
        content: `✅ Du hast den Report erfolgreich erledigt!`,
      });

      // LOCK AND ARCHIVE PRIVATE THREAD END \\
      return resolve(null);
    });
  },
};
