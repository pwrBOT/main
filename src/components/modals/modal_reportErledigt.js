const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ThreadAutoArchiveDuration,
  PermissionFlagsBits
} = require("discord.js");

const guildsRepository = require("../../mysql/guildsRepository");
const reportRepository = require("../../mysql/reportRepository");

module.exports = {
  data: {
    name: "userReportErledigt"
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
        
      const reportId = interaction.fields.getTextInputValue("reportId");
      const modMessage =
        interaction.fields.getTextInputValue("modMessage");

      const reportData = await reportRepository.getReport(
        interaction.guild.id,
        reportId
      );

      await reportRepository.updateReport(
        interaction.guild.id,
        reportId,
        `Resolved ${interaction.user.tag}`,
        interaction.user.id,
        modMessage
      );

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report erledigt durch ${interaction.member.displayName}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
      newEmbed.addFields([
        {
          name: `Moderator Abschlussmeldung:`,
          value: `${modMessage}`,
          inline: false
        }
      ]);

      await interaction.message.edit({
        embeds: [newEmbed],
        components: [new ActionRowBuilder().addComponents(buttonErledigt)]
      });

      const reportErledigtEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Reporting-System ⚡️`)
        .setDescription(
          `Hallo ${await interaction.guild.members.fetch(
            reportData.reporterId
          )}!\n\nDein Report wurde soeben bearbeitet und abgeschlossen.\nDanke für Deine Meldung!`
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
            value: `${await interaction.client.users.fetch(
              reportData.reportedMemberId
            )}`,
            inline: true
          },
          {
            name: `Bearbeitender Moderator:`,
            value: `${interaction.member}`,
            inline: true
          }
          ,
          {
            name: `Moderator Abschlussmeldung:`,
            value: `${modMessage}`,
            inline: false
          }
        ]);

      try {
        const reporter = await interaction.guild.members.fetch(
          reportData.reporterId
        );
        reporter.send({ embeds: [reportErledigtEmbed] });
      } catch (error) {}

      // LOCK AND ARCHIVE PRIVATE THREAD \\
      const modThreadAreaId = await guildsRepository.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (modThreadAreaId) {
        if (!modThreadAreaId.value) {
          await interaction.reply({
            ephemeral: true,
            content: `✅ Du hast den Report erfolgreich erledigt!`
          });
          return resolve(null);
        }
      } else {
        await interaction.reply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`
        });
        return resolve(null);
      }

      const modThreadArea = await interaction.guild.channels.fetch(
        modThreadAreaId.value
      );
      const threadName = `Report ${reportId}`;
      const thread = modThreadArea.threads.cache.find(
        (x) => x.name === threadName
      );

      if (!thread) {
        await interaction.reply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`
        });
        return resolve(null);
      }

      if (thread.archived === true) {
        await interaction.reply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`
        });
        return resolve(null);
      }

      await thread.send({
        content: `✅ Der Report wurde von ${interaction.member} als erledigt markiert! Der Thread wird in 24 Stunden archiviert.`
      });
      await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneDay);
      await interaction.reply({
        ephemeral: true,
        content: `✅ Du hast den Report erfolgreich erledigt!`
      });

      // LOCK AND ARCHIVE PRIVATE THREAD END \\
    });
  }
};
