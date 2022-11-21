const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

module.exports = {
  data: {
    name: `report_uebernahme`
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const guildSettings = require("../../mysql/guildsRepository");
      const modRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modRole"
      );

      if (!modRoleId) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Keine Moderator-Rolle definiert! ❌"
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
          content: "❌ Du bist kein Moderator! ❌"
        });
        return resolve(null);
      }

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
        `In process by ${interaction.user.tag}`,
        interaction.user.id
      );

      const buttonInBearbeitung = new ButtonBuilder()
        .setCustomId("report_uebernahme")
        .setLabel(`Report in Bearbeitung von ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report als erledigt markieren`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      await interaction.message.edit({
        components: [
          new ActionRowBuilder().addComponents([
            buttonInBearbeitung,
            buttonErledigt
          ])
        ]
      });

      // CREATE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (!modThreadAreaId.value) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen!\nEs wurde kein Mod-Thread erstellt (Keine Mod-Area definiert)`
        });
        return resolve(null);
      }

      const modThreadArea = await interaction.guild.channels.cache.get(
        modThreadAreaId.value
      );

      if (interaction.guild.premiumTier === 3) {
        const newThread = await modThreadArea.threads.create({
          name: `Report ${reportId} | Mod ${interaction.member.user.username}`,
          autoArchiveDuration: 60,
          type: ChannelType.PrivateThread,
          reason: "Thread for moderation"
        });

        const reportedUserId = await interaction.message.embeds[0].description
          .split("<@")[1]
          .split(">")[0];

        await newThread.members.add(interaction.member.id);
        await newThread.members.add(reportedUserId);
        await newThread.send(`**Hallo ${interaction.guild.members.cache.get(reportedUserId)}!**`);
        await newThread.send(`Du wurdest von einem User gemeldet. Beschwerde:\n*${reportData.reportReason}*\n\nWas kannst du uns dazu sagen?`);
        await newThread.send(`Bearbeitender Moderator: ${interaction.member}`);
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen!\n\nEin Mod-Thread mit dem Namen "Report ${reportId} | Mod ${interaction.member.user.username}" wurde erstellt.`
        });
      } else {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen! Es wurde jedoch kein Private-Thread erstellt. Hierfür ist Discord-Boost-Level 3 erforderlich!)`
        });
        return resolve(null);
      }
      // CREATE PRIVATE THREAD END \\

      return resolve(null);
    });
  }
};
